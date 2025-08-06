import { NextRequest, NextResponse } from "next/server";
import { getComplaintsAssignedToEmployee } from "@/lib/db/queries";
import { auth } from "@/app/(auth)/auth";

export async function GET(req: NextRequest) {
  // Get the current session (employee)
  const session = await auth();
  if (!session?.user?.id || session.user.type !== "employee") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch complaints assigned to this employee
  const complaints = await getComplaintsAssignedToEmployee(session.user.id);
  return NextResponse.json({ complaints });
}
