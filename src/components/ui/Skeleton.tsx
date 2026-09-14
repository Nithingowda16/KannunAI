import React from 'react';

export interface SkeletonProps {
  className?: string;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = 'h-4 w-full', lines = 1 }) => {
  return (
    <div className="space-y-2.5 w-full" aria-busy="true" aria-label="Loading content...">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-slate-800/80 rounded-lg ${className} ${
            i === lines - 1 && lines > 1 ? 'w-3/4' : ''
          }`}
        />
      ))}
    </div>
  );
};
