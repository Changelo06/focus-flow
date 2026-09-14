import { useEffect, useState } from 'react';
import { TaskCard } from './TaskCard';
import { TaskDetailDialog } from './TaskDetailDialog';
import { AddTaskDialog } from './AddTaskDialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Task } from '@/types';
import { groupFor, sortTasks, taskGroups, TaskGroup } from '@/lib/taskGroups';
interface TasksViewProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed' | 'focusTime' | 'breakTime'>) => void;
  onCompleteTask: (id: string) => void; onDeleteTask: (id: string) => void;
  onClearAllTasks: () => void; onStartTimer: (id: string) => void;
}
export function TasksView({ tasks, onAddTask, onCompleteTask, onDeleteTask, onStartTimer }: TasksViewProps) {
  const [group, setGroup] = useState<TaskGroup>('Today');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(20);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const refresh = () => setNow(new Date());
    const timer = setInterval(refresh, 30000);
    document.addEventListener('visibilitychange', refresh);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', refresh); };
  }, []);
  const matching = tasks.filter(t => `${t.title} ${t.description}`.toLowerCase().includes(query.trim().toLowerCase()));
  const visible = sortTasks(matching.filter(t => groupFor(t, now) === group), group);
  return <div className="pt-10 pb-28 space-y-5">
    <div className="flex justify-between items-center"><h1 className="text-2xl font-bold">Tasks</h1><AddTaskDialog onAdd={onAddTask} /></div>
    <Input aria-label="Search tasks" placeholder="Search tasks" value={query} onChange={e => { setQuery(e.target.value); setLimit(20); }} />
    <div className="flex flex-wrap gap-2" aria-label="Task groups">
      {taskGroups.map(value => <Button key={value} size="sm" variant={group === value ? 'default' : 'outline'} aria-pressed={group === value}
        onClick={() => { setGroup(value); setLimit(20); }}>{value} ({matching.filter(t => groupFor(t, now) === value).length})</Button>)}
    </div>
    <p className="text-sm text-muted-foreground">{group === 'Completed' ? 'Newest completions first. Older tasks without completion dates appear last.' : 'Choose one task to focus on. Tasks with due dates are ordered nearest first.'}</p>
    {visible.length === 0 && <p className="py-10 text-center text-muted-foreground">{query ? 'No matching tasks in this group.' : `No ${group.toLowerCase()} tasks.`}</p>}
    {visible.slice(0, limit).map(task => <TaskCard key={task.id} task={task} onComplete={onCompleteTask} onDelete={onDeleteTask} onStartTimer={onStartTimer} onClick={t => setSelectedId(t.id)} />)}
    {visible.length > limit && <Button variant="outline" onClick={() => setLimit(limit + 20)}>Show more ({visible.length - limit} remaining)</Button>}
    <TaskDetailDialog task={tasks.find(t => t.id === selectedId) ?? null} open={!!selectedId} onClose={() => setSelectedId(null)} onComplete={onCompleteTask} onStartTimer={onStartTimer} />
  </div>;
}
