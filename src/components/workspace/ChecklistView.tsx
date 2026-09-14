import React, { useState } from 'react';
import { CheckSquare, Square, CheckCircle2 } from 'lucide-react';
import { ChecklistItem } from '../../types/checklist';
import { Progress } from '../ui/Progress';
import { Badge } from '../ui/Badge';

export interface ChecklistViewProps {
  items: ChecklistItem[];
}

export const ChecklistView: React.FC<ChecklistViewProps> = ({ items: initialItems }) => {
  const [items, setItems] = useState<ChecklistItem[]>(initialItems);

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

  return (
    <div className="space-y-6">
      {/* Header & Progress Bar */}
      <div className="glass-panel p-6 rounded-2xl border border-[var(--border-panel)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-[var(--apple-emerald-text)]" />
              Actionable Pre-Signing Checklist
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Verify essential clauses, payment terms, and notice windows before signing.
            </p>
          </div>
          <Badge variant="success">
            {completedCount} of {items.length} Completed
          </Badge>
        </div>

        <Progress value={progressPercent} label="Pre-Signing Readiness Score" />
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {items.map((item) => {
          const isDone = item.isCompleted || item.isChecked;
          const labelText = item.itemText || item.label || 'Checklist Item';
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
                aria-label={`Toggle checklist item: ${labelText}`}
                className="mt-0.5 text-[var(--apple-emerald-text)] focus:outline-none"
              >
                {isDone ? (
                  <CheckCircle2 className="h-5 w-5 text-[var(--apple-emerald-text)]" />
                ) : (
                  <Square className="h-5 w-5 text-[var(--text-tertiary)]" />
                )}
              </button>

              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h4
                    className={`text-sm font-bold ${
                      isDone ? 'text-[var(--text-secondary)] line-through' : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {labelText}
                  </h4>
                  <Badge variant="slate">{item.category}</Badge>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.description || item.itemText}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
