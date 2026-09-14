import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { clsx } from 'clsx';

export interface AlertProps {
  type?: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ type = 'info', title, children, className }) => {
  const styles = {
    info: 'bg-indigo-950/40 border-indigo-800/60 text-indigo-200 icon-indigo-400',
    warning: 'bg-amber-950/40 border-amber-800/60 text-amber-200 icon-amber-400',
    error: 'bg-rose-950/40 border-rose-800/60 text-rose-200 icon-rose-400',
    success: 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200 icon-emerald-400'
  };

  const icons = {
    info: <Info className="h-5 w-5 text-indigo-400 flex-shrink-0" aria-hidden="true" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0" aria-hidden="true" />,
    error: <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0" aria-hidden="true" />,
    success: <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" aria-hidden="true" />
  };

  return (
    <div
      role="alert"
      className={clsx('rounded-xl border p-4 flex gap-3 text-sm leading-relaxed', styles[type], className)}
    >
      {icons[type]}
      <div className="flex-1 space-y-1">
        {title && <h4 className="font-semibold text-slate-100">{title}</h4>}
        <div>{children}</div>
      </div>
    </div>
  );
};
