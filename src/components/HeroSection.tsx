"use client";

import { motion } from "framer-motion";

const cards = [
  {
    id: "blauwprint",
    title: "Blauwprint",
    description: "Bezetting 2026 per lijn.",
  },
  {
    id: "planning",
    title: "Planningsregels",
    description: "Wanneer FTE wijzigt.",
  },
  {
    id: "pause-aflos",
    title: "Pauze-aflos",
    description: "Simulatie Lijn D & E.",
  },
] as const;

export function HeroSection() {
  function scrollTo(id: string) {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section
      id="intro"
      className="relative flex min-h-dvh items-center justify-center overflow-hidden px-6 pt-24 pb-16">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-150 w-200 -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-br from-brand-gold/20 via-amber-50/30 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 h-125 w-150 translate-x-1/4 translate-y-1/4 rounded-full bg-linear-to-tl from-brand-gold/15 via-amber-50/20 to-transparent blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center">
          <h1 className="mx-auto max-w-4xl text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl md:text-5xl lg:text-6xl">
            Van blauwprint naar
            <span className="block text-brand-gold">
              werkvloer beslissingen
            </span>
          </h1>

          <p className="mx-auto mt-4 sm:mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-neutral-600 px-4 sm:px-0">
            Blauwprint ≠ realiteit: FTE beweegt mee met planningcondities en
            pause-aflos coverage.
          </p>

          {/* CTA Button */}
          <div className="mt-8 sm:mt-10 px-4 sm:px-0">
            <button
              type="button"
              onClick={() => scrollTo("calculator")}
              className="inline-flex items-center gap-2 rounded-full bg-brand-gold px-6 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-brand-gold/25 transition-all hover:bg-brand-gold/90 hover:shadow-xl hover:shadow-brand-gold/30 w-full sm:w-auto justify-center">
              <span>Open FTE Calculator</span>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </button>
          </div>
        </motion.div>

        {/* Navigation Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="mt-10 sm:mt-16 px-2 sm:px-0">
          <p className="mb-3 sm:mb-4 text-center text-xs font-bold uppercase tracking-widest text-neutral-400">
            Navigeer door de presentatie
          </p>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
            {cards.map((c, idx) => (
              <motion.button
                key={c.id}
                type="button"
                onClick={() => scrollTo(c.id)}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-white p-3 sm:p-5 text-left shadow-sm ring-1 ring-neutral-200/80 transition-all hover:shadow-lg hover:ring-brand-gold/40">
                <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-brand-gold/10 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <span className="text-xs font-bold text-brand-gold">
                    {idx + 1}
                  </span>
                  <h3 className="mt-1 font-bold text-brand-navy">{c.title}</h3>
                  <p className="mt-1 text-xs text-neutral-500">
                    {c.description}
                  </p>
                </div>
                <div className="absolute bottom-4 right-4 text-brand-gold opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
