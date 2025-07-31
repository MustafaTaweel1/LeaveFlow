import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import LeaveRequest from "@/models/LeaveRequest"
import User from "@/models/User"
import Notification from "@/models/Notification"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as any

    await connectDB()

    const currentUser = await User.findById(decoded.userId)
    if (!currentUser || !["manager", "hr", "admin"].includes(currentUser.role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const { comment } = await request.json()

    const leaveRequest = await LeaveRequest.findById(params.id).populate("employeeId", "name email department")

    if (!leaveRequest) {
      return NextResponse.json({ message: "Leave request not found" }, { status: 404 })
    }

    // Check if manager can reject this request (same department)
    if (currentUser.role === "manager" && leaveRequest.employeeId.department !== currentUser.department) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    leaveRequest.status = "rejected_manager"
    leaveRequest.managerReview = {
      reviewedBy: decoded.userId,
      comment: comment || "Rejected by manager",
      reviewedAt: new Date(),
    }

    await leaveRequest.save()

    // Create notification for employee
    await new Notification({
      userId: leaveRequest.employeeId._id,
      type: "leave_rejected",
      title: "Leave Request Rejected",
      message: `Your ${leaveRequest.type} leave request has been rejected by your manager.`,
      data: { leaveRequestId: leaveRequest._id },
    }).save()

    return NextResponse.json(leaveRequest)
  } catch (error) {
    console.error("Error rejecting leave request:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
