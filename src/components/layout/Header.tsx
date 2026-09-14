import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Logo } from '../ui/Logo';

export interface HeaderProps {
  activeView: 'landing' | 'workspace' | 'compare';
  onNavigate: (view: 'landing' | 'workspace' | 'compare') => void;
  onTryDemo: () => void;
  hasAnalyzedDoc?: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onNavigate,
  onTryDemo,
  hasAnalyzedDoc,
  theme,
  onToggleTheme
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-panel)] backdrop-blur-2xl border-b border-[var(--border-panel)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Brand Identity */}
        <button
          onClick={() => onNavigate('landing')}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--apple-blue)] rounded-xl text-left flex-shrink-0"
          aria-label="KannunAI Home"
        >
          <Logo size="md" />
        </button>

        {/* Clean Text Navigation Links (Apple Style - Normal Clickable Text) */}
        <nav aria-label="Main navigation" className="flex items-center gap-6 flex-shrink-0">
          <button
            onClick={() => onNavigate('landing')}
            className={`text-sm font-medium transition-colors focus-visible:outline-none focus-visible:underline ${
              activeView === 'landing'
                ? 'text-[var(--apple-blue-text)] font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Home
          </button>

          {hasAnalyzedDoc && (
            <button
              onClick={() => onNavigate('workspace')}
              className={`text-sm font-medium transition-colors focus-visible:outline-none focus-visible:underline ${
                activeView === 'workspace'
                  ? 'text-[var(--apple-blue-text)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Document Workspace
            </button>
          )}

          <button
            onClick={() => onNavigate('compare')}
            className={`text-sm font-medium transition-colors focus-visible:outline-none focus-visible:underline ${
              activeView === 'compare'
                ? 'text-[var(--apple-blue-text)] font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Compare Contracts
          </button>

          <Button
            variant="primary"
            size="sm"
            onClick={onTryDemo}
            className="hidden sm:inline-flex px-4 py-1.5 text-xs font-medium"
          >
            1-Click Demo
          </Button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            className="ml-1 p-2 rounded-full bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--apple-blue)] flex-shrink-0"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
          </button>
        </nav>
      </div>
    </header>
  );
};
