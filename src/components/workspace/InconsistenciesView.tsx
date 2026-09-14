import React from 'react';
import { AlertOctagon, CheckCircle } from 'lucide-react';
import { LegalInconsistencyItem } from '../../types/inconsistency';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export interface InconsistenciesViewProps {
  inconsistencies?: LegalInconsistencyItem[];
  onSelectCitation?: (range: { startChar: number; endChar: number; pageNumber?: number }) => void;
}

export const InconsistenciesView: React.FC<InconsistenciesViewProps> = ({ inconsistencies = [] }) => {
  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass-panel p-6 rounded-2xl border border-[var(--border-panel)] space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-[var(--apple-amber-text)]" />
            Contractual Inconsistencies & Contradictions
          </h3>
          <Badge variant={inconsistencies.length > 0 ? 'high' : 'success'}>
            {inconsistencies.length} Detected
          </Badge>
        </div>
        <p className="text-xs text-[var(--text-secondary)]">
          Surfacing contradictory terms, overlapping survival clauses, and asymmetrical commitments across sections.
        </p>
      </div>

      {/* Inconsistencies List */}
      <div className="space-y-4">
        {inconsistencies.length === 0 ? (
          <Card className="p-8 text-center space-y-2 bg-[var(--apple-emerald-bg)] border-[var(--apple-emerald-border)]">
            <CheckCircle className="h-8 w-8 text-[var(--apple-emerald-text)] mx-auto" />
            <h4 className="text-sm font-bold text-[var(--apple-emerald-text)]">No Structural Contradictions Detected</h4>
            <p className="text-xs text-[var(--text-primary)] max-w-md mx-auto">
              Terms across termination, survival, payment, and restrictive covenants appear logically coherent in initial scans.
            </p>
          </Card>
        ) : (
          inconsistencies.map((inc) => (
            <Card key={inc.id} className="space-y-4 border-l-4 border-l-[var(--apple-amber)] rounded-2xl">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <h4 className="text-base font-bold text-[var(--text-primary)]">{inc.title}</h4>
                <Badge variant={inc.severity === 'high' ? 'high' : 'medium'}>
                  {inc.severity === 'high' ? 'High Concern' : 'Attention Area'}
                </Badge>
              </div>

              <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                {inc.description}
              </p>

              {/* Side-by-Side Contradicting Clauses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-subtle)] space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--apple-blue-text)] block">
                    Provision A: {inc.clauseA.title} ({inc.clauseA.section || 'Clause 1'})
                  </span>
                  <p className="text-xs font-mono text-[var(--text-secondary)] italic bg-[var(--bg-tertiary)] p-2.5 rounded-lg border border-[var(--border-subtle)]">
                    "{inc.clauseA.text}"
                  </p>
                </div>

                <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-subtle)] space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--apple-rose-text)] block">
                    Provision B: {inc.clauseB.title} ({inc.clauseB.section || 'Clause 2'})
                  </span>
                  <p className="text-xs font-mono text-[var(--text-secondary)] italic bg-[var(--bg-tertiary)] p-2.5 rounded-lg border border-[var(--border-subtle)]">
                    "{inc.clauseB.text}"
                  </p>
                </div>
              </div>

              {/* Why It Matters & Recommendation */}
              <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)] text-xs">
                <div>
                  <span className="font-bold text-[var(--apple-amber-text)] block">WHY THIS MATTERS:</span>
                  <p className="text-[var(--text-secondary)] leading-relaxed">{inc.whyItMatters}</p>
                </div>

                <div className="bg-[var(--apple-blue-bg)] p-3 rounded-xl border border-[var(--apple-blue-border)]">
                  <span className="font-bold text-[var(--apple-blue-text)] block">RECOMMENDED NEGOTIATION POINT:</span>
                  <p className="text-[var(--text-primary)] leading-relaxed">{inc.recommendation}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
