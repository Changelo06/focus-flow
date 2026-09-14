import { Play, Pause, Coffee, RotateCcw, CheckCircle2, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TimerControlsProps {
  status: 'idle' | 'focus' | 'break' | 'completed';
  isPaused?: boolean;
  onStart: () => void;
  onPause?: () => void;
  onResume: () => void;
  onBreak: () => void;
  onResumeFocus?: () => void;
  onStop?: () => void;
  onComplete: () => void;
  onReset: () => void;
}

export function TimerControls({ 
  status,
  isPaused = false,
  onStart, 
  onPause,
  onResume,
  onBreak,
  onResumeFocus,
  onStop,
  onComplete, 
  onReset 
}: TimerControlsProps) {
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      {status === 'idle' && (
        <Button 
          size="lg" 
          onClick={onStart}
          className="gradient-focus text-focus-foreground hover:opacity-90 px-8 py-6 text-lg font-semibold shadow-elevated w-full"
        >
          <Play className="w-5 h-5 mr-2" />
          Start Focus
        </Button>
      )}

      {(status === 'focus' || status === 'break') && (
        <>
          <Button size="lg" className="w-full" onClick={isPaused ? onResume : onPause}>
            {isPaused ? 'Resume timer' : 'Pause timer'}
          </Button>
          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full">
            {status === 'focus' && (
              <Button 
                size="lg" 
                variant="outline"
                onClick={onBreak}
                className="border-break text-break hover:bg-break/10 px-6 py-6 flex-1"
                disabled={isPaused}
              >
                <Coffee className="w-5 h-5 mr-2" />
                Break
              </Button>
            )}
            
            {status === 'break' && (
              <Button 
                size="lg" 
                onClick={onResumeFocus || onResume}
                className="gradient-focus text-focus-foreground hover:opacity-90 px-3 py-6 flex-1"
                disabled={isPaused}
              >
                <Play className="w-5 h-5 mr-2" />
                Resume Focus
              </Button>
            )}

            <Button 
              size="lg" 
              onClick={onComplete}
              className="gradient-success text-success-foreground hover:opacity-90 px-3 py-6 flex-1"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              End session
            </Button>
          </div>
        </>
      )}

      {status === 'completed' && (
        <Button 
          size="lg" 
          variant="outline"
          onClick={onReset}
          className="px-8 py-6 w-full"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          New Session
        </Button>
      )}
    </div>
  );
}
