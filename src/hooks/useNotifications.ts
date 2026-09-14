import { useEffect, useCallback, useState } from 'react';
import { LocalNotifications, type ActionPerformed } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { soundPlayer } from '@/utils/soundPlayer';

export interface NotificationActions {
  PAUSE: string;
  RESUME: string;
  BREAK: string;
  STOP: string;
  COMPLETE: string;
}

export const NOTIFICATION_ACTIONS: NotificationActions = {
  PAUSE: 'PAUSE_TIMER',
  RESUME: 'RESUME_TIMER',
  BREAK: 'START_BREAK',
  STOP: 'STOP_TIMER',
  COMPLETE: 'COMPLETE_TASK',
};

export const TIMER_NOTIFICATION_ID = 1;
export const ALARM_NOTIFICATION_ID = 2;

export interface UseNotificationsProps {
  onPause?: () => void;
  onResume?: () => void;
  onBreak?: () => void;
  onStop?: () => void;
  onComplete?: () => void;
}

export function useNotifications({
  onPause,
  onResume,
  onBreak,
  onStop,
  onComplete,
}: UseNotificationsProps = {}) {
  // Check if running on native platform
  const isNative = Capacitor.isNativePlatform();
  
  // Track if app is in background (only show notifications when in background)
  const [isAppInBackground, setIsAppInBackground] = useState(false);

  // Listen for app state changes
  useEffect(() => {
    if (!isNative) return;

    const stateListener = App.addListener('appStateChange', ({ isActive }) => {
      setIsAppInBackground(!isActive);
    });

    return () => {
      stateListener.remove();
    };
  }, [isNative]);

  /**
   * Request notification permissions
   */
  const requestPermissions = useCallback(async () => {
    if (!isNative) {
      // For web, request browser notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
      return true;
    }

    try {
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }, [isNative]);

  /**
   * Show persistent timer notification with controls (only in background)
   */
  const showTimerNotification = useCallback(
    async (
      status: 'focus' | 'break' | 'paused',
      timeRemaining: number,
      taskTitle?: string
    ) => {
      // Only show notification when app is in background
      if (!isNative || !isAppInBackground) {
        return;
      }

      const minutes = Math.floor(timeRemaining / 60);
      const seconds = timeRemaining % 60;
      
      // Format time display
      const minutesText = minutes === 1 ? '1 minute' : `${minutes} minutes`;
      const timeDisplay = minutes > 0 ? `${minutesText} left` : `${seconds} seconds left`;

      const statusText = status === 'focus' ? 'Focus Time' : status === 'break' ? 'Break Time' : 'Paused';
      const bodyText = taskTitle ? `${taskTitle} • ${statusText} • ${timeDisplay}` : `${statusText} • ${timeDisplay}`;

      // Build action buttons based on current status
      const actions = [];
      
      if (status === 'focus') {
        actions.push(
          { 
            id: NOTIFICATION_ACTIONS.PAUSE, 
            title: 'Pause',
          },
          { 
            id: NOTIFICATION_ACTIONS.BREAK, 
            title: 'Break',
          },
          { 
            id: NOTIFICATION_ACTIONS.COMPLETE, 
            title: 'Done',
          }
        );
      } else if (status === 'break') {
        actions.push(
          { 
            id: NOTIFICATION_ACTIONS.PAUSE, 
            title: 'Pause',
          },
          { 
            id: NOTIFICATION_ACTIONS.RESUME, 
            title: 'Resume',
          },
          { 
            id: NOTIFICATION_ACTIONS.COMPLETE, 
            title: 'Done',
          }
        );
      } else if (status === 'paused') {
        actions.push(
          { 
            id: NOTIFICATION_ACTIONS.RESUME, 
            title: 'Resume',
          },
          { 
            id: NOTIFICATION_ACTIONS.STOP, 
            title: 'Stop',
          }
        );
      }

      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: TIMER_NOTIFICATION_ID,
              title: 'Study Track',
              body: bodyText,
              ongoing: true, // Makes notification persistent (can't be swiped away)
              autoCancel: false,
              silent: true, // Completely silent - no sound or vibration
              sound: undefined, // Explicitly no sound
              actionTypeId: 'TIMER_ACTIONS',
              extra: {
                type: 'timer',
              },
            },
          ],
        });
      } catch (error) {
        console.error('Error showing timer notification:', error);
      }
    },
    [isNative, isAppInBackground]
  );

  /**
   * Show alarm notification when timer completes
   */
  const showCompletionNotification = useCallback(
    async (type: 'focus' | 'break', taskTitle?: string) => {
      // Play sound
      await soundPlayer.playRingtone();

      // Vibrate
      if (isNative) {
        await Haptics.vibrate({ duration: 1000 });
      }

      const title = type === 'focus' ? 'Focus Session Complete!' : 'Break Time Over!';
      const body = type === 'focus' 
        ? 'Great work! Time for a well-deserved break.'
        : 'Ready to focus again?';

      if (!isNative) {
        // Web notification
        if ('Notification' in window && Notification.permission === 'granted') {
          const notification = new Notification(title, {
            body: taskTitle ? `${taskTitle}\n${body}` : body,
            icon: '/logo.png',
            tag: 'completion',
            requireInteraction: true,
          });

          notification.onclick = () => {
            soundPlayer.stopSound();
            window.focus();
            notification.close();
          };
        }
        return;
      }

      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: ALARM_NOTIFICATION_ID,
              title,
              body: taskTitle ? `${taskTitle}\n${body}` : body,
              sound: 'ringtone.mp3',
              actionTypeId: 'COMPLETION_ACTIONS',
              extra: {
                type: 'completion',
              },
            },
          ],
        });
      } catch (error) {
        console.error('Error showing completion notification:', error);
      }
    },
    [isNative]
  );

  /**
   * Cancel timer notification
   */
  const cancelTimerNotification = useCallback(async () => {
    if (!isNative) return;

    try {
      await LocalNotifications.cancel({
        notifications: [{ id: TIMER_NOTIFICATION_ID }],
      });
    } catch (error) {
      console.error('Error canceling timer notification:', error);
    }
  }, [isNative]);

  /**
   * Cancel all notifications
   */
  const cancelAllNotifications = useCallback(async () => {
    if (!isNative) return;

    try {
      await LocalNotifications.cancel({
        notifications: [
          { id: TIMER_NOTIFICATION_ID },
          { id: ALARM_NOTIFICATION_ID },
        ],
      });
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }, [isNative]);

  /**
   * Handle notification action taps
   */
  useEffect(() => {
    if (!isNative) return;

    const handleActionPerformed = (action: ActionPerformed) => {
      console.log('Notification action:', action);

      // Stop alarm sound if playing
      if (soundPlayer.isPlaying()) {
        soundPlayer.stopSound();
      }

      switch (action.actionId) {
        case NOTIFICATION_ACTIONS.PAUSE:
          onPause?.();
          Haptics.impact({ style: ImpactStyle.Medium });
          break;
        case NOTIFICATION_ACTIONS.RESUME:
          onResume?.();
          Haptics.impact({ style: ImpactStyle.Medium });
          break;
        case NOTIFICATION_ACTIONS.BREAK:
          onBreak?.();
          Haptics.impact({ style: ImpactStyle.Medium });
          break;
        case NOTIFICATION_ACTIONS.STOP:
          onStop?.();
          Haptics.impact({ style: ImpactStyle.Heavy });
          break;
        case NOTIFICATION_ACTIONS.COMPLETE:
          onComplete?.();
          Haptics.impact({ style: ImpactStyle.Heavy });
          break;
        case 'tap':
          // User tapped the notification body - bring app to foreground
          if (action.notification.extra?.type === 'completion') {
            soundPlayer.stopSound();
          }
          break;
      }
    };

    const listener = LocalNotifications.addListener(
      'localNotificationActionPerformed',
      handleActionPerformed
    );

    return () => {
      listener.remove();
    };
  }, [isNative, onPause, onResume, onBreak, onStop, onComplete]);

  return {
    requestPermissions,
    showTimerNotification,
    showCompletionNotification,
    cancelTimerNotification,
    cancelAllNotifications,
    isNative,
  };
}
