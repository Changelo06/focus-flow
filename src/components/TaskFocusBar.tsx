import { Task } from '@/types';

interface TaskFocusBarProps {
  task: Task;
}

export function TaskFocusBar({ task }: TaskFocusBarProps) {
  const totalTime = task.focusTime + task.breakTime;
  const focusPercentage = totalTime > 0 ? (task.focusTime / totalTime) * 100 : 0;
  const breakPercentage = totalTime > 0 ? (task.breakTime / totalTime) * 100 : 0;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  if (totalTime === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="flex-1 h-1.5 bg-secondary rounded-full" />
        <span>No time tracked</span>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="relative h-1.5 bg-secondary rounded-full overflow-hidden">
        {/* Focus segment */}
        <div
          className="absolute top-0 h-full gradient-focus"
          style={{ left: '0%', width: `${focusPercentage}%` }}
        />
        {/* Break segment */}
        <div
          className="absolute top-0 h-full gradient-break"
          style={{ left: `${focusPercentage}%`, width: `${breakPercentage}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full gradient-focus" />
            {formatTime(task.focusTime)}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full gradient-break" />
            {formatTime(task.breakTime)}
          </span>
        </div>
        <span className="font-medium">{formatTime(totalTime)} total</span>
      </div>
    </div>
  );
}
