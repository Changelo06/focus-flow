import { useState, useMemo } from 'react';
import { Search, Trash2, CheckCircle2, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TaskFocusBar } from './TaskFocusBar';
import { Task } from '@/types';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CompletedTasksListProps {
  tasks: Task[];
  onDeleteArchivedTask: (id: string) => void;
}

// Secret admin code to trigger CSV export
const ADMIN_EXPORT_CODE = '::export-data::';

export function CompletedTasksList({ tasks, onDeleteArchivedTask }: CompletedTasksListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showExportDialog, setShowExportDialog] = useState(false);

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

  const handleExportXLSX = async () => {
    try {
      // Prepare data for Excel
      const exportData = tasks.map(task => {
        const totalTime = task.focusTime + task.breakTime;
        const focusPercentage = totalTime > 0 ? ((task.focusTime / totalTime) * 100).toFixed(2) : '0';
        return {
          'Task ID': task.id,
          'Title': task.title,
          'Description': task.description,
          'Deadline': task.deadline?.toISOString() ?? '',
          'Created At': task.createdAt.toISOString(),
          'Completed': task.completed ? 'Yes' : 'No',
          'Focus Time (seconds)': task.focusTime,
          'Break Time (seconds)': task.breakTime,
          'Total Time (seconds)': totalTime,
          'Focus Percentage': focusPercentage + '%',
        };
      });

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Study Track Data');

      // Generate filename with date and time: Study_Track_DDMMYYYYHHMM.xlsx
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const filename = `Study_Track_${day}${month}${year}${hours}${minutes}.xlsx`;

      const isNative = Capacitor.isNativePlatform();

      if (isNative) {
        // For mobile: save using Capacitor Filesystem
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
        
        const result = await Filesystem.writeFile({
          path: filename,
          data: wbout,
          directory: Directory.Documents,
        });

        toast.success('Data exported successfully!', {
          description: `Exported ${tasks.length} tasks\n📁 Saved to: Documents/${filename}`,
          duration: 6000,
        });
      } else {
        // For web: use standard download
        XLSX.writeFile(wb, filename);
        
        toast.success('Data exported successfully!', {
          description: `Exported ${tasks.length} tasks\n📁 Saved to: Downloads/${filename}`,
          duration: 5000,
        });
      }
      
      setSearchQuery('');
      setShowExportDialog(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    // Check for admin export code
    if (value === ADMIN_EXPORT_CODE) {
      setShowExportDialog(true);
      setSearchQuery('');
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
    <>
    <Card className="p-5">
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

    {/* Export Confirmation Dialog */}
    <AlertDialog open={showExportDialog} onOpenChange={setShowExportDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Download User Report?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Export all {tasks.length} tasks to an Excel file. The file will be saved as Study_Track_[DateTime].xlsx
            <br />
            <span className="text-xs mt-2 inline-block">
              📁 Location: {Capacitor.isNativePlatform() ? 'Documents folder' : 'Downloads folder'}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleExportXLSX}>Download</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}