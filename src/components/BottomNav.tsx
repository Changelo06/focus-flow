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
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border">
      <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              "flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all duration-200",
              activeTab === id
                ? "text-primary bg-secondary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className={cn(
              "w-6 h-6 transition-transform",
              activeTab === id && "scale-110"
            )} />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
