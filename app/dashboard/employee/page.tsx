"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { Calendar, Clock, Plus, RefreshCw } from "lucide-react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import LeaveRequestForm from "@/components/leave/leave-request-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface LeaveRequest {
  _id: string
  type: string
  startDate: string
  endDate: string
  reason: string
  status: "pending_manager" | "pending_hr" | "approved" | "rejected_manager" | "rejected_hr"
  daysRequested: number
  managerReview?: {
    comment: string
    reviewedAt: string
  }
  hrReview?: {
    comment: string
    reviewedAt: string
  }
}

export default function EmployeeDashboard() {
  const { user, refreshUser } = useAuth()
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showRequestForm, setShowRequestForm] = useState(false)

  useEffect(() => {
    fetchLeaveRequests()
  }, [])

  const fetchLeaveRequests = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/leave-requests", {
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
        return "Pending Manager Approval"
      case "pending_hr":
        return "Pending HR Approval"
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
    fetchLeaveRequests()
    refreshUser() // Refresh user data to get updated leave balance
  }

  const refreshBalance = async () => {
    await refreshUser()
  }

  if (!user) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Employee Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.name}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={refreshBalance}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Balance
            </Button>
            <Dialog open={showRequestForm} onOpenChange={setShowRequestForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Leave Request
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
        </div>

        {/* Leave Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {user.leaveBalance.map((balance) => (
            <Card key={balance.type}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium capitalize">{balance.type} Leave</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{balance.remaining}</div>
                <p className="text-xs text-muted-foreground">days remaining</p>
                {balance.remaining === 0 && <p className="text-xs text-red-600 mt-1">No days available</p>}
                {balance.remaining <= 3 && balance.remaining > 0 && (
                  <p className="text-xs text-yellow-600 mt-1">Low balance</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Leave Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Leave Requests</CardTitle>
            <CardDescription>Your recent leave requests and their status</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : leaveRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p>No leave requests found</p>
                <p className="text-sm">Submit your first leave request to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {leaveRequests.map((request) => (
                  <div key={request._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium capitalize">{request.type} Leave</span>
                        <Badge className={getStatusColor(request.status)}>{getStatusText(request.status)}</Badge>
                        <span className="text-sm text-muted-foreground">({request.daysRequested} days)</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {new Date(request.startDate).toLocaleDateString()} -{" "}
                        {new Date(request.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">{request.reason}</p>
                      {request.managerReview?.comment && (
                        <p className="text-sm text-blue-600 mt-2">Manager Review: {request.managerReview.comment}</p>
                      )}
                      {request.hrReview?.comment && (
                        <p className="text-sm text-green-600 mt-2">HR Review: {request.hrReview.comment}</p>
                      )}
                    </div>
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
