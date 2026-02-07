"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { aflosSchedule } from "@/data/aflosSchedule";
import { clamp, formatClock } from "@/lib/time";
import { translations } from "@/lib/translations";
import { cn } from "@/lib/ui";

import { useLanguage } from "./LanguageProvider";
import { PeopleIcon } from "./PeopleIcon";

const SPEEDS = [0.5, 1, 2, 4] as const;

const SHIFT_IDS = ["ochtend", "middag", "nacht"] as const;
const SHIFT_BASE_TIMES = {
  ochtend: "08:00",
  middag: "16:00",
  nacht: "00:00",
} as const;

type ShiftId = (typeof SHIFT_IDS)[number];

const AFLOS_ARRIVAL_MINUTE = 30; // 08:30 (relative to baseTime=08:00)
const AFLOS_BREAK_START_MINUTE = 90; // 09:30
const AFLOS_BREAK_DURATION = 30; // 30 min
const OTHER_LINES_START_MINUTE = 120; // 10:00
const OTHER_LINES_END_MINUTE = 190; // 11:10

const END_OF_SHIFT_MINUTE = Math.max(
  0,
  ...aflosSchedule.blocks.map((b) => b.startMinute + b.durationMinutes),
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

  // For Lijn E wave ②: take the last workers (after the first group)
  if (laneId === "E" && (activeBlockLabel ?? "").includes("②")) {
    return workerIds.slice(Math.max(0, workerIds.length - breakCount));
  }

  // Default: take the first N workers
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
      minute < b.startMinute + b.durationMinutes,
  );
  return active ? active.breakCount : 0;
}

function getLaneActiveBlock(laneId: LaneId, minute: number) {
  return aflosSchedule.blocks.find(
    (b) =>
      b.laneId === laneId &&
      minute >= b.startMinute &&
      minute < b.startMinute + b.durationMinutes,
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
    [laneId],
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
                  : "border-orange-100 bg-orange-50/40 text-neutral-700 hover:bg-orange-50",
              )}
              style={{ left: `${left}%`, width: `${width}%` }}
              title={`${b.label} • ${formatClock(
                baseTime,
                b.startMinute,
              )}–${formatClock(
                baseTime,
                b.startMinute + b.durationMinutes,
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
  const { getText } = useLanguage();
  const t = translations;
  
  const pct =
    maxMinute > 0 ? (clamp(nowMinute, 0, maxMinute) / maxMinute) * 100 : 0;

  // Translation keys for block labels
  const labelOffsite = getText(t.aflos.offsite);
  const labelOnLines = getText(t.aflos.onLine) + " (D/E)";
  const labelOwnBreak = getText(t.aflos.eigenPauze) + " (30m)";
  const labelOtherLines = getText(t.aflos.andereLijnen);
  const labelBreak = getText(t.aflos.pause);
  const labelOther = getText(t.aflos.otherLines);

  const blocks = useMemo(() => {
    return [
      {
        key: "offsite-start",
        label: labelOffsite,
        shortLabel: labelOffsite,
        startMinute: 0,
        durationMinutes: AFLOS_ARRIVAL_MINUTE,
        tone: "neutral" as const,
      },
      {
        key: "onlines-1",
        label: labelOnLines,
        shortLabel: "D/E",
        startMinute: AFLOS_ARRIVAL_MINUTE,
        durationMinutes: Math.max(
          0,
          AFLOS_BREAK_START_MINUTE - AFLOS_ARRIVAL_MINUTE,
        ),
        tone: "neutral" as const,
      },
      {
        key: "ownbreak",
        label: labelOwnBreak,
        shortLabel: labelBreak,
        startMinute: AFLOS_BREAK_START_MINUTE,
        durationMinutes: AFLOS_BREAK_DURATION,
        tone: "orange" as const,
      },
      {
        key: "otherlines",
        label: labelOtherLines,
        shortLabel: labelOther,
        startMinute: OTHER_LINES_START_MINUTE,
        durationMinutes: Math.max(
          0,
          OTHER_LINES_END_MINUTE - OTHER_LINES_START_MINUTE,
        ),
        tone: "emerald" as const,
      },
      {
        key: "onlines-2",
        label: labelOnLines,
        shortLabel: "D/E",
        startMinute: OTHER_LINES_END_MINUTE,
        durationMinutes: Math.max(
          0,
          END_OF_SHIFT_MINUTE - OTHER_LINES_END_MINUTE,
        ),
        tone: "neutral" as const,
      },
      {
        key: "offsite-end",
        label: labelOffsite,
        shortLabel: labelOffsite,
        startMinute: END_OF_SHIFT_MINUTE,
        durationMinutes: Math.max(0, maxMinute - END_OF_SHIFT_MINUTE),
        tone: "neutral" as const,
      },
    ].filter((b) => b.durationMinutes > 0);
  }, [maxMinute, labelOffsite, labelOnLines, labelOwnBreak, labelOtherLines, labelBreak, labelOther]);

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

          return (
            <button
              key={b.key}
              type="button"
              onClick={() => onSelectMinute(b.startMinute)}
              className={cn(
                "absolute inset-y-0 flex items-center justify-center rounded-md sm:rounded-lg border px-1 sm:px-2 text-[10px] sm:text-sm font-bold transition-colors",
                active ? toneClasses[b.tone].active : toneClasses[b.tone].idle,
              )}
              style={{ left: `${left}%`, width: `${width}%` }}
              title={`${b.label} • ${formatClock(
                baseTime,
                b.startMinute,
              )}–${formatClock(baseTime, b.startMinute + b.durationMinutes)}`}>
              {b.shortLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AflosSimulator() {
  const { getText } = useLanguage();
  const t = translations;
  
  const getShiftLabel = (id: ShiftId): string => {
    const shiftMap: Record<ShiftId, { nl: string; en: string }> = {
      ochtend: t.shifts.Ochtend,
      middag: t.shifts.Middag,
      nacht: t.shifts.Nacht,
    };
    return getText(shiftMap[id]);
  };

  const [shiftId, setShiftId] = useState<ShiftId>("ochtend");
  const baseTime = SHIFT_BASE_TIMES[shiftId];

  const maxMinute = aflosSchedule.endMinute;
  const playback = usePlayback(maxMinute);

  const currentT = useMemo(
    () => clamp(Math.round(playback.minute), 0, maxMinute),
    [playback.minute, maxMinute],
  );

  const perLane = useMemo(() => {
    const byLane: Record<LaneId, { breakCount: number; workers: number }> = {
      D: { breakCount: 0, workers: 0 },
      E: { breakCount: 0, workers: 0 },
    };

    for (const lane of aflosSchedule.lanes) {
      byLane[lane.id] = {
        breakCount: getLaneBreakCount(lane.id, currentT),
        workers: lane.workers,
      };
    }

    return byLane;
  }, [currentT]);

  const totalAflos = aflosSchedule.aflosTeam.count;
  const aflosOnSite = currentT >= AFLOS_ARRIVAL_MINUTE && currentT < END_OF_SHIFT_MINUTE;
  const aflosBreakEnd = AFLOS_BREAK_START_MINUTE + AFLOS_BREAK_DURATION;
  const aflosOnOwnBreak =
    aflosOnSite && currentT >= AFLOS_BREAK_START_MINUTE && currentT < aflosBreakEnd;
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
    [totalAflos],
  );

  const aflosAllocation = useMemo(() => {
    const availableIds = maxAflosAvailable > 0 ? aflosIds : [];
    const toE = availableIds.slice(0, coveredByLane.E);
    const toD = availableIds.slice(
      coveredByLane.E,
      coveredByLane.E + coveredByLane.D,
    );
    const remaining = availableIds.slice(coveredByLane.E + coveredByLane.D);

    const offsite = aflosOnSite ? [] : aflosIds;
    const ownBreak = aflosOnOwnBreak ? aflosIds : [];

    const inOtherLinesWindow =
      currentT >= OTHER_LINES_START_MINUTE && currentT < OTHER_LINES_END_MINUTE;

    // Any aflos not assigned to E or D can help other lines:
    // - during the dedicated "andere lijnen" window (min 120-190)
    // - OR whenever they're free during an active break block (e.g. R1②/R3②
    //   only needs 2 aflos on E, so the 3rd is free for other lines)
    const totalNeeded = perLane.E.breakCount + perLane.D.breakCount;
    const someBlockActive = totalNeeded > 0;
    const hasFreeAflos = remaining.length > 0;

    const otherLines =
      aflosAvailableNow &&
      (inOtherLinesWindow || (someBlockActive && hasFreeAflos))
        ? remaining
        : [];
    const idle =
      aflosAvailableNow &&
      !inOtherLinesWindow &&
      !(someBlockActive && hasFreeAflos)
        ? remaining
        : [];

    return { offsite, ownBreak, otherLines, idle, toE, toD };
  }, [
    aflosAvailableNow,
    aflosIds,
    aflosOnOwnBreak,
    aflosOnSite,
    coveredByLane.D,
    coveredByLane.E,
    maxAflosAvailable,
    perLane.D.breakCount,
    perLane.E.breakCount,
    currentT,
  ]);

  return (
    <LayoutGroup id="aflos-sim">
      <div className="grid gap-3 sm:gap-5">
        {/* Compact Control Bar */}
        <div className="rounded-xl sm:rounded-2xl border border-brand-gold/20 bg-white p-3 sm:p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {/* Shift Selector */}
            <div className="flex items-center rounded-lg bg-neutral-50 p-0.5 sm:p-1">
              {SHIFT_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setShiftId(id);
                    playback.setIsPlaying(false);
                    playback.setMinute(0);
                  }}
                  className={cn(
                    "rounded-md px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold transition-colors",
                    shiftId === id
                      ? "bg-brand-gold text-white shadow-sm"
                      : "text-neutral-600 hover:bg-white hover:text-neutral-800",
                  )}>
                  {getShiftLabel(id).slice(0, 3)}
                </button>
              ))}
            </div>

            {/* Time Display */}
            <div className="flex items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl bg-brand-gold/10 px-2 sm:px-4 py-1.5 sm:py-2">
              <span className="text-lg sm:text-2xl font-bold tabular-nums text-brand-gold">
                {formatClock(baseTime, currentT)}
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
                      clamp(Math.round(m) + step, 0, maxMinute),
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
                      clamp(Math.round(m) + step, 0, maxMinute),
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
                      : "text-neutral-500 hover:bg-white hover:text-neutral-700",
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
                value={currentT}
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
              {getText(t.aflos.timeline)}
            </h3>
            <div className="flex items-center gap-2 text-[10px] sm:text-xs">
              <span className="rounded-full bg-brand-gold/15 px-2 py-0.5 font-medium text-brand-gold">
                E: {getLaneActiveBlock("E", currentT)?.label ?? "—"}
              </span>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 font-medium text-neutral-600">
                D: {getLaneActiveBlock("D", currentT)?.label ?? "—"}
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:gap-4">
            <AflosTimelineRow
              label={getText(t.aflos.aflosPool)}
              maxMinute={maxMinute}
              nowMinute={currentT}
              baseTime={baseTime}
              onSelectMinute={(m) => {
                playback.setIsPlaying(false);
                playback.setMinute(m);
              }}
            />
            <TimelineRow
              laneId="E"
              label={`${getText(t.planner.line)} E`}
              maxMinute={maxMinute}
              nowMinute={currentT}
              baseTime={baseTime}
              onSelectMinute={(m) => {
                playback.setIsPlaying(false);
                playback.setMinute(m);
              }}
            />
            <TimelineRow
              laneId="D"
              label={`${getText(t.planner.line)} D`}
              maxMinute={maxMinute}
              nowMinute={currentT}
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
            const activeBlock = getLaneActiveBlock(lane.id, currentT);

            const workerIds = Array.from(
              { length: lane.workers },
              (_, idx) => `${lane.id}-W${idx + 1}` as WorkerId,
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

            return (
              <div
                key={lane.id}
                className="rounded-xl sm:rounded-2xl border border-brand-gold/20 bg-white p-3 sm:p-4 shadow-sm">
                {/* Lane Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <h3 className="text-base sm:text-lg font-bold text-neutral-900">
                      {getText(t.planner.line)} {lane.id}
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
                            : "bg-rose-100 text-rose-700",
                        )}>
                        {covered}/{breakCount} {getText(t.aflos.covered)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Workers Grid */}
                <div className="mt-3 sm:mt-4 grid gap-2 sm:gap-3 grid-cols-[1fr_auto]">
                  <div>
                    <p className="mb-1.5 sm:mb-2 text-[10px] sm:text-xs font-medium text-neutral-400">
                      {getText(t.aflos.onLine)}
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
                                  title={`${workerId} ${getText(t.aflos.uncovered)}`}
                                  aria-label={`${workerId} ${getText(t.aflos.uncovered)}`}>
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
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  <div className="min-w-24 sm:min-w-32">
                    <p className="mb-1.5 sm:mb-2 text-[10px] sm:text-xs font-medium text-neutral-400">
                      {getText(t.aflos.onBreak)}
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
                                label={`${workerId} (${getText(t.aflos.pause)})`}
                              />
                            </motion.div>
                          ))}
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
              {getText(t.aflos.aflosPool)}
            </h3>
            <span
              className={cn(
                "rounded-full px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold w-fit",
                aflosOnOwnBreak
                  ? "bg-orange-100 text-orange-700"
                  : !aflosOnSite
                    ? "bg-neutral-100 text-neutral-500"
                    : aflosAllocation.otherLines.length > 0
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-blue-100 text-blue-700",
              )}>
              {aflosOnOwnBreak
                ? getText(t.aflos.eigenPauze)
                : !aflosOnSite
                  ? getText(t.aflos.nietGearriveerd)
                  : aflosAllocation.otherLines.length > 0
                    ? `${getText(t.aflos.andereLijnen)} (${aflosAllocation.otherLines.length})`
                    : getText(t.aflos.beschikbaar)}
            </span>
          </div>

          <div className="grid gap-2 sm:gap-3 grid-cols-3">
            <div>
              <p className="mb-1.5 sm:mb-2 text-[10px] sm:text-xs font-medium text-neutral-400">
                {getText(t.aflos.offsite)}
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
                          label={`Aflos ${id} (${getText(t.aflos.offsite).toLowerCase()})`}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div>
              <p className="mb-1.5 sm:mb-2 text-[10px] sm:text-xs font-medium text-neutral-400">
                {getText(t.aflos.otherLines)}
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
                          label={`Aflos ${id} (${getText(t.aflos.otherLines).toLowerCase()})`}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div>
              <p className="mb-1.5 sm:mb-2 text-[10px] sm:text-xs font-medium text-neutral-400">
                {getText(t.aflos.pause)}
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
                          label={`Aflos ${id} (${getText(t.aflos.pause).toLowerCase()})`}
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
