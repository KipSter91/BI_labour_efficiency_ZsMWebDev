export type AflosBreakBlock = {
  laneId: "D" | "E";
  label: string;
  startMinute: number; // minutes from baseTime
  durationMinutes: number;
  breakCount: number; // number of workers on break during this block
};

export type AflosSchedule = {
  baseTime: string; // HH:mm
  endMinute: number;
  lanes: Array<{ id: "D" | "E"; label: string; workers: number }>;
  aflosTeam: { count: number; note: string };
  blocks: AflosBreakBlock[];
};

// PRD-derived schedule (minutes relative to baseTime)
export const aflosSchedule: AflosSchedule = {
  baseTime: "08:00",
  endMinute: 300, // 13:00
  lanes: [
    { id: "E", label: "Lijn E", workers: 5 }, // 1 inpakoperator + 4 inpakassistent
    { id: "D", label: "Lijn D", workers: 3 }, // 1 inpakoperator + 2 inpakassistent
  ],
  aflosTeam: {
    count: 3,
    note: "3 FTE aanwezig (4 uur), incl. eigen pauze; flexibele buffer inzet.",
  },
  blocks: [
    // Round 1 – Lijn E (3 + 2 = 5 workers, 20 min each)
    {
      laneId: "E",
      label: "Round 1 ①",
      startMinute: 30,
      durationMinutes: 20,
      breakCount: 3,
    },
    {
      laneId: "E",
      label: "Round 1 ②",
      startMinute: 50,
      durationMinutes: 20,
      breakCount: 2,
    },

    // Round 2 – Lijn D (all 3, 20 min)
    {
      laneId: "D",
      label: "Round 2",
      startMinute: 70,
      durationMinutes: 20,
      breakCount: 3,
    },

    // Round 3 – Lijn E (3 + 2 = 5 workers, 25 min each)
    {
      laneId: "E",
      label: "Round 3 ①",
      startMinute: 190,
      durationMinutes: 25,
      breakCount: 3,
    },
    {
      laneId: "E",
      label: "Round 3 ②",
      startMinute: 215,
      durationMinutes: 25,
      breakCount: 2,
    },

    // Round 4 – Lijn D (all 3, 25 min)
    {
      laneId: "D",
      label: "Round 4",
      startMinute: 240,
      durationMinutes: 25,
      breakCount: 3,
    },
  ],
};
