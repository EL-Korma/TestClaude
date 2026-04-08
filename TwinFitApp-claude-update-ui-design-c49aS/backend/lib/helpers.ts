export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const tryParseJson = (val: any, fallback: any) => {
  try { return JSON.parse(val); } catch { return fallback; }
};

export const getTodayRange = () => {
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const end   = new Date(); end.setHours(23, 59, 59, 999);
  return { start, end };
};

export const resolveStreakLevel = (current: number) => {
  if (current >= 28) return 4;
  if (current >= 14) return 3;
  if (current >= 7)  return 2;
  return 1;
};

export const getPeriodKey = (frequency: string): string => {
  const now = new Date();
  if (frequency === "DAILY") return now.toISOString().slice(0, 10);
  if (frequency === "WEEKLY") {
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const week = Math.ceil(
      ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
    );
    return `${now.getFullYear()}-W${String(week).padStart(2, "0")}`;
  }
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};
