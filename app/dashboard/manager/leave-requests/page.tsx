"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { CheckCircle, XCircle, Clock, Plus } from "lucide-react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import LeaveRequestForm from "@/components/leave/leave-request-form"

interface LeaveRequest {
  _id: string
  employeeId: {
    name: string
    email: string
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

export default function ManagerLeaveRequests() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [myRequests, setMyRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showRequestForm, setShowRequestForm] = useState(false)

  useEffect(() => {
    fetchLeaveRequests()
    fetchMyRequests()
  }, [])

  const fetchLeaveRequests = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/leave-requests/team", {
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
    }
  }

  const fetchMyRequests = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/leave-requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setMyRequests(data)
      }
    } catch (error) {
      console.error("Failed to fetch my requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleManagerAction = async (requestId: string, action: "approve" | "reject", comment = "") => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/leave-requests/${requestId}/manager-${action}`, {
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

  const handleRequestSubmitted = () => {
    setShowRequestForm(false)
    fetchMyRequests()
  }

  if (!user) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Manager Leave Management</h1>
            <p className="text-muted-foreground">Manage team requests and submit your own</p>
          </div>
          <Dialog open={showRequestForm} onOpenChange={setShowRequestForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                My Leave Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Submit Leave Request</DialogTitle>
              </DialogHeader>
              <LeaveRequestForm onSuccess={handleRequestSubmitted} />
            </DialogContent>
          </Dialog>
        </div>

        {/* My Leave Requests */}
        <Card>
          <CardHeader>
            <CardTitle>My Leave Requests</CardTitle>
            <CardDescription>Your personal leave requests</CardDescription>
          </CardHeader>
          <CardContent>
            {myRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p>No leave requests found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myRequests.map((request) => (
                  <div key={request._id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{request.type} Leave</span>
                        <Badge className={getStatusColor(request.status)}>{getStatusText(request.status)}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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
                      <div>
                        <span className="font-medium">Status:</span>
                        <p className="capitalize">{getStatusText(request.status)}</p>
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

        {/* Team Leave Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Team Leave Requests</CardTitle>
            <CardDescription>Review and manage leave requests from your team</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : leaveRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p>No team leave requests found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {leaveRequests.map((request) => (
                  <div key={request._id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{request.employeeId.name}</span>
                          <Badge className={getStatusColor(request.status)}>{getStatusText(request.status)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{request.employeeId.email}</p>
                      </div>
                      {request.status === "pending_manager" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleManagerAction(request._id, "approve")}
                            className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                          >
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleManagerAction(request._id, "reject")}
                            className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <XCircle className="mr-1 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      )}
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
