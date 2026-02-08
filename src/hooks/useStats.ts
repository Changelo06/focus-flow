import { useMemo } from 'react';
import { Task, WeeklyStats, DailyStats } from '@/types';

export function useStats(tasks: Task[]) {
  const weeklyStats = useMemo((): WeeklyStats => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const dailyMap = new Map<string, DailyStats>();
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
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
      // Count completed tasks this week
      if (task.completed && task.createdAt >= oneWeekAgo) {
        tasksCompleted++;
        const dateKey = task.createdAt.toISOString().split('T')[0];
        const daily = dailyMap.get(dateKey);
        if (daily) {
          daily.tasksCompleted++;
        }
      }

      // Sum focus time
      totalFocusTime += task.focusTime / 60;
      totalBreakTime += task.breakTime / 60;

      // Add to daily focus time (simplified - using creation date)
      const dateKey = task.createdAt.toISOString().split('T')[0];
      const daily = dailyMap.get(dateKey);
      if (daily) {
        daily.focusTime += task.focusTime / 60;
      }
    });

    return {
      totalFocusTime: Math.round(totalFocusTime),
      totalBreakTime: Math.round(totalBreakTime),
      tasksCompleted,
      dailyStats: Array.from(dailyMap.values()),
    };
  }, [tasks]);

  const monthlyCompletionRate = useMemo(() => {
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const monthlyTasks = tasks.filter(t => t.createdAt >= oneMonthAgo);
    if (monthlyTasks.length === 0) return 0;
    
    const completed = monthlyTasks.filter(t => t.completed).length;
    return Math.round((completed / monthlyTasks.length) * 100);
  }, [tasks]);

  return {
    weeklyStats,
    monthlyCompletionRate,
  };
}
