import { format, formatDistanceToNow, isPast, isFuture, differenceInDays } from 'date-fns';
import { Clock, Calendar, Trash2, CheckCircle2, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Task } from '@/types';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onStartTimer: (id: string) => void;
  onClick: (task: Task) => void;
}

export function TaskCard({ task, onComplete, onDelete, onStartTimer, onClick }: TaskCardProps) {
  const isOverdue = isPast(task.deadline) && !task.completed;
  const isUrgent = isFuture(task.deadline) && differenceInDays(task.deadline, new Date()) <= 3;
  
  const formatFocusTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <Card 
      className={cn(
        "p-5 transition-all duration-200 hover:shadow-medium cursor-pointer",
        task.completed && "opacity-60",
        isOverdue && "border-destructive/50 bg-destructive/5",
        isUrgent && !isOverdue && "border-warning/50 bg-warning/5"
      )}
      onClick={() => onClick(task)}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onComplete(task.id);
          }}
          className={cn(
            "mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
            task.completed 
              ? "bg-success border-success text-success-foreground" 
              : "border-muted-foreground/40 hover:border-success"
          )}
        >
          {task.completed && <CheckCircle2 className="w-3 h-3" />}
        </button>

        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-semibold text-foreground",
            task.completed && "line-through text-muted-foreground"
          )}>
            {task.title}
          </h3>

          <div className="flex items-center flex-wrap gap-3 mt-3">
            <div className={cn(
              "flex items-center gap-1 text-xs",
              isOverdue ? "text-destructive" : isUrgent ? "text-warning" : "text-muted-foreground"
            )}>
              <Calendar className="w-3 h-3" />
              <span>{format(task.deadline, 'MMM d, h:mm a')}</span>
              {!task.completed && (
                <span className="ml-1">
                  ({isOverdue ? 'overdue' : formatDistanceToNow(task.deadline, { addSuffix: true })})
                </span>
              )}
            </div>

            {task.focusTime > 0 && (
              <div className="flex items-center gap-1 text-xs text-focus">
                <Clock className="w-3 h-3" />
                <span>{formatFocusTime(task.focusTime)} focused</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {!task.completed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onStartTimer(task.id);
              }}
              className="text-focus hover:text-focus hover:bg-focus/10"
            >
              <Timer className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
