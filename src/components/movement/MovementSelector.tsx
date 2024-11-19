import { cn } from '../../lib/utils';
import { PerspectiveType } from '../../types';

interface MovementSelectorProps {
  value: PerspectiveType;
  onChange: (value: PerspectiveType) => void;
}

export function MovementSelector({ value, onChange }: MovementSelectorProps) {
  const options: { value: PerspectiveType; label: string }[] = [
    { value: 'rise', label: 'Rise Up' },
    { value: 'push-forward', label: 'Push Forward' },
    { value: 'reveal-up', label: 'Reveal Up' },
    { value: 'reveal-down', label: 'Reveal Down' },
    { value: 'rise-left', label: 'Rise Left' },
    { value: 'rise-right', label: 'Rise Right' },
    { value: 's-curve-left', label: 'S-Curve Left' },
    { value: 's-curve-right', label: 'S-Curve Right' },
    { value: 's-curve-up', label: 'S-Curve Up' },
    { value: 's-curve-down', label: 'S-Curve Down' },
  ];

  const handleChange = (newValue: PerspectiveType) => {
    onChange(newValue);
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => handleChange(option.value)}
          className={cn(
            "px-3 py-2 rounded-lg text-sm transition-colors",
            value === option.value
              ? "bg-primary text-white"
              : "bg-base-200 hover:bg-base-300 text-gray-300"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}