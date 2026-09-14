import React from 'react';
import { clsx } from 'clsx';

export interface TabOption {
  id: string;
  label: string;
  badge?: string | number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabOption[];
  activeTab: string;
  onChange: (id: string) => void;
  ariaLabel?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, ariaLabel = 'Navigation tabs' }) => {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="flex items-center gap-1 p-1 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-full overflow-x-auto"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--apple-blue)]',
              isActive
                ? 'bg-[var(--apple-blue)] text-white shadow-sm font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
            )}
          >
            {tab.icon && <span aria-hidden="true">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={clsx(
                  'px-2 py-0.5 text-[10px] font-bold rounded-full',
                  isActive ? 'bg-white/20 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
