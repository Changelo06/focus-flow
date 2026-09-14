import { useState, useMemo } from 'react';
import { SessionHistory } from '@/components/SessionHistory';
import { timeInRange } from '@/lib/sessionStats';
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
  const [activeTab, setActiveTab] = useState<'timer' | 'tasks' | 'stats' | 'history'>('timer');
  const [statsPeriod, setStatsPeriod] = useState<TimePeriod>('weekly');
  
  const { affirmation, showAffirmation, hideAffirmation } = useAffirmations();
  
  const {
    session,
    history,
    alarmMessage,
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
    deleteTask,
    deleteArchivedTask,
    clearAllTasks,
    completeTask,
  } = useTasks(history);

  const { weeklyStats, monthlyCompletionRate, periodLabel } = useStats([...new Map([...archivedTasks, ...tasks].map(task => [task.id, task])).values()], statsPeriod, history);

  const tasksCompletedToday = useMemo(() => {
    const today = new Date().toDateString();
    return tasks.filter(t => 
      t.completed && t.completedAt?.toDateString() === today
    ).length;
  }, [tasks]);

  const handleStartTimer = (taskId: string) => {
    setTaskId(taskId);
    setActiveTab('timer');
  };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayTime = timeInRange(history, todayStart.getTime(), Date.now());
  const completedSessionsToday = history.filter(record => record.outcome === 'completed' && record.endedAt >= todayStart.getTime()).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-6">
        {activeTab === 'timer' && alarmMessage && <p role="status" className="pt-6 text-sm text-muted-foreground">{alarmMessage}</p>}
        {activeTab === 'history' && <SessionHistory history={history} />}
        {activeTab === 'timer' && <p className="pt-5 text-center text-xs text-muted-foreground">
          Saved today: {Math.floor(todayTime.focus / 60)}m focus · {Math.floor(todayTime.rest / 60)}m break · {completedSessionsToday} completed sessions
        </p>}
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
