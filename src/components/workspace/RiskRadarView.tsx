import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, AlertCircle, Info, ExternalLink, HelpCircle } from 'lucide-react';
import { RiskItem, RiskLevel } from '../../types/risk';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export interface RiskRadarViewProps {
  risks: RiskItem[];
  onSelectCitation: (range: { startChar: number; endChar: number; pageNumber: number }) => void;
}

export const RiskRadarView: React.FC<RiskRadarViewProps> = ({ risks, onSelectCitation }) => {
  const [filterLevel, setFilterLevel] = useState<'all' | RiskLevel>('all');

  const filteredRisks = risks.filter((r) => {
    const lvl = r.level || r.severity || 'low';
    return filterLevel === 'all' || lvl === filterLevel;
  });

  const highCount = risks.filter((r) => (r.level || r.severity) === 'high' || (r.level || r.severity) === 'critical').length;
  const medCount = risks.filter((r) => (r.level || r.severity) === 'medium').length;
  const lowCount = risks.filter((r) => (r.level || r.severity) === 'low').length;

  return (
    <div className="space-y-6">
      {/* Risk Summary Radar Bar */}
      <div className="glass-panel p-6 rounded-2xl border border-[var(--border-panel)] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-[var(--apple-rose-text)]" />
              Risk Radar Assessment
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Categorized into High, Medium, and Low attention areas. Uses non-conclusion terminology.
            </p>
          </div>

          {/* Severity Counters */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterLevel('high')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${
                filterLevel === 'high' ? 'ring-2 ring-[var(--apple-rose)]' : ''
              } bg-[var(--apple-rose-bg)] text-[var(--apple-rose-text)] border-[var(--apple-rose-border)]`}
            >
              <AlertCircle className="h-3.5 w-3.5" /> High ({highCount})
            </button>

            <button
              onClick={() => setFilterLevel('medium')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${
                filterLevel === 'medium' ? 'ring-2 ring-[var(--apple-amber)]' : ''
              } bg-[var(--apple-amber-bg)] text-[var(--apple-amber-text)] border-[var(--apple-amber-border)]`}
            >
              <AlertTriangle className="h-3.5 w-3.5" /> Medium ({medCount})
            </button>

            <button
              onClick={() => setFilterLevel('low')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${
                filterLevel === 'low' ? 'ring-2 ring-[var(--apple-emerald)]' : ''
              } bg-[var(--apple-emerald-bg)] text-[var(--apple-emerald-text)] border-[var(--apple-emerald-border)]`}
            >
              <Info className="h-3.5 w-3.5" /> Low ({lowCount})
            </button>

            {filterLevel !== 'all' && (
              <button
                onClick={() => setFilterLevel('all')}
                className="text-xs text-[var(--text-secondary)] underline hover:text-[var(--text-primary)] ml-2"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Risk Items List */}
      <div className="space-y-4">
        {filteredRisks.map((risk) => {
          const lvl = risk.level || risk.severity || 'low';
          const isHigh = lvl === 'high' || lvl === 'critical';
          const isMed = lvl === 'medium';
          const pageNum = risk.sourceLocation?.pageNumber || 1;
          const evidence = risk.evidenceSnippet || risk.evidenceText || risk.explanation;
          const action = risk.suggestedQuestion || risk.suggestedAction || 'Review with legal counsel.';

          return (
            <Card
              key={risk.id}
              className={`space-y-4 border-l-4 rounded-2xl ${
                isHigh ? 'border-l-[var(--apple-rose)]' : isMed ? 'border-l-[var(--apple-amber)]' : 'border-l-[var(--apple-emerald)]'
              }`}
            >
              {/* Risk Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={isHigh ? 'high' : isMed ? 'medium' : 'low'}
                    icon={
                      isHigh ? (
                        <AlertCircle className="h-3.5 w-3.5" />
                      ) : isMed ? (
                        <AlertTriangle className="h-3.5 w-3.5" />
                      ) : (
                        <Info className="h-3.5 w-3.5" />
                      )
                    }
                  >
                    {lvl.toUpperCase()} ATTENTION
                  </Badge>
                  <h4 className="text-base font-bold text-[var(--text-primary)]">{risk.title}</h4>
                </div>

                <Badge variant="slate">{risk.category}</Badge>
              </div>

              {/* 1. WHAT THE DOCUMENT SAYS */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--apple-rose-text)] flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> 1. WHAT THE DOCUMENT SAYS (EVIDENCE):
                </span>
                <div className="bg-[var(--bg-secondary)] p-3.5 rounded-xl border border-[var(--border-panel)] text-xs font-mono text-[var(--text-primary)] italic">
                  "{risk.whatDocumentSays || evidence}"
                </div>
              </div>

              {/* 2. WHY IT MATTERS & 3. WHAT TO CONSIDER */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-[var(--bg-secondary)] p-3.5 rounded-xl border border-[var(--border-subtle)] space-y-1">
                  <span className="font-bold text-[var(--apple-amber-text)] text-[10px] uppercase tracking-wider block">
                    2. WHY IT MATTERS:
                  </span>
                  <p className="text-[var(--text-primary)] leading-relaxed">
                    {risk.whyItMatters || risk.reasonForFlagging || risk.explanation}
                  </p>
                </div>

                <div className="bg-[var(--apple-blue-bg)] p-3.5 rounded-xl border border-[var(--apple-blue-border)] space-y-1">
                  <span className="font-bold text-[var(--apple-blue-text)] text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <HelpCircle className="h-3.5 w-3.5 text-[var(--apple-blue-text)]" /> 3. WHAT TO CONSIDER / ACTION:
                  </span>
                  <p className="text-[var(--text-primary)] leading-relaxed">
                    {risk.whatToConsider || action}
                  </p>
                </div>
              </div>

              {/* 4. SOURCE */}
              <div className="bg-[var(--bg-secondary)] p-3 rounded-xl border border-[var(--border-panel)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold tracking-wider">
                    4. SOURCE CITATION:
                  </span>
                  <span className="font-semibold text-[var(--text-secondary)]">
                    {risk.source?.section || risk.sourceLocation?.section || 'Contract Clause'} • Page {pageNum}
                  </span>
                </div>

                <button
                  onClick={() =>
                    onSelectCitation({
                      startChar: risk.source?.startChar || 0,
                      endChar: risk.source?.endChar || 250,
                      pageNumber: pageNum
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--apple-blue-bg)] text-[var(--apple-blue-text)] border border-[var(--apple-blue-border)] hover:bg-[var(--bg-tertiary)] transition-colors font-bold text-xs flex-shrink-0"
                >
                  <span>Jump to Source on Page {pageNum}</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
