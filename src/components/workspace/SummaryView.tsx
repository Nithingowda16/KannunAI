import React, { useState } from 'react';
import { FileText, Users, Calendar, Clock, ShieldCheck, HelpCircle } from 'lucide-react';
import { DocumentSummary } from '../../types/analysis';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface SummaryViewProps {
  summary: DocumentSummary;
}

export const SummaryView: React.FC<SummaryViewProps> = ({ summary }) => {
  const [summaryMode, setSummaryMode] = useState<'quick' | 'detailed'>('quick');

  const quickNarrative = summary.quickSummary || summary.detailedSummary || `Summary of ${summary.documentType}.`;
  const detailedNarrative = summary.detailedSummary || summary.quickSummary || `Detailed analysis of ${summary.documentType}.`;
  const deadlines = summary.keyDeadlines || summary.importantDeadlines || [];
  const missingInfo = summary.missingInformation || summary.unestablishedInformation || [];

  return (
    <div className="space-y-6">
      {/* Overview Header & Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-4 rounded-xl border border-[var(--border-panel)]">
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <FileText className="h-5 w-5 text-[var(--apple-blue-text)]" />
            Plain-Language Document Summary
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">Essential terms, explicit dates, parties, and absent fields.</p>
        </div>

        <div className="flex items-center gap-1 bg-[var(--bg-secondary)] p-1 rounded-lg border border-[var(--border-panel)]">
          <Button
            size="sm"
            variant={summaryMode === 'quick' ? 'primary' : 'ghost'}
            onClick={() => setSummaryMode('quick')}
          >
            Quick Summary
          </Button>
          <Button
            size="sm"
            variant={summaryMode === 'detailed' ? 'primary' : 'ghost'}
            onClick={() => setSummaryMode('detailed')}
          >
            Detailed Summary
          </Button>
        </div>
      </div>

      {/* Summary Narrative */}
      <Card className="space-y-3 bg-[var(--apple-blue-bg)] border-[var(--apple-blue-border)]">
        <h4 className="text-sm font-bold text-[var(--apple-blue-text)]">Overview Narrative</h4>
        <p className="text-sm text-[var(--text-primary)] leading-relaxed">
          {summaryMode === 'quick' ? quickNarrative : detailedNarrative}
        </p>
      </Card>

      {/* Structured Document Meta Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
            <FileText className="h-4 w-4 text-[var(--apple-blue-text)]" /> Document Type
          </div>
          <p className="text-sm font-bold text-[var(--text-primary)]">{summary.documentType}</p>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
            <Users className="h-4 w-4 text-[var(--apple-purple-text)]" /> Parties Involved
          </div>
          <p className="text-sm font-bold text-[var(--text-primary)] truncate">
            {(summary.partiesInvolved || []).join(', ')}
          </p>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
            <Calendar className="h-4 w-4 text-[var(--apple-emerald-text)]" /> Effective Date
          </div>
          <p className={`text-sm font-bold ${summary.effectiveDate?.includes('Not') ? 'text-[var(--apple-amber-text)] font-normal italic' : 'text-[var(--text-primary)]'}`}>
            {summary.effectiveDate}
          </p>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
            <Clock className="h-4 w-4 text-[var(--apple-teal-text)]" /> Duration
          </div>
          <p className={`text-sm font-bold ${summary.duration?.includes('Not') ? 'text-[var(--apple-amber-text)] font-normal italic' : 'text-[var(--text-primary)]'}`}>
            {summary.duration}
          </p>
        </Card>
      </div>

      {/* Obligations & Deadlines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="space-y-3">
          <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[var(--apple-blue-text)]" /> Key Obligations
          </h4>
          <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
            {(summary.keyObligations || []).map((ob, i) => (
              <li key={i} className="flex items-start gap-2 bg-[var(--bg-secondary)] p-2.5 rounded-lg border border-[var(--border-subtle)]">
                <span className="h-2 w-2 rounded-full bg-[var(--apple-blue)] mt-1.5 flex-shrink-0" />
                <span className="text-[var(--text-primary)]">{ob}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="space-y-3">
          <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Clock className="h-4 w-4 text-[var(--apple-amber-text)]" /> Key Deadlines & Notice Terms
          </h4>
          <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
            {deadlines.map((dl, i) => (
              <li key={i} className="flex items-start gap-2 bg-[var(--bg-secondary)] p-2.5 rounded-lg border border-[var(--border-subtle)]">
                <span className="h-2 w-2 rounded-full bg-[var(--apple-amber)] mt-1.5 flex-shrink-0" />
                <span className="text-[var(--text-primary)]">{dl}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Missing Information / Explicit Warning Box */}
      {missingInfo && missingInfo.length > 0 && (
        <Card className="space-y-3 bg-[var(--apple-amber-bg)] border-[var(--apple-amber-border)]">
          <h4 className="text-sm font-bold text-[var(--apple-amber-text)] flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-[var(--apple-amber-text)]" /> Missing / Unestablished Information
          </h4>
          <p className="text-xs text-[var(--text-primary)] leading-relaxed">
            The following standard legal parameters could not be established from the provided text:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {missingInfo.map((item, i) => (
              <Badge key={i} variant="medium">
                {item}
              </Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
