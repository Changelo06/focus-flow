import { useMemo } from 'react';
import { Clock, CheckCircle2, TrendingUp, Coffee } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { WeeklyStats } from '@/types';
import { cn } from '@/lib/utils';

interface StatsViewProps {
  weeklyStats: WeeklyStats;
  monthlyCompletionRate: number;
  tasksCompletedToday: number;
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

export function StatsView({ weeklyStats, monthlyCompletionRate, tasksCompletedToday }: StatsViewProps) {
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

  return (
    <div className="min-h-[calc(100vh-120px)] px-4 pb-24 pt-6 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Your Stats</h1>

      {/* Motivational Message */}
      {tasksCompletedToday > 0 && (
        <Card className="p-4 mb-6 bg-gradient-to-r from-success/10 to-success/5 border-success/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-success flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success-foreground" />
            </div>
            <div>
              <p className="font-semibold text-success">
                {tasksCompletedToday} task{tasksCompletedToday > 1 ? 's' : ''} completed today!
              </p>
              <p className="text-sm text-muted-foreground">{motivationalMessage}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-focus mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Focus Time</span>
          </div>
          <p className="text-2xl font-bold">{formatTime(weeklyStats.totalFocusTime)}</p>
          <p className="text-xs text-muted-foreground">This week</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-break mb-2">
            <Coffee className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Break Time</span>
          </div>
          <p className="text-2xl font-bold">{formatTime(weeklyStats.totalBreakTime)}</p>
          <p className="text-xs text-muted-foreground">This week</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-success mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Completed</span>
          </div>
          <p className="text-2xl font-bold">{weeklyStats.tasksCompleted}</p>
          <p className="text-xs text-muted-foreground">Tasks this week</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-warning mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Success Rate</span>
          </div>
          <p className="text-2xl font-bold">{monthlyCompletionRate}%</p>
          <p className="text-xs text-muted-foreground">This month</p>
        </Card>
      </div>

      {/* Weekly Chart */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Weekly Activity</h3>
        <div className="flex items-end justify-between gap-2 h-32">
          {weeklyStats.dailyStats.map((day, i) => {
            const height = (day.focusTime / maxFocusTime) * 100;
            const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
            const isToday = day.date === new Date().toISOString().split('T')[0];
            
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center justify-end h-24">
                  <div
                    className={cn(
                      "w-full max-w-8 rounded-t-md transition-all",
                      isToday ? "gradient-focus" : "bg-focus/60"
                    )}
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                </div>
                <span className={cn(
                  "text-xs",
                  isToday ? "font-bold text-foreground" : "text-muted-foreground"
                )}>
                  {dayName}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="w-3 h-3 rounded-full gradient-focus" />
          <span className="text-xs text-muted-foreground">Focus time (minutes)</span>
        </div>
      </Card>

      {/* Summary */}
      <div className="mt-6 text-center text-muted-foreground text-sm">
        <p>Keep up the great work! Your consistency is building strong habits.</p>
      </div>
    </div>
  );
}
