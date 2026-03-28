"use client";

import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ label, className, ...props }: Props) {
  return (
    <label className="grid gap-1.5 text-sm">
      {label ? <span className="font-medium text-zinc-700">{label}</span> : null}
      <input
        className={cn(
          "h-11 rounded-xl border border-zinc-200 bg-white px-4 text-zinc-900 shadow-sm outline-none transition-all placeholder:text-zinc-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/10",
          className
        )}
        {...props}
      />
    </label>
  );
}
