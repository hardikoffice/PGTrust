"use client";

import Link from "next/link";

import { RequireRole } from "@/components/layout/RequireRole";
import { Button } from "@/components/ui/Button";

const steps = [
  {
    icon: "📝",
    title: "1. Complete Your Profile",
    desc: "Fill in your personal details — name, DOB, gender, income range. A complete profile builds trust with PG owners.",
  },
  {
    icon: "✅",
    title: "2. Get Verified",
    desc: "Upload a valid government ID. Once verified, you can send booking requests to any listed PG.",
  },
  {
    icon: "🔍",
    title: "3. Search & Request",
    desc: "Browse verified PG listings. Found one you like? Send a booking request with your preferred move-in date.",
  },
  {
    icon: "🤝",
    title: "4. Owner Reviews Your Profile",
    desc: "The PG owner can see your full profile, trust score, and verification status before accepting your request.",
  },
  {
    icon: "🏠",
    title: "5. Move In",
    desc: "Once your request is accepted, congratulations! You're now an active resident. Your dashboard will show your current stay.",
  },
  {
    icon: "💰",
    title: "6. Pay Rent Monthly",
    desc: "Mark your rent as paid each month from the dashboard. The owner verifies the payment — this keeps your trust score healthy.",
  },
  {
    icon: "📊",
    title: "7. Build Your Trust Score",
    desc: "Your trust score starts at 500. Timely rent, clean handovers, and good behavior all increase it. Higher scores unlock better PGs.",
  },
  {
    icon: "🚪",
    title: "8. Move Out Gracefully",
    desc: "When you're ready to leave, request a move-out. The owner will inspect the property and provide feedback that impacts your score.",
  },
];

const faqs = [
  {
    q: "What is a Trust Score?",
    a: "Your Trust Score is a numeric rating (0–1000) that reflects your reliability as a tenant. It's based on rent payments, property care, and owner feedback.",
  },
  {
    q: "How do I increase my Trust Score?",
    a: "Pay rent on time, maintain the property well, and build positive relationships with owners. Each successful stay adds to your score.",
  },
  {
    q: "What happens during a Damage Assessment?",
    a: "When you move out, the owner uploads move-in and move-out photos. Our AI compares them and generates a damage report. The result affects your trust score.",
  },
  {
    q: "Can I see my Damage Reports?",
    a: "Yes! Navigate to 'Damage Reports' in your sidebar to view every AI assessment applied to your account, including the score, damages, and reasoning.",
  },
  {
    q: "What if my request gets rejected?",
    a: "Don't worry — owners may reject requests for various reasons (e.g., room unavailable). Your trust score is NOT affected by rejections.",
  },
  {
    q: "Is my data safe?",
    a: "Absolutely. We use secure authentication and never share your personal details with other tenants. Only PG owners reviewing your request can see your profile.",
  },
];

export default function TenantGuidePage() {
  return (
    <RequireRole role="TENANT">
      <div className="mx-auto max-w-4xl py-12 px-6">
        {/* Header */}
        <div className="mb-12">
          <Link href="/tenant/dashboard" className="text-sm font-medium text-yellow-600 hover:underline">
            &larr; Back to Dashboard
          </Link>
          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-zinc-900">
            Tenant Guide
          </h1>
          <p className="mt-2 text-zinc-600 max-w-2xl">
            Everything you need to know about using PG Trust as a tenant — from signing up to building a high trust score.
          </p>
        </div>

        {/* Steps */}
        <section className="mb-16">
          <h2 className="font-display text-2xl font-bold text-zinc-900 mb-8">How It Works</h2>
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-yellow-400 via-yellow-200 to-transparent" />

            <div className="space-y-8">
              {steps.map((step, i) => (
                <div key={i} className="relative flex gap-6 pl-2">
                  <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white border-2 border-yellow-200 text-2xl shadow-sm">
                    {step.icon}
                  </div>
                  <div className="pt-1">
                    <h3 className="font-display text-lg font-bold text-zinc-900">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-600">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Score Breakdown */}
        <section className="mb-16">
          <h2 className="font-display text-2xl font-bold text-zinc-900 mb-6">Trust Score Breakdown</h2>
          <div className="rounded-3xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 p-8">
              <div className="text-center">
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Score Range</div>
                <div className="font-display text-5xl font-black text-white">0 — 1000</div>
                <div className="mt-2 text-sm text-zinc-400">Starting score for all new tenants: <span className="text-yellow-400 font-bold">500</span></div>
              </div>
            </div>
            <div className="p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-5">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-3">Score Boosters ↑</div>
                  <ul className="space-y-2 text-sm text-emerald-800">
                    <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span> On-time rent payments</li>
                    <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span> Clean property handover</li>
                    <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span> Positive owner feedback</li>
                    <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span> Long, stable stays</li>
                  </ul>
                </div>
                <div className="rounded-2xl bg-red-50 border border-red-100 p-5">
                  <div className="text-xs font-bold uppercase tracking-wider text-red-600 mb-3">Score Reducers ↓</div>
                  <ul className="space-y-2 text-sm text-red-800">
                    <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">✕</span> Late or missed rent payments</li>
                    <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">✕</span> Property damage on move-out</li>
                    <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">✕</span> Negative owner feedback</li>
                    <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">✕</span> Very short, unstable stays</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="mb-16">
          <h2 className="font-display text-2xl font-bold text-zinc-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h3 className="font-display font-bold text-zinc-900">{faq.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="rounded-3xl bg-gradient-to-r from-yellow-400 to-amber-400 p-10 text-center shadow-xl shadow-yellow-400/10">
          <h2 className="font-display text-2xl font-bold text-black">Ready to Get Started?</h2>
          <p className="mt-2 text-sm font-medium text-black/70 max-w-md mx-auto">
            Complete your profile, get verified, and start building your trust score today.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link href="/tenant/dashboard">
              <Button className="bg-black text-white hover:bg-zinc-800 px-8">Go to Dashboard</Button>
            </Link>
            <Link href="/search">
              <Button variant="secondary" className="px-8 border-black/20">Browse PGs</Button>
            </Link>
          </div>
        </div>
      </div>
    </RequireRole>
  );
}
