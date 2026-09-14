import { useState, useCallback, useEffect } from 'react';
import { SessionRecord } from '@/lib/timerState';
import { Task } from '@/types';

const STORAGE_KEY = 'lockin-tasks';
const ARCHIVED_STORAGE_KEY = 'lockin-archived-tasks';

export function useTasks(history: SessionRecord[] = []) {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((t: Task) => ({
        ...t,
        deadline: t.deadline ? new Date(t.deadline) : null,
        completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
        createdAt: new Date(t.createdAt),
      }));
    }
    return [];
  });

  const [archivedTasks, setArchivedTasks] = useState<Task[]>(() => {
    const stored = localStorage.getItem(ARCHIVED_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((t: Task) => ({
        ...t,
        deadline: t.deadline ? new Date(t.deadline) : null,
        completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
        createdAt: new Date(t.createdAt),
      }));
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(ARCHIVED_STORAGE_KEY, JSON.stringify(archivedTasks));
  }, [archivedTasks]);

  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'completed' | 'focusTime' | 'breakTime'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      completed: false,
      focusTime: 0,
      breakTime: 0,
    };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, ...updates } : task
    ));
    // Also update in archive if exists
    setArchivedTasks(prev => prev.map(task =>
      task.id === id ? { ...task, ...updates } : task
    ));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    // Note: Does NOT remove from archived tasks - they persist in Stats
  }, []);

  const deleteArchivedTask = useCallback((id: string) => {
    setArchivedTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  const clearAllTasks = useCallback(() => {
    setTasks([]);
  }, []);

  const completeTask = useCallback((id: string) => {
    setTasks(prev => {
      const updated = prev.map(task =>
        task.id === id ? { ...task, completed: true, completedAt: task.completedAt ?? new Date() } : task
      );
      // Archive the completed task
      const completedTask = updated.find(t => t.id === id);
      if (completedTask) {
        setArchivedTasks(archive => {
          // Update if already exists, otherwise add
          const exists = archive.some(t => t.id === id);
          if (exists) {
            return archive.map(t => t.id === id ? completedTask : t);
          }
          return [...archive, completedTask];
        });
      }
      return updated;
    });
  }, []);

  const addFocusTime = useCallback((id: string, seconds: number) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, focusTime: task.focusTime + seconds } : task
    ));
    setArchivedTasks(prev => prev.map(task =>
      task.id === id ? { ...task, focusTime: task.focusTime + seconds } : task
    ));
  }, []);

  const addBreakTime = useCallback((id: string, seconds: number) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, breakTime: task.breakTime + seconds } : task
    ));
    setArchivedTasks(prev => prev.map(task =>
      task.id === id ? { ...task, breakTime: task.breakTime + seconds } : task
    ));
  }, []);

  const getUpcomingTasks = useCallback(() => {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    return tasks.filter(task =>
      !task.completed &&
      task.deadline && task.deadline >= now &&
      task.deadline <= threeDaysFromNow
    ).sort((a, b) => (a.deadline?.getTime() ?? Infinity) - (b.deadline?.getTime() ?? Infinity));
  }, [tasks]);

  const getOverdueTasks = useCallback(() => {
    const now = new Date();
    return tasks.filter(task =>
      !task.completed && task.deadline && task.deadline < now
    ).sort((a, b) => (a.deadline?.getTime() ?? Infinity) - (b.deadline?.getTime() ?? Infinity));
  }, [tasks]);

  // Legacy totals remain intact; new journal records are derived, never added repeatedly.
  const withHistory = (task: Task): Task => {
    const records = history.filter(record => record.taskId === task.id);
    return { ...task,
      focusTime: task.focusTime + records.reduce((sum, record) => sum + record.focusTime, 0),
      breakTime: task.breakTime + records.reduce((sum, record) => sum + record.breakTime, 0) };
  };
  return {
    tasks: tasks.map(withHistory),
    archivedTasks: archivedTasks.map(withHistory),
    addTask,
    updateTask,
    deleteTask,
    deleteArchivedTask,
    clearAllTasks,
    completeTask,
    addFocusTime,
    addBreakTime,
    getUpcomingTasks,
    getOverdueTasks,
  };
}
