import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

type DayStats = { main: number; bonus: number; xp: number };

export function StatsPanel() {
  // Calculate date range for the past 7 days
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 6);

  const startDate = weekAgo.toISOString().split("T")[0];
  const endDate = today.toISOString().split("T")[0];

  const weeklyStats = useQuery(api.tasks.getWeeklyStats, { startDate, endDate }) as Record<string, DayStats> | undefined ?? {};

  // Generate array of last 7 days
  const days: { date: string; dayName: string; dayNum: number; stats: DayStats }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    const dayNum = date.getDate();

    days.push({
      date: dateStr,
      dayName,
      dayNum,
      stats: weeklyStats[dateStr] || { main: 0, bonus: 0, xp: 0 },
    });
  }

  const totalWeekXp = Object.values(weeklyStats).reduce((sum: number, day: DayStats) => sum + (day?.xp || 0), 0);
  const maxDayXp = Math.max(...days.map((d) => d.stats.xp), 1);

  return (
    <div className="panel p-4 md:p-6 mt-6 md:mt-8 animate-fade-in-up stagger-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl md:text-3xl">📊</span>
          <div>
            <h2 className="font-pixel text-sm md:text-base text-lavender-400">
              WEEKLY PROGRESS
            </h2>
            <p className="font-body text-xs text-lavender-500 mt-1">
              Last 7 days activity
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-pixel text-lg md:text-xl text-cyan-400 text-glow-cyan">
            {totalWeekXp}
          </p>
          <p className="font-body text-xs text-lavender-500">Total XP</p>
        </div>
      </div>

      {/* Activity chart */}
      <div className="flex items-end justify-between gap-2 h-32 md:h-40 mb-4">
        {days.map((day) => {
          const heightPercent = maxDayXp > 0 ? (day.stats.xp / maxDayXp) * 100 : 0;
          const isToday = day.date === endDate;

          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
              {/* Bar */}
              <div className="w-full flex-1 flex items-end">
                <div
                  className={`w-full rounded-t transition-all duration-500 ${
                    isToday
                      ? "bg-gradient-to-t from-cyan-500 to-cyan-400"
                      : day.stats.xp > 0
                      ? "bg-gradient-to-t from-lavender-600 to-lavender-500"
                      : "bg-[#1a1a24]"
                  }`}
                  style={{ height: `${Math.max(heightPercent, 8)}%` }}
                />
              </div>

              {/* XP label */}
              <span className={`font-body text-xs ${isToday ? "text-cyan-400" : "text-lavender-500"}`}>
                {day.stats.xp > 0 ? `+${day.stats.xp}` : "-"}
              </span>

              {/* Day label */}
              <div className="text-center">
                <span className={`font-body text-xs block ${isToday ? "text-white" : "text-lavender-600"}`}>
                  {day.dayName}
                </span>
                <span className={`font-pixel text-xs ${isToday ? "text-cyan-400" : "text-lavender-700"}`}>
                  {day.dayNum}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs font-body text-lavender-500 pt-4 border-t border-lavender-900/30">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-cyan-500"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-lavender-500"></div>
          <span>Previous days</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[#1a1a24]"></div>
          <span>No activity</span>
        </div>
      </div>
    </div>
  );
}
