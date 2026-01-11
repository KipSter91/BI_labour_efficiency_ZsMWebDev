"use client";

import { useState } from "react";

// Blueprint data - base values
// NB: Er draaien altijd 5 lijnen (A, B, C, D, E).
// Lijn B is OF mini OF normaal - nooit beide tegelijk.
const inpakLinesData = [
  { line: "Inpak Lijn A", key: "A", inpak: 2, operator: 1, bakoperator: 1 },
  {
    line: "Inpak Lijn B (mini)",
    key: "B-mini",
    inpak: 2,
    operator: 1,
    bakoperator: 2,
  },
  {
    line: "Inpak Lijn B (normaal)",
    key: "B-normaal",
    inpak: 6,
    operator: 1,
    bakoperator: 2,
  },
  { line: "Inpak Lijn C", key: "C", inpak: 2, operator: 1, bakoperator: 1 },
  { line: "Inpak Lijn D", key: "D", inpak: 3, operator: 1, bakoperator: 2 },
  { line: "Inpak Lijn E", key: "E", inpak: 7, operator: 1, bakoperator: 2 },
];

// Computed with totals
const inpakLines = inpakLinesData.map((row) => ({
  ...row,
  totaal: row.inpak + row.operator + row.bakoperator,
}));

const otherRoles = [
  { functie: "Shiftleader en assistentie", fte: 2 },
  { functie: "Deegbereiding", fte: 3 },
  { functie: "Stroopbereiding", fte: 2 },
  { functie: "Kruimelaar", fte: 1 },
  { functie: "Cleaning", fte: 1 },
] as const;

const otherTotal = otherRoles.reduce((sum, row) => sum + row.fte, 0);

function Table({
  title,
  children,
  headerRight,
}: {
  title: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl sm:rounded-2xl border border-brand-gold/20 bg-white shadow-sm">
      <div className="border-b border-brand-gold/20 px-3 sm:px-5 py-3 sm:py-4 bg-brand-gold/5 flex items-center justify-between gap-2 sm:gap-4">
        <h3 className="text-xs sm:text-sm font-semibold tracking-wide text-neutral-900">
          {title}
        </h3>
        {headerRight}
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function BlueprintTables() {
  const [bType, setBType] = useState<"mini" | "normaal">("normaal");

  // Filter lines: show A, selected B variant, C, D, E (5 lines total)
  const activeLines = inpakLines.filter((row) => {
    if (row.key === "B-mini") return bType === "mini";
    if (row.key === "B-normaal") return bType === "normaal";
    return true;
  });

  // Calculate totals
  const inpakTotal = activeLines.reduce((sum, row) => sum + row.totaal, 0);
  const grandTotal = inpakTotal + otherTotal;

  return (
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <Table
          title="Inpak lijnen (5 actief)"
          headerRight={
            <div className="flex items-center gap-2">
              <label
                htmlFor="b-type-select"
                className="text-xs text-neutral-500 hidden sm:block">
                Lijn B:
              </label>
              <select
                id="b-type-select"
                value={bType}
                onChange={(e) => setBType(e.target.value as "mini" | "normaal")}
                className="rounded-lg border border-brand-gold/30 bg-white px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:border-brand-gold focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/20">
                <option value="normaal">Normaal</option>
                <option value="mini">Mini</option>
              </select>
            </div>
          }>
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-brand-gold/10 text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-2 sm:px-5 py-2 sm:py-3">Lijn</th>
                <th className="px-2 sm:px-5 py-2 sm:py-3">Inpak</th>
                <th className="px-2 sm:px-5 py-2 sm:py-3">Op.</th>
                <th className="px-2 sm:px-5 py-2 sm:py-3">Bak.</th>
                <th className="px-2 sm:px-5 py-2 sm:py-3">Tot.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gold/20">
              {activeLines.map((row) => {
                const isBLine = row.key.startsWith("B-");
                // Shorten line names on mobile
                const shortName = row.line
                  .replace("Inpak Lijn ", "")
                  .replace(" (mini)", " M")
                  .replace(" (normaal)", " N");

                return (
                  <tr
                    key={row.key}
                    className={`text-neutral-700 ${
                      isBLine ? "bg-brand-gold/5" : ""
                    }`}>
                    <td className="whitespace-nowrap px-2 sm:px-5 py-2 sm:py-3 font-medium text-neutral-900">
                      <span className="sm:hidden">{shortName}</span>
                      <span className="hidden sm:inline">{row.line}</span>
                    </td>
                    <td className="px-2 sm:px-5 py-2 sm:py-3">{row.inpak}</td>
                    <td className="px-2 sm:px-5 py-2 sm:py-3">
                      {row.operator}
                    </td>
                    <td className="px-2 sm:px-5 py-2 sm:py-3">
                      {row.bakoperator}
                    </td>
                    <td className="px-2 sm:px-5 py-2 sm:py-3 font-semibold text-brand-gold">
                      {row.totaal}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-brand-gold/10">
                <td className="px-2 sm:px-5 py-2 sm:py-3 font-semibold text-neutral-900 text-xs sm:text-sm">
                  <span className="sm:hidden">Sub.</span>
                  <span className="hidden sm:inline">Subtotaal inpak</span>
                </td>
                <td className="px-2 sm:px-5 py-2 sm:py-3 font-semibold text-neutral-700">
                  {activeLines.reduce((s, r) => s + r.inpak, 0)}
                </td>
                <td className="px-2 sm:px-5 py-2 sm:py-3 font-semibold text-neutral-700">
                  {activeLines.reduce((s, r) => s + r.operator, 0)}
                </td>
                <td className="px-2 sm:px-5 py-2 sm:py-3 font-semibold text-neutral-700">
                  {activeLines.reduce((s, r) => s + r.bakoperator, 0)}
                </td>
                <td className="px-2 sm:px-5 py-2 sm:py-3 font-bold text-brand-navy">
                  {inpakTotal}
                </td>
              </tr>
            </tbody>
          </table>
        </Table>
      </div>

      <div className="lg:col-span-2">
        <Table title="Overige functies">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-brand-gold/10 text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-2 sm:px-5 py-2 sm:py-3">Functie</th>
                <th className="px-2 sm:px-5 py-2 sm:py-3">FTE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gold/20">
              {otherRoles.map((row) => {
                // Shorten function names on mobile
                const shortFunctie = row.functie
                  .replace("Shiftleader en assistentie", "Shiftleader")
                  .replace("Deegbereiding", "Deeg")
                  .replace("Stroopbereiding", "Stroop")
                  .replace("Kruimelaar", "Kruimel")
                  .replace("Cleaning", "Clean");

                return (
                  <tr
                    key={row.functie}
                    className="text-neutral-700">
                    <td className="px-2 sm:px-5 py-2 sm:py-3 font-medium text-neutral-900">
                      <span className="sm:hidden">{shortFunctie}</span>
                      <span className="hidden sm:inline">{row.functie}</span>
                    </td>
                    <td className="px-2 sm:px-5 py-2 sm:py-3 font-semibold text-brand-gold">
                      {row.fte}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-brand-gold/10">
                <td className="px-2 sm:px-5 py-2 sm:py-3 font-semibold text-neutral-900 text-xs sm:text-sm">
                  <span className="sm:hidden">Sub.</span>
                  <span className="hidden sm:inline">Subtotaal overige</span>
                </td>
                <td className="px-2 sm:px-5 py-2 sm:py-3 font-bold text-brand-navy">
                  {otherTotal}
                </td>
              </tr>
              <tr className="bg-brand-navy/10">
                <td className="px-2 sm:px-5 py-2 sm:py-3 font-bold text-brand-navy text-xs sm:text-sm">
                  <span className="sm:hidden">Totaal/shift</span>
                  <span className="hidden sm:inline">
                    Totaal medewerkers per shift
                  </span>
                </td>
                <td className="px-2 sm:px-5 py-2 sm:py-3 font-bold text-brand-navy text-base sm:text-lg">
                  {grandTotal}
                </td>
              </tr>
            </tbody>
          </table>
        </Table>
      </div>
    </div>
  );
}
