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
  isPaused?: boolean;
  tasks: Task[];
  onStart: (taskId?: string | null) => void;
  onPause?: () => void;
  onResume: () => void;
  onBreak: () => void;
  onResumeFocus?: () => void;
  onStop?: () => void;
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
  isPaused = false,
  tasks,
  onStart,
  onPause,
  onResume,
  onBreak,
  onResumeFocus,
  onStop,
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
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] pb-20 gap-section animate-fade-in" style={{ paddingTop: 'max(40px, env(safe-area-inset-top))', paddingLeft: '6px', paddingRight: '6px', paddingBottom: 'max(80px, env(safe-area-inset-bottom))' }}>
      {/* Task Selector - Secondary Element */}
      <TaskSelector
        tasks={tasks}
        selectedTaskId={session.taskId}
        onSelect={onTaskSelect}
        disabled={session.status !== 'idle'}
      />

      {/* Timer Display - Primary Focus Element */}
      <TimerDisplay 
        timeRemaining={timeRemaining} 
        session={session}
        isPaused={isPaused}
        onPause={onPause}
        onResume={onResume}
        onStop={onStop}
      />

      {/* Progress Bar - Visual Feedback */}
      <ProgressBar
        focusSegments={session.focusSegments}
        breakSegments={session.breakSegments}
        currentProgress={progress}
        status={session.status}
      />

      {/* Duration Selector - Secondary Control */}
      <DurationSelector
        duration={session.duration}
        onDurationChange={onDurationChange}
        disabled={session.status !== 'idle'}
      />

      {/* Controls - Primary Actions */}
      <TimerControls
        status={session.status}
        isPaused={isPaused}
        onStart={() => onStart(session.taskId)}
        onPause={onPause}
        onResume={onResume}
        onResumeFocus={onResumeFocus}
        onBreak={onBreak}
        onStop={onStop}
        onComplete={handleComplete}
        onReset={() => onReset()}
      />
    </div>
  );
}
