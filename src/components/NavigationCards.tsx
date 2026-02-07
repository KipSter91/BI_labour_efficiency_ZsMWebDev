"use client";

import { motion } from "framer-motion";

const cards = [
  {
    id: "blauwprint",
    title: "Blauwprint",
    description: "Concrete staffing blueprint 2026 (per lijn + functies).",
  },
  {
    id: "planning",
    title: "Planning omstandigheden",
    description: "Planning rules die bepalen wanneer FTE kan zakken.",
  },
  {
    id: "calculator",
    title: "FTE Calculator",
    description: "Scenario berekening met directe FTE impact.",
  },
  {
    id: "planner",
    title: "Weekplanner",
    description: "Bezetting per dag en shift plannen.",
  },
  {
    id: "pause-aflos",
    title: "Pause aflos",
    description: "Data-driven simulatie met timeline controls (Lijn D & E).",
  },
] as const;

export function NavigationCards() {
  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {cards.map((c) => (
        <motion.button
          key={c.id}
          type="button"
          onClick={() => scrollTo(c.id)}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.99 }}
          className="group rounded-2xl border border-orange-100 bg-white p-6 text-left shadow-sm transition-all hover:border-orange-200 hover:shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-orange-600">
              {c.title}
            </h3>
            <span className="text-orange-300 transition-colors group-hover:text-orange-500">
              →
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-neutral-500 group-hover:text-neutral-600">
            {c.description}
          </p>
        </motion.button>
      ))}
    </div>
  );
}
