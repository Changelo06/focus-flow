import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Task } from '@/types';
import { cn } from '@/lib/utils';

interface TaskSelectorProps {
  tasks: Task[];
  selectedTaskId: string | null;
  onSelect: (taskId: string | null) => void;
  disabled?: boolean;
}

export function TaskSelector({ tasks, selectedTaskId, onSelect, disabled }: TaskSelectorProps) {
  const selectedTask = tasks.find(t => t.id === selectedTaskId);
  const incompleteTasks = tasks.filter(t => !t.completed);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full max-w-sm justify-between"
          disabled={disabled || incompleteTasks.length === 0}
        >
          <span className={cn(
            "truncate",
            !selectedTask && "text-muted-foreground"
          )}>
            {selectedTask?.title || 'Select a task (optional)'}
          </span>
          <ChevronDown className="w-4 h-4 ml-2 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80">
        <DropdownMenuItem onClick={() => onSelect(null)}>
          <span className="text-muted-foreground">No task</span>
        </DropdownMenuItem>
        {incompleteTasks.map(task => (
          <DropdownMenuItem 
            key={task.id} 
            onClick={() => onSelect(task.id)}
            className="flex flex-col items-start py-3"
          >
            <span className="font-medium">{task.title}</span>
            {task.description && (
              <span className="text-xs text-muted-foreground truncate max-w-full">
                {task.description}
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
