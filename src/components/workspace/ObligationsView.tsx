import React, { useState } from 'react';
import { ShieldCheck, Clock, AlertTriangle, ExternalLink, Users } from 'lucide-react';
import { LegalObligationItem } from '../../types/obligation';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export interface ObligationsViewProps {
  obligations: LegalObligationItem[];
  onSelectCitation?: (range: { startChar: number; endChar: number; pageNumber?: number }) => void;
}

export const ObligationsView: React.FC<ObligationsViewProps> = ({ obligations, onSelectCitation }) => {
  const [filterParty, setFilterParty] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const parties = Array.from(new Set(obligations.map((o) => o.party)));

  const filteredObligations = obligations.filter((o) => {
    const matchParty = filterParty === 'all' || o.party === filterParty;
    const matchSev = filterSeverity === 'all' || o.severity === filterSeverity;
    return matchParty && matchSev;
  });

  const highCount = obligations.filter((o) => o.severity === 'high').length;
  const medCount = obligations.filter((o) => o.severity === 'medium').length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass-panel p-6 rounded-2xl border border-[var(--border-panel)] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[var(--apple-emerald-text)]" />
              Contractual Obligations Tracker
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Explicit binding duties structured by Who, What, When, Consequences, and Supporting Source.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="high">{highCount} High Priority</Badge>
            <Badge variant="medium">{medCount} Standard</Badge>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[var(--border-subtle)] text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-secondary)] font-medium">Party:</span>
            <select
              value={filterParty}
              onChange={(e) => setFilterParty(e.target.value)}
              className="bg-[var(--bg-secondary)] border border-[var(--border-panel)] rounded-lg px-2.5 py-1 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)]"
            >
              <option value="all">All Parties ({obligations.length})</option>
              {parties.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-secondary)] font-medium">Priority:</span>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as any)}
              className="bg-[var(--bg-secondary)] border border-[var(--border-panel)] rounded-lg px-2.5 py-1 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)]"
            >
              <option value="all">All Levels</option>
              <option value="high">High Priority Only</option>
              <option value="medium">Medium Priority Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Obligations Cards List */}
      <div className="space-y-4">
        {filteredObligations.length === 0 ? (
          <div className="p-8 text-center glass-panel rounded-2xl text-[var(--text-secondary)] text-xs">
            No obligations found for the selected filter.
          </div>
        ) : (
          filteredObligations.map((ob) => {
            const isHigh = ob.severity === 'high';
            const pageNum = ob.sourceLocation.pageNumber;
            const startChar = ob.sourceLocation.startChar || 0;
            const endChar = ob.sourceLocation.endChar || 200;

            return (
              <Card
                key={ob.id}
                className={`space-y-4 border-l-4 rounded-2xl ${
                  isHigh ? 'border-l-[var(--apple-rose)]' : 'border-l-[var(--apple-emerald)]'
                }`}
              >
                {/* Card Header: Party & Severity */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[var(--apple-blue-text)]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Obligated Party:</span>
                    <Badge variant={isHigh ? 'high' : 'info'}>{ob.party}</Badge>
                  </div>

                  <Badge variant={isHigh ? 'high' : 'low'}>
                    {isHigh ? 'Strict Liability' : 'Standard Compliance'}
                  </Badge>
                </div>

                {/* WHAT */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--apple-blue-text)]">
                    WHAT IS REQUIRED:
                  </span>
                  <p className="text-sm font-semibold text-[var(--text-primary)] leading-relaxed">
                    {ob.obligation}
                  </p>
                </div>

                {/* WHEN & CONSEQUENCE Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {/* WHEN */}
                  <div className="bg-[var(--bg-secondary)] p-3 rounded-xl border border-[var(--border-subtle)] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--apple-teal-text)] flex items-center gap-1">
                      <Clock className="h-3 w-3" /> WHEN / DEADLINE:
                    </span>
                    <p className="text-xs text-[var(--text-primary)] font-medium">
                      {ob.deadline || 'During contract term'}
                    </p>
                  </div>

                  {/* CONSEQUENCE */}
                  <div className="bg-[var(--bg-secondary)] p-3 rounded-xl border border-[var(--border-subtle)] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--apple-amber-text)] flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> CONSEQUENCE OF BREACH:
                    </span>
                    <p className="text-xs text-[var(--text-primary)] font-medium">
                      {ob.consequence || 'Default under contract and legal damages.'}
                    </p>
                  </div>
                </div>

                {/* SOURCE & JUMP ACTION */}
                <div className="bg-[var(--bg-secondary)] p-3 rounded-xl border border-[var(--border-panel)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold tracking-wider block">
                      Supporting Document Evidence ({ob.sourceLocation.section || 'Contract Text'}, Page {pageNum}):
                    </span>
                    <p className="text-[11px] font-mono text-[var(--text-secondary)] italic line-clamp-2">
                      "{ob.evidence}"
                    </p>
                  </div>

                  <button
                    onClick={() => onSelectCitation?.({ startChar, endChar, pageNumber: pageNum })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--apple-blue-bg)] text-[var(--apple-blue-text)] border border-[var(--apple-blue-border)] hover:bg-[var(--bg-tertiary)] transition-colors text-xs font-bold flex-shrink-0"
                  >
                    <span>Jump to Source</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
