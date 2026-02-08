import { cn } from '@/lib/utils';
import { TimerSession } from '@/types';

interface TimerDisplayProps {
  timeRemaining: number;
  session: TimerSession;
}

export function TimerDisplay({ timeRemaining, session }: TimerDisplayProps) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  
  const formatTime = (num: number) => num.toString().padStart(2, '0');

  const isActive = session.status === 'focus' || session.status === 'break';

  return (
    <div className="relative">
      {/* Glow effect */}
      <div 
        className={cn(
          "absolute inset-0 rounded-full blur-3xl opacity-30 transition-all duration-500",
          session.status === 'focus' && "bg-focus animate-pulse-glow",
          session.status === 'break' && "bg-break animate-pulse-break",
          session.status === 'idle' && "bg-muted",
          session.status === 'completed' && "bg-success"
        )}
      />
      
      {/* Timer circle */}
      <div 
        className={cn(
          "relative w-64 h-64 rounded-full flex items-center justify-center",
          "border-4 transition-all duration-300",
          session.status === 'focus' && "border-focus shadow-focus-ring",
          session.status === 'break' && "border-break shadow-break-ring",
          session.status === 'idle' && "border-muted",
          session.status === 'completed' && "border-success"
        )}
      >
        <div className="text-center">
          <div className={cn(
            "text-6xl font-bold tracking-tight transition-colors",
            session.status === 'focus' && "text-focus",
            session.status === 'break' && "text-break",
            session.status === 'completed' && "text-success"
          )}>
            {formatTime(minutes)}:{formatTime(seconds)}
          </div>
          <div className={cn(
            "text-sm font-medium uppercase tracking-widest mt-2 transition-colors",
            session.status === 'focus' && "text-focus",
            session.status === 'break' && "text-break",
            session.status === 'idle' && "text-muted-foreground",
            session.status === 'completed' && "text-success"
          )}>
            {session.status === 'idle' && 'Ready'}
            {session.status === 'focus' && 'Locked In'}
            {session.status === 'break' && 'Break Time'}
            {session.status === 'completed' && 'Complete!'}
          </div>
        </div>
      </div>
    </div>
  );
}
