import { TimerSession } from '@/types';
export interface RecordedSegment { type: 'focus' | 'break'; start: number; end: number }
export interface ActiveTimer extends TimerSession {
  taskTitle?: string;
  id: string; startedAt: number | null; anchor: number | null;
  paused: boolean; segments: RecordedSegment[];
}
export interface SessionRecord {
  id: string; taskId: string | null; taskTitle: string; startedAt: number; endedAt: number;
  focusTime: number; breakTime: number; outcome: 'completed' | 'ended-early'; segments: RecordedSegment[];
}
export interface TimerStore { version: 1; active: ActiveTimer; history: SessionRecord[] }
export const TIMER_KEY = 'lockin-timer-v1';
export function emptyTimer(duration = 1500): ActiveTimer {
  return { id: crypto.randomUUID(), taskId: null, duration, elapsed: 0, status: 'idle',
    focusSegments: [], breakSegments: [], startedAt: null, anchor: null, paused: false, segments: [] };
}
export function advance(timer: ActiveTimer, now: number): ActiveTimer {
  if (timer.anchor === null || timer.paused || !['focus', 'break'].includes(timer.status)) return timer;
  const seconds = Math.min(Math.max(0, (now - timer.anchor) / 1000), timer.duration - timer.elapsed);
  if (seconds <= 0) return timer;
  const end = timer.anchor + seconds * 1000;
  const segments = [...timer.segments];
  const last = segments[segments.length - 1];
  const type = timer.status as 'focus' | 'break';
  if (last?.type === type && last.end === timer.anchor) segments[segments.length - 1] = { ...last, end };
  else segments.push({ type, start: timer.anchor, end });
  let elapsed = 0;
  const focusSegments = [], breakSegments = [];
  for (const segment of segments) {
    const start = elapsed / timer.duration * 100;
    elapsed += (segment.end - segment.start) / 1000;
    (segment.type === 'focus' ? focusSegments : breakSegments).push({ start, end: elapsed / timer.duration * 100 });
  }
  return { ...timer, elapsed: Math.min(timer.duration, timer.elapsed + seconds), anchor: end, segments, focusSegments, breakSegments };
}
export function finish(store: TimerStore, now: number, taskTitle: string): TimerStore {
  const active = advance(store.active, now);
  if (active.startedAt === null || active.status === 'completed' || active.status === 'idle') return store;
  const total = (type: string) => active.segments.filter(s => s.type === type).reduce((sum, s) => sum + (s.end - s.start) / 1000, 0);
  const record: SessionRecord = { id: active.id, taskId: active.taskId, taskTitle: active.taskTitle ?? taskTitle,
    startedAt: active.startedAt, endedAt: active.elapsed >= active.duration ? active.anchor ?? now : now,
    focusTime: total('focus'), breakTime: total('break'), segments: active.segments,
    outcome: active.elapsed >= active.duration ? 'completed' : 'ended-early' };
  return { ...store, active: { ...active, status: 'completed', anchor: null, paused: false },
    history: store.history.some(s => s.id === active.id) ? store.history : [...store.history, record] };
}
