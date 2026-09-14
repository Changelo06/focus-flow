import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AffirmationOverlayProps {
  message: string;
  isVisible: boolean;
  type?: 'focus' | 'break';
  onDismiss: () => void;
  autoHideDuration?: number;
}

export function AffirmationOverlay({
  message,
  isVisible,
  type = 'focus',
  onDismiss,
  autoHideDuration = 5000,
}: AffirmationOverlayProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      
      if (autoHideDuration > 0) {
        const timer = setTimeout(() => {
          onDismiss();
        }, autoHideDuration);

        return () => clearTimeout(timer);
      }
    } else {
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoHideDuration, onDismiss]);

  if (!isVisible && !isAnimating) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className={cn(
          "relative pointer-events-auto rounded-xl shadow-2xl overflow-hidden max-w-md w-full transform transition-all duration-300 bg-card border border-border",
          isVisible ? "scale-100 translate-y-0" : "scale-90 translate-y-8"
        )}
        onClick={onDismiss}
      >
        {/* Content */}
        <div className="relative p-8 flex flex-col items-center text-center space-y-4">
          {/* Icon */}
          <div
            className={cn(
              "p-4 rounded-full animate-in zoom-in duration-500",
              type === 'focus'
                ? "bg-focus/10 text-focus"
                : "bg-break/10 text-break"
            )}
          >
            <CheckCircle2 className="w-12 h-12" />
          </div>

          {/* Title */}
          <h3
            className="text-2xl font-bold animate-in fade-in slide-in-from-bottom-4 duration-500 text-foreground"
            style={{ animationDelay: '100ms' }}
          >
            {type === 'focus' ? 'Session Complete!' : 'Break Complete!'}
          </h3>

          {/* Affirmation Message */}
          <p
            className="text-lg font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-500 text-muted-foreground"
            style={{ animationDelay: '200ms' }}
          >
            {message}
          </p>

          {/* Tap to dismiss hint */}
          <p
            className="text-sm animate-in fade-in duration-500 text-muted-foreground/60"
            style={{ animationDelay: '300ms' }}
          >
            Tap anywhere to dismiss
          </p>
        </div>

        {/* Progress Bar for Auto-hide */}
        <div
          className={cn(
            "absolute bottom-0 left-0 h-1 transition-all origin-left",
            type === 'focus'
              ? "bg-focus"
              : "bg-break"
          )}
          style={{
            width: isVisible ? '0%' : '100%',
            transitionDuration: isVisible ? `${autoHideDuration}ms` : '0ms',
            transitionTimingFunction: 'linear',
          }}
        />
      </div>
    </div>
  );
}
