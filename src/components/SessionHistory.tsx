import { useState } from 'react';
import { SessionRecord } from '@/lib/timerState';
import { Button } from './ui/button';
import { Input } from './ui/input';
function formatTime(seconds: number) {
  const value = Math.floor(seconds);
  return `${Math.floor(value / 3600)}h ${Math.floor(value % 3600 / 60)}m ${value % 60}s`;
}
export function SessionHistory({ history }: { history: SessionRecord[] }) {
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(30);
  const records = [...history].filter(s => s.taskTitle.toLowerCase().includes(query.toLowerCase())).sort((a, b) => b.startedAt - a.startedAt);
  const days = new Map<string, SessionRecord[]>();
  for (const record of records.slice(0, limit)) {
    const day = new Date(record.startedAt).toLocaleDateString();
    days.set(day, [...(days.get(day) ?? []), record]);
  }
  return <div className="pt-10 pb-28 space-y-5">
    <h1 className="text-2xl font-bold">Session history</h1>
    <p className="text-sm text-muted-foreground">Actual focus and break time, excluding pauses. Sessions are grouped by their local start date. Earlier task totals are preserved; detailed history starts with this patch.</p>
    <Input aria-label="Search session history" placeholder="Search by task" value={query} onChange={e => { setQuery(e.target.value); setLimit(30); }} />
    {!records.length && <p className="py-10 text-center text-muted-foreground">No sessions to show.</p>}
    {[...days].map(([day, sessions]) => <section key={day} className="space-y-3">
      <h2 className="font-semibold">{day}</h2>
      {sessions.map(record => <article key={record.id} className="rounded-xl border p-4 space-y-2">
        <h3 className="font-medium break-words">{record.taskTitle}</h3>
        <p className="text-xs text-muted-foreground">{new Date(record.startedAt).toLocaleString()} – {new Date(record.endedAt).toLocaleString()}</p>
        <p className="text-sm">Focus {formatTime(record.focusTime)} · Break {formatTime(record.breakTime)}</p>
        <p className="text-xs text-muted-foreground">{record.outcome === 'completed' ? 'Completed session' : 'Ended early'}</p>
      </article>)}
    </section>)}
    {records.length > limit && <Button variant="outline" onClick={() => setLimit(limit + 30)}>Show more sessions</Button>}
  </div>;
}
