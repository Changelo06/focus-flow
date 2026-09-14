import { cn } from '@/lib/utils';
import { TimerSession } from '@/types';
import { Play, Pause, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface TimerDisplayProps {
  timeRemaining: number;
  session: TimerSession;
  isPaused?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
}

export function TimerDisplay({ 
  timeRemaining, 
  session, 
  isPaused = false,
  onPause,
  onResume,
  onStop
}: TimerDisplayProps) {
  const [showControls, setShowControls] = useState(false);
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  
  const formatTime = (num: number) => num.toString().padStart(2, '0');

  const isActive = session.status === 'focus' || session.status === 'break';
  const canShowControls = isActive;

  // Close controls with ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showControls) {
        setShowControls(false);
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showControls]);

  const handleTimerClick = () => {
    if (canShowControls) {
      setShowControls(!showControls);
    }
  };

  const handleControlClick = (action: () => void | undefined) => {
    if (action) {
      action();
    }
    setShowControls(false);
  };

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
        onClick={handleTimerClick}
        className={cn(
          "relative w-64 h-64 rounded-full flex items-center justify-center",
          "border-4 transition-all duration-300",
          session.status === 'focus' && "border-focus shadow-focus-ring",
          session.status === 'break' && "border-break shadow-break-ring",
          session.status === 'idle' && "border-muted",
          session.status === 'completed' && "border-success",
          canShowControls && "cursor-pointer hover:scale-105"
        )}
      >
        <div className={cn(
          "text-center transition-all duration-300",
          showControls && "blur-sm"
        )}>
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

        {/* Overlay Controls */}
        {showControls && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-3 bg-background/95 backdrop-blur-sm rounded-full p-2 border border-border shadow-2xl">
              {!isPaused ? (
                <Button 
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleControlClick(onPause);
                  }}
                  className="h-12 w-12 rounded-full hover:bg-muted"
                  title="Pause Timer"
                >
                  <Pause className="w-6 h-6" />
                </Button>
              ) : (
                <>
                  <Button 
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleControlClick(onResume);
                    }}
                    className="h-12 w-12 rounded-full hover:bg-muted"
                    title="Resume Timer"
                  >
                    <Play className="w-6 h-6" />
                  </Button>
                  {onStop && (
                    <Button 
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleControlClick(onStop);
                      }}
                      className="h-12 w-12 rounded-full hover:bg-destructive/10 text-destructive"
                      title="Stop Timer"
                    >
                      <StopCircle className="w-6 h-6" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
