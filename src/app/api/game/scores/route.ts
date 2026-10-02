import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const scores = await prisma.gameScore.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return new Response(JSON.stringify(scores), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Game scores fetch error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch game scores' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { levelId, score, timeMs, completed, metadata } = await request.json();

    if (!levelId || typeof score !== 'number' || typeof timeMs !== 'number') {
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const gameScore = await prisma.gameScore.upsert({
      where: {
        userId_levelId: {
          userId: session.user.id,
          levelId,
        },
      },
      update: {
        score: Math.max(score, 0),
        timeMs: Math.min(timeMs, 2147483647),
        completed: completed ?? false,
        metadata,
      },
      create: {
        userId: session.user.id,
        levelId,
        score,
        timeMs,
        completed: completed ?? false,
        metadata,
      },
    });

    return new Response(JSON.stringify(gameScore), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Game score save error:', error);
    return new Response(JSON.stringify({ error: 'Failed to save game score' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}