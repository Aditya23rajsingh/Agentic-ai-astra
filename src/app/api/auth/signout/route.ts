import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { signOut } from 'next-auth/react';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // The actual sign out is handled client-side via next-auth/react
    // This endpoint exists for API consistency
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Signout error:', error);
    return new Response(JSON.stringify({ error: 'Signout failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}