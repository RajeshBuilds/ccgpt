import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceByComplaintId } from '@/lib/db/queries';
import { generateUUID } from '@/lib/utils';
import { auth } from '@/app/(auth)/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.type !== 'employee') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { complaintId } = await request.json();

    if (!complaintId) {
      return NextResponse.json(
        { error: 'Complaint ID is required' },
        { status: 400 }
      );
    }

    // Check if workspace already exists for this complaint
    const existingWorkspace = await getWorkspaceByComplaintId({ complaintId });

    if (existingWorkspace) {
      // Return existing workspace ID
      return NextResponse.json({
        workspaceId: existingWorkspace.id,
        isNew: false
      });
    }

    // Generate new workspace ID if none exists
    const workspaceId = generateUUID();

    return NextResponse.json({
      workspaceId,
      isNew: true
    });

  } catch (error) {
    console.error('Error handling workspace request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 