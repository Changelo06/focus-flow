import { useState, useCallback, useEffect } from 'react';
import { Task } from '@/types';

const STORAGE_KEY = 'lockin-tasks';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((t: Task) => ({
        ...t,
        deadline: new Date(t.deadline),
        createdAt: new Date(t.createdAt),
      }));
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

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
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  const completeTask = useCallback((id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: true } : task
    ));
  }, []);

  const addFocusTime = useCallback((id: string, seconds: number) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, focusTime: task.focusTime + seconds } : task
    ));
  }, []);

  const addBreakTime = useCallback((id: string, seconds: number) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, breakTime: task.breakTime + seconds } : task
    ));
  }, []);

  const getUpcomingTasks = useCallback(() => {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    return tasks.filter(task => 
      !task.completed && 
      task.deadline >= now && 
      task.deadline <= threeDaysFromNow
    ).sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
  }, [tasks]);

  const getOverdueTasks = useCallback(() => {
    const now = new Date();
    return tasks.filter(task => 
      !task.completed && task.deadline < now
    ).sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
  }, [tasks]);

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    addFocusTime,
    addBreakTime,
    getUpcomingTasks,
    getOverdueTasks,
  };
}
