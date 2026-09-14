import React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, hoverable = false, className, ...props }) => {
  return (
    <div
      className={clsx(
        'glass-panel rounded-3xl p-6 border border-[var(--border-panel)] text-[var(--text-primary)] transition-all duration-300',
        hoverable && 'glass-panel-hover cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
