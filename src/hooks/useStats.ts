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

export function useStats(tasks: Task[], period: TimePeriod = 'weekly') {
  const periodStats = useMemo((): WeeklyStats => {
    const now = new Date();
    const config = PERIOD_CONFIG[period];
    const startDate = new Date(now.getTime() - config.days * 24 * 60 * 60 * 1000);
    
    const dailyMap = new Map<string, DailyStats>();
    
    // Initialize days for the period
    for (let i = config.days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];
      dailyMap.set(dateKey, {
        date: dateKey,
        focusTime: 0,
        tasksCompleted: 0,
      });
    }

    let totalFocusTime = 0;
    let totalBreakTime = 0;
    let tasksCompleted = 0;

    tasks.forEach(task => {
      const taskDate = task.createdAt;
      const dateKey = taskDate.toISOString().split('T')[0];
      
      // Only count tasks within the period
      if (taskDate >= startDate) {
        if (task.completed) {
          tasksCompleted++;
          const daily = dailyMap.get(dateKey);
          if (daily) {
            daily.tasksCompleted++;
          }
        }

        // Sum focus time for the period
        totalFocusTime += task.focusTime / 60;
        totalBreakTime += task.breakTime / 60;

        // Add to daily focus time
        const daily = dailyMap.get(dateKey);
        if (daily) {
          daily.focusTime += task.focusTime / 60;
        }
      }
    });

    return {
      totalFocusTime: Math.round(totalFocusTime),
      totalBreakTime: Math.round(totalBreakTime),
      tasksCompleted,
      dailyStats: Array.from(dailyMap.values()),
    };
  }, [tasks, period]);

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
