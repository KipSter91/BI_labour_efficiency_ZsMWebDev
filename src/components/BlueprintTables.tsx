"use client";

import { useState } from "react";
import { useLanguage } from "./LanguageProvider";

// Blueprint data - base values
// NB: Er draaien altijd 5 lijnen (A, B, C, D, E).
// Lijn B is OF mini OF normaal - nooit beide tegelijk.
const inpakLinesData = [
  { lineKey: "A", key: "A", inpak: 2, operator: 1, bakoperator: 1 },
  { lineKey: "B-mini", key: "B-mini", inpak: 2, operator: 1, bakoperator: 2 },
  {
    lineKey: "B-normaal",
    key: "B-normaal",
    inpak: 4,
    operator: 1,
    bakoperator: 2,
  },
  { lineKey: "C", key: "C", inpak: 2, operator: 1, bakoperator: 1 },
  { lineKey: "D", key: "D", inpak: 2, operator: 1, bakoperator: 2 },
  { lineKey: "E", key: "E", inpak: 4, operator: 1, bakoperator: 2 },
];

// Computed with totals
const inpakLines = inpakLinesData.map((row) => ({
  ...row,
  totaal: row.inpak + row.operator + row.bakoperator,
}));

const otherRolesKeys = [
  { key: "shiftleader", fte: 2 },
  { key: "deegbereiding", fte: 3 },
  { key: "stroopbereiding", fte: 2 },
  { key: "kruimelaar", fte: 1 },
  { key: "schoonmaak", fte: 1 },
  { key: "td", fte: 2 },
  { key: "reserve", fte: 3 },
  { key: "aflosser", fte: 3 },
] as const;

const otherTotal = otherRolesKeys.reduce((sum, row) => sum + row.fte, 0);

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
  const { getText, t } = useLanguage();
  const [bType, setBType] = useState<"mini" | "normaal">("normaal");

  // Get translated line names
  const getLineName = (key: string) => {
    const lineWord = getText(t.common.line);
    if (key === "B-mini")
      return `${lineWord} B (${getText(t.blueprint.mini).toLowerCase()})`;
    if (key === "B-normaal")
      return `${lineWord} B (${getText(t.blueprint.normaal).toLowerCase()})`;
    return `${lineWord} ${key}`;
  };

  const getLineShortName = (key: string) => {
    if (key === "B-mini") return "B M";
    if (key === "B-normaal") return "B N";
    return key;
  };

  // Get translated other role names
  const getOtherRoleName = (key: string) => {
    const roleMap: Record<
      string,
      { full: { nl: string; en: string }; short: { nl: string; en: string } }
    > = {
      shiftleader: {
        full: t.otherRoles.shiftleader,
        short: t.otherRoles.shiftleaderShort,
      },
      deegbereiding: {
        full: t.otherRoles.deegbereiding,
        short: t.otherRoles.deegbereidingShort,
      },
      stroopbereiding: {
        full: t.otherRoles.stroopbereiding,
        short: t.otherRoles.stroopbereidingShort,
      },
      kruimelaar: {
        full: t.otherRoles.kruimelaar,
        short: t.otherRoles.kruimelaarShort,
      },
      schoonmaak: {
        full: t.otherRoles.schoonmaak,
        short: t.otherRoles.schoonmaakShort,
      },
      td: { full: t.otherRoles.td, short: t.otherRoles.td },
      reserve: { full: t.otherRoles.reserve, short: t.otherRoles.reserve },
      aflosser: { full: t.otherRoles.aflosser, short: t.otherRoles.aflosser },
    };
    return (
      roleMap[key] ?? {
        full: { nl: key, en: key },
        short: { nl: key, en: key },
      }
    );
  };

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
          title={getText(t.blueprint.linesTitle)}
          headerRight={
            <div className="flex items-center gap-2">
              <label
                htmlFor="b-type-select"
                className="text-xs text-neutral-500 hidden sm:block">
                {getText(t.blueprint.lineB)}
              </label>
              <select
                id="b-type-select"
                value={bType}
                onChange={(e) => setBType(e.target.value as "mini" | "normaal")}
                className="rounded-lg border border-brand-gold/30 bg-white px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:border-brand-gold focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/20">
                <option value="normaal">{getText(t.blueprint.normaal)}</option>
                <option value="mini">{getText(t.blueprint.mini)}</option>
              </select>
            </div>
          }>
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-brand-gold/10 text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-2 sm:px-5 py-2 sm:py-3">
                  {getText(t.common.line)}
                </th>
                <th className="px-2 sm:px-5 py-2 sm:py-3">
                  <span className="sm:hidden">
                    {getText(t.roles.bakoperatorShort)}
                  </span>
                  <span className="hidden sm:inline">
                    {getText(t.roles.bakoperator)}
                  </span>
                </th>
                <th className="px-2 sm:px-5 py-2 sm:py-3">
                  <span className="sm:hidden">
                    {getText(t.roles.inpakoperatorShort)}
                  </span>
                  <span className="hidden sm:inline">
                    {getText(t.roles.inpakoperator)}
                  </span>
                </th>
                <th className="px-2 sm:px-5 py-2 sm:py-3">
                  <span className="sm:hidden">
                    {getText(t.roles.inpakassistentShort)}
                  </span>
                  <span className="hidden sm:inline">
                    {getText(t.roles.inpakassistent)}
                  </span>
                </th>
                <th className="px-2 sm:px-5 py-2 sm:py-3">
                  <span className="sm:hidden">Tot.</span>
                  <span className="hidden sm:inline">
                    {getText(t.common.total)}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gold/20">
              {activeLines.map((row) => {
                const isBLine = row.key.startsWith("B-");

                return (
                  <tr
                    key={row.key}
                    className={`text-neutral-700 ${
                      isBLine ? "bg-brand-gold/5" : ""
                    }`}>
                    <td className="whitespace-nowrap px-2 sm:px-5 py-2 sm:py-3 font-medium text-neutral-900">
                      <span className="sm:hidden">
                        {getLineShortName(row.lineKey)}
                      </span>
                      <span className="hidden sm:inline">
                        {getLineName(row.lineKey)}
                      </span>
                    </td>
                    <td className="px-2 sm:px-5 py-2 sm:py-3">
                      {row.bakoperator}
                    </td>
                    <td className="px-2 sm:px-5 py-2 sm:py-3">
                      {row.operator}
                    </td>
                    <td className="px-2 sm:px-5 py-2 sm:py-3">{row.inpak}</td>
                    <td className="px-2 sm:px-5 py-2 sm:py-3 font-semibold text-brand-gold">
                      {row.totaal}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-brand-gold/10">
                <td className="px-2 sm:px-5 py-2 sm:py-3 font-semibold text-neutral-900 text-xs sm:text-sm">
                  <span className="sm:hidden">Sub.</span>
                  <span className="hidden sm:inline">
                    {getText(t.blueprint.subtotalInpak)}
                  </span>
                </td>
                <td className="px-2 sm:px-5 py-2 sm:py-3 font-semibold text-neutral-700">
                  {activeLines.reduce((s, r) => s + r.bakoperator, 0)}
                </td>
                <td className="px-2 sm:px-5 py-2 sm:py-3 font-semibold text-neutral-700">
                  {activeLines.reduce((s, r) => s + r.operator, 0)}
                </td>
                <td className="px-2 sm:px-5 py-2 sm:py-3 font-semibold text-neutral-700">
                  {activeLines.reduce((s, r) => s + r.inpak, 0)}
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
        <Table title={getText(t.blueprint.otherFunctions)}>
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-brand-gold/10 text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-2 sm:px-5 py-2 sm:py-3">
                  {getText(t.common.function)}
                </th>
                <th className="px-2 sm:px-5 py-2 sm:py-3">
                  {getText(t.common.fte)}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gold/20">
              {otherRolesKeys.map((row) => {
                const roleNames = getOtherRoleName(row.key);

                return (
                  <tr
                    key={row.key}
                    className="text-neutral-700">
                    <td className="px-2 sm:px-5 py-2 sm:py-3 font-medium text-neutral-900">
                      <span className="sm:hidden">
                        {getText(roleNames.short)}
                      </span>
                      <span className="hidden sm:inline">
                        {getText(roleNames.full)}
                      </span>
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
                  <span className="hidden sm:inline">
                    {getText(t.common.subtotal)}
                  </span>
                </td>
                <td className="px-2 sm:px-5 py-2 sm:py-3 font-bold text-brand-navy">
                  {otherTotal}
                </td>
              </tr>
              <tr className="bg-brand-navy/10">
                <td className="px-2 sm:px-5 py-2 sm:py-3 font-bold text-brand-navy text-xs sm:text-sm">
                  <span className="sm:hidden">{getText(t.common.total)}</span>
                  <span className="hidden sm:inline">
                    {getText(t.blueprint.grandTotal)}
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
