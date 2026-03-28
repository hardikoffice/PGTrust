"use client";

import { resolveMediaUrl } from "@/lib/api";

type Props = {
  src?: string | null;
  alt: string;
  className?: string;
};

export function PgThumbnail({ src, alt, className }: Props) {
  const base =
    "shrink-0 rounded-xl border border-zinc-200 bg-zinc-100 object-cover";
  if (!src) {
    return (
      <div
        className={`flex h-24 w-32 items-center justify-center text-xs text-zinc-400 ${base} ${className ?? ""}`}
      >
        No photo
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolveMediaUrl(src)}
      alt={alt}
      className={`h-24 w-32 ${base} ${className ?? ""}`}
    />
  );
}
