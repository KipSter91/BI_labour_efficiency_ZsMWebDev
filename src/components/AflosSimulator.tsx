"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { aflosSchedule } from "@/data/aflosSchedule";
import { clamp, formatClock } from "@/lib/time";
import { cn } from "@/lib/ui";

import { PeopleIcon } from "./PeopleIcon";

const SPEEDS = [0.5, 1, 2, 4] as const;

const SHIFTS = [
  { id: "ochtend", label: "Ochtend", baseTime: "08:00" },
  { id: "middag", label: "Middag", baseTime: "16:00" },
  { id: "nacht", label: "Nacht", baseTime: "00:00" },
] as const;

type ShiftId = (typeof SHIFTS)[number]["id"];

const AFLOS_ARRIVAL_MINUTE = 30; // 08:30 (relative to baseTime=08:00)
const AFLOS_BREAK_START_MINUTE = 90; // 09:30
const AFLOS_BREAK_DURATION = 30; // 30 min
const OTHER_LINES_START_MINUTE = 120; // 10:00
const OTHER_LINES_END_MINUTE = 190; // 11:10

const END_OF_SHIFT_MINUTE = Math.max(
  0,
  ...aflosSchedule.blocks.map((b) => b.startMinute + b.durationMinutes)
); // 12:25

type LaneId = (typeof aflosSchedule.lanes)[number]["id"];

type AflosId = `A${number}`;
type WorkerId = `${LaneId}-W${number}`;

function getBreakWorkerIds({
  laneId,
  workerIds,
  breakCount,
  activeBlockLabel,
}: {
  laneId: LaneId;
  workerIds: WorkerId[];
  breakCount: number;
  activeBlockLabel?: string;
}) {
  if (breakCount <= 0) return [] as WorkerId[];

  // Visual rule: for lane E, wave 1 replaces the first 3, wave 2 replaces the last 3.
  // This makes the "swap" clearly visible without tracking individual names.
  if (laneId === "E" && (activeBlockLabel ?? "").includes("②")) {
    return workerIds.slice(Math.max(0, workerIds.length - breakCount));
  }

  return workerIds.slice(0, breakCount);
}

function usePlayback(maxMinute: number) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [minute, setMinute] = useState(0);

  const last = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      last.current = null;
      return;
    }

    let raf = 0;
    const tick = (now: number) => {
      if (last.current == null) last.current = now;
      const dtMs = now - last.current;
      last.current = now;

      // 1 second real time == 1 minute simulated at speed=1
      const deltaMinutes = (dtMs / 1000) * speed;
      setMinute((m) => {
        const next = m + deltaMinutes;
        if (next >= maxMinute) {
          setIsPlaying(false);
          return maxMinute;
        }
        return next;
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, maxMinute, speed]);

  return {
    isPlaying,
    setIsPlaying,
    speed,
    setSpeed,
    minute,
    setMinute,
  };
}

function getLaneBreakCount(laneId: LaneId, minute: number) {
  const active = aflosSchedule.blocks.find(
    (b) =>
      b.laneId === laneId &&
      minute >= b.startMinute &&
      minute < b.startMinute + b.durationMinutes
  );
  return active ? active.breakCount : 0;
}

function getLaneActiveBlock(laneId: LaneId, minute: number) {
  return aflosSchedule.blocks.find(
    (b) =>
      b.laneId === laneId &&
      minute >= b.startMinute &&
      minute < b.startMinute + b.durationMinutes
  );
}

function TimelineRow({
  laneId,
  label,
  maxMinute,
  nowMinute,
  baseTime,
  onSelectMinute,
}: {
  laneId: LaneId;
  label: string;
  maxMinute: number;
  nowMinute: number;
  baseTime: string;
  onSelectMinute: (minute: number) => void;
}) {
  const blocks = useMemo(
    () => aflosSchedule.blocks.filter((b) => b.laneId === laneId),
    [laneId]
  );

  const pct =
    maxMinute > 0 ? (clamp(nowMinute, 0, maxMinute) / maxMinute) * 100 : 0;

  return (
    <div className="grid gap-1.5 sm:gap-2">
      <div className="flex items-center justify-between">
        <div className="text-xs sm:text-sm font-semibold text-neutral-900">
          {label}
        </div>
        <div className="text-[10px] sm:text-xs text-neutral-500">
          {formatClock(baseTime, 0)} – {formatClock(baseTime, maxMinute)}
        </div>
      </div>

      <div className="relative h-8 sm:h-10 overflow-hidden rounded-lg sm:rounded-xl border border-brand-gold/20 bg-white">
        <div
          className="pointer-events-none absolute inset-y-0 w-px bg-orange-400/70"
          style={{ left: `${pct}%` }}
          aria-hidden="true"
        />

        {blocks.map((b) => {
          const left = (b.startMinute / maxMinute) * 100;
          const width = (b.durationMinutes / maxMinute) * 100;
          const active =
            nowMinute >= b.startMinute &&
            nowMinute < b.startMinute + b.durationMinutes;

          // Shorten label: "Round 1 ①" -> "R1①", "Round 2" -> "R2"
          const shortLabel = b.label.replace(/Round\s+(\d+)\s*(①|②)?/, "R$1$2");

          return (
            <button
              key={`${b.laneId}-${b.label}-${b.startMinute}`}
              type="button"
              onClick={() => onSelectMinute(b.startMinute)}
              className={cn(
                "absolute inset-y-0 flex items-center justify-center rounded-md sm:rounded-lg border px-1 sm:px-2 text-[10px] sm:text-sm font-bold transition-colors",
                active
                  ? "border-orange-300 bg-orange-100 text-orange-800"
                  : "border-orange-100 bg-orange-50/40 text-neutral-700 hover:bg-orange-50"
              )}
              style={{ left: `${left}%`, width: `${width}%` }}
              title={`${b.label} • ${formatClock(
                baseTime,
                b.startMinute
              )}–${formatClock(
                baseTime,
                b.startMinute + b.durationMinutes
              )} • breakCount=${b.breakCount}`}>
              {shortLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type AflosTimelineTone = "neutral" | "orange" | "emerald";

function AflosTimelineRow({
  label,
  maxMinute,
  nowMinute,
  baseTime,
  onSelectMinute,
}: {
  label: string;
  maxMinute: number;
  nowMinute: number;
  baseTime: string;
  onSelectMinute: (minute: number) => void;
}) {
  const pct =
    maxMinute > 0 ? (clamp(nowMinute, 0, maxMinute) / maxMinute) * 100 : 0;

  const blocks = useMemo(() => {
    return [
      {
        key: "offsite-start",
        label: "Offsite",
        startMinute: 0,
        durationMinutes: AFLOS_ARRIVAL_MINUTE,
        tone: "neutral" as const,
      },
      {
        key: "onlines-1",
        label: "Op de lijnen (D/E)",
        startMinute: AFLOS_ARRIVAL_MINUTE,
        durationMinutes: Math.max(
          0,
          AFLOS_BREAK_START_MINUTE - AFLOS_ARRIVAL_MINUTE
        ),
        tone: "neutral" as const,
      },
      {
        key: "ownbreak",
        label: "Eigen pauze (30m)",
        startMinute: AFLOS_BREAK_START_MINUTE,
        durationMinutes: AFLOS_BREAK_DURATION,
        tone: "orange" as const,
      },
      {
        key: "otherlines",
        label: "Ondersteuning andere lijnen",
        startMinute: OTHER_LINES_START_MINUTE,
        durationMinutes: Math.max(
          0,
          OTHER_LINES_END_MINUTE - OTHER_LINES_START_MINUTE
        ),
        tone: "emerald" as const,
      },
      {
        key: "onlines-2",
        label: "Op de lijnen (D/E)",
        startMinute: OTHER_LINES_END_MINUTE,
        durationMinutes: Math.max(
          0,
          END_OF_SHIFT_MINUTE - OTHER_LINES_END_MINUTE
        ),
        tone: "neutral" as const,
      },
      {
        key: "offsite-end",
        label: "Offsite",
        startMinute: END_OF_SHIFT_MINUTE,
        durationMinutes: Math.max(0, maxMinute - END_OF_SHIFT_MINUTE),
        tone: "neutral" as const,
      },
    ].filter((b) => b.durationMinutes > 0);
  }, [maxMinute]);

  return (
    <div className="grid gap-1.5 sm:gap-2">
      <div className="flex items-center justify-between">
        <div className="text-xs sm:text-sm font-semibold text-neutral-900">
          {label}
        </div>
        <div className="text-[10px] sm:text-xs text-neutral-500">
          {formatClock(baseTime, 0)} – {formatClock(baseTime, maxMinute)}
        </div>
      </div>

      <div className="relative h-8 sm:h-10 overflow-hidden rounded-lg sm:rounded-xl border border-brand-gold/20 bg-white">
        <div
          className="pointer-events-none absolute inset-y-0 w-px bg-orange-400/70"
          style={{ left: `${pct}%` }}
          aria-hidden="true"
        />

        {blocks.map((b) => {
          const left = (b.startMinute / maxMinute) * 100;
          const width = (b.durationMinutes / maxMinute) * 100;
          const active =
            nowMinute >= b.startMinute &&
            nowMinute < b.startMinute + b.durationMinutes;

          const toneClasses: Record<
            AflosTimelineTone,
            { active: string; idle: string }
          > = {
            neutral: {
              active: "border-neutral-300 bg-neutral-100 text-neutral-800",
              idle: "border-neutral-200 bg-neutral-50/60 text-neutral-600 hover:bg-neutral-50",
            },
            orange: {
              active: "border-orange-300 bg-orange-100 text-orange-800",
              idle: "border-orange-100 bg-orange-50/50 text-neutral-600 hover:bg-orange-50",
            },
            emerald: {
              active: "border-emerald-300 bg-emerald-100 text-emerald-800",
              idle: "border-emerald-200 bg-emerald-50/60 text-neutral-600 hover:bg-emerald-50",
            },
          };

          // Shorten labels for better readability
          let shortLabel = b.label;
          if (b.label === "Op de lijnen (D/E)") shortLabel = "D/E";
          else if (b.label === "Eigen pauze (30m)") shortLabel = "Pauze";
          else if (b.label === "Ondersteuning andere lijnen")
            shortLabel = "Andere";

          return (
            <button
              key={b.key}
              type="button"
              onClick={() => onSelectMinute(b.startMinute)}
              className={cn(
                "absolute inset-y-0 flex items-center justify-center rounded-md sm:rounded-lg border px-1 sm:px-2 text-[10px] sm:text-sm font-bold transition-colors",
                active ? toneClasses[b.tone].active : toneClasses[b.tone].idle
              )}
              style={{ left: `${left}%`, width: `${width}%` }}
              title={`${b.label} • ${formatClock(
                baseTime,
                b.startMinute
              )}–${formatClock(baseTime, b.startMinute + b.durationMinutes)}`}>
              {shortLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AflosSimulator() {
  const [shiftId, setShiftId] = useState<ShiftId>("ochtend");
  const currentShift = SHIFTS.find((s) => s.id === shiftId) ?? SHIFTS[0];
  const baseTime = currentShift.baseTime;

  const maxMinute = aflosSchedule.endMinute;
  const playback = usePlayback(maxMinute);

  const t = useMemo(
    () => clamp(Math.round(playback.minute), 0, maxMinute),
    [playback.minute, maxMinute]
  );

  const perLane = useMemo(() => {
    const byLane: Record<LaneId, { breakCount: number; workers: number }> = {
      D: { breakCount: 0, workers: 0 },
      E: { breakCount: 0, workers: 0 },
    };

    for (const lane of aflosSchedule.lanes) {
      byLane[lane.id] = {
        breakCount: getLaneBreakCount(lane.id, t),
        workers: lane.workers,
      };
    }

    return byLane;
  }, [t]);

  const totalAflos = aflosSchedule.aflosTeam.count;
  const aflosOnSite = t >= AFLOS_ARRIVAL_MINUTE && t < END_OF_SHIFT_MINUTE;
  const aflosBreakEnd = AFLOS_BREAK_START_MINUTE + AFLOS_BREAK_DURATION;
  const aflosOnOwnBreak =
    aflosOnSite && t >= AFLOS_BREAK_START_MINUTE && t < aflosBreakEnd;
  const aflosAvailableNow = aflosOnSite && !aflosOnOwnBreak;
  const maxAflosAvailable = aflosAvailableNow ? totalAflos : 0;

  const coveredByLane = useMemo(() => {
    // Allocate aflos coverage lane-by-lane (E first, then D)
    let remaining = maxAflosAvailable;
    const coverE = Math.min(remaining, perLane.E.breakCount);
    remaining -= coverE;
    const coverD = Math.min(remaining, perLane.D.breakCount);
    return { E: coverE, D: coverD };
  }, [maxAflosAvailable, perLane.D.breakCount, perLane.E.breakCount]);

  const aflosIds = useMemo(
    () =>
      Array.from({ length: totalAflos }, (_, idx) => `A${idx + 1}` as AflosId),
    [totalAflos]
  );

  const aflosAllocation = useMemo(() => {
    const availableIds = maxAflosAvailable > 0 ? aflosIds : [];
    const toE = availableIds.slice(0, coveredByLane.E);
    const toD = availableIds.slice(
      coveredByLane.E,
      coveredByLane.E + coveredByLane.D
    );
    const remaining = availableIds.slice(coveredByLane.E + coveredByLane.D);

    const offsite = aflosOnSite ? [] : aflosIds;
    const ownBreak = aflosOnOwnBreak ? aflosIds : [];

    const inOtherLinesWindow =
      t >= OTHER_LINES_START_MINUTE && t < OTHER_LINES_END_MINUTE;
    const otherLines = aflosAvailableNow && inOtherLinesWindow ? remaining : [];
    const idle = aflosAvailableNow && !inOtherLinesWindow ? remaining : [];

    return { offsite, ownBreak, otherLines, idle, toE, toD };
  }, [
    aflosAvailableNow,
    aflosIds,
    aflosOnOwnBreak,
    aflosOnSite,
    coveredByLane.D,
    coveredByLane.E,
    maxAflosAvailable,
    t,
  ]);

  return (
    <LayoutGroup id="aflos-sim">
      <div className="grid gap-3 sm:gap-5">
        {/* Compact Control Bar */}
        <div className="rounded-xl sm:rounded-2xl border border-brand-gold/20 bg-white p-3 sm:p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {/* Shift Selector */}
            <div className="flex items-center rounded-lg bg-neutral-50 p-0.5 sm:p-1">
              {SHIFTS.map((shift) => (
                <button
                  key={shift.id}
                  type="button"
                  onClick={() => {
                    setShiftId(shift.id);
                    playback.setIsPlaying(false);
                    playback.setMinute(0);
                  }}
                  className={cn(
                    "rounded-md px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold transition-colors",
                    shiftId === shift.id
                      ? "bg-brand-gold text-white shadow-sm"
                      : "text-neutral-600 hover:bg-white hover:text-neutral-800"
                  )}>
                  {shift.label.slice(0, 3)}
                </button>
              ))}
            </div>

            {/* Time Display */}
            <div className="flex items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl bg-brand-gold/10 px-2 sm:px-4 py-1.5 sm:py-2">
              <span className="text-lg sm:text-2xl font-bold tabular-nums text-brand-gold">
                {formatClock(baseTime, t)}
              </span>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => playback.setIsPlaying((p) => !p)}
                className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-brand-gold text-white shadow-sm hover:bg-brand-gold/90 transition-colors"
                title={playback.isPlaying ? "Pause" : "Play"}>
                {playback.isPlaying ? (
                  <svg
                    className="h-3 w-3 sm:h-4 sm:w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-3 w-3 sm:h-4 sm:w-4 ml-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  playback.setIsPlaying(false);
                  playback.setMinute(0);
                }}
                className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors"
                title="Reset">
                <svg
                  className="h-3 w-3 sm:h-4 sm:w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>

            {/* Step Controls */}
            <div className="hidden items-center rounded-lg bg-neutral-50 p-1 sm:flex">
              {[-10, -5, -1].map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => {
                    playback.setIsPlaying(false);
                    playback.setMinute((m) =>
                      clamp(Math.round(m) + step, 0, maxMinute)
                    );
                  }}
                  className="rounded-md px-2 py-1 text-xs font-medium text-neutral-500 hover:bg-white hover:text-neutral-700 transition-colors">
                  {step}
                </button>
              ))}
              <span className="px-1 text-neutral-300">|</span>
              {[1, 5, 10].map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => {
                    playback.setIsPlaying(false);
                    playback.setMinute((m) =>
                      clamp(Math.round(m) + step, 0, maxMinute)
                    );
                  }}
                  className="rounded-md px-2 py-1 text-xs font-medium text-neutral-500 hover:bg-white hover:text-neutral-700 transition-colors">
                  +{step}
                </button>
              ))}
            </div>

            {/* Speed Controls */}
            <div className="flex items-center rounded-lg bg-neutral-50 p-0.5 sm:p-1">
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => playback.setSpeed(s)}
                  className={cn(
                    "rounded-md px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold transition-colors",
                    playback.speed === s
                      ? "bg-neutral-900 text-white shadow-sm"
                      : "text-neutral-500 hover:bg-white hover:text-neutral-700"
                  )}>
                  {s}x
                </button>
              ))}
            </div>

            {/* Timeline Slider */}
            <div className="flex flex-1 items-center gap-2 sm:gap-3 min-w-30 sm:min-w-50 w-full sm:w-auto order-last sm:order-0">
              <span className="text-[10px] sm:text-xs font-medium text-neutral-400 hidden sm:block">
                {baseTime}
              </span>
              <input
                type="range"
                min={0}
                max={maxMinute}
                value={t}
                onChange={(e) => {
                  playback.setIsPlaying(false);
                  playback.setMinute(Number(e.target.value));
                }}
                className="flex-1 accent-brand-gold h-2"
              />
              <span className="text-[10px] sm:text-xs font-medium text-neutral-400 hidden sm:block">
                {formatClock(baseTime, maxMinute)}
              </span>
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="rounded-xl sm:rounded-2xl border border-brand-gold/20 bg-white p-3 sm:p-4 shadow-sm">
          <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-xs sm:text-sm font-semibold text-neutral-700">
              Tijdlijn
            </h3>
            <div className="flex items-center gap-2 text-[10px] sm:text-xs">
              <span className="rounded-full bg-brand-gold/15 px-2 py-0.5 font-medium text-brand-gold">
                E: {getLaneActiveBlock("E", t)?.label ?? "—"}
              </span>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 font-medium text-neutral-600">
                D: {getLaneActiveBlock("D", t)?.label ?? "—"}
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:gap-4">
            <AflosTimelineRow
              label="Aflos"
              maxMinute={maxMinute}
              nowMinute={t}
              baseTime={baseTime}
              onSelectMinute={(m) => {
                playback.setIsPlaying(false);
                playback.setMinute(m);
              }}
            />
            <TimelineRow
              laneId="E"
              label="Lijn E"
              maxMinute={maxMinute}
              nowMinute={t}
              baseTime={baseTime}
              onSelectMinute={(m) => {
                playback.setIsPlaying(false);
                playback.setMinute(m);
              }}
            />
            <TimelineRow
              laneId="D"
              label="Lijn D"
              maxMinute={maxMinute}
              nowMinute={t}
              baseTime={baseTime}
              onSelectMinute={(m) => {
                playback.setIsPlaying(false);
                playback.setMinute(m);
              }}
            />
          </div>
        </div>

        {/* Lane Cards */}
        <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
          {aflosSchedule.lanes.map((lane) => {
            const breakCount = perLane[lane.id].breakCount;
            const covered = coveredByLane[lane.id];
            const activeBlock = getLaneActiveBlock(lane.id, t);

            const workerIds = Array.from(
              { length: lane.workers },
              (_, idx) => `${lane.id}-W${idx + 1}` as WorkerId
            );
            const breakWorkerIds = getBreakWorkerIds({
              laneId: lane.id,
              workerIds,
              breakCount,
              activeBlockLabel: activeBlock?.label,
            });
            const onBreak = new Set(breakWorkerIds);

            const laneAflosIds =
              lane.id === "E"
                ? aflosAllocation.toE
                : lane.id === "D"
                ? aflosAllocation.toD
                : [];

            const replacementMap = new Map<WorkerId, AflosId>();
            for (
              let idx = 0;
              idx < Math.min(laneAflosIds.length, breakWorkerIds.length);
              idx++
            ) {
              replacementMap.set(breakWorkerIds[idx], laneAflosIds[idx]);
            }

            const slotWorkerIds = workerIds;
            const isFullyCovered = breakCount > 0 && covered === breakCount;

            // PO and PO Assistant alternate breaks (for Lijn E and D only)
            const hasPOPair = lane.id === "E" || lane.id === "D";

            let poOnBreak = false;
            let poaOnBreak = false;

            if (hasPOPair) {
              if (lane.id === "E" && activeBlock) {
                // Lijn E: alternate per block (block 0: PO, block 1: PO-A, etc.)
                const blockIndex = aflosSchedule.blocks.findIndex(
                  (b) => b.label === activeBlock.label
                );
                poOnBreak = blockIndex % 2 === 0;
                poaOnBreak = blockIndex % 2 === 1;
              } else if (lane.id === "D") {
                // Lijn D: fixed times for PO breaks (independent of worker blocks)
                // 1st round: PO 9:10-9:30 (70-90), PO-A 9:30-9:50 (90-110)
                // 2nd round: PO 12:00-12:20 (240-260), PO-A 12:20-12:40 (260-280)
                const poBreak1 = t >= 70 && t < 90;
                const poBreak2 = t >= 240 && t < 260;
                const poaBreak1 = t >= 90 && t < 110;
                const poaBreak2 = t >= 260 && t < 280;
                poOnBreak = poBreak1 || poBreak2;
                poaOnBreak = poaBreak1 || poaBreak2;
              }
            }

            return (
              <div
                key={lane.id}
                className="rounded-xl sm:rounded-2xl border border-brand-gold/20 bg-white p-3 sm:p-4 shadow-sm">
                {/* Lane Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <h3 className="text-base sm:text-lg font-bold text-neutral-900">
                      {lane.label}
                    </h3>
                    {activeBlock && (
                      <span className="rounded-full bg-orange-100 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium text-orange-700">
                        {activeBlock.label}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {breakCount > 0 && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-semibold",
                          isFullyCovered
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        )}>
                        {covered}/{breakCount} gedekt
                      </span>
                    )}
                  </div>
                </div>

                {/* Workers Grid */}
                <div className="mt-3 sm:mt-4 grid gap-2 sm:gap-3 grid-cols-[1fr_auto]">
                  <div>
                    <p className="mb-1.5 sm:mb-2 text-[10px] sm:text-xs font-medium text-neutral-400">
                      Op de lijn
                    </p>
                    <div className="min-h-9 sm:min-h-11 rounded-lg sm:rounded-xl border border-neutral-200 bg-neutral-50/50 p-1.5 sm:p-2">
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        <AnimatePresence
                          initial={false}
                          mode="popLayout">
                          {slotWorkerIds.map((workerId, idx) => {
                            const isOnBreakNow = onBreak.has(workerId);
                            const replacingAflos = replacementMap.get(workerId);

                            if (isOnBreakNow) {
                              if (replacingAflos) {
                                return (
                                  <motion.div
                                    key={`slot-${lane.id}-${idx}-${replacingAflos}`}
                                    layoutId={replacingAflos}
                                    layout
                                    transition={{
                                      type: "spring",
                                      stiffness: 500,
                                      damping: 35,
                                    }}>
                                    <PeopleIcon
                                      variant="aflos"
                                      label={`Aflos ${replacingAflos} replacing ${workerId}`}
                                    />
                                  </motion.div>
                                );
                              }

                              return (
                                <motion.div
                                  key={`slot-${lane.id}-${idx}-empty`}
                                  layout
                                  transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 35,
                                  }}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-dashed ring-orange-200 bg-white"
                                  title={`${workerId} uncovered`}
                                  aria-label={`${workerId} uncovered`}>
                                  <span className="text-[10px] font-semibold text-orange-600">
                                    —
                                  </span>
                                </motion.div>
                              );
                            }

                            return (
                              <motion.div
                                key={`slot-${lane.id}-${idx}-${workerId}`}
                                layoutId={workerId}
                                layout
                                transition={{
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 35,
                                }}>
                                <PeopleIcon
                                  variant="worker"
                                  label={workerId}
                                />
                              </motion.div>
                            );
                          })}
                          {/* PO on line (when not on break) */}
                          {hasPOPair && !poOnBreak && (
                            <motion.div
                              key={`slot-${lane.id}-PO`}
                              layoutId={`${lane.id}-PO`}
                              layout
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 35,
                              }}>
                              <PeopleIcon
                                variant="po"
                                label="PO"
                              />
                            </motion.div>
                          )}
                          {/* PO-A on line (when not on break) */}
                          {hasPOPair && !poaOnBreak && (
                            <motion.div
                              key={`slot-${lane.id}-POA`}
                              layoutId={`${lane.id}-POA`}
                              layout
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 35,
                              }}>
                              <PeopleIcon
                                variant="poa"
                                label="PO-A"
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  <div className="min-w-24 sm:min-w-32">
                    <p className="mb-1.5 sm:mb-2 text-[10px] sm:text-xs font-medium text-neutral-400">
                      Op pauze
                    </p>
                    <div className="min-h-9 sm:min-h-11 rounded-lg sm:rounded-xl border border-orange-200 bg-orange-50/50 p-1.5 sm:p-2">
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        <AnimatePresence
                          initial={false}
                          mode="popLayout">
                          {breakWorkerIds.map((workerId) => (
                            <motion.div
                              key={`break-${workerId}`}
                              layoutId={workerId}
                              layout
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 35,
                              }}>
                              <PeopleIcon
                                variant="break"
                                label={`${workerId} (break)`}
                              />
                            </motion.div>
                          ))}
                          {/* PO on break */}
                          {hasPOPair && poOnBreak && (
                            <motion.div
                              key={`break-${lane.id}-PO`}
                              layoutId={`${lane.id}-PO`}
                              layout
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 35,
                              }}>
                              <PeopleIcon
                                variant="po"
                                label="PO (pauze)"
                              />
                            </motion.div>
                          )}
                          {/* PO-A on break */}
                          {hasPOPair && poaOnBreak && (
                            <motion.div
                              key={`break-${lane.id}-POA`}
                              layoutId={`${lane.id}-POA`}
                              layout
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 35,
                              }}>
                              <PeopleIcon
                                variant="poa"
                                label="PO-A (pauze)"
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Aflos Pool Status */}
        <div className="rounded-xl sm:rounded-2xl border border-brand-gold/20 bg-white p-3 sm:p-4 shadow-sm">
          <div className="mb-2 sm:mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-0">
            <h3 className="text-xs sm:text-sm font-semibold text-neutral-700">
              Aflos Pool
            </h3>
            <span
              className={cn(
                "rounded-full px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold w-fit",
                aflosOnOwnBreak
                  ? "bg-orange-100 text-orange-700"
                  : !aflosOnSite
                  ? "bg-neutral-100 text-neutral-500"
                  : t >= OTHER_LINES_START_MINUTE && t < OTHER_LINES_END_MINUTE
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-blue-100 text-blue-700"
              )}>
              {aflosOnOwnBreak
                ? "Eigen pauze"
                : !aflosOnSite
                ? "Niet gearriveerd"
                : t >= OTHER_LINES_START_MINUTE && t < OTHER_LINES_END_MINUTE
                ? "Andere lijnen"
                : "Beschikbaar"}
            </span>
          </div>

          <div className="grid gap-2 sm:gap-3 grid-cols-3">
            <div>
              <p className="mb-1.5 sm:mb-2 text-[10px] sm:text-xs font-medium text-neutral-400">
                Offsite
              </p>
              <div className="min-h-9 sm:min-h-11 rounded-lg sm:rounded-xl border border-neutral-200 bg-neutral-50/50 p-1.5 sm:p-2">
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <AnimatePresence initial={false}>
                    {aflosAllocation.offsite.map((id) => (
                      <motion.div
                        key={id}
                        layoutId={id}
                        layout
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 35,
                        }}>
                        <PeopleIcon
                          variant="aflos"
                          label={`Aflos ${id} (offsite)`}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div>
              <p className="mb-1.5 sm:mb-2 text-[10px] sm:text-xs font-medium text-neutral-400">
                Andere
              </p>
              <div className="min-h-9 sm:min-h-11 rounded-lg sm:rounded-xl border border-emerald-200 bg-emerald-50/50 p-1.5 sm:p-2">
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <AnimatePresence
                    initial={false}
                    mode="popLayout">
                    {aflosAllocation.otherLines.map((id) => (
                      <motion.div
                        key={id}
                        layoutId={id}
                        layout
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 35,
                        }}>
                        <PeopleIcon
                          variant="aflos"
                          label={`Aflos ${id} (other lines)`}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div>
              <p className="mb-1.5 sm:mb-2 text-[10px] sm:text-xs font-medium text-neutral-400">
                Pauze
              </p>
              <div className="min-h-9 sm:min-h-11 rounded-lg sm:rounded-xl border border-orange-200 bg-orange-50/50 p-1.5 sm:p-2">
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <AnimatePresence
                    initial={false}
                    mode="popLayout">
                    {aflosAllocation.ownBreak.map((id) => (
                      <motion.div
                        key={id}
                        layoutId={id}
                        layout
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 35,
                        }}>
                        <PeopleIcon
                          variant="aflos"
                          label={`Aflos ${id} (break)`}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutGroup>
  );
}
