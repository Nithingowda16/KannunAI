import React from 'react';
import { FileSearch } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Document Selected',
  description = 'Upload a legal document (PDF, DOCX, TXT) or try our sample agreement to see plain-language analysis.',
  icon = <FileSearch className="h-12 w-12 text-indigo-400 stroke-1" />,
  actionLabel,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-10 glass-panel rounded-2xl border border-dashed border-slate-800 my-6">
      <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 mb-4 shadow-inner">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-100 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
