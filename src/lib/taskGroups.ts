import { Task } from '@/types';
export const taskGroups = ['Today', 'Overdue', 'Upcoming', 'Anytime', 'Completed'] as const;
export type TaskGroup = typeof taskGroups[number];
export function groupFor(task: Task, now = new Date()): TaskGroup {
  if (task.completed) return 'Completed';
  if (!task.deadline || !Number.isFinite(task.deadline.getTime())) return 'Anytime';
  if (task.deadline < now) return 'Overdue';
  if (task.deadline.toDateString() === now.toDateString()) return 'Today';
  return 'Upcoming';
}
export function sortTasks(tasks: Task[], group: TaskGroup) {
  return [...tasks].sort((a, b) => {
    if (group === 'Completed') return (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0) || b.createdAt.getTime() - a.createdAt.getTime();
    return (a.deadline?.getTime() ?? Infinity) - (b.deadline?.getTime() ?? Infinity) || a.createdAt.getTime() - b.createdAt.getTime() || a.id.localeCompare(b.id);
  });
}
