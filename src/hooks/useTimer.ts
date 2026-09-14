import { useEffect, useRef, useState } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { advance, emptyTimer, finish, TIMER_KEY, TimerStore } from '@/lib/timerState';
import { syncAlarm, requestAlarmPermissions } from '@/lib/timerAlarm';
import { soundPlayer } from '@/utils/soundPlayer';

export interface UseTimerProps {
  initialDuration?: number;
  onSessionComplete?: (type: 'focus' | 'break', taskId?: string | null) => void;
}
function titleFor(id: string | null) {
  if (!id) return 'Unassigned focus';
  try { return JSON.parse(localStorage.getItem('lockin-tasks') || '[]').find((t: { id: string }) => t.id === id)?.title || 'Deleted task'; }
  catch { return 'Linked task'; }
}
export function useTimer(props?: UseTimerProps) {
  const duration = props?.initialDuration ?? 1500;
  const [store, setStore] = useState<TimerStore>(() => {
    const raw = localStorage.getItem(TIMER_KEY);
    if (raw) {
      try {
        const saved = JSON.parse(raw);
        if (saved.version === 1 && Array.isArray(saved.history) && saved.active && Number.isFinite(saved.active.duration) && saved.active.duration > 0 && Array.isArray(saved.active.segments)) return saved;
      } catch { /* Retain the original payload for recovery. */ }
      localStorage.setItem(`${TIMER_KEY}-recovery-${Date.now()}`, raw);
    }
    return { version: 1, active: emptyTimer(duration), history: [] };
  });
  const current = useRef(store);
  const callback = useRef(props?.onSessionComplete);
  callback.current = props?.onSessionComplete;
  const [alarmMessage, setAlarmMessage] = useState('');
  // A single storage write commits history and active state together; rendering never logs time.
  const commit = (next: TimerStore, alarm = false) => {
    try { localStorage.setItem(TIMER_KEY, JSON.stringify(next)); }
    catch { setAlarmMessage('Device storage is full. Keep the app open and free space to save your session.'); }
    current.current = next;
    setStore(next);
    if (alarm) void syncAlarm(next.active).then(setAlarmMessage);
  };
  const reconcile = () => {
    const previous = current.current;
    const active = advance(previous.active, Date.now());
    if (active.status !== 'completed' && active.elapsed >= active.duration) {
      commit(finish({ ...previous, active }, Date.now(), titleFor(active.taskId)), true);
      if (!document.hidden) {
        if (!Capacitor.isNativePlatform()) void soundPlayer.playRingtone();
        callback.current?.(active.status as 'focus' | 'break', active.taskId);
      }
    } else if (active !== previous.active) commit({ ...previous, active });
  };
  const reconcileRef = useRef(reconcile);
  reconcileRef.current = reconcile;
  useEffect(() => {
    reconcileRef.current();
    void syncAlarm(current.current.active).then(setAlarmMessage);
    const tick = setInterval(() => reconcileRef.current(), 1000);
    const visible = () => { reconcileRef.current(); if (!document.hidden) void syncAlarm(current.current.active).then(setAlarmMessage); };
    document.addEventListener('visibilitychange', visible);
    const listener = Capacitor.isNativePlatform() ? App.addListener('appStateChange', visible) : null;
    return () => { clearInterval(tick); document.removeEventListener('visibilitychange', visible); void listener?.then(handle => handle.remove()); };
  }, []);
  const change = (action: 'focus' | 'break' | 'pause' | 'resume' | 'end', taskId?: string | null) => {
    reconcile();
    const previous = current.current;
    let active = advance(previous.active, Date.now());
    if (active.status === 'completed') return;
    if (action === 'end') { commit(finish({ ...previous, active }, Date.now(), titleFor(active.taskId)), true); return; }
    if (active.status === 'idle' && action !== 'focus') return;
    if (action === 'pause') active = { ...active, paused: true, anchor: null };
    else active = { ...active, status: action === 'resume' ? active.status : action,
      taskTitle: active.taskTitle ?? titleFor(taskId !== undefined ? taskId : active.taskId),
      taskId: active.status === 'idle' && taskId !== undefined ? taskId : active.taskId,
      startedAt: active.startedAt ?? Date.now(), anchor: Date.now(), paused: false };
    commit({ ...previous, active }, true);
  };
  const startFocus = async (id?: string | null) => {
    change('focus', id);
    await requestAlarmPermissions();
    setAlarmMessage(await syncAlarm(current.current.active));
  };
  const reset = (newDuration = duration) => {
    change('end'); soundPlayer.stopSound();
    commit({ ...current.current, active: emptyTimer(newDuration) }, true);
  };
  const session = store.active;
  return { session, history: store.history, alarmMessage,
    timeRemaining: Math.max(0, Math.ceil(session.duration - session.elapsed)), progress: session.elapsed / session.duration * 100,
    isPaused: session.paused, startFocus, startBreak: () => change('break'), resumeFocus: () => change('focus'),
    pause: () => change('pause'), resume: () => change('resume'), stop: () => change('end'), completeEarly: () => change('end'), reset,
    setDuration: (value: number) => { if (session.status === 'idle' && Number.isFinite(value) && value > 0) commit({ ...current.current, active: { ...session, duration: value } }); },
    setTaskId: (id: string | null) => { if (session.status === 'idle') commit({ ...current.current, active: { ...session, taskId: id } }); },
  };
}
