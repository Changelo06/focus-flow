import { expect, it } from 'vitest';
import { timeInRange } from '@/lib/sessionStats';
import { SessionRecord } from '@/lib/timerState';
it('splits sessions across local midnight without assigning time to task creation', () => {
  const midnight = new Date(2026, 8, 15).getTime();
  const history: SessionRecord[] = [{ id: 's', taskId: null, taskTitle: 'Unassigned focus', startedAt: midnight - 60000, endedAt: midnight + 60000,
    focusTime: 90, breakTime: 30, outcome: 'completed', segments: [
      { type: 'focus', start: midnight - 60000, end: midnight + 30000 },
      { type: 'break', start: midnight + 30000, end: midnight + 60000 } ] }];
  expect(timeInRange(history, midnight - 86400000, midnight)).toEqual({ focus: 60, rest: 0 });
  expect(timeInRange(history, midnight, midnight + 86400000)).toEqual({ focus: 30, rest: 30 });
});
