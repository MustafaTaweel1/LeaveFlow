"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/auth/login-form";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";
export const dynamic = "force-dynamic";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && user) {
      // Redirect based on user role
      switch (user.role) {
        case "admin":
        case "hr":
          router.push("/dashboard/hr");
          break;
        case "manager":
          router.push("/dashboard/manager");
          break;
        case "employee":
          router.push("/dashboard/employee");
          break;
        default:
          router.push("/dashboard/employee");
      }
    }
  }, [user, loading, router, mounted]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Employee Leave Management
          </h1>
          <p className="text-muted-foreground">
            Sign in to manage your leave requests
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
