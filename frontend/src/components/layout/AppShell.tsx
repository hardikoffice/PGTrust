"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { Role } from "@/hooks/useAuth";
import { setToken } from "@/lib/api";

type Props = {
  role: Role;
  children: React.ReactNode;
};

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      className={cn(
        "rounded-lg px-3 py-2 text-sm font-medium transition",
        active ? "bg-yellow-100 text-zinc-900" : "text-zinc-600 hover:bg-zinc-50"
      )}
    >
      {label}
    </Link>
  );
}

export function AppShell({ role, children }: Props) {
  const router = useRouter();
  const tenantLinks = [
    { href: "/tenant/dashboard", label: "Dashboard" },
    { href: "/tenant/search", label: "Search" },
    { href: "/tenant/requests", label: "Requests" },
    { href: "/tenant/profile", label: "Profile" },
  ];
  const ownerLinks = [
    { href: "/owner/dashboard", label: "Dashboard" },
    { href: "/owner/properties", label: "Properties" },
    { href: "/owner/requests", label: "Requests" },
    { href: "/owner/rent-verifications", label: "Rent" },
    { href: "/owner/feedback", label: "Feedback" },
  ];
  const links = role === "OWNER" ? ownerLinks : tenantLinks;

  return (
    <div className="flex min-h-[calc(100vh-0px)] w-full bg-zinc-50">
      <aside className="hidden w-64 border-r border-zinc-200 bg-white p-4 md:flex md:flex-col md:gap-2">
        <div className="flex items-center justify-between pb-2">
          <Link href="/" className="text-lg font-semibold">
            PG Trust
          </Link>
          <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-zinc-700">
            {role}
          </span>
        </div>
        <nav className="flex flex-col gap-1">
          {links.map((l) => (
            <NavLink key={l.href} href={l.href} label={l.label} />
          ))}
        </nav>
        <div className="mt-auto pt-4">
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              setToken(null);
              router.push("/login");
              router.refresh();
            }}
          >
            Logout
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 md:hidden">
          <Link href="/" className="text-base font-semibold">
            PG Trust
          </Link>
          <Button
            variant="secondary"
            onClick={() => {
              setToken(null);
              router.push("/login");
              router.refresh();
            }}
          >
            Logout
          </Button>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 p-4 md:p-8">
          {children}
        </main>

        <nav className="sticky bottom-0 border-t border-zinc-200 bg-white p-2 md:hidden">
          <div className="grid grid-cols-4 gap-2">
            {links.slice(0, 4).map((l) => (
              <NavLink key={l.href} href={l.href} label={l.label} />
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}

