"use client";

import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ label, className, ...props }: Props) {
  return (
    <label className="grid gap-1 text-sm">
      {label ? <span className="text-zinc-700">{label}</span> : null}
      <input
        className={cn(
          "h-10 rounded-lg border border-zinc-200 bg-white px-3 text-zinc-900 outline-none focus:ring-2 focus:ring-yellow-400",
          className
        )}
        {...props}
      />
    </label>
  );
}

