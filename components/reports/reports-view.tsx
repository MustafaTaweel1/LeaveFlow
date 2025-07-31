"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, FileText, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ReportData {
  employee: string
  department: string
  leaveType: string
  startDate: string
  endDate: string
  days: number
  status: string
}

export default function ReportsView() {
  const [reportData, setReportData] = useState<ReportData[]>([])
  const [filteredData, setFilteredData] = useState<ReportData[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    department: "all",
    leaveType: "all",
    status: "all",
    startDate: "",
    endDate: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchReportData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, reportData])

  const fetchReportData = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/reports/leave-summary", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setReportData(data)
        setFilteredData(data)
      }
    } catch (error) {
      console.error("Failed to fetch report data:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = reportData

    if (filters.department !== "all") {
      filtered = filtered.filter((item) => item.department === filters.department)
    }
    if (filters.leaveType !== "all") {
      filtered = filtered.filter((item) => item.leaveType === filters.leaveType)
    }
    if (filters.status !== "all") {
      filtered = filtered.filter((item) => item.status === filters.status)
    }
    if (filters.startDate) {
      filtered = filtered.filter((item) => new Date(item.startDate) >= new Date(filters.startDate))
    }
    if (filters.endDate) {
      filtered = filtered.filter((item) => new Date(item.endDate) <= new Date(filters.endDate))
    }

    setFilteredData(filtered)
  }

  const exportToCSV = () => {
    const headers = ["Employee", "Department", "Leave Type", "Start Date", "End Date", "Days", "Status"]
    const csvContent = [
      headers.join(","),
      ...filteredData.map((row) =>
        [row.employee, row.department, row.leaveType, row.startDate, row.endDate, row.days, row.status].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `leave-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Success",
      description: "Report exported successfully",
    })
  }

  const clearFilters = () => {
    setFilters({
      department: "all",
      leaveType: "all",
      status: "all",
      startDate: "",
      endDate: "",
    })
  }

  const uniqueDepartments = [...new Set(reportData.map((item) => item.department))]
  const uniqueLeaveTypes = [...new Set(reportData.map((item) => item.leaveType))]

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
          <CardDescription>Filter the report data by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={filters.department}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, department: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {uniqueDepartments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Leave Type</Label>
              <Select
                value={filters.leaveType}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, leaveType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueLeaveTypes.map((type) => (
                    <SelectItem key={type} value={type} className="capitalize">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
            <Button onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Leave Report
          </CardTitle>
          <CardDescription>
            Showing {filteredData.length} of {reportData.length} records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading report data...</div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>No data found matching the current filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Employee</th>
                    <th className="text-left p-2 font-medium">Department</th>
                    <th className="text-left p-2 font-medium">Leave Type</th>
                    <th className="text-left p-2 font-medium">Start Date</th>
                    <th className="text-left p-2 font-medium">End Date</th>
                    <th className="text-left p-2 font-medium">Days</th>
                    <th className="text-left p-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2">{row.employee}</td>
                      <td className="p-2">{row.department}</td>
                      <td className="p-2 capitalize">{row.leaveType}</td>
                      <td className="p-2">{new Date(row.startDate).toLocaleDateString()}</td>
                      <td className="p-2">{new Date(row.endDate).toLocaleDateString()}</td>
                      <td className="p-2">{row.days}</td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            row.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : row.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
