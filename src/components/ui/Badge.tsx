import React from 'react';
import { clsx } from 'clsx';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'low' | 'medium' | 'high' | 'info' | 'success' | 'slate';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'info', icon, className, ...props }) => {
  const variants = {
    high: 'bg-[var(--apple-rose-bg)] text-[var(--apple-rose-text)] border-[var(--apple-rose-border)]',
    medium: 'bg-[var(--apple-amber-bg)] text-[var(--apple-amber-text)] border-[var(--apple-amber-border)]',
    low: 'bg-[var(--apple-emerald-bg)] text-[var(--apple-emerald-text)] border-[var(--apple-emerald-border)]',
    info: 'bg-[var(--apple-blue-bg)] text-[var(--apple-blue-text)] border-[var(--apple-blue-border)]',
    success: 'bg-[var(--apple-emerald-bg)] text-[var(--apple-emerald-text)] border-[var(--apple-emerald-border)]',
    slate: 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-panel)]'
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border leading-none whitespace-nowrap',
        variants[variant],
        className
      )}
      {...props}
    >
      {icon && <span aria-hidden="true" className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
