"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/ui";
import { AnimatePresence, motion } from "framer-motion";

const links = [
  { id: "intro", label: "Intro" },
  { id: "blauwprint", label: "Blauwprint" },
  { id: "planning", label: "Planning" },
  { id: "calculator", label: "Calculator" },
  { id: "planner", label: "Planner" },
  { id: "pause-aflos", label: "Pause aflos" },
] as const;

export function TopNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setMobileOpen(false);
  }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || mobileOpen
          ? "bg-white/95 shadow-md backdrop-blur-lg"
          : "bg-transparent",
      )}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <button
          type="button"
          onClick={() => scrollTo("intro")}
          className={cn(
            "flex items-center gap-2 sm:gap-3 rounded-lg px-2 sm:px-3 py-2 transition-all",
            scrolled || mobileOpen
              ? "bg-white shadow-sm ring-1 ring-neutral-200 hover:ring-brand-gold/50"
              : "bg-white shadow-sm ring-1 ring-neutral-200 hover:ring-brand-gold/50",
          )}>
          <Image
            src="/logo.svg"
            alt="Biscuit International"
            width={100}
            height={28}
            className="h-6 sm:h-7 w-auto"
          />
          <span className="hidden sm:block h-6 w-px bg-neutral-200" />
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-sm font-semibold leading-tight text-brand-navy">
              Labour Efficiency 2026
            </span>
            <span className="text-xs font-medium text-neutral-500">
              Bergambacht
            </span>
          </div>
        </button>

        {/* Desktop nav */}
        <nav
          className={cn(
            "hidden gap-1 rounded-xl p-1 text-sm font-semibold transition-all md:flex",
            scrolled
              ? "bg-neutral-100"
              : "bg-white/95 shadow-sm ring-1 ring-neutral-200 backdrop-blur",
          )}>
          {links.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => scrollTo(l.id)}
              className="rounded-lg px-4 py-2 text-neutral-600 transition-colors hover:bg-brand-gold/10 hover:text-brand-navy">
              {l.label}
            </button>
          ))}
        </nav>

        {/* Hamburger button - mobile only */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-white shadow-sm ring-1 ring-neutral-200 hover:ring-brand-gold/50 transition-all"
          aria-label="Toggle menu">
          <div className="relative w-5 h-4">
            <span
              className={cn(
                "absolute left-0 h-0.5 w-5 bg-brand-navy rounded-full transition-all duration-300",
                mobileOpen ? "top-1.5 rotate-45" : "top-0",
              )}
            />
            <span
              className={cn(
                "absolute left-0 top-1.5 h-0.5 w-5 bg-brand-navy rounded-full transition-all duration-300",
                mobileOpen ? "opacity-0 scale-0" : "opacity-100",
              )}
            />
            <span
              className={cn(
                "absolute left-0 h-0.5 w-5 bg-brand-navy rounded-full transition-all duration-300",
                mobileOpen ? "top-1.5 -rotate-45" : "top-3",
              )}
            />
          </div>
        </button>
      </div>

      {/* Mobile menu dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-neutral-200 bg-white/95 backdrop-blur-lg overflow-hidden">
            <div className="px-4 py-3 space-y-1">
              {links.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => scrollTo(l.id)}
                  className="w-full text-left rounded-lg px-4 py-3 text-sm font-semibold text-neutral-600 transition-colors hover:bg-brand-gold/10 hover:text-brand-navy">
                  {l.label}
                </button>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
