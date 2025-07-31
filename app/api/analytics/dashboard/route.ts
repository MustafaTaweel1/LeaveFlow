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

    // Get date ranges
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Build query based on user role
    let matchQuery = {};
    if (currentUser.role === "manager") {
      const teamMembers = await User.find({
        department: currentUser.department,
      }).select("_id");
      matchQuery = {
        employeeId: { $in: teamMembers.map((member) => member._id) },
      };
    }

    // Leave Utilization
    const users = await User.find(
      currentUser.role === "manager"
        ? { department: currentUser.department }
        : {}
    );
    const leaveUtilization = {
      annual: { used: 0, total: 0 },
      sick: { used: 0, total: 0 },
      personal: { used: 0, total: 0 },
      emergency: { used: 0, total: 0 },
    };

    users.forEach((user) => {
      user.leaveBalance.forEach((balance) => {
        if (leaveUtilization[balance.type as keyof typeof leaveUtilization]) {
          const originalBalance = getOriginalBalance(balance.type);
          const used = originalBalance - balance.remaining;
          leaveUtilization[
            balance.type as keyof typeof leaveUtilization
          ].used += used;
          leaveUtilization[
            balance.type as keyof typeof leaveUtilization
          ].total += originalBalance;
        }
      });
    });

    // Monthly Trends
    const monthlyTrends = await LeaveRequest.aggregate([
      { $match: { ...matchQuery, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          requests: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
          rejected: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const formattedMonthlyTrends = monthlyTrends.map((trend) => ({
      month: new Date(trend._id.year, trend._id.month - 1).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "short",
        }
      ),
      requests: trend.requests,
      approved: trend.approved,
      rejected: trend.rejected,
    }));

    // Department Statistics
    const departmentStats = await LeaveRequest.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: "users",
          localField: "employeeId",
          foreignField: "_id",
          as: "employee",
        },
      },
      { $unwind: "$employee" },
      {
        $group: {
          _id: "$employee.department",
          totalRequests: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          department: "$_id",
          totalRequests: 1,
          approvalRate: {
            $round: [
              {
                $multiply: [{ $divide: ["$approved", "$totalRequests"] }, 100],
              },
              0,
            ],
          },
        },
      },
    ]);

    // Upcoming Leaves
    const upcomingLeaves = await LeaveRequest.find({
      ...matchQuery,
      status: "approved",
      startDate: { $gte: now, $lte: nextMonth },
    })
      .populate("employeeId", "name department")
      .sort({ startDate: 1 })
      .limit(10);

    const formattedUpcomingLeaves = upcomingLeaves.map((leave) => ({
      employee: leave.employeeId.name,
      department: leave.employeeId.department,
      startDate: leave.startDate,
      endDate: leave.endDate,
      type: leave.type,
    }));

    return NextResponse.json({
      leaveUtilization,
      monthlyTrends: formattedMonthlyTrends,
      departmentStats,
      upcomingLeaves: formattedUpcomingLeaves,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

function getOriginalBalance(type: string): number {
  switch (type) {
    case "annual":
      return 20;
    case "sick":
      return 10;
    case "personal":
      return 5;
    case "emergency":
      return 3;
    default:
      return 0;
  }
}
