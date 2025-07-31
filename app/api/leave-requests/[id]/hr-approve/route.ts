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
    if (!currentUser || !["hr", "admin"].includes(currentUser.role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const { comment } = await request.json()

    const leaveRequest = await LeaveRequest.findById(params.id).populate("employeeId", "name email department")

    if (!leaveRequest) {
      return NextResponse.json({ message: "Leave request not found" }, { status: 404 })
    }

    // Calculate days to deduct
    const startDate = new Date(leaveRequest.startDate)
    const endDate = new Date(leaveRequest.endDate)
    const timeDiff = endDate.getTime() - startDate.getTime()
    const daysToDeduct = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1

    // Update user's leave balance
    const employee = await User.findById(leaveRequest.employeeId._id)
    if (!employee) {
      return NextResponse.json({ message: "Employee not found" }, { status: 404 })
    }

    // Find and update the specific leave balance
    const leaveBalanceIndex = employee.leaveBalance.findIndex((balance: any) => balance.type === leaveRequest.type)

    if (leaveBalanceIndex === -1) {
      return NextResponse.json({ message: "Leave type not found in employee balance" }, { status: 400 })
    }

    // Check if employee still has sufficient balance (in case balance changed since request)
    if (employee.leaveBalance[leaveBalanceIndex].remaining < daysToDeduct) {
      return NextResponse.json(
        {
          message: "Employee no longer has sufficient leave balance",
        },
        { status: 400 },
      )
    }

    // Deduct the leave days
    employee.leaveBalance[leaveBalanceIndex].remaining -= daysToDeduct
    await employee.save()

    // Update leave request status
    leaveRequest.status = "approved"
    leaveRequest.hrReview = {
      reviewedBy: decoded.userId,
      comment: comment || "Approved by HR",
      reviewedAt: new Date(),
    }

    await leaveRequest.save()

    // Create notification for employee
    await new Notification({
      userId: leaveRequest.employeeId._id,
      type: "leave_approved",
      title: "Leave Request Approved",
      message: `Your ${leaveRequest.type} leave request has been fully approved. ${daysToDeduct} days have been deducted from your balance.`,
      data: { leaveRequestId: leaveRequest._id, daysDeducted: daysToDeduct },
    }).save()

    return NextResponse.json(leaveRequest)
  } catch (error) {
    console.error("Error approving leave request:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
