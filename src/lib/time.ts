export function formatClock(base: string, minutesFromBase: number) {
  const [hStr, mStr] = base.split(":");
  const baseMinutes = Number(hStr) * 60 + Number(mStr);
  const total = baseMinutes + minutesFromBase;
  const hh = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const mm = (total % 60).toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
