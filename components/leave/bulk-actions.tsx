"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle } from "lucide-react"

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
  status: "pending" | "approved" | "rejected"
}

interface BulkActionsProps {
  requests: LeaveRequest[]
  selectedRequests: string[]
  onSelectionChange: (requestIds: string[]) => void
  onActionComplete: () => void
}

export default function BulkActions({
  requests,
  selectedRequests,
  onSelectionChange,
  onActionComplete,
}: BulkActionsProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showBulkApprove, setShowBulkApprove] = useState(false)
  const [showBulkReject, setShowBulkReject] = useState(false)
  const [comment, setComment] = useState("")

  const pendingRequests = requests.filter((req) => req.status === "pending")
  const selectedPendingRequests = selectedRequests.filter((id) => pendingRequests.some((req) => req._id === id))

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(pendingRequests.map((req) => req._id))
    } else {
      onSelectionChange([])
    }
  }

  const handleSelectRequest = (requestId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedRequests, requestId])
    } else {
      onSelectionChange(selectedRequests.filter((id) => id !== requestId))
    }
  }

  const handleBulkAction = async (action: "approve" | "reject") => {
    if (selectedPendingRequests.length === 0) return

    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const promises = selectedPendingRequests.map((requestId) =>
        fetch(`/api/leave-requests/${requestId}/${action}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ comment }),
        }),
      )

      const results = await Promise.all(promises)
      const successCount = results.filter((res) => res.ok).length

      toast({
        title: "Bulk Action Complete",
        description: `${successCount} requests ${action}d successfully`,
      })

      onSelectionChange([])
      onActionComplete()
      setComment("")
      setShowBulkApprove(false)
      setShowBulkReject(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process bulk action",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const allSelected = pendingRequests.length > 0 && selectedPendingRequests.length === pendingRequests.length
  const someSelected = selectedPendingRequests.length > 0 && selectedPendingRequests.length < pendingRequests.length

  return (
    <div className="space-y-4">
      {/* Bulk Selection Controls */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected
              }}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="select-all" className="text-sm font-medium">
              Select All ({pendingRequests.length} pending)
            </Label>
          </div>
          {selectedPendingRequests.length > 0 && (
            <span className="text-sm text-gray-600">{selectedPendingRequests.length} selected</span>
          )}
        </div>

        {selectedPendingRequests.length > 0 && (
          <div className="flex space-x-2">
            <Dialog open={showBulkApprove} onOpenChange={setShowBulkApprove}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Approve ({selectedPendingRequests.length})
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk Approve Requests</DialogTitle>
                  <DialogDescription>
                    You are about to approve {selectedPendingRequests.length} leave requests.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="approve-comment">Comment (Optional)</Label>
                    <Textarea
                      id="approve-comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add a comment for all approved requests..."
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowBulkApprove(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleBulkAction("approve")}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {loading ? "Processing..." : "Approve All"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showBulkReject} onOpenChange={setShowBulkReject}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                >
                  <XCircle className="mr-1 h-4 w-4" />
                  Reject ({selectedPendingRequests.length})
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk Reject Requests</DialogTitle>
                  <DialogDescription>
                    You are about to reject {selectedPendingRequests.length} leave requests.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reject-comment">Reason for Rejection</Label>
                    <Textarea
                      id="reject-comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Please provide a reason for rejection..."
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowBulkReject(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleBulkAction("reject")}
                      disabled={loading || !comment.trim()}
                      variant="destructive"
                    >
                      {loading ? "Processing..." : "Reject All"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Request List with Checkboxes */}
      <div className="space-y-4">
        {requests.map((request) => (
          <div key={request._id} className="flex items-start space-x-3 p-4 border rounded-lg">
            {request.status === "pending" && (
              <Checkbox
                checked={selectedRequests.includes(request._id)}
                onCheckedChange={(checked) => handleSelectRequest(request._id, checked as boolean)}
                className="mt-1"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{request.employeeId.name}</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    request.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : request.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {request.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{request.employeeId.email}</p>
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
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
