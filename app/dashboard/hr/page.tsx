"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HRDashboard() {
  const router = useRouter()

  useEffect(() => {
    router.push("/dashboard/hr/leave-requests")
  }, [router])

  return null
}
