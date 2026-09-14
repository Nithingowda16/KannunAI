import React from 'react';

export interface ProgressProps {
  value: number; // 0 to 100
  label?: string;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({ value, label, className = '' }) => {
  const percentage = Math.min(100, Math.max(0, value));

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {label && (
        <div className="flex justify-between text-xs font-medium text-slate-300">
          <span>{label}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress bar'}
      >
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
