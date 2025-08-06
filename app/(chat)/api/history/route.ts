import { auth } from '@/app/(auth)/auth';
import type { NextRequest } from 'next/server';
import { getChatsByUserId } from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const limit = Number.parseInt(searchParams.get('limit') || '50');

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  const chats = await getChatsByUserId({
    id: session.user.id,
    userType: session.user.type,
    limit,
    startingAfter: null,
    endingBefore: null,
  });

  return Response.json(chats);
}
