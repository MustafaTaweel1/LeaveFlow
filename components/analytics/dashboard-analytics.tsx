"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Users, Calendar, Clock, CheckCircle } from "lucide-react"

interface AnalyticsData {
  leaveUtilization: {
    annual: { used: number; total: number }
    sick: { used: number; total: number }
    personal: { used: number; total: number }
    emergency: { used: number; total: number }
  }
  monthlyTrends: Array<{
    month: string
    requests: number
    approved: number
    rejected: number
  }>
  departmentStats: Array<{
    department: string
    totalRequests: number
    approvalRate: number
  }>
  upcomingLeaves: Array<{
    employee: string
    department: string
    startDate: string
    endDate: string
    type: string
  }>
}

export default function DashboardAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/analytics/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!analytics) return null

  const getUtilizationPercentage = (used: number, total: number) => {
    return total > 0 ? Math.round((used / total) * 100) : 0
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="h-4 w-4 text-green-600" />
    } else if (current < previous) {
      return <TrendingDown className="h-4 w-4 text-red-600" />
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Leave Utilization */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(analytics.leaveUtilization).map(([type, data]) => {
          const percentage = getUtilizationPercentage(data.used, data.total)
          return (
            <Card key={type}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium capitalize">{type} Leave</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Used: {data.used}</span>
                    <span>Total: {data.total}</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <p className="text-xs text-gray-500">{percentage}% utilized</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Trends
          </CardTitle>
          <CardDescription>Leave request trends over the past 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.monthlyTrends.map((month, index) => {
              const approvalRate = month.requests > 0 ? Math.round((month.approved / month.requests) * 100) : 0
              const previousMonth = analytics.monthlyTrends[index - 1]
              const trend = previousMonth ? getTrendIcon(month.requests, previousMonth.requests) : null

              return (
                <div key={month.month} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="font-medium">{month.month}</div>
                    {trend}
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-medium">{month.requests}</div>
                      <div className="text-gray-500">Requests</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-green-600">{month.approved}</div>
                      <div className="text-gray-500">Approved</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-red-600">{month.rejected}</div>
                      <div className="text-gray-500">Rejected</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{approvalRate}%</div>
                      <div className="text-gray-500">Approval Rate</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Department Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Department Statistics
            </CardTitle>
            <CardDescription>Leave request statistics by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.departmentStats.map((dept) => (
                <div key={dept.department} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{dept.department}</span>
                    <span className="text-sm text-gray-500">{dept.totalRequests} requests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={dept.approvalRate} className="flex-1 h-2" />
                    <span className="text-sm font-medium">{dept.approvalRate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Leaves */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Leaves
            </CardTitle>
            <CardDescription>Approved leaves starting soon</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.upcomingLeaves.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <CheckCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p>No upcoming leaves</p>
              </div>
            ) : (
              <div className="space-y-3">
                {analytics.upcomingLeaves.map((leave, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{leave.employee}</div>
                      <div className="text-sm text-gray-500">{leave.department}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium capitalize">{leave.type}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(leave.startDate).toLocaleDateString()} -{" "}
                        {new Date(leave.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
