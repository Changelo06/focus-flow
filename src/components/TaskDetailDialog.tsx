import { format, formatDistanceToNow, isPast, isFuture, differenceInDays } from 'date-fns';
import { Clock, Calendar, Timer, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Task } from '@/types';
import { cn } from '@/lib/utils';

interface TaskDetailDialogProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onComplete: (id: string) => void;
  onStartTimer: (id: string) => void;
}

export function TaskDetailDialog({ 
  task, 
  open, 
  onClose, 
  onComplete, 
  onStartTimer 
}: TaskDetailDialogProps) {
  if (!task) return null;

  const isOverdue = isPast(task.deadline) && !task.completed;
  const isUrgent = isFuture(task.deadline) && differenceInDays(task.deadline, new Date()) <= 3;
  
  const formatFocusTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const formatBreakTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 pr-6">
            <button
              onClick={() => {
                onComplete(task.id);
                onClose();
              }}
              className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
                task.completed 
                  ? "bg-success border-success text-success-foreground" 
                  : "border-muted-foreground/40 hover:border-success"
              )}
            >
              {task.completed && <CheckCircle2 className="w-4 h-4" />}
            </button>
            <span className={cn(
              "flex-1 break-all overflow-hidden",
              task.completed && "line-through text-muted-foreground"
            )}>
              {task.title}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Description */}
          {task.description && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
              <p className="text-sm text-foreground break-all overflow-hidden">{task.description}</p>
            </div>
          )}

          {/* Deadline */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Deadline</h4>
            <div className={cn(
              "flex items-center gap-2 text-sm",
              isOverdue ? "text-destructive" : isUrgent ? "text-warning" : "text-foreground"
            )}>
              <Calendar className="w-4 h-4" />
              <span className="font-medium">{format(task.deadline, 'MMMM d, yyyy h:mm a')}</span>
            </div>
            {!task.completed && (
              <p className={cn(
                "text-xs mt-1.5",
                isOverdue ? "text-destructive" : "text-muted-foreground"
              )}>
                {isOverdue ? 'Overdue' : formatDistanceToNow(task.deadline, { addSuffix: true })}
              </p>
            )}
          </div>

          {/* Time Stats */}
          {(task.focusTime > 0 || task.breakTime > 0) && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Time Tracked</h4>
              <div className="space-y-2">
                {task.focusTime > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-focus" />
                    <span className="text-foreground">
                      <span className="font-semibold">{formatFocusTime(task.focusTime)}</span>
                      <span className="text-muted-foreground ml-1">focused</span>
                    </span>
                  </div>
                )}
                {task.breakTime > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-break" />
                    <span className="text-foreground">
                      <span className="font-semibold">{formatBreakTime(task.breakTime)}</span>
                      <span className="text-muted-foreground ml-1">break time</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Created Date */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Created</h4>
            <p className="text-sm text-foreground">
              {format(task.createdAt, 'MMMM d, yyyy h:mm a')}
            </p>
          </div>

          {/* Actions */}
          {!task.completed && (
            <div className="pt-2">
              <Button
                onClick={() => {
                  onStartTimer(task.id);
                  onClose();
                }}
                className="w-full gradient-focus text-focus-foreground"
              >
                <Timer className="w-4 h-4 mr-2" />
                Start Focus Timer
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
