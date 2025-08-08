import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db/drizzle';
import { complaint } from '@/lib/db/schema';
import { count, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total count of all complaints
    const totalCount = await db
      .select({ count: count() })
      .from(complaint);

    // Get count of draft vs submitted complaints
    const draftCount = await db
      .select({ count: count() })
      .from(complaint)
      .where(sql`${complaint.isDraft} = true`);

    const submittedCount = await db
      .select({ count: count() })
      .from(complaint)
      .where(sql`${complaint.isDraft} = false`);

    // Get sample of recent complaints
    const recentComplaints = await db
      .select({
        id: complaint.id,
        referenceNumber: complaint.referenceNumber,
        description: complaint.description,
        category: complaint.category,
        status: complaint.status,
        urgencyLevel: complaint.urgencyLevel,
        isDraft: complaint.isDraft,
        assignedTo: complaint.assignedTo,
        createdAt: complaint.createdAt,
      })
      .from(complaint)
      .limit(10)
      .orderBy(sql`${complaint.createdAt} DESC`);

    // Get status distribution for all complaints
    const statusDistribution = await db
      .select({
        status: complaint.status,
        isDraft: complaint.isDraft,
        count: count(),
      })
      .from(complaint)
      .groupBy(complaint.status, complaint.isDraft);

    return NextResponse.json({
      summary: {
        total: totalCount[0]?.count || 0,
        drafts: draftCount[0]?.count || 0,
        submitted: submittedCount[0]?.count || 0,
      },
      statusDistribution,
      recentComplaints,
      message: submittedCount[0]?.count === 0 
        ? 'No submitted complaints found. All complaints might be in draft state.'
        : `Found ${submittedCount[0]?.count} submitted complaints`,
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debug data', details: error },
      { status: 500 }
    );
  }
} 