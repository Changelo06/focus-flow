import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ cancel: vi.fn(async () => {}), schedule: vi.fn(async () => {}),
  checkPermissions: vi.fn(async () => ({ display: 'granted' })), checkExactNotificationSetting: vi.fn(async () => ({ exact_alarm: 'granted' })) }));
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => true, getPlatform: () => 'android' } }));
vi.mock('@capacitor/local-notifications', () => ({ LocalNotifications: mocks }));
import { syncAlarm } from '@/lib/timerAlarm';
import { emptyTimer } from '@/lib/timerState';
beforeEach(() => vi.clearAllMocks());
describe('native completion alarms', () => {
  it('does not cancel the completion alarm at its natural deadline', async () => {
    await syncAlarm({ ...emptyTimer(60), status: 'completed', elapsed: 60 });
    expect(mocks.cancel).toHaveBeenCalledWith({ notifications: [{ id: 1 }] });
    expect(mocks.schedule).not.toHaveBeenCalled();
  });
  it('schedules a future deadline and cancels when paused', async () => {
    const active = { ...emptyTimer(60), status: 'focus' as const, anchor: Date.now(), startedAt: Date.now() };
    await syncAlarm(active);
    expect(mocks.schedule).toHaveBeenCalledWith(expect.objectContaining({ notifications: [expect.objectContaining({ schedule: { at: new Date(active.anchor + 60000), allowWhileIdle: true } })] }));
    await syncAlarm({ ...active, paused: true, anchor: null });
    expect(mocks.cancel).toHaveBeenCalledTimes(2);
    expect(mocks.schedule).toHaveBeenCalledTimes(1);
  });
  it('explains denied permission and does not schedule', async () => {
    mocks.checkPermissions.mockResolvedValueOnce({ display: 'denied' });
    expect(await syncAlarm({ ...emptyTimer(), status: 'focus', anchor: Date.now() })).toContain('Enable notifications');
    expect(mocks.schedule).not.toHaveBeenCalled();
  });
  it('reports the inexact fallback when exact permission is denied', async () => {
    mocks.checkExactNotificationSetting.mockResolvedValueOnce({ exact_alarm: 'denied' });
    expect(await syncAlarm({ ...emptyTimer(), status: 'focus', anchor: Date.now() })).toContain('may otherwise be delayed');
    expect(mocks.schedule).toHaveBeenCalledTimes(1);
  });
});
