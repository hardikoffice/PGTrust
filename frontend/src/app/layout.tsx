import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PG Trust",
  description: "Trust Score platform for PG rentals",
};

import { Footer } from "@/components/layout/Footer";
import { LandingNav } from "@/components/layout/LandingNav";
import { API_BASE_URL } from "@/lib/api";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <LandingNav />
        <div className="flex-grow">{children}</div>
        <Footer />
        <div className="fixed bottom-0 left-0 bg-red-500 text-white text-xs px-2 py-1 select-all z-50">
          DEBUG API URL: {API_BASE_URL}
        </div>
      </body>
    </html>
  );
}
