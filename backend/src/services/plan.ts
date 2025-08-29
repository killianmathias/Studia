export type SessionPlan = { date: Date; duration: number; objectif: string };

export function planSessionsDates({
  examDate,
  totalMinutes,
  difficulty,
  sessionMaxMinutes = 90,
}: {
  examDate: string | Date;
  totalMinutes: number;
  difficulty: "facile" | "moyen" | "difficile";
  sessionMaxMinutes?: number;
}): SessionPlan[] {
  const exam = new Date(examDate);
  const today = new Date();
  const block = sessionMaxMinutes;
  const baseCount = Math.max(1, Math.ceil(totalMinutes / block));
  const bonus = difficulty === "difficile" ? 2 : difficulty === "moyen" ? 1 : 0;
  const numSessions = baseCount + bonus;

  const baseIntervals = [1, 3, 6, 10, 15, 21, 28, 35];
  const intervals = Array.from(
    { length: numSessions },
    (_, i) => baseIntervals[i] ?? (i + 1) * 7
  );

  const sessions: SessionPlan[] = intervals.map((days, idx) => {
    const d = new Date(today);
    d.setDate(today.getDate() + days);
    return {
      date: d >= exam ? new Date(exam.getTime() - 24 * 60 * 60 * 1000) : d,
      duration: Math.min(
        Math.ceil(totalMinutes / numSessions),
        sessionMaxMinutes
      ),
      objectif: `Révision ${idx + 1}`,
    };
  });

  return sessions;
}
