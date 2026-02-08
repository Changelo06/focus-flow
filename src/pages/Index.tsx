import { useState, useMemo } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { TimerView } from '@/components/TimerView';
import { TasksView } from '@/components/TasksView';
import { StatsView } from '@/components/StatsView';
import { useTimer } from '@/hooks/useTimer';
import { useTasks } from '@/hooks/useTasks';
import { useStats, TimePeriod } from '@/hooks/useStats';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'timer' | 'tasks' | 'stats'>('timer');
  const [statsPeriod, setStatsPeriod] = useState<TimePeriod>('weekly');
  
  const {
    session,
    timeRemaining,
    progress,
    startFocus,
    startBreak,
    resumeFocus,
    completeEarly,
    reset,
    setDuration,
    setTaskId,
  } = useTimer();

  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
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
      <div className="max-w-md mx-auto">
        {activeTab === 'timer' && (
          <TimerView
            session={session}
            timeRemaining={timeRemaining}
            progress={progress}
            tasks={tasks}
            onStart={startFocus}
            onBreak={startBreak}
            onResume={resumeFocus}
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
            onStartTimer={handleStartTimer}
          />
        )}

        {activeTab === 'stats' && (
          <StatsView
            weeklyStats={weeklyStats}
            monthlyCompletionRate={monthlyCompletionRate}
            tasksCompletedToday={tasksCompletedToday}
            tasks={tasks}
            period={statsPeriod}
            onPeriodChange={setStatsPeriod}
            periodLabel={periodLabel}
          />
        )}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
