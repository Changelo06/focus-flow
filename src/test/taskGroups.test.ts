import { describe, expect, it } from 'vitest';
import { groupFor, sortTasks } from '@/lib/taskGroups';
import { Task } from '@/types';
const now = new Date(2026, 8, 14, 12);
const task = (deadline: Date | null, extra: Partial<Task> = {}): Task => ({ id: 't', title: 'Task', description: '', createdAt: now, deadline, completed: false, focusTime: 0, breakTime: 0, ...extra });
describe('task groups', () => {
  it('uses due time, local calendar date and optional deadlines', () => {
    expect(groupFor(task(new Date(2026, 8, 14, 11)), now)).toBe('Overdue');
    expect(groupFor(task(new Date(2026, 8, 14, 13)), now)).toBe('Today');
    expect(groupFor(task(new Date(2026, 8, 15)), now)).toBe('Upcoming');
    expect(groupFor(task(null), now)).toBe('Anytime');
    expect(groupFor(task(null, { completed: true }), now)).toBe('Completed');
  });
  it('sorts completed tasks by actual completion rather than deadline', () => {
    const old = task(new Date(2027, 0, 1), { id: 'old', completed: true, completedAt: new Date(2026, 8, 12) });
    const recent = task(null, { id: 'new', completed: true, completedAt: now });
    expect(sortTasks([old, recent], 'Completed').map(t => t.id)).toEqual(['new', 'old']);
  });
});
