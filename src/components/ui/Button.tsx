import React from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex flex-row items-center justify-center font-medium rounded-full whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    primary: 'bg-[var(--apple-blue)] hover:bg-[var(--apple-blue-hover)] text-white shadow-sm border border-transparent',
    secondary: 'bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] border border-transparent',
    outline: 'bg-[var(--btn-outline-bg)] text-[var(--btn-outline-text)] border border-[var(--btn-outline-border)] hover:bg-[var(--btn-outline-hover)] hover:border-[var(--apple-blue)]',
    danger: 'bg-[var(--apple-rose)] hover:brightness-110 text-white shadow-sm border border-transparent',
    ghost: 'bg-transparent hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-transparent'
  };

  const sizes = {
    sm: 'px-4 py-1.5 text-xs gap-2 min-h-[34px]',
    md: 'px-5 py-2.5 text-sm gap-2 min-h-[40px]',
    lg: 'px-7 py-3 text-base gap-2.5 min-h-[46px]'
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4 text-current flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <>
          {leftIcon && <span aria-hidden="true" className="inline-flex items-center justify-center flex-shrink-0">{leftIcon}</span>}
          <span className="whitespace-nowrap inline-block">{children}</span>
          {rightIcon && <span aria-hidden="true" className="inline-flex items-center justify-center flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
