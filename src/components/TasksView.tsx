import { useMemo, useState } from 'react';
import { AlertCircle, Clock, Trash2 } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { TaskDetailDialog } from './TaskDetailDialog';
import { AddTaskDialog } from './AddTaskDialog';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Task } from '@/types';

interface TasksViewProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed' | 'focusTime' | 'breakTime'>) => void;
  onCompleteTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onClearAllTasks: () => void;
  onStartTimer: (taskId: string) => void;
}

export function TasksView({
  tasks,
  onAddTask,
  onCompleteTask,
  onDeleteTask,
  onClearAllTasks,
  onStartTimer,
}: TasksViewProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const { overdue, upcoming, completed } = useMemo(() => {
    const now = new Date();
    const sorted = [...tasks].sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
    
    return {
      overdue: sorted.filter(t => !t.completed && t.deadline < now),
      upcoming: sorted.filter(t => !t.completed && t.deadline >= now),
      completed: sorted.filter(t => t.completed).reverse(),
    };
  }, [tasks]);

  const hasAnyTasks = tasks.length > 0;

  return (
    <div className="min-h-[calc(100vh-120px)] pb-24 animate-fade-in" style={{ paddingTop: 'max(40px, env(safe-area-inset-top))', paddingLeft: '6px', paddingRight: '6px', paddingBottom: 'max(96px, env(safe-area-inset-bottom))' }}>
      <div className="flex items-center justify-between mb-section">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <div className="flex items-center gap-element-gap">
          {hasAnyTasks && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all tasks?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all tasks from your task list. Completed tasks will still be visible in your Stats.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onClearAllTasks}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Clear All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <AddTaskDialog onAdd={onAddTask} />
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-section-lg text-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-card-gap shadow-soft">
            <Clock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No tasks yet</h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            Add your first task to start tracking your productivity
          </p>
        </div>
      ) : (
        <div className="space-y-section">
          {/* Overdue Tasks */}
          {overdue.length > 0 && (
            <section>
              <div className="flex items-center gap-element-gap mb-card-gap">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <h2 className="text-sm font-semibold text-destructive uppercase tracking-wider">
                  Overdue ({overdue.length})
                </h2>
              </div>
              <div className="space-y-card-gap">
                {overdue.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={onCompleteTask}
                    onDelete={onDeleteTask}
                    onStartTimer={onStartTimer}
                    onClick={(task) => {
                      setSelectedTask(task);
                      setDetailDialogOpen(true);
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Upcoming Tasks */}
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-card-gap">
                Upcoming ({upcoming.length})
              </h2>
              <div className="space-y-card-gap">
                {upcoming.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={onCompleteTask}
                    onDelete={onDeleteTask}
                    onStartTimer={onStartTimer}
                    onClick={(task) => {
                      setSelectedTask(task);
                      setDetailDialogOpen(true);
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Completed Tasks */}
          {completed.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-card-gap">
                Completed ({completed.length})
              </h2>
              <div className="space-y-card-gap">
                {completed.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={onCompleteTask}
                    onDelete={onDeleteTask}
                    onStartTimer={onStartTimer}
                    onClick={(task) => {
                      setSelectedTask(task);
                      setDetailDialogOpen(true);
                    }}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Task Detail Dialog */}
      <TaskDetailDialog
        task={selectedTask}
        open={detailDialogOpen}
        onClose={() => {
          setDetailDialogOpen(false);
          setSelectedTask(null);
        }}
        onComplete={onCompleteTask}
        onStartTimer={onStartTimer}
      />
    </div>
  );
}