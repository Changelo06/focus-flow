import { useState, useEffect, useCallback, useRef } from 'react';
import { TimerSession, TimeSegment } from '@/types';
import { useNotifications } from './useNotifications';
import { soundPlayer } from '@/utils/soundPlayer';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { Capacitor } from '@capacitor/core';

export interface UseTimerProps {
  initialDuration?: number;
  onSessionComplete?: (type: 'focus' | 'break', taskId?: string | null) => void;
}

export function useTimer(props?: UseTimerProps) {
  const initialDuration = props?.initialDuration ?? 25 * 60;
  const onSessionComplete = props?.onSessionComplete;
  const [session, setSession] = useState<TimerSession>({
    taskId: null,
    duration: initialDuration,
    elapsed: 0,
    focusSegments: [],
    breakSegments: [],
    status: 'idle',
  });

  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const segmentStartRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const isNative = Capacitor.isNativePlatform();

  const {
    showTimerNotification,
    showCompletionNotification,
    cancelTimerNotification,
    cancelAllNotifications,
    requestPermissions,
  } = useNotifications({
    onPause: () => pause(),
    onResume: () => resume(),
    onBreak: () => startBreak(),
    onStop: () => stop(),
    onComplete: () => completeEarly(),
  });

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const pause = useCallback(async () => {
    if (session.status === 'focus' || session.status === 'break') {
      setIsPaused(true);
      clearTimer();
      
      // Allow device to sleep when paused
      if (isNative) {
        try {
          await KeepAwake.allowSleep();
        } catch (error) {
          console.warn('Failed to allow device sleep:', error);
        }
      }
      
      const timeRemaining = session.duration - session.elapsed;
      showTimerNotification('paused', timeRemaining, session.taskId || undefined);
    }
  }, [session.status, session.duration, session.elapsed, session.taskId, clearTimer, showTimerNotification, isNative]);

  const resume = useCallback(async () => {
    if (isPaused && (session.status === 'focus' || session.status === 'break')) {
      // Keep device awake when resuming
      if (isNative) {
        try {
          await KeepAwake.keepAwake();
        } catch (error) {
          console.warn('Failed to keep device awake:', error);
        }
      }
      
      setIsPaused(false);
      startTimeRef.current = Date.now();
      // Timer will restart in the useEffect
    }
  }, [isPaused, session.status, isNative]);

  const stop = useCallback(async () => {
    // Stop forfeits the timer - do NOT mark as completed or log time
    clearTimer();
    setIsPaused(false);
    soundPlayer.stopSound();
    cancelAllNotifications();
    
    // Allow device to sleep when stopping
    if (isNative) {
      try {
        await KeepAwake.allowSleep();
      } catch (error) {
        console.warn('Failed to allow device sleep:', error);
      }
    }
    
    setSession({
      taskId: null,
      duration: initialDuration,
      elapsed: 0,
      focusSegments: [],
      breakSegments: [],
      status: 'idle', // Reset to idle, NOT completed
    });
    segmentStartRef.current = 0;
  }, [clearTimer, cancelAllNotifications, initialDuration, isNative]);

  const startFocus = useCallback(async (taskId?: string | null) => {
    // Request notification permissions on first timer start
    await requestPermissions();
    
    // Keep device awake during focus session
    if (isNative) {
      try {
        await KeepAwake.keepAwake();
      } catch (error) {
        console.warn('Failed to keep device awake:', error);
      }
    }
    
    setIsPaused(false);
    startTimeRef.current = Date.now();
    setSession(prev => {
      const percentage = (prev.elapsed / prev.duration) * 100;
      segmentStartRef.current = percentage;
      return {
        ...prev,
        taskId: taskId !== undefined ? taskId : prev.taskId,
        status: 'focus',
      };
    });
  }, [requestPermissions, isNative]);

  const startBreak = useCallback(async () => {
    // Keep device awake during break session
    if (isNative) {
      try {
        await KeepAwake.keepAwake();
      } catch (error) {
        console.warn('Failed to keep device awake:', error);
      }
    }
    
    setIsPaused(false);
    startTimeRef.current = Date.now();
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
  }, [isNative]);

  const resumeFocus = useCallback(async () => {
    // Keep device awake when resuming
    if (isNative) {
      try {
        await KeepAwake.keepAwake();
      } catch (error) {
        console.warn('Failed to keep device awake:', error);
      }
    }
    
    setIsPaused(false);
    startTimeRef.current = Date.now();
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
  }, [isNative]);

  const completeEarly = useCallback(async () => {
    clearTimer();
    setIsPaused(false);
    soundPlayer.stopSound();
    
    // Allow device to sleep when completing
    if (isNative) {
      try {
        await KeepAwake.allowSleep();
      } catch (error) {
        console.warn('Failed to allow device sleep:', error);
      }
    }
    
    setSession(prev => {
      const percentage = (prev.elapsed / prev.duration) * 100;
      if (prev.status === 'focus') {
        const newFocusSegment: TimeSegment = {
          start: segmentStartRef.current,
          end: percentage,
        };
        // Play sound and show affirmation instead of notification
        soundPlayer.playRingtone();
        onSessionComplete?.('focus', prev.taskId);
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
        // Play sound and show affirmation instead of notification
        soundPlayer.playRingtone();
        onSessionComplete?.('break', prev.taskId);
        return {
          ...prev,
          status: 'completed',
          breakSegments: [...prev.breakSegments, newBreakSegment],
        };
      }
      return { ...prev, status: 'completed' };
    });
    
    cancelTimerNotification();
  }, [clearTimer, onSessionComplete, cancelTimerNotification, isNative]);

  const reset = useCallback(async (newDuration?: number) => {
    clearTimer();
    setIsPaused(false);
    soundPlayer.stopSound();
    cancelAllNotifications();
    
    // Allow device to sleep when resetting
    if (isNative) {
      try {
        await KeepAwake.allowSleep();
      } catch (error) {
        console.warn('Failed to allow device sleep:', error);
      }
    }
    
    setSession({
      taskId: null,
      duration: newDuration ?? initialDuration,
      elapsed: 0,
      focusSegments: [],
      breakSegments: [],
      status: 'idle',
    });
    segmentStartRef.current = 0;
  }, [clearTimer, cancelAllNotifications, initialDuration, isNative]);

  const setDuration = useCallback((duration: number) => {
    setSession(prev => ({ ...prev, duration }));
  }, []);

  const setTaskId = useCallback((taskId: string | null) => {
    setSession(prev => ({ ...prev, taskId }));
  }, []);

  // Timer tick effect
  useEffect(() => {
    if ((session.status === 'focus' || session.status === 'break') && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSession(prev => {
          const newElapsed = prev.elapsed + 1;
          if (newElapsed >= prev.duration) {
            clearTimer();
            
            // Allow device to sleep when timer completes
            if (isNative) {
              KeepAwake.allowSleep().catch(error => {
                console.warn('Failed to allow device sleep:', error);
              });
            }
            
            const percentage = 100;
            if (prev.status === 'focus') {
              const newFocusSegment: TimeSegment = {
                start: segmentStartRef.current,
                end: percentage,
              };
              // Play sound and show affirmation instead of notification
              soundPlayer.playRingtone();
              onSessionComplete?.('focus', prev.taskId);
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
              // Play sound and show affirmation instead of notification
              soundPlayer.playRingtone();
              onSessionComplete?.('break', prev.taskId);
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
  }, [session.status, isPaused, clearTimer, onSessionComplete, isNative]);

  // Update persistent notification in real-time (every 30 seconds)
  useEffect(() => {
    if ((session.status === 'focus' || session.status === 'break') && !isPaused) {
      const updateNotification = () => {
        const timeRemaining = session.duration - session.elapsed;
        showTimerNotification(session.status, timeRemaining, session.taskId || undefined);
      };

      // Update immediately when status changes
      updateNotification();

      // Then update every 60 seconds to show time remaining
      const notificationInterval = setInterval(updateNotification, 60000);

      return () => clearInterval(notificationInterval);
    } else if (isPaused && (session.status === 'focus' || session.status === 'break')) {
      // Update to show paused state immediately
      const timeRemaining = session.duration - session.elapsed;
      showTimerNotification('paused', timeRemaining, session.taskId || undefined);
    } else if (session.status === 'completed' || session.status === 'idle') {
      cancelTimerNotification();
    }
  }, [session.status, isPaused, showTimerNotification, cancelTimerNotification]);

  const timeRemaining = session.duration - session.elapsed;
  const progress = (session.elapsed / session.duration) * 100;

  return {
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
    requestPermissions,
  };
}
