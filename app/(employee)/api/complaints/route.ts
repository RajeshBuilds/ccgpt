import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getComplaintsAssignedToEmployee } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get employee ID from session
    const employeeId = session.user.id;
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    
    const complaints = await getComplaintsAssignedToEmployee({
      employeeId,
      status,
    });

    return NextResponse.json({ complaints });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return NextResponse.json(
      { error: 'Failed to fetch complaints' },
      { status: 500 }
    );
  }
} 