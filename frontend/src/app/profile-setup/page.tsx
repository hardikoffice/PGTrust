"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export default function ProfileSetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile: user, refresh: mutate } = useAuth();
  
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [incomeRange, setIncomeRange] = useState("");
  const [phone, setPhone] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (user.role === "OWNER") {
        router.push("/owner/dashboard");
        return;
      }
      setFullName(user.full_name || "");
      setPhone(user.phone_number || "");
    }
  }, [user, router]);

  const calculateAge = (dateString: string) => {
    if (!dateString) return null;
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(dob);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      await apiFetch("/user/me/profile", {
        method: "PATCH",
        auth: true,
        body: JSON.stringify({
          full_name: fullName || null,
          phone_number: phone || null,
          date_of_birth: dob || null,
          gender: gender || null,
          marital_status: maritalStatus || null,
          income_range: incomeRange || null,
        }),
      });
      
      await mutate(); // Refresh user data
      
      const dashboard = user?.role === "OWNER" ? "/owner/dashboard" : "/tenant/dashboard";
      const next = searchParams.get("next") || dashboard;
      router.push(next);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 py-16 px-4">
      <div className="mx-auto max-w-xl">
        <div className="mb-10 text-center">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-zinc-900 md:text-5xl">
            Complete Your Profile
          </h1>
          <p className="mt-4 text-lg text-zinc-600">Provide these details to get your initial Trust Score.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 rounded-3xl border border-zinc-200 bg-white p-10 shadow-xl shadow-zinc-200/50">
          <div className="space-y-6">
            <h2 className="font-display text-xl font-bold text-zinc-900 border-b border-zinc-100 pb-2">
              Personal Information
            </h2>
            
            <Input 
              label="Full Name" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              placeholder="Your name as on ID"
              required 
            />
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1.5 flex flex-col">
                <label className="text-sm font-semibold text-zinc-700">Date of Birth</label>
                <input
                  type="date"
                  className="h-11 rounded-xl border border-zinc-200 bg-white px-4 text-zinc-900 shadow-sm outline-none transition-all focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/10"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />
                {age !== null && (
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mt-1.5 ml-1">
                    Confirmed: {age} years
                  </p>
                )}
              </div>

              <div className="space-y-1.5 flex flex-col">
                <label className="text-sm font-semibold text-zinc-700">Gender</label>
                <select
                  className="h-11 rounded-xl border border-zinc-200 bg-white px-4 text-zinc-900 shadow-sm outline-none transition-all focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/10 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                >
                  <option value="">Select...</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="font-display text-xl font-bold text-zinc-900 border-b border-zinc-100 pb-2">
              Financial & Status
            </h2>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1.5 flex flex-col">
                <label className="text-sm font-semibold text-zinc-700">Marital Status</label>
                <select
                  className="h-11 rounded-xl border border-zinc-200 bg-white px-4 text-zinc-900 shadow-sm outline-none transition-all focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/10 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value)}
                  required
                >
                  <option value="">Select...</option>
                  <option value="SINGLE">Single</option>
                  <option value="MARRIED">Married</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="space-y-1.5 flex flex-col">
                <label className="text-sm font-semibold text-zinc-700">Income Range (INR)</label>
                <select
                  className="h-11 rounded-xl border border-zinc-200 bg-white px-4 text-zinc-900 shadow-sm outline-none transition-all focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/10 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
                  value={incomeRange}
                  onChange={(e) => setIncomeRange(e.target.value)}
                  required
                >
                  <option value="">Select...</option>
                  <option value="0-3L">₹0 - ₹3,00,000</option>
                  <option value="3L-6L">₹3,00,000 - ₹6,00,000</option>
                  <option value="6L-12L">₹6,00,000 - ₹12,00,000</option>
                  <option value="12L+">₹12,00,000+</option>
                </select>
              </div>
            </div>

            <Input 
              label="Active Phone Number" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              placeholder="+91..."
              required 
            />
          </div>

          {err && (
            <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700 border border-red-100">
              ⚠️ {err}
            </div>
          )}

          <Button type="submit" className="w-full h-12 text-base shadow-lg shadow-yellow-400/20" disabled={loading}>
            {loading ? "Calculating..." : "Generate My Trust Score"}
          </Button>
        </form>
      </div>
    </div>
  );
}
