import type { ReactNode } from "react";
import { cn } from "@/lib/ui";

type SectionVariant = "white" | "cream" | "navy" | "gold";

const variantStyles: Record<
  SectionVariant,
  {
    bg: string;
    accent: string;
    blob1: string;
    blob2: string;
  }
> = {
  white: {
    bg: "bg-white",
    accent: "from-slate-100/80",
    blob1: "bg-brand-gold/5",
    blob2: "bg-brand-navy/5",
  },
  cream: {
    bg: "bg-stone-50",
    accent: "from-amber-100/60",
    blob1: "bg-amber-200/30",
    blob2: "bg-orange-100/40",
  },
  navy: {
    bg: "bg-slate-50",
    accent: "from-slate-200/80",
    blob1: "bg-blue-100/50",
    blob2: "bg-indigo-100/40",
  },
  gold: {
    bg: "bg-amber-50/50",
    accent: "from-amber-100/50",
    blob1: "bg-yellow-200/40",
    blob2: "bg-orange-100/30",
  },
};

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  variant = "white",
}: {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  variant?: SectionVariant;
}) {
  const styles = variantStyles[variant];

  return (
    <section
      id={id}
      className={cn(
        "relative flex min-h-dvh scroll-mt-16 items-center justify-center px-4 sm:px-6 py-16 sm:py-24 overflow-hidden",
        styles.bg
      )}>
      {/* Large decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={cn(
            "absolute -top-1/4 -right-1/4 h-200 w-200 rounded-full blur-3xl",
            styles.blob1
          )}
        />
        <div
          className={cn(
            "absolute -bottom-1/4 -left-1/4 h-150 w-150 rounded-full blur-3xl",
            styles.blob2
          )}
        />
      </div>

      {/* Top edge gradient */}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r to-transparent via-black/10",
          styles.accent
        )}
      />

      <div className="relative w-full max-w-6xl">
        <div className="max-w-3xl">
          {eyebrow ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-px w-6 sm:w-8 bg-brand-gold" />
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-brand-gold">
                {eyebrow}
              </span>
            </span>
          ) : null}
          <h2 className="mt-3 sm:mt-4 text-2xl sm:text-4xl font-bold tracking-tight text-brand-navy md:text-5xl lg:text-6xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-4 sm:mt-6 text-sm sm:text-lg leading-relaxed text-neutral-500 md:text-xl">
              {description}
            </p>
          ) : null}
        </div>

        {children ? <div className="mt-8 sm:mt-12">{children}</div> : null}
      </div>
    </section>
  );
}
