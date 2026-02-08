import { useState, useMemo } from 'react';
import { Search, Trash2, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TaskFocusBar } from './TaskFocusBar';
import { Task } from '@/types';
import { toast } from 'sonner';

interface CompletedTasksListProps {
  tasks: Task[];
  onDeleteArchivedTask: (id: string) => void;
}

// Secret admin code to trigger CSV export
const ADMIN_EXPORT_CODE = '::export-data::';

export function CompletedTasksList({ tasks, onDeleteArchivedTask }: CompletedTasksListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const completedTasks = useMemo(() => {
    return tasks
      .filter(t => t.completed)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (!searchQuery || searchQuery === ADMIN_EXPORT_CODE) return completedTasks;
    const query = searchQuery.toLowerCase();
    return completedTasks.filter(
      task =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
    );
  }, [completedTasks, searchQuery]);

  const handleExportCSV = () => {
    const headers = [
      'Task ID',
      'Title',
      'Description',
      'Deadline',
      'Created At',
      'Completed',
      'Focus Time (seconds)',
      'Break Time (seconds)',
      'Total Time (seconds)',
      'Focus Percentage',
    ];

    const rows = tasks.map(task => {
      const totalTime = task.focusTime + task.breakTime;
      const focusPercentage = totalTime > 0 ? ((task.focusTime / totalTime) * 100).toFixed(2) : '0';
      return [
        task.id,
        `"${task.title.replace(/"/g, '""')}"`,
        `"${task.description.replace(/"/g, '""')}"`,
        task.deadline.toISOString(),
        task.createdAt.toISOString(),
        task.completed ? 'Yes' : 'No',
        task.focusTime,
        task.breakTime,
        totalTime,
        focusPercentage,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `lockin-study-data-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully!', {
      description: `Exported ${tasks.length} tasks to CSV`,
    });
    setSearchQuery('');
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    // Check for admin export code
    if (value === ADMIN_EXPORT_CODE) {
      handleExportCSV();
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-success" />
          Completed Tasks
        </h3>
        <span className="text-xs text-muted-foreground">
          {filteredTasks.length} of {completedTasks.length}
        </span>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search completed tasks..."
          value={searchQuery}
          onChange={e => handleSearchChange(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      {/* Tasks List */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {filteredTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {completedTasks.length === 0 ? 'No completed tasks yet' : 'No matching tasks found'}
          </p>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              className="p-3 bg-secondary/30 rounded-lg space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{task.title}</h4>
                  {task.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {task.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(task.createdAt)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDeleteArchivedTask(task.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <TaskFocusBar task={task} />
            </div>
          ))
        )}
      </div>
    </Card>
  );
}