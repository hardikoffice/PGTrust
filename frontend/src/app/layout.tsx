import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PG Trust",
  description: "Trust Score platform for PG rentals",
};

import { Footer } from "@/components/layout/Footer";

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
        <div className="flex-grow">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
