import { cn } from "@/lib/ui";

export function PeopleIcon({
  variant,
  label,
}: {
  variant: "worker" | "break" | "aflos";
  label?: string;
}) {
  const colors =
    variant === "aflos"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : variant === "break"
        ? "bg-orange-50 text-orange-700 ring-orange-200"
        : "bg-neutral-50 text-neutral-700 ring-neutral-200";

  return (
    <div
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full ring-1",
        colors,
      )}
      title={label}
      aria-label={label}>
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="currentColor"
        aria-hidden="true">
        <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.42 0-8 2-8 4.5V21h16v-2.5c0-2.5-3.58-4.5-8-4.5Z" />
      </svg>
    </div>
  );
}
