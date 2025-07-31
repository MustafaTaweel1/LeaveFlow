"use client"

import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { LogOut, User, Calendar, BarChart3, Users, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import NotificationCenter from "@/components/notifications/notification-center"
import { ThemeToggle } from "@/components/theme/theme-toggle"

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  if (!user) return null

  const getNavItems = () => {
    const baseItems = [
      {
        href: user.role === "employee" ? `/dashboard/${user.role}` : `/dashboard/${user.role}/leave-requests`,
        label: "Dashboard",
        icon: BarChart3,
      },
    ]

    if (user.role === "manager" || user.role === "hr" || user.role === "admin") {
      baseItems.push(
        { href: "/dashboard/calendar", label: "Team Calendar", icon: Calendar },
        { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
      )
    }

    if (user.role === "hr" || user.role === "admin") {
      baseItems.push(
        { href: "/dashboard/users", label: "Manage Users", icon: Users },
        { href: "/dashboard/settings", label: "Settings", icon: Settings },
      )
    }

    return baseItems
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-foreground">Leave Management System</h1>
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <NotificationCenter />
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-foreground">{user.name}</span>
                <span className="text-xs text-muted-foreground capitalize">({user.role})</span>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex space-x-4">
            {getNavItems().map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link key={item.href} href={item.href}>
                  <Button variant={isActive ? "default" : "ghost"} size="sm" className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main>{children}</main>
      </div>
    </div>
  )
}
