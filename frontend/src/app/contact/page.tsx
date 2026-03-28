"use client";

import { LandingNav } from "@/components/layout/LandingNav";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <LandingNav />
      <main className="mx-auto max-w-xl px-4 py-16 flex-grow w-full">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">Contact Us</h1>
        <p className="text-zinc-600 mb-8">Have questions or need help? Reach out to our support team.</p>
        
        {submitted ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center">
            <h2 className="text-xl font-bold text-zinc-900 mb-2">Message Sent!</h2>
            <p className="text-zinc-600 mb-6">Thank you for reaching out. We'll get back to you within 24-48 hours.</p>
            <Button onClick={() => setSubmitted(false)} variant="secondary">Send another message</Button>
          </div>
        ) : (
          <form 
            className="grid gap-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
          >
            <Input label="Full Name" placeholder="Your name..." required />
            <Input label="Email Address" type="email" placeholder="you@example.com..." required />
            <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
              Message
              <textarea 
                className="min-h-[150px] rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 focus:ring-2 focus:ring-yellow-400 outline-none"
                placeholder="How can we help you?"
                required
              />
            </label>
            <Button type="submit" className="w-full">Send Message</Button>
          </form>
        )}

        <div className="mt-12 space-y-4">
           <div className="flex items-center gap-3">
             <div className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
               📧
             </div>
             <div>
               <div className="text-sm font-semibold">Email</div>
               <div className="text-sm text-zinc-500">support@pgtrust.com</div>
             </div>
           </div>
           <div className="flex items-center gap-3">
             <div className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
               📍
             </div>
             <div>
               <div className="text-sm font-semibold">Location</div>
               <div className="text-sm text-zinc-500">Bengaluru, India</div>
             </div>
           </div>
        </div>
      </main>
    </div>
  );
}
