"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { CheckCircle, XCircle, Clock } from "lucide-react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { useToast } from "@/hooks/use-toast"

interface LeaveRequest {
  _id: string
  employeeId: {
    name: string
    email: string
    department: string
  }
  type: string
  startDate: string
  endDate: string
  reason: string
  status: "pending_manager" | "pending_hr" | "approved" | "rejected_manager" | "rejected_hr"
  managerReview?: {
    comment: string
    reviewedAt: string
  }
  hrReview?: {
    comment: string
    reviewedAt: string
  }
}

export default function HRLeaveRequests() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaveRequests()
  }, [])

  const fetchLeaveRequests = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/leave-requests/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setLeaveRequests(data)
      }
    } catch (error) {
      console.error("Failed to fetch leave requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleHRAction = async (requestId: string, action: "approve" | "reject", comment = "") => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/leave-requests/${requestId}/hr-${action}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Leave request ${action}d successfully`,
        })
        fetchLeaveRequests()
      } else {
        throw new Error("Failed to update request")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update leave request",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "rejected_manager":
      case "rejected_hr":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "pending_hr":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending_manager":
        return "Pending Manager"
      case "pending_hr":
        return "Pending HR"
      case "rejected_manager":
        return "Rejected by Manager"
      case "rejected_hr":
        return "Rejected by HR"
      default:
        return status
    }
  }

  // Separate requests by status
  const pendingHRRequests = leaveRequests.filter((req) => req.status === "pending_hr")
  const otherRequests = leaveRequests.filter((req) => req.status !== "pending_hr")

  if (!user) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">HR Leave Management</h1>
          <p className="text-muted-foreground">Review and approve leave requests</p>
        </div>

        {/* Pending HR Approval */}
        <Card>
          <CardHeader>
            <CardTitle>Pending HR Approval ({pendingHRRequests.length})</CardTitle>
            <CardDescription>Leave requests approved by managers awaiting HR approval</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingHRRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p>No requests pending HR approval</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingHRRequests.map((request) => (
                  <div key={request._id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{request.employeeId.name}</span>
                          <Badge variant="outline">{request.employeeId.department}</Badge>
                          <Badge className={getStatusColor(request.status)}>{getStatusText(request.status)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{request.employeeId.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleHRAction(request._id, "approve")}
                          className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Final Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleHRAction(request._id, "reject")}
                          className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                      <div>
                        <span className="font-medium">Leave Type:</span>
                        <p className="capitalize">{request.type}</p>
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span>
                        <p>
                          {new Date(request.startDate).toLocaleDateString()} -{" "}
                          {new Date(request.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Reason:</span>
                        <p>{request.reason}</p>
                      </div>
                    </div>

                    {request.managerReview?.comment && (
                      <div className="mt-3 p-2 bg-muted rounded">
                        <span className="font-medium text-sm">Manager Review:</span>
                        <p className="text-sm">{request.managerReview.comment}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Other Requests */}
        <Card>
          <CardHeader>
            <CardTitle>All Leave Requests</CardTitle>
            <CardDescription>Complete history of leave requests</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : otherRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p>No other requests found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {otherRequests.map((request) => (
                  <div key={request._id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{request.employeeId.name}</span>
                        <Badge variant="outline">{request.employeeId.department}</Badge>
                        <Badge className={getStatusColor(request.status)}>{getStatusText(request.status)}</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Leave Type:</span>
                        <p className="capitalize">{request.type}</p>
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span>
                        <p>
                          {new Date(request.startDate).toLocaleDateString()} -{" "}
                          {new Date(request.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Reason:</span>
                        <p>{request.reason}</p>
                      </div>
                    </div>

                    {request.managerReview?.comment && (
                      <div className="mt-3 p-2 bg-muted rounded">
                        <span className="font-medium text-sm">Manager Review:</span>
                        <p className="text-sm">{request.managerReview.comment}</p>
                      </div>
                    )}
                    {request.hrReview?.comment && (
                      <div className="mt-3 p-2 bg-muted rounded">
                        <span className="font-medium text-sm">HR Review:</span>
                        <p className="text-sm">{request.hrReview.comment}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
