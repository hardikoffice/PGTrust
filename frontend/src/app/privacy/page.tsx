"use client";


export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <main className="mx-auto max-w-3xl px-4 py-16 flex-grow">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-8">Privacy Policy</h1>
        <div className="prose prose-zinc prose-sm">
          <p>Last updated: March 28, 2026</p>
          <h2 className="text-lg font-bold mt-6 mb-2">1. Information We Collect</h2>
          <p>We collect personal information such as name, email, phone number, and government IDs (hashed) to provide and verify our trust-based services.</p>
          
          <h2 className="text-lg font-bold mt-6 mb-2">2. How We Use Data</h2>
          <p>Your data is used to calculate Trust Scores, manage booking requests, and ensure the safety of our community. We do not sell your personal data to third parties.</p>

          <h2 className="text-lg font-bold mt-6 mb-2">3. Data Security</h2>
          <p>We implement industry-standard security measures to protect your data, including encryption and hashing for sensitive identity information.</p>

          <h2 className="text-lg font-bold mt-6 mb-2">4. Your Rights</h2>
          <p>You have the right to access, correct, or request the deletion of your personal information at any time through your account settings or by contacting our support.</p>
        </div>
      </main>
    </div>
  );
}
