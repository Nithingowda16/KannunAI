import React from 'react';
import { Logo } from '../ui/Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[var(--border-panel)] bg-[var(--bg-base)] py-16 text-[var(--text-secondary)] text-xs transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[var(--text-primary)]">KannunAI Platform</h4>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Empowering users to navigate, compare, and understand complex legal documents with grounded AI assistance.
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="font-semibold text-[var(--text-primary)]">Security & Privacy</h5>
            <ul className="space-y-2 text-[var(--text-secondary)]">
              <li>Ephemeral Data Minimization</li>
              <li>Prompt Injection Shields</li>
              <li>No Persistent Document Logging</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-semibold text-[var(--text-primary)]">Accessibility & Quality</h5>
            <ul className="space-y-2 text-[var(--text-secondary)]">
              <li>Target WCAG 2.2 AA Compliance</li>
              <li>Non-Color Risk Dual Encoding</li>
              <li>Screen Reader Live Regions</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-semibold text-[var(--text-primary)]">Responsible AI</h5>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              KannunAI provides document information and research assistance. It does not provide legal advice or replace a licensed legal professional.
            </p>
          </div>
        </div>

        {/* Centered Website Brand & Copyright Bar */}
        <div className="border-t border-[var(--border-subtle)] pt-8 flex flex-col items-center justify-center space-y-3 text-center text-[var(--text-tertiary)]">
          <Logo size="md" showText={true} />
          <p>© 2026 KannunAI. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};
