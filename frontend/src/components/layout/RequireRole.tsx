"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";

export function RequireRole({
  role,
  children,
}: {
  role: "TENANT" | "OWNER";
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!profile) router.replace("/login");
    else if (profile.role === "UNASSIGNED") router.replace("/role");
    else if (profile.role !== role)
      router.replace(profile.role === "TENANT" ? "/tenant/dashboard" : "/owner/dashboard");
  }, [profile, loading, role, router]);

  if (loading || !profile || profile.role !== role) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <div className="mx-auto max-w-5xl p-8 text-sm text-zinc-600">
          Loading...
        </div>
      </div>
    );
  }

  return <AppShell role={profile.role}>{children}</AppShell>;
}

