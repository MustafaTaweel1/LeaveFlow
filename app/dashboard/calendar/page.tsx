"use client"

import { useAuth } from "@/contexts/auth-context"
import DashboardLayout from "@/components/layout/dashboard-layout"
import TeamCalendar from "@/components/calendar/team-calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "lucide-react"

export default function CalendarPage() {
  const { user } = useAuth()

  if (!user || !["manager", "hr", "admin"].includes(user.role)) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>Access denied. This page is only available to managers and HR.</p>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Calendar</h1>
          <p className="text-gray-600">View and manage team leave schedules</p>
        </div>
        <TeamCalendar />
      </div>
    </DashboardLayout>
  )
}
