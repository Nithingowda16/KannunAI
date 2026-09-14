import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div
      role="region"
      aria-label="Legal Disclaimer"
      className="bg-[var(--apple-amber-bg)] border-b border-[var(--apple-amber-border)] text-[var(--apple-amber-text)] px-4 py-2 text-xs text-center flex items-center justify-center gap-2 font-medium"
    >
      <ShieldAlert className="h-4 w-4 text-[var(--apple-amber-text)] flex-shrink-0" aria-hidden="true" />
      <span>
        <strong>Responsible AI Disclosure:</strong> KannunAI provides legal document intelligence and general information. It does <strong>not</strong> provide legal advice and does <strong>not</strong> replace a qualified legal professional.
      </span>
    </div>
  );
};
