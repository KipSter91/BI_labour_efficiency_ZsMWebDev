"use client";

import { useState } from "react";
import { cn } from "@/lib/ui";
import { useLanguage } from "./LanguageProvider";

/*
 * BLAUWPRINT BASE FTE VALUES
 *
 * INPAKLIJN (inpak + operator):
 * A: inpak 2 + operator 1 = 3
 * B mini: inpak 2 + operator 1 = 3
 * B normaal: inpak 4 + operator 1 = 5
 * C: inpak 2 + operator 1 = 3
 * D: inpak 2 + operator 1 = 3
 * E: inpak 4 + operator 1 = 5
 *
 * BAKLIJN (bakoperator per lijn):
 * A: 1 bakoperator
 * B: 2 bakoperator
 * C: 1 bakoperator
 * D: 2 bakoperator
 * E: 2 bakoperator
 */

type BLijnType = "mini" | "normal";

type State = {
  // Actieve lijnen
  lijnA: boolean;
  lijnB: boolean;
  lijnBType: BLijnType;
  lijnC: boolean;
  lijnD: boolean;
  lijnE: boolean;

  // Planning scenarios (inpaklijn)
  lijnA_8stuks: boolean; // +1 FTE inpak
  lijnE_tray: boolean; // +1 FTE inpak (working with tray)
};

function Toggle({
  checked,
  onChange,
  label,
  description,
  badge,
  badgeColor = "amber",
  disabled = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  badge?: string;
  badgeColor?: "amber" | "rose" | "emerald";
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex items-start gap-3 cursor-pointer group",
        disabled && "opacity-50 cursor-not-allowed",
      )}>
      <div className="relative mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <div
          className={cn(
            "h-5 w-9 rounded-full transition-colors",
            checked ? "bg-brand-gold" : "bg-neutral-300",
          )}
        />
        <div
          className={cn(
            "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
            checked && "translate-x-4",
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-neutral-900">{label}</span>
          {badge && (
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-xs font-bold",
                badgeColor === "amber" && "bg-amber-100 text-amber-700",
                badgeColor === "rose" && "bg-rose-100 text-rose-700",
                badgeColor === "emerald" && "bg-emerald-100 text-emerald-700",
              )}>
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="mt-0.5 text-xs text-neutral-500">{description}</p>
        )}
      </div>
    </label>
  );
}

export function CalculatorPanel() {
  const { getText, t } = useLanguage();
  const [state, setState] = useState<State>({
    // Default: alle lijnen actief behalve B mini
    lijnA: true,
    lijnB: true,
    lijnBType: "normal",
    lijnC: true,
    lijnD: true,
    lijnE: true,

    // Planning: standaard geen speciale scenarios
    lijnA_8stuks: false,
    lijnE_tray: false,
  });

  // === INPAKLIJN berekeningen (alleen inpak + operator, GEEN bakoperator) ===
  const calcInpakA = () => {
    if (!state.lijnA) return { base: 0, planning: 0, tech: 0, total: 0 };
    const base = 3; // inpak 2 + operator 1
    const planning = state.lijnA_8stuks ? 1 : 0;
    return { base, planning, tech: 0, total: base + planning };
  };

  const calcInpakB = () => {
    if (!state.lijnB) return { base: 0, planning: 0, tech: 0, total: 0 };
    if (state.lijnBType === "mini") {
      return { base: 3, planning: 0, tech: 0, total: 3 }; // mini: inpak 2 + operator 1
    }
    const base = 5; // normaal: inpak 4 + operator 1
    return { base, planning: 0, tech: 0, total: base };
  };

  const calcInpakC = () => {
    if (!state.lijnC) return { base: 0, planning: 0, tech: 0, total: 0 };
    return { base: 3, planning: 0, tech: 0, total: 3 }; // inpak 2 + operator 1
  };

  const calcInpakD = () => {
    if (!state.lijnD) return { base: 0, planning: 0, tech: 0, total: 0 };
    const base = 3; // inpak 2 + operator 1
    return { base, planning: 0, tech: 0, total: base };
  };

  const calcInpakE = () => {
    if (!state.lijnE) return { base: 0, planning: 0, tech: 0, total: 0 };
    const base = 5; // inpak 4 + operator 1
    const planning = state.lijnE_tray ? 1 : 0;
    return { base, planning, tech: 0, total: base + planning };
  };

  // === BAKLIJN berekeningen (bakoperator per lijn) ===
  const calcBaklijnA = () => {
    if (!state.lijnA) return { base: 0, tech: 0, total: 0 };
    return { base: 1, tech: 0, total: 1 }; // 1 bakoperator
  };

  const calcBaklijnB = () => {
    if (!state.lijnB) return { base: 0, tech: 0, total: 0 };
    return { base: 2, tech: 0, total: 2 }; // 2 bakoperator (zelfde voor mini en normaal)
  };

  const calcBaklijnC = () => {
    if (!state.lijnC) return { base: 0, tech: 0, total: 0 };
    return { base: 1, tech: 0, total: 1 }; // 1 bakoperator
  };

  const calcBaklijnD = () => {
    if (!state.lijnD) return { base: 0, tech: 0, total: 0 };
    const base = 2; // 2 bakoperator
    return { base, tech: 0, total: base };
  };

  const calcBaklijnE = () => {
    if (!state.lijnE) return { base: 0, tech: 0, total: 0 };
    const base = 2; // 2 bakoperator
    return { base, tech: 0, total: base };
  };

  // Resultaten
  const inpakA = calcInpakA();
  const inpakB = calcInpakB();
  const inpakC = calcInpakC();
  const inpakD = calcInpakD();
  const inpakE = calcInpakE();

  const baklijnA = calcBaklijnA();
  const baklijnB = calcBaklijnB();
  const baklijnC = calcBaklijnC();
  const baklijnD = calcBaklijnD();
  const baklijnE = calcBaklijnE();

  const inpakTotals = {
    base: inpakA.base + inpakB.base + inpakC.base + inpakD.base + inpakE.base,
    planning:
      inpakA.planning +
      inpakB.planning +
      inpakC.planning +
      inpakD.planning +
      inpakE.planning,
    total:
      inpakA.total + inpakB.total + inpakC.total + inpakD.total + inpakE.total,
  };

  const baklijnTotals = {
    base:
      baklijnA.base +
      baklijnB.base +
      baklijnC.base +
      baklijnD.base +
      baklijnE.base,
    total:
      baklijnA.total +
      baklijnB.total +
      baklijnC.total +
      baklijnD.total +
      baklijnE.total,
  };

  const grandTotal = inpakTotals.total + baklijnTotals.total;

  // Line data for table display - with extras info
  const getLineName = (lineKey: string, bType: string) => {
    const lineWord = getText(t.common.line);
    if (lineKey === "B") {
      const typeWord =
        bType === "mini"
          ? getText(t.blueprint.mini)
          : getText(t.blueprint.normaal);
      return `${lineWord} B (${typeWord.toLowerCase()})`;
    }
    return `${lineWord} ${lineKey}`;
  };

  const linesTableData = [
    {
      lineKey: "A",
      line: getLineName("A", ""),
      active: state.lijnA,
      inpak: state.lijnA ? 2 + (state.lijnA_8stuks ? 1 : 0) : 0,
      inpakBase: 2,
      inpakExtra: state.lijnA_8stuks ? 1 : 0,
      inpakExtraLabel: state.lijnA_8stuks ? getText(t.calculator.stuks8) : null,
      operator: state.lijnA ? 1 : 0,
      bakoperator: state.lijnA ? 1 : 0,
      bakoperatorBase: 1,
      bakoperatorExtra: 0,
      bakoperatorExtraLabel: null as string | null,
    },
    {
      lineKey: "B",
      line: getLineName("B", state.lijnBType),
      active: state.lijnB,
      inpak: state.lijnB ? (state.lijnBType === "mini" ? 2 : 4) : 0,
      inpakBase: state.lijnBType === "mini" ? 2 : 4,
      inpakExtra: 0,
      inpakExtraLabel: null as string | null,
      operator: state.lijnB ? 1 : 0,
      bakoperator: state.lijnB ? 2 : 0,
      bakoperatorBase: 2,
      bakoperatorExtra: 0,
      bakoperatorExtraLabel: null as string | null,
    },
    {
      lineKey: "C",
      line: getLineName("C", ""),
      active: state.lijnC,
      inpak: state.lijnC ? 2 : 0,
      inpakBase: 2,
      inpakExtra: 0,
      inpakExtraLabel: null as string | null,
      operator: state.lijnC ? 1 : 0,
      bakoperator: state.lijnC ? 1 : 0,
      bakoperatorBase: 1,
      bakoperatorExtra: 0,
      bakoperatorExtraLabel: null as string | null,
    },
    {
      lineKey: "D",
      line: getLineName("D", ""),
      active: state.lijnD,
      inpak: state.lijnD ? 2 : 0,
      inpakBase: 2,
      inpakExtra: 0,
      inpakExtraLabel: null as string | null,
      operator: state.lijnD ? 1 : 0,
      bakoperator: state.lijnD ? 2 : 0,
      bakoperatorBase: 2,
      bakoperatorExtra: 0,
      bakoperatorExtraLabel: null as string | null,
    },
    {
      lineKey: "E",
      line: getLineName("E", ""),
      active: state.lijnE,
      inpak: state.lijnE ? 4 + (state.lijnE_tray ? 1 : 0) : 0,
      inpakBase: 4,
      inpakExtra: state.lijnE_tray ? 1 : 0,
      inpakExtraLabel: state.lijnE_tray ? getText(t.calculator.tray) : null,
      operator: state.lijnE ? 1 : 0,
      bakoperator: state.lijnE ? 2 : 0,
      bakoperatorBase: 2,
      bakoperatorExtra: 0,
      bakoperatorExtraLabel: null as string | null,
    },
  ].filter((row) => row.active);

  const tableSubtotals = {
    inpak: linesTableData.reduce((s, r) => s + r.inpak, 0),
    operator: linesTableData.reduce((s, r) => s + r.operator, 0),
    bakoperator: linesTableData.reduce((s, r) => s + r.bakoperator, 0),
  };

  return (
    <div className="space-y-4">
      {/* Compact grid - stacks on mobile */}
      <div className="grid gap-3 sm:gap-4">
        {/* Column 1: Lijn selectie */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-brand-navy mb-3">
            {getText(t.calculator.activeLines)}
          </h3>
          <div className="space-y-2">
            {/* Lijn A */}
            <div
              className={cn(
                "flex items-center justify-between rounded-lg border px-3 py-2",
                state.lijnA
                  ? "border-brand-gold/40 bg-brand-gold/5"
                  : "border-neutral-200",
              )}>
              <Toggle
                checked={state.lijnA}
                onChange={(v) => setState((s) => ({ ...s, lijnA: v }))}
                label="A"
                badge={
                  state.lijnA ? `${inpakA.total + baklijnA.total}` : undefined
                }
              />
              {state.lijnA && (
                <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.lijnA_8stuks}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        lijnA_8stuks: e.target.checked,
                      }))
                    }
                    className="h-3.5 w-3.5 accent-brand-gold"
                  />
                  <span className="text-neutral-600">8-stuks</span>
                </label>
              )}
            </div>

            {/* Lijn B */}
            <div
              className={cn(
                "rounded-lg border px-3 py-2",
                state.lijnB
                  ? "border-brand-gold/40 bg-brand-gold/5"
                  : "border-neutral-200",
              )}>
              <div className="flex items-center justify-between">
                <Toggle
                  checked={state.lijnB}
                  onChange={(v) => setState((s) => ({ ...s, lijnB: v }))}
                  label="B"
                  badge={
                    state.lijnB ? `${inpakB.total + baklijnB.total}` : undefined
                  }
                />
                {state.lijnB && (
                  <div className="flex gap-2 text-xs">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="bType"
                        checked={state.lijnBType === "normal"}
                        onChange={() =>
                          setState((s) => ({
                            ...s,
                            lijnBType: "normal",
                          }))
                        }
                        className="h-3 w-3 accent-brand-gold"
                      />
                      <span>Norm</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="bType"
                        checked={state.lijnBType === "mini"}
                        onChange={() =>
                          setState((s) => ({
                            ...s,
                            lijnBType: "mini",
                          }))
                        }
                        className="h-3 w-3 accent-brand-gold"
                      />
                      <span>Mini</span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Lijn C */}
            <div
              className={cn(
                "flex items-center justify-between rounded-lg border px-3 py-2",
                state.lijnC
                  ? "border-brand-gold/40 bg-brand-gold/5"
                  : "border-neutral-200",
              )}>
              <Toggle
                checked={state.lijnC}
                onChange={(v) => setState((s) => ({ ...s, lijnC: v }))}
                label="C"
                badge={
                  state.lijnC ? `${inpakC.total + baklijnC.total}` : undefined
                }
              />
            </div>

            {/* Lijn D */}
            <div
              className={cn(
                "flex items-center justify-between rounded-lg border px-3 py-2",
                state.lijnD
                  ? "border-brand-gold/40 bg-brand-gold/5"
                  : "border-neutral-200",
              )}>
              <Toggle
                checked={state.lijnD}
                onChange={(v) => setState((s) => ({ ...s, lijnD: v }))}
                label="D"
                badge={
                  state.lijnD ? `${inpakD.total + baklijnD.total}` : undefined
                }
              />
            </div>

            {/* Lijn E */}
            <div
              className={cn(
                "rounded-lg border px-3 py-2",
                state.lijnE
                  ? "border-brand-gold/40 bg-brand-gold/5"
                  : "border-neutral-200",
              )}>
              <div className="flex items-center justify-between">
                <Toggle
                  checked={state.lijnE}
                  onChange={(v) => setState((s) => ({ ...s, lijnE: v }))}
                  label="E"
                  badge={
                    state.lijnE ? `${inpakE.total + baklijnE.total}` : undefined
                  }
                />
                {state.lijnE && (
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={state.lijnE_tray}
                      onChange={(e) =>
                        setState((s) => ({
                          ...s,
                          lijnE_tray: e.target.checked,
                        }))
                      }
                      className="h-3.5 w-3.5 accent-brand-gold"
                    />
                    <span className="text-neutral-600">
                      {getText(t.calculator.tray)} +1
                    </span>
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Summary Table */}
      <div className="overflow-hidden rounded-xl sm:rounded-2xl border border-brand-gold/20 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-brand-gold/10 text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-3 sm:px-4 py-2">{getText(t.common.line)}</th>
                <th className="px-3 sm:px-4 py-2">
                  <span className="sm:hidden">
                    {getText(t.roles.bakoperatorShort)}
                  </span>
                  <span className="hidden sm:inline">
                    {getText(t.roles.bakoperator)}
                  </span>
                </th>
                <th className="px-3 sm:px-4 py-2">
                  <span className="sm:hidden">
                    {getText(t.roles.inpakoperatorShort)}
                  </span>
                  <span className="hidden sm:inline">
                    {getText(t.roles.inpakoperator)}
                  </span>
                </th>
                <th className="px-3 sm:px-4 py-2">
                  <span className="sm:hidden">
                    {getText(t.roles.inpakassistentShort)}
                  </span>
                  <span className="hidden sm:inline">
                    {getText(t.roles.inpakassistent)}
                  </span>
                </th>
                <th className="px-3 sm:px-4 py-2">
                  <span className="sm:hidden">Tot.</span>
                  <span className="hidden sm:inline">
                    {getText(t.common.total)}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gold/20">
              {linesTableData.map((row) => {
                return (
                  <tr
                    key={row.lineKey}
                    className="text-neutral-700">
                    <td className="whitespace-nowrap px-3 sm:px-4 py-2 font-medium text-neutral-900 text-xs sm:text-sm">
                      <span className="sm:hidden">{row.lineKey}</span>
                      <span className="hidden sm:inline">{row.line}</span>
                    </td>
                    <td className="px-3 sm:px-4 py-2">
                      {row.bakoperator}
                      {row.bakoperatorExtraLabel && (
                        <span className="text-brand-gold ml-1 text-[10px] sm:text-xs">
                          (+{row.bakoperatorExtra} {row.bakoperatorExtraLabel})
                        </span>
                      )}
                    </td>
                    <td className="px-3 sm:px-4 py-2">{row.operator}</td>
                    <td className="px-3 sm:px-4 py-2">
                      {row.inpak}
                      {row.inpakExtraLabel && (
                        <span className="text-brand-gold ml-1 text-[10px] sm:text-xs">
                          (+{row.inpakExtra} {row.inpakExtraLabel})
                        </span>
                      )}
                    </td>
                    <td className="px-3 sm:px-4 py-2 font-semibold text-brand-gold">
                      {row.inpak + row.operator + row.bakoperator}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-brand-navy/5">
                <td className="px-3 sm:px-4 py-2 sm:py-3 font-bold text-brand-navy text-xs sm:text-sm">
                  <span className="sm:hidden">
                    TOT ({linesTableData.length})
                  </span>
                  <span className="hidden sm:inline">
                    {getText(t.common.total).toUpperCase()} (
                    {linesTableData.length}{" "}
                    {getText(t.common.lines).toLowerCase()})
                  </span>
                </td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 font-semibold text-neutral-700">
                  {tableSubtotals.bakoperator}
                </td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 font-semibold text-neutral-700">
                  {tableSubtotals.operator}
                </td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 font-semibold text-neutral-700">
                  {tableSubtotals.inpak}
                </td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 font-bold text-brand-navy text-lg sm:text-xl">
                  {grandTotal}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
