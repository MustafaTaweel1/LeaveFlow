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

    let matchQuery = {};

    // Managers can only see their department's data
    if (currentUser.role === "manager") {
      const teamMembers = await User.find({
        department: currentUser.department,
      }).select("_id");

      matchQuery = {
        employeeId: { $in: teamMembers.map((member) => member._id) },
      };
    }

    const reportData = await LeaveRequest.aggregate([
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
        $addFields: {
          days: {
            $ceil: {
              $divide: [
                { $subtract: ["$endDate", "$startDate"] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
        },
      },
      {
        $project: {
          employee: "$employee.name",
          department: "$employee.department",
          leaveType: "$type",
          startDate: "$startDate",
          endDate: "$endDate",
          days: 1,
          status: 1,
        },
      },
      { $sort: { startDate: -1 } },
    ]);

    return NextResponse.json(reportData);
  } catch (error) {
    console.error("Error generating leave summary report:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
