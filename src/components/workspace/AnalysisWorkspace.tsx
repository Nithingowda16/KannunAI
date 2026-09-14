import React, { useState } from 'react';
import { FileText, Bookmark, ShieldAlert, HelpCircle, CheckSquare, Briefcase, ChevronRight, Scale } from 'lucide-react';
import { UploadedDocument } from '../../types/document';
import { DocumentAnalysis } from '../../types/analysis';
import { DocumentViewer } from '../document/DocumentViewer';
import { SummaryView } from './SummaryView';
import { ClauseExplorerView } from './ClauseExplorerView';
import { RiskRadarView } from './RiskRadarView';
import { GroundedQAView } from './GroundedQAView';
import { ChecklistView } from './ChecklistView';
import { LawyerBriefView } from './LawyerBriefView';
import { Tabs, TabOption } from '../ui/Tabs';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

export interface AnalysisWorkspaceProps {
  document: UploadedDocument;
  analysis: DocumentAnalysis;
}

export const AnalysisWorkspace: React.FC<AnalysisWorkspaceProps> = ({ document, analysis }) => {
  const [activeTab, setActiveTab] = useState<string>('summary');
  const [activeCitation, setActiveCitation] = useState<{ startChar: number; endChar: number; pageNumber?: number } | null>(null);

  const tabs: TabOption[] = [
    { id: 'summary', label: 'Summary', icon: <FileText className="h-4 w-4" /> },
    { id: 'clauses', label: 'Clauses', badge: analysis.clauses.length, icon: <Bookmark className="h-4 w-4" /> },
    { id: 'risks', label: 'Risk Radar', badge: analysis.risks.length, icon: <ShieldAlert className="h-4 w-4" /> },
    { id: 'qa', label: 'Ask AI', icon: <HelpCircle className="h-4 w-4" /> },
    { id: 'checklist', label: 'Checklist', badge: analysis.checklist.length, icon: <CheckSquare className="h-4 w-4" /> },
    { id: 'brief', label: 'Lawyer Brief', icon: <Briefcase className="h-4 w-4" /> }
  ];

  const handleCitationSelect = (range: { startChar: number; endChar: number; pageNumber?: number }) => {
    setActiveCitation(range);
  };

  const highRisks = analysis.risks.filter((r) => r.severity === 'high').length;

  return (
    <div className="space-y-6">
      {/* Workspace Header Bar */}
      <div className="glass-panel p-4 rounded-3xl border border-[var(--border-panel)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[var(--apple-blue-bg)] text-[var(--apple-blue-text)] rounded-2xl border border-[var(--apple-blue-border)]">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-[var(--text-primary)]">
                {document.filename}
              </h2>
              {highRisks > 0 ? (
                <Badge variant="high">{highRisks} High Attention</Badge>
              ) : (
                <Badge variant="success">Standard Review</Badge>
              )}
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              {document.wordCount} words • {document.pageCount} pages • Grounded RAG Analysis
            </p>
          </div>
        </div>

        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Main 2-Column Responsive Desktop Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start min-h-[780px]">
        {/* LEFT COLUMN: Interactive Document Viewer & Quick Nav (5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-4 h-[780px] flex flex-col min-w-0 sticky top-20">
          {/* Quick Info Bar */}
          <div className="glass-panel p-3 rounded-2xl border border-[var(--border-panel)] flex flex-wrap items-center justify-between text-xs gap-2 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[var(--text-secondary)] font-medium">Type:</span>
              <span className="font-bold text-[var(--text-primary)] truncate max-w-[140px]">{analysis.metadata.documentType}</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <span>Gov. Law: <strong className="text-[var(--text-primary)] font-semibold">{analysis.metadata.governingLaw}</strong></span>
            </div>
          </div>

          {/* Main Document Viewer Canvas */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <DocumentViewer document={document} activeCitationRange={activeCitation} />
          </div>
        </div>

        {/* RIGHT COLUMN: AI Insights Workspace (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-6 overflow-y-auto max-h-[780px] pr-1 min-w-0">
          {activeTab === 'summary' && <SummaryView summary={analysis.summary} />}
          {activeTab === 'clauses' && (
            <ClauseExplorerView clauses={analysis.clauses} onSelectCitation={handleCitationSelect} />
          )}
          {activeTab === 'risks' && (
            <RiskRadarView risks={analysis.risks} onSelectCitation={handleCitationSelect} />
          )}
          {activeTab === 'qa' && (
            <GroundedQAView document={document} onSelectCitation={handleCitationSelect} />
          )}
          {activeTab === 'checklist' && <ChecklistView items={analysis.checklist} />}
          {activeTab === 'brief' && <LawyerBriefView brief={analysis.lawyerBrief} />}
        </div>
      </div>
    </div>
  );
};
