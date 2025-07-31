import { type NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import LeaveRequest from "@/models/LeaveRequest";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    await connectDB();

    const currentUser = await User.findById(decoded.userId);
    if (
      !currentUser ||
      !["manager", "hr", "admin"].includes(currentUser.role)
    ) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    let query = {};

    // Managers can only see their department's requests
    if (currentUser.role === "manager") {
      const teamMembers = await User.find({
        department: currentUser.department,
        role: "employee",
      }).select("_id");

      query = { employeeId: { $in: teamMembers.map((member) => member._id) } };
    }
    // HR and Admin can see all requests

    const leaveRequests = await LeaveRequest.find(query)
      .populate("employeeId", "name email department")
      .sort({ createdAt: -1 });

    return NextResponse.json(leaveRequests);
  } catch (error) {
    console.error("Error fetching team leave requests:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
