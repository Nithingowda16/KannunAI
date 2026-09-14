import React, { useState, useMemo } from 'react';
import { CheckSquare, Square, CheckCircle2, AlertCircle, Filter } from 'lucide-react';
import { ChecklistItem, ChecklistActionType } from '../../types/checklist';
import { Progress } from '../ui/Progress';
import { Badge } from '../ui/Badge';

export interface ChecklistViewProps {
  items: ChecklistItem[];
}

const ACTION_TYPE_COLORS: Record<ChecklistActionType, { variant: 'slate' | 'info' | 'medium' | 'success' | 'high'; label: string }> = {
  'Review': { variant: 'slate', label: 'Review' },
  'Clarify': { variant: 'info', label: 'Clarify' },
  'Negotiate': { variant: 'medium', label: 'Negotiate' },
  'Confirm': { variant: 'success', label: 'Confirm' },
  'Ask a Lawyer': { variant: 'high', label: 'Ask a Lawyer' },
};

export const ChecklistView: React.FC<ChecklistViewProps> = ({ items: initialItems }) => {
  const [items, setItems] = useState<ChecklistItem[]>(initialItems);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newState = !(item.isCompleted || item.isChecked);
          return { ...item, isCompleted: newState, isChecked: newState };
        }
        return item;
      })
    );
  };

  const completedCount = items.filter((i) => i.isCompleted || i.isChecked).length;
  const progressPercent = Math.round((completedCount / Math.max(1, items.length)) * 100);

  const availableActionTypes = useMemo(() => {
    const types = new Set<string>();
    items.forEach((item) => {
      if (item.actionType) types.add(item.actionType);
    });
    return Array.from(types);
  }, [items]);

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return items;
    return items.filter((item) => item.actionType === activeFilter || item.category === activeFilter);
  }, [items, activeFilter]);

  return (
    <div className="space-y-6">
      {/* Header & Progress Bar */}
      <div className="glass-panel p-6 rounded-2xl border border-[var(--border-panel)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-[var(--apple-emerald-text)]" />
              Actionable Pre-Signing Checklist
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Practical steps categorized by action required: Review, Clarify, Negotiate, Confirm, or Ask a Lawyer before executing.
            </p>
          </div>
          <Badge variant="success">
            {completedCount} of {items.length} Completed
          </Badge>
        </div>

        <Progress value={progressPercent} label="Pre-Signing Readiness Score" />

        {/* Action Type Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] mr-2">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter by Action:</span>
          </div>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              activeFilter === 'all'
                ? 'bg-[var(--apple-blue-bg)] text-[var(--apple-blue-text)] border border-[var(--apple-blue-border)] font-semibold'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-panel)]'
            }`}
          >
            All ({items.length})
          </button>
          {availableActionTypes.map((actionType) => {
            const count = items.filter((i) => i.actionType === actionType).length;
            const isSelected = activeFilter === actionType;
            return (
              <button
                key={actionType}
                onClick={() => setActiveFilter(actionType)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                  isSelected
                    ? 'bg-[var(--apple-blue-bg)] text-[var(--apple-blue-text)] border border-[var(--apple-blue-border)] font-semibold'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-panel)]'
                }`}
              >
                {actionType} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--text-secondary)] glass-panel rounded-xl border border-[var(--border-panel)]">
            No checklist items match the selected action filter.
          </div>
        ) : (
          filteredItems.map((item) => {
            const isDone = item.isCompleted || item.isChecked;
            const labelText = item.itemText || item.label || 'Checklist Item';
            const actionConfig = item.actionType && ACTION_TYPE_COLORS[item.actionType]
              ? ACTION_TYPE_COLORS[item.actionType]
              : { variant: 'slate' as const, label: item.actionType || item.category };

            return (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`glass-panel p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                  isDone
                    ? 'bg-[var(--apple-emerald-bg)] border-[var(--apple-emerald-border)] opacity-75'
                    : 'border-[var(--border-panel)] hover:border-[var(--border-subtle)] bg-[var(--bg-secondary)]'
                }`}
              >
                <button
                  type="button"
                  aria-label={`Toggle checklist item: ${labelText}`}
                  className="mt-0.5 text-[var(--apple-emerald-text)] focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleItem(item.id);
                  }}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-5 w-5 text-[var(--apple-emerald-text)]" />
                  ) : (
                    <Square className="h-5 w-5 text-[var(--text-tertiary)]" />
                  )}
                </button>

                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4
                      className={`text-sm font-bold ${
                        isDone ? 'text-[var(--text-secondary)] line-through' : 'text-[var(--text-primary)]'
                      }`}
                    >
                      {labelText}
                    </h4>
                    <div className="flex items-center gap-1.5">
                      {item.actionType && (
                        <Badge variant={actionConfig.variant}>
                          {item.actionType}
                        </Badge>
                      )}
                      <Badge variant="slate">{item.category}</Badge>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {item.description || item.itemText}
                  </p>

                  {item.linkedFinding && (
                    <div className="mt-2 text-xs flex items-center gap-1.5 text-[var(--text-tertiary)] bg-[var(--bg-primary)] px-2.5 py-1 rounded-md border border-[var(--border-subtle)]">
                      <AlertCircle className="h-3 w-3 text-[var(--apple-amber-text)] shrink-0" />
                      <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                        <strong>Contract Context:</strong> {item.linkedFinding}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

