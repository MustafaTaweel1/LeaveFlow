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
    if (!currentUser || !["hr", "admin"].includes(currentUser.role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Get current month start and end
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get stats
    const [
      totalEmployees,
      pendingRequests,
      approvedThisMonth,
      totalLeavesTaken,
    ] = await Promise.all([
      User.countDocuments({ role: "employee" }),
      LeaveRequest.countDocuments({
        status: { $in: ["pending_manager", "pending_hr"] },
      }),
      LeaveRequest.countDocuments({
        status: "approved",
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      }),
      LeaveRequest.aggregate([
        { $match: { status: "approved" } },
        {
          $addFields: {
            days: {
              $divide: [
                { $subtract: ["$endDate", "$startDate"] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
        },
        { $group: { _id: null, totalDays: { $sum: "$days" } } },
      ]),
    ]);

    return NextResponse.json({
      totalEmployees,
      pendingRequests,
      approvedThisMonth,
      totalLeavesTaken: totalLeavesTaken[0]?.totalDays || 0,
    });
  } catch (error) {
    console.error("Error fetching HR stats:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
