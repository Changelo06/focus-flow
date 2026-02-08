import { cn } from '@/lib/utils';
import { TimeSegment } from '@/types';

interface ProgressBarProps {
  focusSegments: TimeSegment[];
  breakSegments: TimeSegment[];
  currentProgress: number;
  status: 'idle' | 'focus' | 'break' | 'completed';
}

export function ProgressBar({ focusSegments, breakSegments, currentProgress, status }: ProgressBarProps) {
  return (
    <div className="w-full max-w-sm">
      <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
        {/* Focus segments (red) */}
        {focusSegments.map((segment, i) => (
          <div
            key={`focus-${i}`}
            className="absolute top-0 h-full gradient-focus transition-all"
            style={{
              left: `${segment.start}%`,
              width: `${segment.end - segment.start}%`,
            }}
          />
        ))}
        
        {/* Break segments (blue) */}
        {breakSegments.map((segment, i) => (
          <div
            key={`break-${i}`}
            className="absolute top-0 h-full gradient-break transition-all"
            style={{
              left: `${segment.start}%`,
              width: `${segment.end - segment.start}%`,
            }}
          />
        ))}
        
        {/* Current active segment */}
        {(status === 'focus' || status === 'break') && (
          <div
            className={cn(
              "absolute top-0 h-full transition-all",
              status === 'focus' ? "gradient-focus" : "gradient-break"
            )}
            style={{
              left: `${focusSegments.length > 0 || breakSegments.length > 0 
                ? Math.max(
                    ...focusSegments.map(s => s.end),
                    ...breakSegments.map(s => s.end),
                    0
                  ) 
                : 0}%`,
              width: `${currentProgress - Math.max(
                ...focusSegments.map(s => s.end),
                ...breakSegments.map(s => s.end),
                0
              )}%`,
            }}
          />
        )}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full gradient-focus" />
          <span className="text-xs text-muted-foreground">Focus</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full gradient-break" />
          <span className="text-xs text-muted-foreground">Break</span>
        </div>
      </div>
    </div>
  );
}
