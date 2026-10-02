import { openai, anthropic, getDefaultProvider, AI_MODELS, AGENT_CONFIG } from './config';
import { availableTools, getTool, ToolCall, ToolResultMessage } from './tools';
import { prisma } from '@/lib/prisma';

export interface AgentStep {
  step: number;
  thought: string;
  toolCalls: ToolCall[];
  toolResults: ToolResultMessage[];
  completed: boolean;
}

export interface AgentRunResult {
  success: boolean;
  steps: AgentStep[];
  finalAnswer?: string;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

interface AgentContext {
  userId: string;
  conversationId: string;
  taskRunId: string;
  abortSignal?: AbortSignal;
}

const SYSTEM_PROMPT = `You are an AI agent that can use tools to accomplish tasks. 
You have access to the following tools:
{{tools}}

When you need to use a tool, respond with a JSON object in this format:
{
  "tool_calls": [
    {
      "id": "unique-id",
      "name": "tool_name",
      "arguments": { "param": "value" }
    }
  ]
}

You can make multiple tool calls in one response. After receiving tool results, continue your reasoning.
When the task is complete, provide your final answer without any tool calls.

Guidelines:
- Think step by step
- Use tools when you need information or need to perform actions
- Be concise but thorough
- If a tool fails, try an alternative approach
- Respect the user's intent and constraints`;

function buildSystemPrompt(): string {
  const toolDescriptions = availableTools
    .map((t) => `- ${t.definition.name}: ${t.definition.description}`)
    .join('\n');
  return SYSTEM_PROMPT.replace('{{tools}}', toolDescriptions);
}

async function callAI(
  messages: Array<{ role: string; content: string }>,
  provider: 'openai' | 'anthropic',
  model: string
): Promise<{ content: string; toolCalls?: ToolCall[]; usage?: any }> {
  if (provider === 'openai' && openai) {
    const completion = await openai.chat.completions.create({
      model,
      messages: messages as any,
      tools: availableTools.map((t) => ({
        type: 'function',
        function: {
          name: t.definition.name,
          description: t.definition.description,
          parameters: t.definition.parameters,
        },
      })),
      tool_choice: 'auto',
      max_tokens: AGENT_CONFIG.maxTokensPerResponse,
      temperature: AGENT_CONFIG.temperature,
    });

    const choice = completion.choices[0];
    const toolCalls: ToolCall[] = choice.message.tool_calls?.map((tc) => ({
      id: tc.id,
      name: tc.function.name,
      arguments: JSON.parse(tc.function.arguments),
    })) || [];

    return {
      content: choice.message.content || '',
      toolCalls,
      usage: completion.usage,
    };
  }

  if (provider === 'anthropic' && anthropic) {
    const systemMessage = messages.find((m) => m.role === 'system');
    const userMessages = messages.filter((m) => m.role !== 'system');

    const completion = await anthropic.messages.create({
      model,
      system: systemMessage?.content || buildSystemPrompt(),
      messages: userMessages as any,
      tools: availableTools.map((t) => ({
        name: t.definition.name,
        description: t.definition.description,
        input_schema: t.definition.parameters,
      })),
      max_tokens: AGENT_CONFIG.maxTokensPerResponse,
      temperature: AGENT_CONFIG.temperature,
    });

    const toolCalls: ToolCall[] = [];
    let content = '';

    for (const block of completion.content) {
      if (block.type === 'text') {
        content += block.text;
      } else if (block.type === 'tool_use') {
        toolCalls.push({
          id: block.id,
          name: block.name,
          arguments: block.input as Record<string, unknown>,
        });
      }
    }

    return {
      content,
      toolCalls,
      usage: completion.usage,
    };
  }

  throw new Error(`No AI provider configured for ${provider}`);
}

async function executeToolCalls(
  toolCalls: ToolCall[],
  context: AgentContext
): Promise<ToolResultMessage[]> {
  const results: ToolResultMessage[] = [];

  for (const toolCall of toolCalls) {
    const tool = getTool(toolCall.name);
    if (!tool) {
      results.push({
        toolCallId: toolCall.id,
        name: toolCall.name,
        result: null,
        success: false,
        error: `Tool '${toolCall.name}' not found`,
      });
      continue;
    }

    try {
      const result = await tool.executor(toolCall.arguments, context);
      results.push({
        toolCallId: toolCall.id,
        name: toolCall.name,
        result: result.result,
        success: result.success,
        error: result.error,
      });

      // Store tool call in database
      await prisma.toolCall.create({
        data: {
          taskRunId: context.taskRunId,
          name: toolCall.name,
          arguments: toolCall.arguments,
          result: result.result,
          status: result.success ? 'success' : 'error',
          error: result.error,
        },
      });
    } catch (error) {
      results.push({
        toolCallId: toolCall.id,
        name: toolCall.name,
        result: null,
        success: false,
        error: error instanceof Error ? error.message : 'Tool execution failed',
      });
    }
  }

  return results;
}

export async function runAgent(
  goal: string,
  context: AgentContext,
  options?: {
    provider?: 'openai' | 'anthropic';
    model?: string;
    onStep?: (step: AgentStep) => void;
  }
): Promise<AgentRunResult> {
  const provider = options?.provider || getDefaultProvider();
  const model = options?.model || AI_MODELS[provider].default;
  const steps: AgentStep[] = [];
  let totalUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

  const messages: Array<{ role: string; content: string }> = [
    { role: 'system', content: buildSystemPrompt() },
    { role: 'user', content: goal },
  ];

  for (let stepNum = 1; stepNum <= AGENT_CONFIG.maxSteps; stepNum++) {
    if (context.abortSignal?.aborted) {
      return {
        success: false,
        steps,
        error: 'Task cancelled by user',
      };
    }

    const response = await callAI(messages, provider, model);

    if (response.usage) {
      totalUsage.promptTokens += response.usage.prompt_tokens || 0;
      totalUsage.completionTokens += response.usage.completion_tokens || 0;
      totalUsage.totalTokens += response.usage.total_tokens || 0;
    }

    const toolCalls = response.toolCalls || [];
    const toolResults = await executeToolCalls(toolCalls, context);

    const step: AgentStep = {
      step: stepNum,
      thought: response.content,
      toolCalls,
      toolResults,
      completed: toolCalls.length === 0,
    };

    steps.push(step);
    options?.onStep?.(step);

    // Add tool results to messages
    for (const result of toolResults) {
      messages.push({
        role: 'tool',
        content: JSON.stringify({
          toolCallId: result.toolCallId,
          name: result.name,
          result: result.result,
          success: result.success,
          error: result.error,
        }),
      });
    }

    if (toolCalls.length === 0) {
      // Task completed
      return {
        success: true,
        steps,
        finalAnswer: response.content,
        usage: totalUsage,
      };
    }
  }

  return {
    success: false,
    steps,
    error: `Maximum steps (${AGENT_CONFIG.maxSteps}) reached`,
    usage: totalUsage,
  };
}