import { z } from 'zod';

export const ToolDefinition = z.object({
  name: z.string(),
  description: z.string(),
  parameters: z.record(z.unknown()),
  required: z.array(z.string()).optional(),
  execute: z.function().optional(), // Runtime only, not serialized
});

export type ToolDefinition = z.infer<typeof ToolDefinition>;

export interface ToolResult {
  success: boolean;
  result?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface ToolContext {
  userId: string;
  conversationId: string;
  taskRunId?: string;
  abortSignal?: AbortSignal;
}

export type ToolExecutor = (
  args: Record<string, unknown>,
  context: ToolContext
) => Promise<ToolResult>;

export interface RegisteredTool {
  definition: Omit<ToolDefinition, 'execute'>;
  executor: ToolExecutor;
}

export const ToolCallSchema = z.object({
  id: z.string(),
  name: z.string(),
  arguments: z.record(z.unknown()),
});

export type ToolCall = z.infer<typeof ToolCallSchema>;

export const ToolResultSchema = z.object({
  toolCallId: z.string(),
  name: z.string(),
  result: z.unknown(),
  success: z.boolean(),
  error: z.string().optional(),
});

export type ToolResultMessage = z.infer<typeof ToolResultSchema>;