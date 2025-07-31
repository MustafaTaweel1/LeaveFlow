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

    const leaveRequests = await LeaveRequest.find({
      employeeId: decoded.userId,
    })
      .populate("employeeId", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json(leaveRequests);
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    await connectDB();

    const { type, startDate, endDate, reason } = await request.json();

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return NextResponse.json(
        { message: "End date must be after start date" },
        { status: 400 }
      );
    }

    // Calculate number of days requested
    const timeDiff = end.getTime() - start.getTime();
    const daysRequested = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates

    // Get user's current leave balance
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if user has sufficient leave balance
    const leaveBalance = user.leaveBalance.find(
      (balance: any) => balance.type === type
    );
    if (!leaveBalance) {
      return NextResponse.json(
        { message: "Invalid leave type" },
        { status: 400 }
      );
    }

    if (leaveBalance.remaining < daysRequested) {
      return NextResponse.json(
        {
          message: `Insufficient leave balance. You have ${leaveBalance.remaining} days remaining for ${type} leave, but requested ${daysRequested} days.`,
        },
        { status: 400 }
      );
    }

    if (leaveBalance.remaining === 0) {
      return NextResponse.json(
        {
          message: `You have no remaining ${type} leave days available.`,
        },
        { status: 400 }
      );
    }

    // Check for overlapping requests
    const overlapping = await LeaveRequest.findOne({
      employeeId: decoded.userId,
      status: { $in: ["pending_manager", "pending_hr", "approved"] },
      $or: [{ startDate: { $lte: end }, endDate: { $gte: start } }],
    });

    if (overlapping) {
      return NextResponse.json(
        { message: "You have an overlapping leave request" },
        { status: 400 }
      );
    }

    const leaveRequest = new LeaveRequest({
      employeeId: decoded.userId,
      type,
      startDate: start,
      endDate: end,
      reason,
      status: "pending_manager",
      daysRequested, // Store the number of days requested
    });

    await leaveRequest.save();
    await leaveRequest.populate("employeeId", "name email");

    return NextResponse.json(leaveRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating leave request:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
