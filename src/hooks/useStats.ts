import { SessionRecord } from '@/lib/timerState';
import { dayKey, timeInRange } from '@/lib/sessionStats';
import { useMemo } from 'react';
import { Task, WeeklyStats, DailyStats } from '@/types';

export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly';

interface PeriodConfig {
  days: number;
  label: string;
}

const PERIOD_CONFIG: Record<TimePeriod, PeriodConfig> = {
  daily: { days: 1, label: 'Today' },
  weekly: { days: 7, label: 'This Week' },
  monthly: { days: 30, label: 'This Month' },
  quarterly: { days: 90, label: 'This Quarter' },
};

export function useStats(tasks: Task[], period: TimePeriod = 'weekly', history: SessionRecord[] = []) {
  const periodStats = useMemo((): WeeklyStats => {
    const now = new Date();
    const config = PERIOD_CONFIG[period];
    const dailyMap = new Map<string, DailyStats>();
    let totalFocusTime = 0, totalBreakTime = 0, tasksCompleted = 0;
    for (let i = config.days - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);
      const tracked = timeInRange(history, start.getTime(), end.getTime());
      const completed = tasks.filter(t => t.completed && t.completedAt && t.completedAt >= start && t.completedAt < end).length;
      totalFocusTime += tracked.focus / 60;
      totalBreakTime += tracked.rest / 60;
      tasksCompleted += completed;
      dailyMap.set(dayKey(start), { date: dayKey(start), focusTime: tracked.focus / 60, tasksCompleted: completed });
    }

    return {
      totalFocusTime: Math.round(totalFocusTime),
      totalBreakTime: Math.round(totalBreakTime),
      tasksCompleted,
      dailyStats: Array.from(dailyMap.values()),
    };
  }, [tasks, period, history]);

  const monthlyCompletionRate = useMemo(() => {
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const monthlyTasks = tasks.filter(t => t.createdAt >= oneMonthAgo);
    if (monthlyTasks.length === 0) return 0;
    
    const completed = monthlyTasks.filter(t => t.completed).length;
    return Math.round((completed / monthlyTasks.length) * 100);
  }, [tasks]);

  return {
    weeklyStats: periodStats,
    monthlyCompletionRate,
    periodLabel: PERIOD_CONFIG[period].label,
  };
}
