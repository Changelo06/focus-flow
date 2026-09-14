import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { ActiveTimer } from './timerState';
// Serialize writes so a slow schedule cannot recreate an alarm after pause/reset.
let queue: Promise<string> = Promise.resolve('');
export async function requestAlarmPermissions() {
  if (!Capacitor.isNativePlatform()) return;
  try { await LocalNotifications.requestPermissions(); } catch { /* Reported by syncAlarm. */ }
}
export function syncAlarm(active: ActiveTimer): Promise<string> {
  if (!Capacitor.isNativePlatform()) return Promise.resolve('');
  queue = queue.then(async () => {
    // Do not race Android's delivery by cancelling an alarm at its natural deadline.
    const naturalCompletion = active.status === 'completed' && active.elapsed >= active.duration;
    await LocalNotifications.cancel({ notifications: naturalCompletion ? [{ id: 1 }] : [{ id: 1 }, { id: 2 }] });
    if (active.anchor === null || active.paused || active.status === 'completed') return '';
    if ((await LocalNotifications.checkPermissions()).display !== 'granted') return 'Enable notifications to receive the timer completion alert outside the app.';
    const at = active.anchor + (active.duration - active.elapsed) * 1000;
    if (at <= Date.now()) return '';
    const exact = Capacitor.getPlatform() !== 'android' || (await LocalNotifications.checkExactNotificationSetting()).exact_alarm === 'granted';
    await LocalNotifications.schedule({ notifications: [{ id: 2, title: 'Session complete',
      body: 'Your timer has finished. Open Study Track to review your focus and break time.',
      schedule: { at: new Date(at), allowWhileIdle: true } }] });
    return exact ? '' : 'For timely alerts, enable Alarms & reminders for Study Track in Android settings. Alerts may otherwise be delayed.';
  }).catch(() => 'The completion alert could not be scheduled. Your timer still tracks elapsed time. Check notification permissions.');
  return queue;
}
