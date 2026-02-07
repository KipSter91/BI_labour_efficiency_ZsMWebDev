type InfoItem = {
  title: string;
  subtitle?: string;
  description: string;
  impact?: string;
  variant?: "default" | "highlight" | "summary";
  lijn?: string;
};

function Card({ item }: { item: InfoItem }) {
  const isSummary = item.variant === "summary";

  return (
    <div
      className={`group relative rounded-xl sm:rounded-2xl border bg-white p-4 sm:p-6 shadow-sm transition-all hover:shadow-md ${
        item.variant === "highlight"
          ? "border-brand-gold/40 ring-1 ring-brand-gold/20"
          : item.variant === "summary"
            ? "border-brand-navy/20 bg-linear-to-br from-brand-navy/5 to-slate-50"
            : "border-neutral-200 hover:border-brand-gold/30"
      }`}>
      {item.impact && (
        <span
          className={`absolute -top-2 sm:-top-2.5 right-3 sm:right-4 inline-flex items-center rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold ${
            isSummary ? "bg-brand-gold text-white" : "bg-brand-navy text-white"
          }`}>
          {item.impact}
        </span>
      )}
      {item.lijn && (
        <span className="mb-2 sm:mb-3 inline-flex items-center rounded-lg bg-brand-navy/10 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold text-brand-navy">
          {item.lijn}
        </span>
      )}
      <h3 className="text-sm sm:text-base font-bold text-brand-navy">
        {item.title}
      </h3>
      {item.subtitle && (
        <p className="mt-1 text-[10px] sm:text-xs font-medium uppercase tracking-wide text-brand-gold">
          {item.subtitle}
        </p>
      )}
      <p className="mt-2 sm:mt-3 text-xs sm:text-sm leading-relaxed text-neutral-600">
        {item.description}
      </p>
    </div>
  );
}

export function InfoCards({
  items,
  gridClassName,
}: {
  items: InfoItem[];
  gridClassName?: string;
}) {
  const regularItems = items.filter((item) => item.variant !== "summary");
  const summaryItem = items.find((item) => item.variant === "summary");
  const gridClasses =
    gridClassName ??
    "grid gap-3 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Line cards - grouped by lijn */}
      <div className={gridClasses}>
        {regularItems.map((item) => (
          <Card
            key={item.title}
            item={item}
          />
        ))}
      </div>

      {/* Summary card - full width */}
      {summaryItem && (
        <div className="pt-2">
          <div className="mx-auto max-w-2xl">
            <Card item={summaryItem} />
          </div>
        </div>
      )}
    </div>
  );
}
