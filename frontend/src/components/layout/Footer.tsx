import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="col-span-2 space-y-6">
            <Link href="/" className="font-display text-xl font-bold tracking-tight text-zinc-900">
              PG Trust
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-zinc-600">
              Building the first decentralized trust network for PG rentals. Verify your reputation, unlock better stays.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-display text-sm font-bold uppercase tracking-widest text-zinc-900">Platform</h4>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li><Link href="/search" className="hover:text-yellow-600 transition-colors">Search PGs</Link></li>
              <li><Link href="/signup" className="hover:text-yellow-600 transition-colors">Create Account</Link></li>
              <li><Link href="/login" className="hover:text-yellow-600 transition-colors">Sign In</Link></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-display text-sm font-bold uppercase tracking-widest text-zinc-900">Company</h4>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li><Link href="/about" className="hover:text-yellow-600 transition-colors">About Us</Link></li>
              <li><Link href="/privacy" className="hover:text-yellow-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-yellow-600 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-zinc-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-medium text-zinc-500">
            © {new Date().getFullYear()} PG Trust Score Engine. All rights reserved.
          </p>
          <div className="flex gap-6">
             {/* Social placeholders */}
             <div className="h-4 w-4 rounded-full bg-zinc-200" />
             <div className="h-4 w-4 rounded-full bg-zinc-200" />
             <div className="h-4 w-4 rounded-full bg-zinc-200" />
          </div>
        </div>
      </div>
    </footer>
  );
}
