import { cn } from '@/lib/utils';

interface DurationSelectorProps {
  duration: number;
  onDurationChange: (duration: number) => void;
  disabled?: boolean;
}

const presets = [
  { label: '15m', value: 15 * 60 },
  { label: '25m', value: 25 * 60 },
  { label: '45m', value: 45 * 60 },
  { label: '60m', value: 60 * 60 },
  { label: '90m', value: 90 * 60 },
];

export function DurationSelector({ duration, onDurationChange, disabled }: DurationSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      {presets.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => onDurationChange(value)}
          disabled={disabled}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
            duration === value 
              ? "bg-primary text-primary-foreground" 
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
