import { useEffect } from 'react';
import { TimerDisplay } from './TimerDisplay';
import { ProgressBar } from './ProgressBar';
import { TimerControls } from './TimerControls';
import { DurationSelector } from './DurationSelector';
import { TaskSelector } from './TaskSelector';
import { TimerSession, Task } from '@/types';

interface TimerViewProps {
  session: TimerSession;
  timeRemaining: number;
  progress: number;
  tasks: Task[];
  onStart: (taskId?: string | null) => void;
  onBreak: () => void;
  onResume: () => void;
  onComplete: () => void;
  onReset: (duration?: number) => void;
  onDurationChange: (duration: number) => void;
  onTaskSelect: (taskId: string | null) => void;
  onAddFocusTime: (taskId: string, seconds: number) => void;
  onAddBreakTime: (taskId: string, seconds: number) => void;
  onCompleteTask: (taskId: string) => void;
}

export function TimerView({
  session,
  timeRemaining,
  progress,
  tasks,
  onStart,
  onBreak,
  onResume,
  onComplete,
  onReset,
  onDurationChange,
  onTaskSelect,
  onAddFocusTime,
  onAddBreakTime,
  onCompleteTask,
}: TimerViewProps) {
  // Track time for linked task
  useEffect(() => {
    if (session.status === 'completed' && session.taskId) {
      const focusTime = session.focusSegments.reduce(
        (acc, seg) => acc + ((seg.end - seg.start) / 100) * session.duration,
        0
      );
      const breakTime = session.breakSegments.reduce(
        (acc, seg) => acc + ((seg.end - seg.start) / 100) * session.duration,
        0
      );
      onAddFocusTime(session.taskId, Math.round(focusTime));
      onAddBreakTime(session.taskId, Math.round(breakTime));
    }
  }, [session.status]);

  const handleComplete = () => {
    onComplete();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4 pb-20 gap-8 animate-fade-in">
      {/* Task Selector */}
      <TaskSelector
        tasks={tasks}
        selectedTaskId={session.taskId}
        onSelect={onTaskSelect}
        disabled={session.status !== 'idle'}
      />

      {/* Timer Display */}
      <TimerDisplay timeRemaining={timeRemaining} session={session} />

      {/* Progress Bar */}
      <ProgressBar
        focusSegments={session.focusSegments}
        breakSegments={session.breakSegments}
        currentProgress={progress}
        status={session.status}
      />

      {/* Duration Selector */}
      <DurationSelector
        duration={session.duration}
        onDurationChange={onDurationChange}
        disabled={session.status !== 'idle'}
      />

      {/* Controls */}
      <TimerControls
        status={session.status}
        onStart={() => onStart(session.taskId)}
        onBreak={onBreak}
        onResume={onResume}
        onComplete={handleComplete}
        onReset={() => onReset()}
      />
    </div>
  );
}
