import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, AlertCircle, Info, ExternalLink, HelpCircle } from 'lucide-react';
import { RiskItem, RiskSeverity } from '../../types/risk';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export interface RiskRadarViewProps {
  risks: RiskItem[];
  onSelectCitation: (range: { startChar: number; endChar: number; pageNumber: number }) => void;
}

export const RiskRadarView: React.FC<RiskRadarViewProps> = ({ risks, onSelectCitation }) => {
  const [filterSeverity, setFilterSeverity] = useState<'all' | RiskSeverity>('all');

  const filteredRisks = risks.filter((r) => filterSeverity === 'all' || r.severity === filterSeverity);

  const highCount = risks.filter((r) => r.severity === 'high').length;
  const medCount = risks.filter((r) => r.severity === 'medium').length;
  const lowCount = risks.filter((r) => r.severity === 'low').length;

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
              onClick={() => setFilterSeverity('high')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${
                filterSeverity === 'high' ? 'ring-2 ring-[var(--apple-rose)]' : ''
              } bg-[var(--apple-rose-bg)] text-[var(--apple-rose-text)] border-[var(--apple-rose-border)]`}
            >
              <AlertCircle className="h-3.5 w-3.5" /> High ({highCount})
            </button>

            <button
              onClick={() => setFilterSeverity('medium')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${
                filterSeverity === 'medium' ? 'ring-2 ring-[var(--apple-amber)]' : ''
              } bg-[var(--apple-amber-bg)] text-[var(--apple-amber-text)] border-[var(--apple-amber-border)]`}
            >
              <AlertTriangle className="h-3.5 w-3.5" /> Medium ({medCount})
            </button>

            <button
              onClick={() => setFilterSeverity('low')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${
                filterSeverity === 'low' ? 'ring-2 ring-[var(--apple-emerald)]' : ''
              } bg-[var(--apple-emerald-bg)] text-[var(--apple-emerald-text)] border-[var(--apple-emerald-border)]`}
            >
              <Info className="h-3.5 w-3.5" /> Low ({lowCount})
            </button>

            {filterSeverity !== 'all' && (
              <button
                onClick={() => setFilterSeverity('all')}
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
          const isHigh = risk.severity === 'high';
          const isMed = risk.severity === 'medium';

          return (
            <Card
              key={risk.id}
              className={`space-y-4 border-l-4 ${
                isHigh ? 'border-l-[var(--apple-rose)]' : isMed ? 'border-l-[var(--apple-amber)]' : 'border-l-[var(--apple-emerald)]'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={risk.severity}
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
                    {risk.severity.toUpperCase()} ATTENTION
                  </Badge>
                  <h4 className="text-base font-bold text-[var(--text-primary)]">{risk.title}</h4>
                </div>

                <button
                  onClick={() =>
                    onSelectCitation({
                      startChar: 0,
                      endChar: 300,
                      pageNumber: risk.sourceLocation.pageNumber
                    })
                  }
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[var(--apple-blue-bg)] text-[var(--apple-blue-text)] border border-[var(--apple-blue-border)] hover:bg-[var(--bg-tertiary)] transition-colors font-medium text-xs"
                >
                  <span>Source Page {risk.sourceLocation.pageNumber}</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>

              {/* Explanation */}
              <p className="text-xs text-[var(--text-primary)] leading-relaxed">{risk.explanation}</p>

              {/* Evidence Box */}
              <div className="bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-panel)] text-xs font-mono text-[var(--text-primary)]">
                <span className="text-[10px] text-[var(--text-secondary)] font-sans block mb-1 uppercase tracking-wider font-semibold">
                  Evidence Text from Document:
                </span>
                "{risk.evidenceText}"
              </div>

              {/* Reason & Suggested Question */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-subtle)]">
                  <span className="font-bold text-[var(--apple-rose-text)] block mb-1">Reason for Flagging:</span>
                  <p className="text-[var(--text-primary)] leading-relaxed">{risk.reasonForFlagging}</p>
                </div>

                <div className="bg-[var(--apple-blue-bg)] p-3 rounded-lg border border-[var(--apple-blue-border)]">
                  <span className="font-bold text-[var(--apple-blue-text)] flex items-center gap-1 mb-1">
                    <HelpCircle className="h-3.5 w-3.5 text-[var(--apple-blue-text)]" /> Suggested Question / Action:
                  </span>
                  <p className="text-[var(--text-primary)] leading-relaxed">{risk.suggestedAction}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
