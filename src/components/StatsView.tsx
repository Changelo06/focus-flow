import { useState, useMemo } from 'react';
import { Clock, CheckCircle2, TrendingUp, Coffee } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CompletedTasksList } from './CompletedTasksList';
import { ThemeToggle } from './ThemeToggle';
import { Task, WeeklyStats } from '@/types';
import { TimePeriod } from '@/hooks/useStats';
import { cn } from '@/lib/utils';

interface StatsViewProps {
  weeklyStats: WeeklyStats;
  monthlyCompletionRate: number;
  tasksCompletedToday: number;
  archivedTasks: Task[];
  period: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  onDeleteArchivedTask: (id: string) => void;
  periodLabel: string;
}

const motivationalMessages = [
  "You're crushing it! Keep the momentum going! 🔥",
  "Every focused minute counts. Great work! ⭐",
  "Consistency is key, and you're nailing it! 💪",
  "Your dedication is inspiring! 🌟",
  "Small steps lead to big achievements! 🚀",
  "You're building great habits! Keep it up! 💎",
  "Focus today, success tomorrow! 🎯",
  "Progress, not perfection. You're doing amazing! ✨",
];

export function StatsView({ 
  weeklyStats, 
  monthlyCompletionRate, 
  tasksCompletedToday,
  archivedTasks,
  period,
  onPeriodChange,
  onDeleteArchivedTask,
  periodLabel,
}: StatsViewProps) {
  const motivationalMessage = useMemo(() => {
    return motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
  }, []);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const maxFocusTime = Math.max(...weeklyStats.dailyStats.map(d => d.focusTime), 1);

  // For monthly/quarterly, aggregate into weeks for better visualization
  const chartData = useMemo(() => {
    if (period === 'daily' || period === 'weekly') {
      return weeklyStats.dailyStats;
    }

    // Aggregate by weeks for monthly/quarterly
    const weeklyData: { date: string; focusTime: number; label: string }[] = [];
    const chunkSize = 7;
    
    for (let i = 0; i < weeklyStats.dailyStats.length; i += chunkSize) {
      const chunk = weeklyStats.dailyStats.slice(i, i + chunkSize);
      const totalFocus = chunk.reduce((sum, d) => sum + d.focusTime, 0);
      const startDate = new Date(chunk[0].date);
      weeklyData.push({
        date: chunk[0].date,
        focusTime: totalFocus,
        label: `W${Math.floor(i / chunkSize) + 1}`,
      });
    }
    
    return weeklyData;
  }, [weeklyStats.dailyStats, period]);

  const chartMaxFocus = Math.max(...chartData.map(d => d.focusTime), 1);

  return (
    <div className="min-h-[calc(100vh-120px)] pb-24 animate-fade-in" style={{ paddingTop: 'max(40px, env(safe-area-inset-top))', paddingLeft: '6px', paddingRight: '6px', paddingBottom: 'max(96px, env(safe-area-inset-bottom))' }}>
      {/* Header with Design System spacing */}
      <div className="flex items-center justify-between mb-card-gap">
        <h1 className="text-2xl font-bold">Your Stats</h1>
        <ThemeToggle />
      </div>

      {/* Motivational Message */}
      {tasksCompletedToday > 0 && (
        <Card className="p-5 mb-card-gap bg-gradient-to-r from-success/10 to-success/5 border-success/20 shadow-soft">
          <div className="flex items-center gap-element-gap">
            <div className="w-10 h-10 rounded-full gradient-success flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-success-foreground" />
            </div>
            <div>
              <p className="font-semibold text-success">
                {tasksCompletedToday} task{tasksCompletedToday > 1 ? 's' : ''} completed today!
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">{motivationalMessage}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Primary Info: Stats Grid with Elevated Hierarchy */}
      <div className="grid grid-cols-2 gap-card-gap mb-section">
        {/* Focus Time - Primary Stat */}
        <Card className="p-5 shadow-elevated hover:shadow-primary-elevated transition-shadow duration-200">
          <div className="flex items-center gap-element-gap text-focus mb-3">
            <Clock className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Focus Time</span>
          </div>
          <p className="text-3xl font-bold mb-1">{formatTime(weeklyStats.totalFocusTime)}</p>
          <p className="text-xs text-muted-foreground font-medium">{periodLabel}</p>
        </Card>

        {/* Break Time - Primary Stat */}
        <Card className="p-5 shadow-elevated hover:shadow-primary-elevated transition-shadow duration-200">
          <div className="flex items-center gap-element-gap text-break mb-3">
            <Coffee className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Break Time</span>
          </div>
          <p className="text-3xl font-bold mb-1">{formatTime(weeklyStats.totalBreakTime)}</p>
          <p className="text-xs text-muted-foreground font-medium">{periodLabel}</p>
        </Card>

        {/* Tasks Completed - Primary Stat */}
        <Card className="p-5 shadow-elevated hover:shadow-primary-elevated transition-shadow duration-200">
          <div className="flex items-center gap-element-gap text-success mb-3">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
          </div>
          <p className="text-3xl font-bold mb-1">{weeklyStats.tasksCompleted}</p>
          <p className="text-xs text-muted-foreground font-medium">Tasks {periodLabel.toLowerCase()}</p>
        </Card>

        {/* Success Rate - Primary Stat */}
        <Card className="p-5 shadow-elevated hover:shadow-primary-elevated transition-shadow duration-200">
          <div className="flex items-center gap-element-gap text-warning mb-3">
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Success Rate</span>
          </div>
          <p className="text-3xl font-bold mb-1">{monthlyCompletionRate}%</p>
          <p className="text-xs text-muted-foreground font-medium">This month</p>
        </Card>
      </div>

      {/* Secondary Info: Activity Chart */}
      <Card className="p-6 mb-card-gap shadow-medium">
        <div className="flex items-center justify-between mb-card-gap">
          <h3 className="font-semibold text-lg">Activity Overview</h3>
        </div>
        
        {/* Period Toggle */}
        <ToggleGroup 
          type="single" 
          value={period} 
          onValueChange={(value) => value && onPeriodChange(value as TimePeriod)}
          className="justify-start mb-card-gap"
        >
          <ToggleGroupItem value="daily" className="text-xs px-3 h-8 font-medium">
            Daily
          </ToggleGroupItem>
          <ToggleGroupItem value="weekly" className="text-xs px-3 h-8 font-medium">
            Weekly
          </ToggleGroupItem>
          <ToggleGroupItem value="monthly" className="text-xs px-3 h-8 font-medium">
            Monthly
          </ToggleGroupItem>
          <ToggleGroupItem value="quarterly" className="text-xs px-3 h-8 font-medium">
            Quarterly
          </ToggleGroupItem>
        </ToggleGroup>

        <div className={cn(
          "overflow-x-auto -mx-6 px-6",
          (period === 'monthly' || period === 'quarterly') && "pb-2"
        )}>
          <div className={cn(
            "flex items-end gap-element-gap h-32",
            period === 'daily' || period === 'weekly' ? "justify-between" : "justify-start"
          )}
          style={{
            minWidth: period === 'monthly' || period === 'quarterly' 
              ? `${chartData.length * 40}px` 
              : 'auto'
          }}>
            {chartData.map((day, i) => {
              const height = (day.focusTime / chartMaxFocus) * 100;
              const dayName = period === 'daily' || period === 'weekly'
                ? new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })
                : (day as any).label || `W${i + 1}`;
              const isToday = day.date === new Date().toISOString().split('T')[0];
              
              return (
                <div 
                  key={day.date} 
                  className={cn(
                    "flex flex-col items-center gap-element-gap",
                    period === 'daily' || period === 'weekly' ? "flex-1" : "min-w-[32px]"
                  )}
                >
                  <div className="w-full flex flex-col items-center justify-end h-24">
                    <div
                      className={cn(
                        "w-full max-w-8 rounded-t-md transition-all hover:opacity-90",
                        isToday ? "gradient-focus shadow-sm" : "bg-focus/70"
                      )}
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                  </div>
                  <span className={cn(
                    "text-xs whitespace-nowrap",
                    isToday ? "font-bold text-foreground" : "text-muted-foreground font-medium"
                  )}>
                    {dayName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex items-center justify-center gap-element-gap mt-card-gap">
          <div className="w-3 h-3 rounded-full gradient-focus shadow-sm" />
          <span className="text-xs text-muted-foreground font-medium">Focus time (minutes)</span>
        </div>
      </Card>

      {/* Tertiary Info: Completed Tasks List */}
      <CompletedTasksList tasks={archivedTasks} onDeleteArchivedTask={onDeleteArchivedTask} />

      {/* Footer Summary with section break */}
      <div className="mt-section text-center text-muted-foreground text-sm">
        <p className="font-medium">Keep up the great work! Your consistency is building strong habits.</p>
      </div>
    </div>
  );
}
