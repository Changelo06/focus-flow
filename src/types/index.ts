export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: Date | null;
  completedAt?: Date;
  completed: boolean;
  createdAt: Date;
  focusTime: number; // in seconds
  breakTime: number; // in seconds
}

export interface TimerSession {
  taskId: string | null;
  duration: number; // total duration in seconds
  elapsed: number; // elapsed time in seconds
  focusSegments: TimeSegment[];
  breakSegments: TimeSegment[];
  status: 'idle' | 'focus' | 'break' | 'completed';
}

export interface TimeSegment {
  start: number; // percentage
  end: number; // percentage
}

export interface DailyStats {
  date: string;
  focusTime: number; // in minutes
  tasksCompleted: number;
}

export interface WeeklyStats {
  totalFocusTime: number; // in minutes
  totalBreakTime: number; // in minutes
  tasksCompleted: number;
  dailyStats: DailyStats[];
}
