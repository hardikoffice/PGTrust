"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiFetch, setToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-zinc-900">Login</h1>
          <p className="text-sm text-zinc-600">
            Access your dashboard using your email and password.
          </p>
        </div>

        <form
          className="grid gap-3 rounded-xl border border-zinc-200 bg-white p-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setErr(null);
            setLoading(true);
            try {
              const res = await apiFetch<{
                access_token: string;
                role: "TENANT" | "OWNER" | "UNASSIGNED";
              }>("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password }),
              });
              setToken(res.access_token);
              router.push(res.role === "UNASSIGNED" ? "/role" : res.role === "TENANT" ? "/tenant/dashboard" : "/owner/dashboard");
              router.refresh();
            } catch (e) {
              setErr(e instanceof Error ? e.message : "Login failed");
            } finally {
              setLoading(false);
            }
          }}
        >
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {err ? (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          ) : null}
          <Button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="text-sm text-zinc-600">
          New here?{" "}
          <Link className="font-medium text-zinc-900 underline" href="/signup">
            Create an account
          </Link>
        </div>
      </main>
    </div>
  );
}

