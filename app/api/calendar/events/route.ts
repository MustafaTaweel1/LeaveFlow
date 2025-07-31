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
    if (!currentUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const query: any = {
      status: "approved",
    };

    if (start && end) {
      query.$or = [
        {
          startDate: { $gte: new Date(start), $lte: new Date(end) },
        },
        {
          endDate: { $gte: new Date(start), $lte: new Date(end) },
        },
        {
          startDate: { $lte: new Date(start) },
          endDate: { $gte: new Date(end) },
        },
      ];
    }

    // Filter based on user role
    if (currentUser.role === "manager") {
      const teamMembers = await User.find({
        department: currentUser.department,
      }).select("_id");

      query.employeeId = { $in: teamMembers.map((member) => member._id) };
    }

    const events = await LeaveRequest.find(query)
      .populate("employeeId", "name department")
      .sort({ startDate: 1 });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
