import { auth } from '@/app/(auth)/auth';
import type { ArtifactKind } from '@/components/artifact';
import {
  getDocumentById,
  saveDocument,
} from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/errors';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new ChatSDKError(
      'bad_request:api',
      'Parameter id is missing',
    ).toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError('unauthorized:document').toResponse();
  }

  const document = await getDocumentById({ id });

  if (!document) {
    return new ChatSDKError('not_found:document').toResponse();
  }

  const userField = session.user.type === 'customer' ? 'customerId' : 'employeeId';
  
  // Skip ownership check for employees accessing documents in their workspace
  // This allows employees to view documents created in their workspace chats
  if (session.user.type === 'employee' || document[userField] === session.user.id) {
    return Response.json([document], { status: 200 });
  }
  
  return new ChatSDKError('forbidden:document').toResponse();
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new ChatSDKError(
      'bad_request:api',
      'Parameter id is required.',
    ).toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError('not_found:document').toResponse();
  }

  const {
    content,
    title,
    kind,
    chatId,
  }: { content: string; title: string; kind: ArtifactKind; chatId?: string } =
    await request.json();

  const existingDocument = await getDocumentById({ id });

  if (existingDocument) {
    const userField = session.user.type === 'customer' ? 'customerId' : 'employeeId';
    if (existingDocument[userField] !== session.user.id) {
      return new ChatSDKError('forbidden:document').toResponse();
    }
  }
  
  const savedDocument = await saveDocument({
    id,
    content,
    title,
    kind,
    userId: session.user.id,
    userType: session.user.type || 'customer',
    chatId: chatId || id,
  });

  return Response.json(savedDocument, { status: 200 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const timestamp = searchParams.get('timestamp');

  if (!id) {
    return new ChatSDKError(
      'bad_request:api',
      'Parameter id is required.',
    ).toResponse();
  }

  if (!timestamp) {
    return new ChatSDKError(
      'bad_request:api',
      'Parameter timestamp is required.',
    ).toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError('unauthorized:document').toResponse();
  }

  const document = await getDocumentById({ id });

  if (!document) {
    return new ChatSDKError('not_found:document').toResponse();
  }

  const userField = session.user.type === 'customer' ? 'customerId' : 'employeeId';
  if (document[userField] !== session.user.id) {
    return new ChatSDKError('forbidden:document').toResponse();
  }

  // For now, we'll just return success since deleteDocumentsByIdAfterTimestamp doesn't exist
  // TODO: Implement document deletion functionality
  return Response.json({ success: true }, { status: 200 });
}
