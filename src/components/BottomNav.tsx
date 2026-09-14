import { Timer, ListTodo, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  activeTab: 'timer' | 'tasks' | 'stats';
  onTabChange: (tab: 'timer' | 'tasks' | 'stats') => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'timer' as const, icon: Timer, label: 'Focus' },
    { id: 'tasks' as const, icon: ListTodo, label: 'Tasks' },
    { id: 'stats' as const, icon: BarChart3, label: 'Stats' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border shadow-soft" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around py-2 px-4 max-w-lg mx-auto">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              "flex flex-col items-center gap-1 px-5 py-2.5 rounded-xl transition-all duration-200",
              activeTab === id
                ? "text-primary bg-secondary/80"
                : "text-muted-foreground/70 hover:text-foreground hover:bg-secondary/40"
            )}
          >
            <Icon className={cn(
              "w-5 h-5 transition-transform duration-200",
              activeTab === id && "scale-105"
            )} />
            <span className={cn(
              "text-[10px] font-medium uppercase tracking-wide",
              activeTab === id ? "opacity-100" : "opacity-70"
            )}>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
