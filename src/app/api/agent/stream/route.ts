import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { runAgent, AgentRunResult } from '@/lib/ai/agent';
import { prisma } from '@/lib/prisma';
import { generateId } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { goal, conversationId, provider, model } = await request.json();

    if (!goal || typeof goal !== 'string') {
      return new Response(JSON.stringify({ error: 'Goal is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create or get conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, userId: session.user.id },
      });
      if (!conversation) {
        return new Response(JSON.stringify({ error: 'Conversation not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } else {
      conversation = await prisma.conversation.create({
        data: {
          title: goal.slice(0, 100),
          userId: session.user.id,
        },
      });
    }

    // Create task run
    const taskRun = await prisma.taskRun.create({
      data: {
        conversationId: conversation.id,
        goal,
        status: 'running',
        steps: [],
      },
    });

    // Create encoder for streaming
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: unknown) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        const abortController = new AbortController();

        // Handle client disconnect
        request.signal.addEventListener('abort', () => {
          abortController.abort();
        });

        try {
          const result = await runAgent(goal, {
            userId: session.user.id,
            conversationId: conversation.id,
            taskRunId: taskRun.id,
            abortSignal: abortController.signal,
          }, {
            provider,
            model,
            onStep: (step) => {
              send({ type: 'step', step });
            },
          });

          // Update task run with final result
          await prisma.taskRun.update({
            where: { id: taskRun.id },
            data: {
              status: result.success ? 'completed' : 'failed',
              steps: result.steps,
              result: result.finalAnswer ? { answer: result.finalAnswer } : null,
              error: result.error,
              completedAt: new Date(),
            },
          });

          // Add assistant message to conversation
          if (result.finalAnswer) {
            await prisma.message.create({
              data: {
                conversationId: conversation.id,
                role: 'assistant',
                content: result.finalAnswer,
                metadata: {
                  steps: result.steps.length,
                  usage: result.usage,
                },
              },
            });
          }

          send({ type: 'complete', result });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Agent execution failed';
          
          await prisma.taskRun.update({
            where: { id: taskRun.id },
            data: {
              status: 'failed',
              error: errorMessage,
              completedAt: new Date(),
            },
          });

          send({ type: 'error', error: errorMessage });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Agent stream error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}