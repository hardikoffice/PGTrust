"use client";

import { LandingNav } from "@/components/layout/LandingNav";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <LandingNav />
      <main className="mx-auto max-w-3xl px-4 py-16 flex-grow">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-8">About PG Trust</h1>
        <div className="prose prose-zinc lg:prose-lg">
          <p className="text-lg text-zinc-600 mb-6">
            PG Trust is a platform dedicated to making PG rentals safer and more transparent for everyone. 
            We believe that finding a home should be based on real data and verified experiences.
          </p>
          <h2 className="text-2xl font-bold text-zinc-900 mt-12 mb-4">Our Mission</h2>
          <p className="text-zinc-600 mb-4">
            Our mission is to build a high-trust ecosystem where owners can find reliable tenants and tenants can build a verified reputation through their stay history.
          </p>
          <h2 className="text-2xl font-bold text-zinc-900 mt-12 mb-4">How it Works</h2>
          <ul className="list-disc list-inside space-y-3 text-zinc-600">
            <li><strong>Verified IDs:</strong> Todos are verified with government IDs to prevent fraud and multi-accounting.</li>
            <li><strong>Trust Scores:</strong> Every interaction, payment, and stay contributes to a dynamic trust score.</li>
            <li><strong>Authentic Reviews:</strong> Only tenants who have stayed at a PG can leave a verified rating and review.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
