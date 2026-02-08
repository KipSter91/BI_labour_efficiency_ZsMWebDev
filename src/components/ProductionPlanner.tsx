"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useLanguage } from "./LanguageProvider";

type Day = "Maandag" | "Dinsdag" | "Woensdag" | "Donderdag" | "Vrijdag";
type Shift = "Ochtend" | "Middag" | "Nacht";
type LineKey = "A" | "B" | "C" | "D" | "E";
type RoleKey = "bak" | "op" | "asst";
type BLijnType = "normaal" | "mini";

type ShiftSettings = {
  activeLines: Record<LineKey, boolean>;
  bType: BLijnType;
  a8stuks: boolean;
  eTray: boolean;
};

type PlannerData = Record<
  Day,
  Record<Shift, Record<LineKey, Record<RoleKey, number>>>
>;

type PlannerSettings = Record<Day, Record<Shift, ShiftSettings>>;

const DAYS: Day[] = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag"];
const SHIFTS: Shift[] = ["Ochtend", "Middag", "Nacht"];
const LINES: LineKey[] = ["A", "B", "C", "D", "E"];

const STORAGE_KEY = "labeff_weekplanner_v1";

function getNextWeekInfo() {
  const now = new Date();
  // Find next Monday
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ...
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);

  // ISO 8601 week number
  const target = new Date(nextMonday.getTime());
  target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7));
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  firstThursday.setDate(
    firstThursday.getDate() + 3 - ((firstThursday.getDay() + 6) % 7),
  );
  const weekNumber =
    1 +
    Math.round((target.getTime() - firstThursday.getTime()) / (7 * 86400000));

  // Build dates for Mon-Fri
  const dates: Record<Day, string> = {} as Record<Day, string>;
  const shortMonths = [
    "jan",
    "feb",
    "mrt",
    "apr",
    "mei",
    "jun",
    "jul",
    "aug",
    "sep",
    "okt",
    "nov",
    "dec",
  ];
  DAYS.forEach((day, i) => {
    const d = new Date(nextMonday);
    d.setDate(nextMonday.getDate() + i);
    dates[day] = `${d.getDate()} ${shortMonths[d.getMonth()]}`;
  });

  return { weekNumber, dates, year: nextMonday.getFullYear() };
}

function createEmptyData(): PlannerData {
  return DAYS.reduce((acc, day) => {
    acc[day] = SHIFTS.reduce(
      (accShift, shift) => {
        accShift[shift] = LINES.reduce(
          (accLine, line) => {
            accLine[line] = { bak: 0, op: 0, asst: 0 };
            return accLine;
          },
          {} as Record<LineKey, Record<RoleKey, number>>,
        );
        return accShift;
      },
      {} as Record<Shift, Record<LineKey, Record<RoleKey, number>>>,
    );
    return acc;
  }, {} as PlannerData);
}

function createDefaultSettings(): PlannerSettings {
  return DAYS.reduce((acc, day) => {
    acc[day] = SHIFTS.reduce(
      (accShift, shift) => {
        accShift[shift] = {
          activeLines: LINES.reduce(
            (a, line) => {
              a[line] = true;
              return a;
            },
            {} as Record<LineKey, boolean>,
          ),
          bType: "normaal",
          a8stuks: false,
          eTray: false,
        };
        return accShift;
      },
      {} as Record<Shift, ShiftSettings>,
    );
    return acc;
  }, {} as PlannerSettings);
}

function getBlueprint(line: LineKey, bType: BLijnType) {
  const base = {
    A: { bak: 1, op: 1, asst: 2 },
    B: { bak: 2, op: 1, asst: bType === "mini" ? 2 : 4 },
    C: { bak: 1, op: 1, asst: 2 },
    D: { bak: 2, op: 1, asst: 2 },
    E: { bak: 2, op: 1, asst: 4 },
  } as const;
  return base[line];
}

function getInitialPlannerState() {
  if (typeof window === "undefined") {
    return {
      data: createEmptyData(),
      settings: createDefaultSettings(),
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        data: createEmptyData(),
        settings: createDefaultSettings(),
      };
    }
    const parsed = JSON.parse(raw) as {
      data: PlannerData;
      settings: PlannerSettings;
    };
    if (parsed?.data && parsed?.settings) {
      return { data: parsed.data, settings: parsed.settings };
    }
  } catch {
    // ignore
  }
  return {
    data: createEmptyData(),
    settings: createDefaultSettings(),
  };
}

export function ProductionPlanner() {
  const { getText, t, language } = useLanguage();
  const initial = getInitialPlannerState();
  const [data, setData] = useState<PlannerData>(initial.data);
  const [settings, setSettings] = useState<PlannerSettings>(initial.settings);
  const plannerRef = useRef<HTMLDivElement | null>(null);
  const dayRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const nextWeek = useMemo(() => getNextWeekInfo(), []);
  const [expandedDays, setExpandedDays] = useState<Record<Day, boolean>>(() =>
    DAYS.reduce(
      (acc, day) => ({ ...acc, [day]: false }),
      {} as Record<Day, boolean>,
    ),
  );

  // Translated labels
  const getDayName = (day: Day) => getText(t.days[day]);
  const getShiftName = (shift: Shift) => getText(t.shifts[shift]);
  const ROLES: Array<{ key: RoleKey; label: string }> = [
    { key: "bak", label: getText(t.roles.bakoperator) },
    { key: "op", label: getText(t.roles.inpakoperator) },
    { key: "asst", label: getText(t.roles.inpakassistent) },
  ];

  // Generate shift remark based on active line count
  const getShiftRemark = (shiftSettings: ShiftSettings): string | null => {
    const activeCount = LINES.filter(
      (l) => shiftSettings.activeLines[l],
    ).length;
    if (activeCount === 3) {
      return getText(t.planner.remark3Lines);
    } else if (activeCount <= 2 && activeCount > 0) {
      return getText(t.planner.remark2Lines);
    }
    return null;
  };

  const toggleDay = (day: Day) => {
    const willOpen = !expandedDays[day];
    setExpandedDays((prev) => ({ ...prev, [day]: !prev[day] }));

    if (willOpen) {
      // Opening: wait for content to render, then scroll to center
      setTimeout(() => {
        const el = dayRefs.current[day];
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const elCenter = rect.top + rect.height / 2;
        const viewCenter = window.innerHeight / 2;
        const scrollTarget = window.scrollY + elCenter - viewCenter;
        window.scrollTo({ top: Math.max(0, scrollTarget), behavior: "smooth" });
      }, 300);
    } else {
      // Closing: scroll header to top
      requestAnimationFrame(() => {
        const el = dayRefs.current[day];
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      });
    }
  };

  const expandAll = () => {
    setExpandedDays(
      DAYS.reduce(
        (acc, day) => ({ ...acc, [day]: true }),
        {} as Record<Day, boolean>,
      ),
    );
  };

  const collapseAll = () => {
    setExpandedDays(
      DAYS.reduce(
        (acc, day) => ({ ...acc, [day]: false }),
        {} as Record<Day, boolean>,
      ),
    );
    requestAnimationFrame(() => {
      plannerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, settings }));
    } catch {
      // ignore
    }
  }, [data, settings]);

  const updateCell = (
    day: Day,
    shift: Shift,
    line: LineKey,
    role: RoleKey,
    value: number,
  ) => {
    setData((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [shift]: {
          ...prev[day][shift],
          [line]: {
            ...prev[day][shift][line],
            [role]: value,
          },
        },
      },
    }));
  };

  const applyAutoFillForShift = (
    day: Day,
    shift: Shift,
    nextSettings: ShiftSettings,
  ) => {
    setData((prev) => {
      const nextShift = LINES.reduce(
        (acc, line) => {
          const isActive = nextSettings.activeLines[line];
          if (!isActive) {
            acc[line] = { bak: 0, op: 0, asst: 0 };
            return acc;
          }
          const base = getBlueprint(line, nextSettings.bType);
          const asstExtra =
            (line === "A" && nextSettings.a8stuks ? 1 : 0) +
            (line === "E" && nextSettings.eTray ? 1 : 0);
          acc[line] = {
            bak: base.bak,
            op: base.op,
            asst: base.asst + asstExtra,
          };
          return acc;
        },
        {} as Record<LineKey, Record<RoleKey, number>>,
      );

      return {
        ...prev,
        [day]: {
          ...prev[day],
          [shift]: nextShift,
        },
      };
    });
  };

  const updateShiftSettings = (
    day: Day,
    shift: Shift,
    updater: (s: ShiftSettings) => ShiftSettings,
  ) => {
    setSettings((prev) => {
      const prevShift = prev[day][shift];
      const nextShift = updater(prevShift);

      // Check what changed
      const activeLinesChanged = LINES.some(
        (line) => prevShift.activeLines[line] !== nextShift.activeLines[line],
      );
      const conditionsChanged =
        prevShift.a8stuks !== nextShift.a8stuks ||
        prevShift.bType !== nextShift.bType ||
        prevShift.eTray !== nextShift.eTray;

      if (activeLinesChanged) {
        // Only zero out deactivated lines
        LINES.forEach((line) => {
          if (prevShift.activeLines[line] && !nextShift.activeLines[line]) {
            setData((d) => ({
              ...d,
              [day]: {
                ...d[day],
                [shift]: {
                  ...d[day][shift],
                  [line]: { bak: 0, op: 0, asst: 0 },
                },
              },
            }));
          }
        });
      }

      if (conditionsChanged) {
        // Recalculate active lines with new conditions
        setData((d) => {
          const updated = { ...d[day][shift] };
          LINES.forEach((line) => {
            if (!nextShift.activeLines[line]) return;
            const base = getBlueprint(line, nextShift.bType);
            const asstExtra =
              (line === "A" && nextShift.a8stuks ? 1 : 0) +
              (line === "E" && nextShift.eTray ? 1 : 0);
            updated[line] = {
              bak: base.bak,
              op: base.op,
              asst: base.asst + asstExtra,
            };
          });
          return {
            ...d,
            [day]: {
              ...d[day],
              [shift]: updated,
            },
          };
        });
      }

      return {
        ...prev,
        [day]: {
          ...prev[day],
          [shift]: nextShift,
        },
      };
    });
  };

  const autoFillWeek = () => {
    DAYS.forEach((day) => {
      SHIFTS.forEach((shift) => {
        applyAutoFillForShift(day, shift, settings[day][shift]);
      });
    });
  };

  const resetWeek = () => {
    setData(createEmptyData());
    setSettings(createDefaultSettings());
  };

  const resetShift = (day: Day, shift: Shift) => {
    setData((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [shift]: LINES.reduce(
          (acc, line) => {
            acc[line] = { bak: 0, op: 0, asst: 0 };
            return acc;
          },
          {} as Record<LineKey, Record<RoleKey, number>>,
        ),
      },
    }));
    setSettings((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [shift]: {
          activeLines: LINES.reduce(
            (a, line) => ({ ...a, [line]: true }),
            {} as Record<LineKey, boolean>,
          ),
          bType: "normaal" as BLijnType,
          a8stuks: false,
          eTray: false,
        },
      },
    }));
  };

  const exportToPdf = () => {
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 30;

    const navy = "#19213c";
    const goldBg = [253, 230, 138] as [number, number, number]; // brand-gold header
    const subHeadBg = [255, 247, 237] as [number, number, number]; // light gold sub-header
    const lineBg = [241, 245, 249] as [number, number, number]; // line-col bg
    const mutedColor = "#94a3b8";
    const borderColor = [209, 213, 219] as [number, number, number];

    // Title
    const pdfTitle = getText(t.planner.pdfTitle);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.setTextColor(navy);
    pdf.text(
      `${pdfTitle} – ${getText(t.common.week)} ${nextWeek.weekNumber} (${nextWeek.dates["Maandag"]} – ${nextWeek.dates["Vrijdag"]} ${nextWeek.year})`,
      margin,
      margin + 4,
    );

    const dateLocale = language === "en" ? "en-GB" : "nl-NL";
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(120, 120, 120);
    pdf.text(
      `${language === "en" ? "Generated on" : "Gegenereerd op"}: ${new Date().toLocaleDateString(dateLocale, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`,
      margin,
      margin + 18,
    );

    let startY = margin + 32;

    DAYS.forEach((day) => {
      // Build header rows
      const headerRow1 = [
        {
          content: getText(t.common.line),
          rowSpan: 2,
          styles: {
            halign: "left" as const,
            fillColor: lineBg,
            fontStyle: "bold" as const,
            textColor: navy,
          },
        },
        ...SHIFTS.map((shift) => ({
          content: getShiftName(shift),
          colSpan: 3,
          styles: {
            halign: "center" as const,
            fillColor: goldBg,
            fontStyle: "bold" as const,
            textColor: navy,
          },
        })),
      ];

      const headerRow2 = SHIFTS.flatMap(() =>
        ROLES.map((role) => ({
          content: role.label,
          styles: {
            halign: "center" as const,
            fillColor: subHeadBg,
            fontStyle: "bold" as const,
            textColor: "#374151",
            fontSize: 7,
          },
        })),
      );

      // Build body rows
      const bodyRows = LINES.map((line) => {
        const lineCells = SHIFTS.flatMap((shift) =>
          ROLES.map((role) => {
            const isActive = settings[day][shift].activeLines[line];
            const value = data[day][shift][line][role.key];
            return {
              content: isActive ? String(value) : "–",
              styles: {
                halign: "center" as const,
                textColor: isActive ? "#0f172a" : mutedColor,
                fontStyle: (isActive ? "normal" : "normal") as "normal",
              },
            };
          }),
        );
        return [
          {
            content: `${getText(t.planner.pdfLine)} ${line}`,
            styles: {
              halign: "left" as const,
              fillColor: lineBg,
              fontStyle: "bold" as const,
              textColor: navy,
            },
          },
          ...lineCells,
        ];
      });

      // Totals row
      const totalRow = [
        {
          content: getText(t.planner.pdfTotal),
          styles: {
            halign: "left" as const,
            fontStyle: "bold" as const,
            fillColor: goldBg,
            textColor: navy,
          },
        },
        ...SHIFTS.flatMap((shift) =>
          ROLES.map((role) => {
            const total = LINES.reduce((sum, line) => {
              if (!settings[day][shift].activeLines[line]) return sum;
              return sum + data[day][shift][line][role.key];
            }, 0);
            return {
              content: String(total),
              styles: {
                halign: "center" as const,
                fontStyle: "bold" as const,
                fillColor: goldBg,
                textColor: navy,
              },
            };
          }),
        ),
      ];

      // Conditions info row
      const conditionTags = SHIFTS.map((shift) => {
        const s = settings[day][shift];
        const tags: string[] = [];
        const inactiveLines = LINES.filter((l) => !s.activeLines[l]);
        if (inactiveLines.length > 0) {
          tags.push(`${getText(t.planner.off)}: ${inactiveLines.join(", ")}`);
        }
        if (s.a8stuks) tags.push(getText(t.planner.a8stuks));
        if (s.bType === "mini") tags.push(getText(t.planner.bMini));
        if (s.eTray) tags.push(getText(t.planner.eTray));
        return tags.length > 0 ? tags.join("  •  ") : "–";
      });

      const conditionsRow = [
        {
          content: getText(t.planner.pdfConditions),
          styles: {
            halign: "left" as const,
            fontStyle: "bold" as const,
            fillColor: [237, 242, 247] as [number, number, number],
            textColor: "#475569",
            fontSize: 6.5,
          },
        },
        ...conditionTags.map((tag) => ({
          content: tag,
          colSpan: 3,
          styles: {
            halign: "center" as const,
            fillColor: [237, 242, 247] as [number, number, number],
            textColor: "#475569",
            fontSize: 6.5,
            fontStyle: (tag === "–" ? "normal" : "italic") as
              | "normal"
              | "italic",
          },
        })),
      ];

      // Remarks row (based on active line count per shift)
      const remarkTexts = SHIFTS.map((shift) => {
        const remark = getShiftRemark(settings[day][shift]);
        return remark ?? "–";
      });

      const remarksRow = [
        {
          content: getText(t.planner.remarks),
          styles: {
            halign: "left" as const,
            fontStyle: "bold" as const,
            fillColor: [255, 247, 230] as [number, number, number],
            textColor: "#92400e",
            fontSize: 6.5,
          },
        },
        ...remarkTexts.map((txt) => ({
          content: txt,
          colSpan: 3,
          styles: {
            halign: "center" as const,
            fillColor: [255, 247, 230] as [number, number, number],
            textColor: "#92400e",
            fontSize: 6.5,
            fontStyle: (txt === "–" ? "normal" : "italic") as
              | "normal"
              | "italic",
          },
        })),
      ];

      // Each day block = 22px header bar + 2 header rows (≈16 each) + (LINES+2) body rows (≈16 each) + gap
      const rowHeight = 18;
      const dayBlockHeight =
        22 + 2 * rowHeight + (LINES.length + 3) * rowHeight + 14;
      const pageHeight = pdf.internal.pageSize.getHeight();
      if (startY + dayBlockHeight > pageHeight - margin) {
        pdf.addPage();
        startY = margin;
      }

      // Day header bar
      pdf.setFillColor(goldBg[0], goldBg[1], goldBg[2]);
      pdf.roundedRect(margin, startY, pageWidth - margin * 2, 18, 3, 3, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.setTextColor(navy);
      pdf.text(
        `${getDayName(day)}  –  ${nextWeek.dates[day]}`,
        margin + 8,
        startY + 13,
      );
      startY += 22;

      // Render the table
      autoTable(pdf, {
        startY,
        margin: { left: margin, right: margin },
        head: [headerRow1, headerRow2],
        body: [...bodyRows, totalRow, conditionsRow, remarksRow],
        theme: "grid",
        pageBreak: "avoid",
        rowPageBreak: "avoid",
        styles: {
          font: "helvetica",
          fontSize: 8,
          cellPadding: 4,
          lineColor: borderColor,
          lineWidth: 0.5,
          valign: "middle",
        },
        headStyles: {
          lineColor: borderColor,
          lineWidth: 0.5,
        },
        tableWidth: pageWidth - margin * 2,
        didParseCell: (hookData) => {
          // Zebra striping for body
          if (hookData.section === "body" && hookData.row.index % 2 === 1) {
            const cellStyles = hookData.cell.styles;
            if (
              !cellStyles.fillColor ||
              (Array.isArray(cellStyles.fillColor) &&
                cellStyles.fillColor[0] === 255)
            ) {
              cellStyles.fillColor = [249, 250, 251];
            }
          }
        },
      });

      // Get final Y position after table
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      startY = (pdf as any).lastAutoTable.finalY + 14;
    });

    pdf.save(
      `weekplanner_week${nextWeek.weekNumber}_${nextWeek.dates["Maandag"].replace(" ", "-")}_${nextWeek.dates["Vrijdag"].replace(" ", "-")}_${nextWeek.year}.pdf`,
    );
  };

  const totalsByDayShift = useMemo(() => {
    return DAYS.reduce(
      (acc, day) => {
        acc[day] = SHIFTS.reduce(
          (accShift, shift) => {
            const total = LINES.reduce((sum, line) => {
              const cell = data[day][shift][line];
              return sum + cell.bak + cell.op + cell.asst;
            }, 0);
            accShift[shift] = total;
            return accShift;
          },
          {} as Record<Shift, number>,
        );
        return acc;
      },
      {} as Record<Day, Record<Shift, number>>,
    );
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={autoFillWeek}
          className="rounded-lg bg-brand-navy px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-brand-navy/90">
          {getText(t.planner.autoFill)}
        </button>
        <button
          type="button"
          onClick={resetWeek}
          className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-neutral-700 hover:border-neutral-300">
          {getText(t.planner.resetWeek)}
        </button>
        <button
          type="button"
          onClick={exportToPdf}
          className="rounded-lg border border-brand-gold/40 bg-brand-gold/10 px-4 py-2 text-xs sm:text-sm font-semibold text-brand-navy hover:bg-brand-gold/20">
          {getText(t.planner.exportPdf)}
        </button>
        <span className="mx-1 hidden sm:inline text-neutral-300">|</span>
        <button
          type="button"
          onClick={expandAll}
          className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-500 hover:border-neutral-300 hover:text-neutral-700">
          ▼ {getText(t.planner.expandAll)}
        </button>
        <button
          type="button"
          onClick={collapseAll}
          className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-500 hover:border-neutral-300 hover:text-neutral-700">
          ▲ {getText(t.planner.collapseAll)}
        </button>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-brand-gold/30 bg-brand-gold/10 px-4 py-2.5">
        <span className="rounded-lg bg-brand-navy px-3 py-1 text-sm font-bold text-white">
          {getText(t.planner.nextWeek)} {nextWeek.weekNumber}
        </span>
        <span className="text-sm font-medium text-brand-navy">
          {nextWeek.dates["Maandag"]} – {nextWeek.dates["Vrijdag"]}{" "}
          {nextWeek.year}
        </span>
      </div>

      <div
        ref={plannerRef}
        className="space-y-6">
        {DAYS.map((day) => (
          <div
            key={day}
            ref={(el) => {
              dayRefs.current[day] = el;
            }}
            data-export-day
            className="overflow-hidden rounded-2xl border border-brand-gold/20 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => toggleDay(day)}
              data-export-day-header
              className="flex w-full items-center justify-between border-b border-brand-gold/20 bg-brand-gold/10 px-4 py-3 text-left transition-colors hover:bg-brand-gold/15">
              <h3 className="text-sm sm:text-base font-bold text-brand-navy">
                {getDayName(day)}{" "}
                <span className="text-xs sm:text-sm font-normal text-brand-navy/60">
                  {nextWeek.dates[day]}
                </span>
              </h3>
              <div className="flex items-center gap-2">
                {!expandedDays[day] && (
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-500">
                    {SHIFTS.map((shift) => (
                      <span
                        key={shift}
                        className="rounded-md bg-white/80 px-2 py-0.5 font-medium">
                        {getShiftName(shift).charAt(0)}:{" "}
                        {totalsByDayShift[day][shift]}
                      </span>
                    ))}
                    <span className="rounded-md bg-brand-navy/10 px-2 py-0.5 font-bold text-brand-navy">
                      Σ{" "}
                      {SHIFTS.reduce(
                        (s, sh) => s + totalsByDayShift[day][sh],
                        0,
                      )}
                    </span>
                  </div>
                )}
                <svg
                  className={`h-4 w-4 text-brand-navy/60 transition-transform duration-200 ${expandedDays[day] ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </button>

            <AnimatePresence initial={false}>
              {expandedDays[day] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden">
                  <div className="grid gap-3 sm:gap-4 p-4 md:grid-cols-3">
                    {SHIFTS.map((shift) => {
                      const shiftSettings = settings[day][shift];
                      return (
                        <div
                          key={shift}
                          data-export-shift
                          className="rounded-xl border border-neutral-200 bg-neutral-50/40 p-3">
                          <div className="flex items-center justify-between">
                            <p
                              data-export-shift-title
                              className="text-xs font-bold text-neutral-700">
                              {getShiftName(shift)}
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  applyAutoFillForShift(
                                    day,
                                    shift,
                                    shiftSettings,
                                  )
                                }
                                className="text-[10px] font-semibold text-brand-navy hover:text-brand-gold">
                                {getText(t.planner.autoFillShift)}
                              </button>
                              <button
                                type="button"
                                onClick={() => resetShift(day, shift)}
                                className="text-[10px] font-semibold text-neutral-400 hover:text-red-500">
                                {getText(t.planner.resetShift)}
                              </button>
                            </div>
                          </div>

                          <div className="mt-2">
                            <p className="text-[10px] uppercase tracking-wide text-neutral-400">
                              {getText(t.calculator.activeLines)}
                            </p>
                            <div className="mt-1 grid grid-cols-5 gap-1 text-[10px]">
                              {LINES.map((line) => (
                                <label
                                  key={line}
                                  className="flex items-center gap-1 rounded-md bg-white px-1.5 py-1 border border-neutral-200">
                                  <input
                                    type="checkbox"
                                    checked={shiftSettings.activeLines[line]}
                                    onChange={(e) =>
                                      updateShiftSettings(day, shift, (s) => ({
                                        ...s,
                                        activeLines: {
                                          ...s.activeLines,
                                          [line]: e.target.checked,
                                        },
                                      }))
                                    }
                                    className="h-3 w-3 accent-brand-gold"
                                  />
                                  <span className="text-neutral-600">
                                    {line}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="mt-3">
                            <p className="text-[10px] uppercase tracking-wide text-neutral-400">
                              {getText(t.calculator.conditions)}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-2 text-[10px]">
                              <label className="flex items-center gap-1 rounded-md bg-white px-2 py-1 border border-neutral-200">
                                <input
                                  type="checkbox"
                                  checked={shiftSettings.a8stuks}
                                  onChange={(e) =>
                                    updateShiftSettings(day, shift, (s) => ({
                                      ...s,
                                      a8stuks: e.target.checked,
                                    }))
                                  }
                                  className="h-3 w-3 accent-brand-gold"
                                />
                                <span className="text-neutral-600">
                                  {getText(t.planner.a8stuksShort)}
                                </span>
                              </label>
                              <label className="flex items-center gap-1 rounded-md bg-white px-2 py-1 border border-neutral-200">
                                <input
                                  type="checkbox"
                                  checked={shiftSettings.bType === "mini"}
                                  onChange={(e) =>
                                    updateShiftSettings(day, shift, (s) => ({
                                      ...s,
                                      bType: e.target.checked
                                        ? "mini"
                                        : "normaal",
                                    }))
                                  }
                                  className="h-3 w-3 accent-brand-gold"
                                />
                                <span className="text-neutral-600">
                                  {getText(t.planner.bMiniShort)}
                                </span>
                              </label>
                              <label className="flex items-center gap-1 rounded-md bg-white px-2 py-1 border border-neutral-200">
                                <input
                                  type="checkbox"
                                  checked={shiftSettings.eTray}
                                  onChange={(e) =>
                                    updateShiftSettings(day, shift, (s) => ({
                                      ...s,
                                      eTray: e.target.checked,
                                    }))
                                  }
                                  className="h-3 w-3 accent-brand-gold"
                                />
                                <span className="text-neutral-600">
                                  {getText(t.planner.eTrayShort)}
                                </span>
                              </label>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between text-[10px]">
                            <span className="text-neutral-400">
                              {getText(t.planner.shiftTotalRow)}
                            </span>
                            <span className="font-semibold text-brand-navy">
                              {totalsByDayShift[day][shift]}
                            </span>
                          </div>

                          {/* Shift remark based on active line count */}
                          {(() => {
                            const remark = getShiftRemark(shiftSettings);
                            if (!remark) return null;
                            return (
                              <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5">
                                <p className="text-[10px] text-amber-800 leading-relaxed">
                                  {remark}
                                </p>
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })}
                  </div>

                  <div className="px-4 pb-4">
                    <div className="overflow-x-auto">
                      <table
                        data-export-table
                        className="min-w-full border-separate border-spacing-0 text-[10px] sm:text-xs">
                        <thead>
                          <tr>
                            <th className="sticky left-0 z-10 bg-white border border-neutral-200 px-2 py-1 text-left">
                              {getText(t.planner.line)}
                            </th>
                            {SHIFTS.map((shift) => (
                              <th
                                key={shift}
                                colSpan={3}
                                className="border border-neutral-200 bg-brand-gold/10 px-2 py-1 text-center font-semibold text-brand-navy">
                                {getShiftName(shift)}
                              </th>
                            ))}
                          </tr>
                          <tr>
                            <th className="sticky left-0 z-10 bg-white border border-neutral-200 px-2 py-1 text-left"></th>
                            {SHIFTS.flatMap((shift) =>
                              ROLES.map((role) => (
                                <th
                                  key={`${shift}-${role.key}`}
                                  className="border border-neutral-200 bg-white px-2 py-1 text-center font-medium text-neutral-600">
                                  {role.label}
                                </th>
                              )),
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {LINES.map((line) => (
                            <tr key={line}>
                              <td className="sticky left-0 z-10 bg-white border border-neutral-200 px-2 py-1 font-semibold text-neutral-700">
                                {getText(t.planner.line)} {line}
                              </td>
                              {SHIFTS.flatMap((shift) =>
                                ROLES.map((role) => {
                                  const isActive =
                                    settings[day][shift].activeLines[line];
                                  const value =
                                    data[day][shift][line][role.key];
                                  return (
                                    <td
                                      key={`${shift}-${line}-${role.key}`}
                                      className="border border-neutral-200 px-1 py-1 text-center">
                                      <input
                                        type="number"
                                        min={0}
                                        value={value}
                                        onChange={(e) =>
                                          updateCell(
                                            day,
                                            shift,
                                            line,
                                            role.key,
                                            Number(e.target.value),
                                          )
                                        }
                                        disabled={!isActive}
                                        className="w-12 rounded-md border border-neutral-200 bg-white px-1 py-0.5 text-center text-[10px] sm:text-xs focus:border-brand-gold focus:outline-none disabled:bg-neutral-100"
                                      />
                                    </td>
                                  );
                                }),
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
