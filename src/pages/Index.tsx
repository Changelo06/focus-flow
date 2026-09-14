import { useState, useMemo } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { TimerView } from '@/components/TimerView';
import { TasksView } from '@/components/TasksView';
import { StatsView } from '@/components/StatsView';
import { AffirmationOverlay } from '@/components/AffirmationOverlay';
import { useTimer } from '@/hooks/useTimer';
import { useTasks } from '@/hooks/useTasks';
import { useStats, TimePeriod } from '@/hooks/useStats';
import { useAffirmations } from '@/hooks/useAffirmations';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'timer' | 'tasks' | 'stats'>('timer');
  const [statsPeriod, setStatsPeriod] = useState<TimePeriod>('weekly');
  
  const { affirmation, showAffirmation, hideAffirmation } = useAffirmations();
  
  const {
    session,
    timeRemaining,
    progress,
    isPaused,
    startFocus,
    startBreak,
    resumeFocus,
    pause,
    resume,
    stop,
    completeEarly,
    reset,
    setDuration,
    setTaskId,
  } = useTimer({
    onSessionComplete: (type) => {
      showAffirmation(type);
    },
  });

  const {
    tasks,
    archivedTasks,
    addTask,
    updateTask,
    deleteTask,
    deleteArchivedTask,
    clearAllTasks,
    completeTask,
    addFocusTime,
    addBreakTime,
  } = useTasks();

  const { weeklyStats, monthlyCompletionRate, periodLabel } = useStats(tasks, statsPeriod);

  const tasksCompletedToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(t => 
      t.completed && t.createdAt.toISOString().split('T')[0] === today
    ).length;
  }, [tasks]);

  const handleStartTimer = (taskId: string) => {
    setTaskId(taskId);
    setActiveTab('timer');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-6">
        {activeTab === 'timer' && (
          <TimerView
            session={session}
            timeRemaining={timeRemaining}
            progress={progress}
            isPaused={isPaused}
            tasks={tasks}
            onStart={startFocus}
            onPause={pause}
            onResume={resume}
            onBreak={startBreak}
            onResumeFocus={resumeFocus}
            onStop={stop}
            onComplete={completeEarly}
            onReset={reset}
            onDurationChange={setDuration}
            onTaskSelect={setTaskId}
            onAddFocusTime={addFocusTime}
            onAddBreakTime={addBreakTime}
            onCompleteTask={completeTask}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksView
            tasks={tasks}
            onAddTask={addTask}
            onCompleteTask={completeTask}
            onDeleteTask={deleteTask}
            onClearAllTasks={clearAllTasks}
            onStartTimer={handleStartTimer}
          />
        )}

        {activeTab === 'stats' && (
          <StatsView
            weeklyStats={weeklyStats}
            monthlyCompletionRate={monthlyCompletionRate}
            tasksCompletedToday={tasksCompletedToday}
            archivedTasks={archivedTasks}
            period={statsPeriod}
            onPeriodChange={setStatsPeriod}
            onDeleteArchivedTask={deleteArchivedTask}
            periodLabel={periodLabel}
          />
        )}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Affirmation Overlay */}
      <AffirmationOverlay
        message={affirmation.message}
        isVisible={affirmation.isVisible}
        type={affirmation.type}
        onDismiss={hideAffirmation}
      />
    </div>
  );
};

export default Index;
