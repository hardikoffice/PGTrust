"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { apiFetch, setToken } from "@/lib/api";

export type Role = "TENANT" | "OWNER" | "UNASSIGNED";

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string | null;
  role: Role;
  tenant_data?: {
    verification_status: "UNVERIFIED" | "PENDING" | "VERIFIED";
    trust_score: number;
  } | null;
  owner_data?: {
    business_name: string | null;
    verified_owner: boolean;
    phone?: string | null;
  } | null;
};

export function useAuth() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const p = await apiFetch<Profile>("/user/profile", { auth: true });
      setProfile(p);
    } catch (e) {
      setProfile(null);
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setProfile(null);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return useMemo(
    () => ({ profile, loading, error, refresh, logout }),
    [profile, loading, error, refresh, logout]
  );
}

