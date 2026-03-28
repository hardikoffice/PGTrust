"use client";

import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};

export function Button({ className, variant = "primary", ...props }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";
  const variants: Record<string, string> = {
    primary: "bg-yellow-400 text-black hover:bg-yellow-300 shadow-sm",
    secondary:
      "bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 shadow-sm",
    danger: "bg-red-600 text-white hover:bg-red-500 shadow-sm",
  };
  return (
    <button className={cn(base, variants[variant], className)} {...props} />
  );
}
