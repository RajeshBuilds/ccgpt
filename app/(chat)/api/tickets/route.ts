import { NextResponse } from 'next/server';
import { getAllComplaints, getComplaintsAssignedToEmployeeA } from '@/lib/db/queries';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const employeeId = url.searchParams.get('employeeId');
    let complaints;
    if (employeeId) {
      complaints = await getComplaintsAssignedToEmployeeA(Number(employeeId));
    } else {
      complaints = await getAllComplaints();
    }
    console.log('Complaints fetched:', complaints);
    return NextResponse.json({ complaints });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch complaints' }, { status: 500 });
  }
}
