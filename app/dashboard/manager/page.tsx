"use client"

// Replace the entire content with a redirect to the new page
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ManagerDashboard() {
  const router = useRouter()

  useEffect(() => {
    router.push("/dashboard/manager/leave-requests")
  }, [router])

  return null
}
