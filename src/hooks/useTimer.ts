import { useState, useEffect, useCallback, useRef } from 'react';
import { TimerSession, TimeSegment } from '@/types';

export function useTimer(initialDuration: number = 25 * 60) {
  const [session, setSession] = useState<TimerSession>({
    taskId: null,
    duration: initialDuration,
    elapsed: 0,
    focusSegments: [],
    breakSegments: [],
    status: 'idle',
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const segmentStartRef = useRef<number>(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startFocus = useCallback((taskId?: string | null) => {
    setSession(prev => {
      const percentage = (prev.elapsed / prev.duration) * 100;
      segmentStartRef.current = percentage;
      return {
        ...prev,
        taskId: taskId !== undefined ? taskId : prev.taskId,
        status: 'focus',
      };
    });
  }, []);

  const startBreak = useCallback(() => {
    setSession(prev => {
      const percentage = (prev.elapsed / prev.duration) * 100;
      const newFocusSegment: TimeSegment = {
        start: segmentStartRef.current,
        end: percentage,
      };
      segmentStartRef.current = percentage;
      return {
        ...prev,
        status: 'break',
        focusSegments: [...prev.focusSegments, newFocusSegment],
      };
    });
  }, []);

  const resumeFocus = useCallback(() => {
    setSession(prev => {
      const percentage = (prev.elapsed / prev.duration) * 100;
      const newBreakSegment: TimeSegment = {
        start: segmentStartRef.current,
        end: percentage,
      };
      segmentStartRef.current = percentage;
      return {
        ...prev,
        status: 'focus',
        breakSegments: [...prev.breakSegments, newBreakSegment],
      };
    });
  }, []);

  const completeEarly = useCallback(() => {
    clearTimer();
    setSession(prev => {
      const percentage = (prev.elapsed / prev.duration) * 100;
      if (prev.status === 'focus') {
        const newFocusSegment: TimeSegment = {
          start: segmentStartRef.current,
          end: percentage,
        };
        return {
          ...prev,
          status: 'completed',
          focusSegments: [...prev.focusSegments, newFocusSegment],
        };
      } else if (prev.status === 'break') {
        const newBreakSegment: TimeSegment = {
          start: segmentStartRef.current,
          end: percentage,
        };
        return {
          ...prev,
          status: 'completed',
          breakSegments: [...prev.breakSegments, newBreakSegment],
        };
      }
      return { ...prev, status: 'completed' };
    });
  }, [clearTimer]);

  const reset = useCallback((newDuration?: number) => {
    clearTimer();
    setSession({
      taskId: null,
      duration: newDuration ?? initialDuration,
      elapsed: 0,
      focusSegments: [],
      breakSegments: [],
      status: 'idle',
    });
    segmentStartRef.current = 0;
  }, [clearTimer, initialDuration]);

  const setDuration = useCallback((duration: number) => {
    setSession(prev => ({ ...prev, duration }));
  }, []);

  const setTaskId = useCallback((taskId: string | null) => {
    setSession(prev => ({ ...prev, taskId }));
  }, []);

  // Timer tick effect
  useEffect(() => {
    if (session.status === 'focus' || session.status === 'break') {
      intervalRef.current = setInterval(() => {
        setSession(prev => {
          const newElapsed = prev.elapsed + 1;
          if (newElapsed >= prev.duration) {
            clearTimer();
            const percentage = 100;
            if (prev.status === 'focus') {
              const newFocusSegment: TimeSegment = {
                start: segmentStartRef.current,
                end: percentage,
              };
              return {
                ...prev,
                elapsed: prev.duration,
                status: 'completed',
                focusSegments: [...prev.focusSegments, newFocusSegment],
              };
            } else {
              const newBreakSegment: TimeSegment = {
                start: segmentStartRef.current,
                end: percentage,
              };
              return {
                ...prev,
                elapsed: prev.duration,
                status: 'completed',
                breakSegments: [...prev.breakSegments, newBreakSegment],
              };
            }
          }
          return { ...prev, elapsed: newElapsed };
        });
      }, 1000);
    }

    return () => clearTimer();
  }, [session.status, clearTimer]);

  const timeRemaining = session.duration - session.elapsed;
  const progress = (session.elapsed / session.duration) * 100;

  return {
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
  };
}
