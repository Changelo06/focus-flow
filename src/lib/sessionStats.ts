import { SessionRecord } from './timerState';
export function dayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function timeInRange(history: SessionRecord[], start: number, end: number) {
  let focus = 0, rest = 0;
  for (const record of history) for (const segment of record.segments) {
    const seconds = Math.max(0, Math.min(end, segment.end) - Math.max(start, segment.start)) / 1000;
    if (segment.type === 'focus') focus += seconds; else rest += seconds;
  }
  return { focus, rest };
}
