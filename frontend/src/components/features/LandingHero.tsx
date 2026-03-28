export function LandingHero() {
  return (
    <section
      className="group relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white px-6 py-12 shadow-sm ring-1 ring-zinc-100 md:px-12 md:py-20"
      aria-labelledby="landing-brand-heading"
    >
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-yellow-400/15 blur-3xl transition-all duration-700 group-hover:bg-yellow-400/25"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-zinc-300/20 blur-3xl transition-all duration-700 group-hover:bg-zinc-300/30"
        aria-hidden
      />

      <div className="relative z-10">
        <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-yellow-600">
          PG Trust
        </p>

        <h1
          id="landing-brand-heading"
          className="font-display landing-brand-headline landing-brand-enter mt-4 max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl"
        >
          The End of <br className="hidden md:block" /> Rental Risk.
        </h1>

        <p className="landing-tagline-enter mt-8 max-w-2xl text-lg leading-relaxed text-zinc-600 md:text-xl md:leading-relaxed">
          <span className="text-zinc-800 italic">Tired of </span>
          <span className="cursor-default rounded-md px-1 font-semibold text-zinc-900 transition-colors duration-300 hover:bg-yellow-100">
            Unreliable Tenants?
          </span>
          <span className="text-zinc-800"> Let </span>
          <span className="cursor-default rounded-md px-1 font-bold text-zinc-900 transition-colors duration-300 hover:bg-yellow-100">
            Your Score
          </span>
          <span className="text-zinc-800"> Do the Talking.</span>
        </p>
      </div>
    </section>
  );
}
