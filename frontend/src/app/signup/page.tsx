"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiFetch, setToken } from "@/lib/api";
import { cn } from "@/lib/cn";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"TENANT" | "OWNER">("TENANT");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-zinc-900">Create account</h1>
          <p className="text-sm text-zinc-600">
            Sign up and get started instantly.
          </p>
        </div>

        <form
          className="grid gap-3 rounded-xl border border-zinc-200 bg-white p-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setErr(null);
            setLoading(true);
            try {
              const res = await apiFetch<{ access_token: string }>("/auth/signup", {
                method: "POST",
                body: JSON.stringify({
                  email,
                  password,
                  full_name: fullName,
                  phone_number: phoneNumber || null,
                  role,
                }),
              });
              
              // Auto-login: set the token
              setToken(res.access_token);
              
              // Redirect to profile setup
              const next = searchParams.get("next") || "/profile-setup";
              router.push(next);
              router.refresh();
            } catch (e) {
              setErr(e instanceof Error ? e.message : "Signup failed");
            } finally {
              setLoading(false);
            }
          }}
        >
          <Input
            label="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <Input
            label="Phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+91..."
          />
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
            {loading ? "Creating..." : "Create account"}
          </Button>
        </form>

        <div className="text-sm text-zinc-600">
          Already have an account?{" "}
          <Link
            className="font-medium text-zinc-900 underline"
            href={`/login?next=${encodeURIComponent(searchParams.get("next") || "/")}`}
          >
            Login
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50">
          <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12">
            <p className="text-sm text-zinc-500">Loading…</p>
          </main>
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}

