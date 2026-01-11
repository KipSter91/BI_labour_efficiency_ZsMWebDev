"use client";

import { useState } from "react";
import { cn } from "@/lib/ui";

/*
 * BLAUWPRINT BASE FTE VALUES
 *
 * INPAKLIJN (inpak + operator):
 * A: inpak 2 + operator 1 = 3
 * B mini: inpak 2 + operator 1 = 3
 * B normaal: inpak 6 + operator 1 = 7
 * C: inpak 2 + operator 1 = 3
 * D: inpak 3 + operator 1 = 4
 * E: inpak 7 + operator 1 = 8
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
  lijnB_duoMeli: boolean; // +1 FTE inpak (alleen bij normal)
  lijnE_bio: boolean; // +1 FTE inpak

  // Technische issues - INPAKLIJN
  techD_casepacker: boolean; // +1 FTE op inpaklijn D

  // Technische issues - BAKLIJN
  techD_opvoerband: boolean; // +1 FTE op baklijn D
  techD_kruimelband: boolean; // +1 FTE op baklijn D
  techE_sync: boolean; // +1 FTE op baklijn E
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
        disabled && "opacity-50 cursor-not-allowed"
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
            checked ? "bg-brand-gold" : "bg-neutral-300"
          )}
        />
        <div
          className={cn(
            "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
            checked && "translate-x-4"
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
                badgeColor === "emerald" && "bg-emerald-100 text-emerald-700"
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
    lijnB_duoMeli: false,
    lijnE_bio: false,

    // Tech issues: default allemaal actief (huidige situatie)
    techD_casepacker: true,
    techD_opvoerband: true,
    techD_kruimelband: true,
    techE_sync: true,
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
    const base = 7; // normaal: inpak 6 + operator 1
    const planning = state.lijnB_duoMeli ? 1 : 0;
    return { base, planning, tech: 0, total: base + planning };
  };

  const calcInpakC = () => {
    if (!state.lijnC) return { base: 0, planning: 0, tech: 0, total: 0 };
    return { base: 3, planning: 0, tech: 0, total: 3 }; // inpak 2 + operator 1
  };

  const calcInpakD = () => {
    if (!state.lijnD) return { base: 0, planning: 0, tech: 0, total: 0 };
    const base = 4; // inpak 3 + operator 1
    const tech = state.techD_casepacker ? 1 : 0; // casepacker issue → +1 op inpak
    return { base, planning: 0, tech, total: base + tech };
  };

  const calcInpakE = () => {
    if (!state.lijnE) return { base: 0, planning: 0, tech: 0, total: 0 };
    const base = 8; // inpak 7 + operator 1
    const planning = state.lijnE_bio ? 1 : 0;
    return { base, planning, tech: 0, total: base + planning };
  };

  // === BAKLIJN berekeningen (bakoperator per lijn + tech issues) ===
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
    let tech = 0;
    if (state.techD_opvoerband) tech += 1;
    if (state.techD_kruimelband) tech += 1;
    return { base, tech, total: base + tech };
  };

  const calcBaklijnE = () => {
    if (!state.lijnE) return { base: 0, tech: 0, total: 0 };
    const base = 2; // 2 bakoperator
    const tech = state.techE_sync ? 1 : 0;
    return { base, tech, total: base + tech };
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
    tech: inpakA.tech + inpakB.tech + inpakC.tech + inpakD.tech + inpakE.tech,
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
    tech:
      baklijnA.tech +
      baklijnB.tech +
      baklijnC.tech +
      baklijnD.tech +
      baklijnE.tech,
    total:
      baklijnA.total +
      baklijnB.total +
      baklijnC.total +
      baklijnD.total +
      baklijnE.total,
  };

  const grandTotal = inpakTotals.total + baklijnTotals.total;

  // Line data for table display - with extras info
  const linesTableData = [
    {
      line: "Inpak Lijn A",
      active: state.lijnA,
      inpak: state.lijnA ? 2 + (state.lijnA_8stuks ? 1 : 0) : 0,
      inpakBase: 2,
      inpakExtra: state.lijnA_8stuks ? 1 : 0,
      inpakExtraLabel: state.lijnA_8stuks ? "8st" : null,
      operator: state.lijnA ? 1 : 0,
      bakoperator: state.lijnA ? 1 : 0,
      bakoperatorBase: 1,
      bakoperatorExtra: 0,
      bakoperatorExtraLabel: null as string | null,
    },
    {
      line:
        state.lijnBType === "mini"
          ? "Inpak Lijn B (mini)"
          : "Inpak Lijn B (normaal)",
      active: state.lijnB,
      inpak: state.lijnB
        ? state.lijnBType === "mini"
          ? 2
          : 6 + (state.lijnB_duoMeli ? 1 : 0)
        : 0,
      inpakBase: state.lijnBType === "mini" ? 2 : 6,
      inpakExtra: state.lijnBType === "normal" && state.lijnB_duoMeli ? 1 : 0,
      inpakExtraLabel:
        state.lijnBType === "normal" && state.lijnB_duoMeli ? "duo" : null,
      operator: state.lijnB ? 1 : 0,
      bakoperator: state.lijnB ? 2 : 0,
      bakoperatorBase: 2,
      bakoperatorExtra: 0,
      bakoperatorExtraLabel: null as string | null,
    },
    {
      line: "Inpak Lijn C",
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
      line: "Inpak Lijn D",
      active: state.lijnD,
      inpak: state.lijnD ? 3 + (state.techD_casepacker ? 1 : 0) : 0,
      inpakBase: 3,
      inpakExtra: state.techD_casepacker ? 1 : 0,
      inpakExtraLabel: state.techD_casepacker ? "case" : null,
      operator: state.lijnD ? 1 : 0,
      bakoperator: state.lijnD
        ? 2 +
          (state.techD_opvoerband ? 1 : 0) +
          (state.techD_kruimelband ? 1 : 0)
        : 0,
      bakoperatorBase: 2,
      bakoperatorExtra:
        (state.techD_opvoerband ? 1 : 0) + (state.techD_kruimelband ? 1 : 0),
      bakoperatorExtraLabel:
        [
          state.techD_opvoerband ? "opv" : null,
          state.techD_kruimelband ? "krm" : null,
        ]
          .filter(Boolean)
          .join("+") || null,
    },
    {
      line: "Inpak Lijn E",
      active: state.lijnE,
      inpak: state.lijnE ? 7 + (state.lijnE_bio ? 1 : 0) : 0,
      inpakBase: 7,
      inpakExtra: state.lijnE_bio ? 1 : 0,
      inpakExtraLabel: state.lijnE_bio ? "bio" : null,
      operator: state.lijnE ? 1 : 0,
      bakoperator: state.lijnE ? 2 + (state.techE_sync ? 1 : 0) : 0,
      bakoperatorBase: 2,
      bakoperatorExtra: state.techE_sync ? 1 : 0,
      bakoperatorExtraLabel: state.techE_sync ? "sync" : null,
    },
  ].filter((row) => row.active);

  const tableSubtotals = {
    inpak: linesTableData.reduce((s, r) => s + r.inpak, 0),
    operator: linesTableData.reduce((s, r) => s + r.operator, 0),
    bakoperator: linesTableData.reduce((s, r) => s + r.bakoperator, 0),
  };

  return (
    <div className="space-y-4">
      {/* Compact 3-column grid - stacks on mobile */}
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Column 1: Lijn selectie */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-brand-navy mb-3">
            Actieve lijnen
          </h3>
          <div className="space-y-2">
            {/* Lijn A */}
            <div
              className={cn(
                "flex items-center justify-between rounded-lg border px-3 py-2",
                state.lijnA
                  ? "border-brand-gold/40 bg-brand-gold/5"
                  : "border-neutral-200"
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
                  : "border-neutral-200"
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
                            lijnB_duoMeli: false,
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
                            lijnB_duoMeli: false,
                          }))
                        }
                        className="h-3 w-3 accent-brand-gold"
                      />
                      <span>Mini</span>
                    </label>
                  </div>
                )}
              </div>
              {state.lijnB && state.lijnBType === "normal" && (
                <label className="flex items-center gap-1.5 text-xs cursor-pointer mt-2 pl-12">
                  <input
                    type="checkbox"
                    checked={state.lijnB_duoMeli}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        lijnB_duoMeli: e.target.checked,
                      }))
                    }
                    className="h-3.5 w-3.5 accent-brand-gold"
                  />
                  <span className="text-neutral-600">Duo Meli +1</span>
                </label>
              )}
            </div>

            {/* Lijn C */}
            <div
              className={cn(
                "flex items-center justify-between rounded-lg border px-3 py-2",
                state.lijnC
                  ? "border-brand-gold/40 bg-brand-gold/5"
                  : "border-neutral-200"
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
                  : "border-neutral-200"
              )}>
              <Toggle
                checked={state.lijnD}
                onChange={(v) => setState((s) => ({ ...s, lijnD: v }))}
                label="D"
                badge={
                  state.lijnD ? `${inpakD.total + baklijnD.total}` : undefined
                }
                badgeColor={
                  inpakD.tech > 0 || baklijnD.tech > 0 ? "rose" : "amber"
                }
              />
            </div>

            {/* Lijn E */}
            <div
              className={cn(
                "rounded-lg border px-3 py-2",
                state.lijnE
                  ? "border-brand-gold/40 bg-brand-gold/5"
                  : "border-neutral-200"
              )}>
              <div className="flex items-center justify-between">
                <Toggle
                  checked={state.lijnE}
                  onChange={(v) => setState((s) => ({ ...s, lijnE: v }))}
                  label="E"
                  badge={
                    state.lijnE ? `${inpakE.total + baklijnE.total}` : undefined
                  }
                  badgeColor={baklijnE.tech > 0 ? "rose" : "amber"}
                />
                {state.lijnE && (
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={state.lijnE_bio}
                      onChange={(e) =>
                        setState((s) => ({ ...s, lijnE_bio: e.target.checked }))
                      }
                      className="h-3.5 w-3.5 accent-brand-gold"
                    />
                    <span className="text-neutral-600">BIO</span>
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Tech issues Inpaklijn */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-brand-navy mb-3">
            Tech issues — Inpak
          </h3>
          <div className="space-y-2">
            <div className="rounded-lg bg-neutral-50 px-3 py-2">
              <Toggle
                checked={state.techD_casepacker}
                onChange={(v) =>
                  setState((s) => ({ ...s, techD_casepacker: v }))
                }
                label="Casepacker (D)"
                badge="+1"
                badgeColor="rose"
                disabled={!state.lijnD}
              />
            </div>
          </div>
          {inpakTotals.tech > 0 && (
            <div className="mt-3 rounded-lg bg-rose-50 px-3 py-2 flex justify-between items-center">
              <span className="text-xs font-medium text-rose-700">Impact</span>
              <span className="text-sm font-bold text-rose-700">
                +{inpakTotals.tech} FTE
              </span>
            </div>
          )}
        </div>

        {/* Column 3: Tech issues Baklijn */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-brand-navy mb-3">
            Tech issues — Baklijn
          </h3>
          <div className="space-y-2">
            <div className="rounded-lg bg-neutral-50 px-3 py-2">
              <Toggle
                checked={state.techD_opvoerband}
                onChange={(v) =>
                  setState((s) => ({ ...s, techD_opvoerband: v }))
                }
                label="Opvoerband (D)"
                badge="+1"
                badgeColor="rose"
                disabled={!state.lijnD}
              />
            </div>
            <div className="rounded-lg bg-neutral-50 px-3 py-2">
              <Toggle
                checked={state.techD_kruimelband}
                onChange={(v) =>
                  setState((s) => ({ ...s, techD_kruimelband: v }))
                }
                label="Kruimelband (D)"
                badge="+1"
                badgeColor="rose"
                disabled={!state.lijnD}
              />
            </div>
            <div className="rounded-lg bg-neutral-50 px-3 py-2">
              <Toggle
                checked={state.techE_sync}
                onChange={(v) => setState((s) => ({ ...s, techE_sync: v }))}
                label="Sync probleem (E)"
                badge="+1"
                badgeColor="rose"
                disabled={!state.lijnE}
              />
            </div>
          </div>
          {baklijnTotals.tech > 0 && (
            <div className="mt-3 rounded-lg bg-rose-50 px-3 py-2 flex justify-between items-center">
              <span className="text-xs font-medium text-rose-700">Impact</span>
              <span className="text-sm font-bold text-rose-700">
                +{baklijnTotals.tech} FTE
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Compact Summary Table */}
      <div className="overflow-hidden rounded-xl sm:rounded-2xl border border-brand-gold/20 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-brand-gold/10 text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-3 sm:px-4 py-2">Lijn</th>
                <th className="px-3 sm:px-4 py-2">Inpak</th>
                <th className="px-3 sm:px-4 py-2">
                  <span className="sm:hidden">Op.</span>
                  <span className="hidden sm:inline">Operator</span>
                </th>
                <th className="px-3 sm:px-4 py-2">
                  <span className="sm:hidden">Bak.</span>
                  <span className="hidden sm:inline">Bakoperator</span>
                </th>
                <th className="px-3 sm:px-4 py-2">
                  <span className="sm:hidden">Tot.</span>
                  <span className="hidden sm:inline">Totaal</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gold/20">
              {linesTableData.map((row) => {
                const shortName = row.line
                  .replace("Inpak Lijn ", "")
                  .replace(" (mini)", " M")
                  .replace(" (normaal)", " N");

                return (
                  <tr
                    key={row.line}
                    className="text-neutral-700">
                    <td className="whitespace-nowrap px-3 sm:px-4 py-2 font-medium text-neutral-900 text-xs sm:text-sm">
                      <span className="sm:hidden">{shortName}</span>
                      <span className="hidden sm:inline">{row.line}</span>
                    </td>
                    <td className="px-3 sm:px-4 py-2">
                      {row.inpak}
                      {row.inpakExtraLabel && (
                        <span className="text-brand-gold ml-1 text-[10px] sm:text-xs">
                          (+{row.inpakExtra} {row.inpakExtraLabel})
                        </span>
                      )}
                    </td>
                    <td className="px-3 sm:px-4 py-2">{row.operator}</td>
                    <td className="px-3 sm:px-4 py-2">
                      {row.bakoperator}
                      {row.bakoperatorExtraLabel && (
                        <span className="text-brand-gold ml-1 text-[10px] sm:text-xs">
                          (+{row.bakoperatorExtra} {row.bakoperatorExtraLabel})
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
                    TOTAAL ({linesTableData.length} lijnen)
                  </span>
                </td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 font-semibold text-neutral-700">
                  {tableSubtotals.inpak}
                </td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 font-semibold text-neutral-700">
                  {tableSubtotals.operator}
                </td>
                <td className="px-3 sm:px-4 py-2 sm:py-3 font-semibold text-neutral-700">
                  {tableSubtotals.bakoperator}
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
