"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Settings, Building, Mail, Shield, Calendar } from "lucide-react"

interface SystemSettings {
  company: {
    name: string
    address: string
    phone: string
    email: string
  }
  leave: {
    maxDaysInAdvance: number
    minNoticeHours: number
    allowWeekendRequests: boolean
    autoApprovalLimit: number
  }
  notifications: {
    emailEnabled: boolean
    managerNotifications: boolean
    hrNotifications: boolean
    reminderDays: number
  }
  holidays: Array<{
    name: string
    date: string
    recurring: boolean
  }>
}

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [settings, setSettings] = useState<SystemSettings>({
    company: {
      name: "Your Company Name",
      address: "123 Business St, City, State 12345",
      phone: "+1 (555) 123-4567",
      email: "hr@company.com",
    },
    leave: {
      maxDaysInAdvance: 365,
      minNoticeHours: 24,
      allowWeekendRequests: true,
      autoApprovalLimit: 0,
    },
    notifications: {
      emailEnabled: true,
      managerNotifications: true,
      hrNotifications: true,
      reminderDays: 7,
    },
    holidays: [
      { name: "New Year's Day", date: "2024-01-01", recurring: true },
      { name: "Independence Day", date: "2024-07-04", recurring: true },
      { name: "Christmas Day", date: "2024-12-25", recurring: true },
    ],
  })
  const [loading, setLoading] = useState(false)
  const [newHoliday, setNewHoliday] = useState({ name: "", date: "", recurring: false })

  useEffect(() => {
    if (user && ["hr", "admin"].includes(user.role)) {
      fetchSettings()
    }
  }, [user])

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/settings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    }
  }

  const saveSettings = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Settings saved successfully",
        })
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addHoliday = () => {
    if (newHoliday.name && newHoliday.date) {
      setSettings((prev) => ({
        ...prev,
        holidays: [...prev.holidays, newHoliday],
      }))
      setNewHoliday({ name: "", date: "", recurring: false })
    }
  }

  const removeHoliday = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      holidays: prev.holidays.filter((_, i) => i !== index),
    }))
  }

  if (!user || !["hr", "admin"].includes(user.role)) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>Access denied. This page is only available to HR and Admin users.</p>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-600">Configure system-wide settings and preferences</p>
          </div>
          <Button onClick={saveSettings} disabled={loading}>
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </div>

        <Tabs defaultValue="company" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Company
            </TabsTrigger>
            <TabsTrigger value="leave" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Leave Policy
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="holidays" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Holidays
            </TabsTrigger>
          </TabsList>

          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Update your company details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={settings.company.name}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          company: { ...prev.company, name: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyEmail">Company Email</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={settings.company.email}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          company: { ...prev.company, email: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Address</Label>
                  <Textarea
                    id="companyAddress"
                    value={settings.company.address}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        company: { ...prev.company, address: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Phone Number</Label>
                  <Input
                    id="companyPhone"
                    value={settings.company.phone}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        company: { ...prev.company, phone: e.target.value },
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leave">
            <Card>
              <CardHeader>
                <CardTitle>Leave Policy Settings</CardTitle>
                <CardDescription>Configure leave request rules and limitations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxDays">Maximum Days in Advance</Label>
                    <Input
                      id="maxDays"
                      type="number"
                      value={settings.leave.maxDaysInAdvance}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          leave: { ...prev.leave, maxDaysInAdvance: Number.parseInt(e.target.value) || 0 },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minNotice">Minimum Notice (Hours)</Label>
                    <Input
                      id="minNotice"
                      type="number"
                      value={settings.leave.minNoticeHours}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          leave: { ...prev.leave, minNoticeHours: Number.parseInt(e.target.value) || 0 },
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="weekendRequests"
                    checked={settings.leave.allowWeekendRequests}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        leave: { ...prev.leave, allowWeekendRequests: checked },
                      }))
                    }
                  />
                  <Label htmlFor="weekendRequests">Allow weekend leave requests</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="autoApproval">Auto-approval limit (days)</Label>
                  <Input
                    id="autoApproval"
                    type="number"
                    value={settings.leave.autoApprovalLimit}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        leave: { ...prev.leave, autoApprovalLimit: Number.parseInt(e.target.value) || 0 },
                      }))
                    }
                  />
                  <p className="text-sm text-gray-500">Set to 0 to disable auto-approval</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure email notifications and reminders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="emailEnabled"
                    checked={settings.notifications.emailEnabled}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, emailEnabled: checked },
                      }))
                    }
                  />
                  <Label htmlFor="emailEnabled">Enable email notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="managerNotifications"
                    checked={settings.notifications.managerNotifications}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, managerNotifications: checked },
                      }))
                    }
                  />
                  <Label htmlFor="managerNotifications">Notify managers of new requests</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="hrNotifications"
                    checked={settings.notifications.hrNotifications}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, hrNotifications: checked },
                      }))
                    }
                  />
                  <Label htmlFor="hrNotifications">Notify HR of all requests</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reminderDays">Reminder days before leave</Label>
                  <Input
                    id="reminderDays"
                    type="number"
                    value={settings.notifications.reminderDays}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, reminderDays: Number.parseInt(e.target.value) || 0 },
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="holidays">
            <Card>
              <CardHeader>
                <CardTitle>Company Holidays</CardTitle>
                <CardDescription>Manage company holidays and non-working days</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="holidayName">Holiday Name</Label>
                    <Input
                      id="holidayName"
                      value={newHoliday.name}
                      onChange={(e) => setNewHoliday((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Labor Day"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="holidayDate">Date</Label>
                    <Input
                      id="holidayDate"
                      type="date"
                      value={newHoliday.date}
                      onChange={(e) => setNewHoliday((prev) => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Actions</Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={newHoliday.recurring}
                        onCheckedChange={(checked) => setNewHoliday((prev) => ({ ...prev, recurring: checked }))}
                      />
                      <span className="text-sm">Recurring</span>
                      <Button onClick={addHoliday} size="sm">
                        Add
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Current Holidays</h4>
                  {settings.holidays.length === 0 ? (
                    <p className="text-gray-500 text-sm">No holidays configured</p>
                  ) : (
                    <div className="space-y-2">
                      {settings.holidays.map((holiday, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <span className="font-medium">{holiday.name}</span>
                            <span className="text-gray-500 ml-2">{new Date(holiday.date).toLocaleDateString()}</span>
                            {holiday.recurring && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2">
                                Recurring
                              </span>
                            )}
                          </div>
                          <Button variant="outline" size="sm" onClick={() => removeHoliday(index)}>
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
