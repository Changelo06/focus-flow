import { Play, Pause, Coffee, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TimerControlsProps {
  status: 'idle' | 'focus' | 'break' | 'completed';
  onStart: () => void;
  onBreak: () => void;
  onResume: () => void;
  onComplete: () => void;
  onReset: () => void;
}

export function TimerControls({ 
  status, 
  onStart, 
  onBreak, 
  onResume, 
  onComplete, 
  onReset 
}: TimerControlsProps) {
  return (
    <div className="flex items-center gap-4">
      {status === 'idle' && (
        <Button 
          size="lg" 
          onClick={onStart}
          className="gradient-focus text-focus-foreground hover:opacity-90 px-8 py-6 text-lg font-semibold shadow-elevated"
        >
          <Play className="w-5 h-5 mr-2" />
          Start Focus
        </Button>
      )}

      {status === 'focus' && (
        <>
          <Button 
            size="lg" 
            variant="outline"
            onClick={onBreak}
            className="border-break text-break hover:bg-break/10 px-6 py-6"
          >
            <Coffee className="w-5 h-5 mr-2" />
            Break
          </Button>
          <Button 
            size="lg" 
            onClick={onComplete}
            className="gradient-success text-success-foreground hover:opacity-90 px-6 py-6"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Done
          </Button>
        </>
      )}

      {status === 'break' && (
        <>
          <Button 
            size="lg" 
            onClick={onResume}
            className="gradient-focus text-focus-foreground hover:opacity-90 px-6 py-6"
          >
            <Play className="w-5 h-5 mr-2" />
            Resume
          </Button>
          <Button 
            size="lg" 
            onClick={onComplete}
            className="gradient-success text-success-foreground hover:opacity-90 px-6 py-6"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Done
          </Button>
        </>
      )}

      {status === 'completed' && (
        <Button 
          size="lg" 
          variant="outline"
          onClick={onReset}
          className="px-8 py-6"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          New Session
        </Button>
      )}
    </div>
  );
}
