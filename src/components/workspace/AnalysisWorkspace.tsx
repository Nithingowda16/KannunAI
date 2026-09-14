import React, { useState } from 'react';
import {
  FileText,
  Bookmark,
  ShieldAlert,
  HelpCircle,
  CheckSquare,
  Briefcase,
  Scale,
  ListOrdered,
  AlertOctagon,
  GitCompare,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { UploadedDocument } from '../../types/document';
import { DocumentAnalysis } from '../../types/analysis';
import { DocumentViewer } from '../document/DocumentViewer';
import { SummaryView } from './SummaryView';
import { ClauseExplorerView } from './ClauseExplorerView';
import { RiskRadarView } from './RiskRadarView';
import { ObligationsView } from './ObligationsView';
import { InconsistenciesView } from './InconsistenciesView';
import { GroundedQAView } from './GroundedQAView';
import { ChecklistView } from './ChecklistView';
import { LawyerBriefView } from './LawyerBriefView';
import { ComparisonView } from './ComparisonView';
import { Tabs, TabOption } from '../ui/Tabs';
import { Badge } from '../ui/Badge';

export interface AnalysisWorkspaceProps {
  document: UploadedDocument;
  analysis: DocumentAnalysis;
  onNavigateCompare?: () => void;
}

export const AnalysisWorkspace: React.FC<AnalysisWorkspaceProps> = ({ document, analysis }) => {
  const [activeTab, setActiveTab] = useState<string>('summary');
  const [activeCitation, setActiveCitation] = useState<{ startChar: number; endChar: number; pageNumber?: number } | null>(null);

  const obligationsCount = analysis.obligations?.length || 0;
  const inconsistenciesCount = analysis.inconsistencies?.length || 0;
  const highRisks = analysis.risks.filter((r) => r.level === 'high' || r.severity === 'high').length;

  const tabs: TabOption[] = [
    { id: 'summary', label: 'Summary', icon: <FileText className="h-4 w-4" /> },
    { id: 'clauses', label: 'Clauses', badge: analysis.clauses.length, icon: <Bookmark className="h-4 w-4" /> },
    { id: 'risks', label: 'Risk Radar', badge: analysis.risks.length, icon: <ShieldAlert className="h-4 w-4" /> },
    { id: 'obligations', label: 'Obligations', badge: obligationsCount, icon: <ListOrdered className="h-4 w-4" /> },
    { id: 'inconsistencies', label: 'Contradictions', badge: inconsistenciesCount, icon: <AlertOctagon className="h-4 w-4" /> },
    { id: 'qa', label: 'Ask AI', icon: <HelpCircle className="h-4 w-4" /> },
    { id: 'checklist', label: 'Checklist', badge: analysis.checklist.length, icon: <CheckSquare className="h-4 w-4" /> },
    { id: 'brief', label: 'Lawyer Brief', icon: <Briefcase className="h-4 w-4" /> },
    { id: 'compare', label: 'Compare', icon: <GitCompare className="h-4 w-4" /> }
  ];

  const handleCitationSelect = (range: { startChar: number; endChar: number; pageNumber?: number }) => {
    setActiveCitation(range);
  };

  const docTitle = document.name || document.filename || 'Legal Document';
  const docType = analysis.metadata?.documentType || analysis.summary.documentType;
  const govLaw = analysis.metadata?.governingLaw || 'Standard Jurisdiction';

  // 6-Stage Legal Review Pipeline Stages
  const pipelineStages = [
    { id: 'summary', label: '1. Understand', desc: 'Plain Language', active: activeTab === 'summary' },
    { id: 'risks', label: '2. Identify Risks', desc: `${highRisks} Attention Points`, active: activeTab === 'risks' || activeTab === 'clauses' },
    { id: 'obligations', label: '3. Map Obligations', desc: `${obligationsCount} Commitments`, active: activeTab === 'obligations' },
    { id: 'inconsistencies', label: '4. Flag Conflicts', desc: `${inconsistenciesCount} Found`, active: activeTab === 'inconsistencies' },
    { id: 'qa', label: '5. Ask Questions', desc: 'Grounded Citations', active: activeTab === 'qa' },
    { id: 'brief', label: '6. Prepare Action', desc: 'Checklist & Brief', active: activeTab === 'checklist' || activeTab === 'brief' },
  ];

  return (
    <div className="space-y-5">
      {/* 6-Stage Legal Review Workflow Ribbon */}
      <div className="glass-panel p-3 sm:p-4 rounded-2xl border border-[var(--border-panel)] bg-[var(--bg-secondary)] overflow-x-auto">
        <div className="flex items-center justify-between min-w-[680px] gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--apple-blue-text)] uppercase tracking-wider shrink-0 pr-2 border-r border-[var(--border-subtle)]">
            <Sparkles className="h-3.5 w-3.5 text-[var(--apple-blue-text)]" />
            <span>Legal Review Flow:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-1 justify-between">
            {pipelineStages.map((stage, idx) => (
              <React.Fragment key={stage.id}>
                <button
                  type="button"
                  onClick={() => setActiveTab(stage.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-left transition-all ${
                    stage.active
                      ? 'bg-[var(--apple-blue-bg)] border border-[var(--apple-blue-border)] shadow-sm'
                      : 'hover:bg-[var(--bg-card)] border border-transparent opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="space-y-0.5">
                    <p className={`text-xs font-bold ${stage.active ? 'text-[var(--apple-blue-text)]' : 'text-[var(--text-primary)]'}`}>
                      {stage.label}
                    </p>
                    <p className="text-[10px] text-[var(--text-secondary)]">
                      {stage.desc}
                    </p>
                  </div>
                </button>

                {idx < pipelineStages.length - 1 && (
                  <ChevronRight className="h-3.5 w-3.5 text-[var(--text-tertiary)] shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Workspace Header Bar */}
      <div className="glass-panel p-4 rounded-3xl border border-[var(--border-panel)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[var(--apple-blue-bg)] text-[var(--apple-blue-text)] rounded-2xl border border-[var(--apple-blue-border)]">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-[var(--text-primary)]">
                {docTitle}
              </h2>
              {highRisks > 0 ? (
                <Badge variant="high">{highRisks} High Attention</Badge>
              ) : (
                <Badge variant="success">Standard Review</Badge>
              )}
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              {document.wordCount || 500} words • {document.pageCount || 1} pages • Grounded In-Memory RAG Engine
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
              <span className="font-bold text-[var(--text-primary)] truncate max-w-[140px]">{docType}</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <span>Gov. Law: <strong className="text-[var(--text-primary)] font-semibold">{govLaw}</strong></span>
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
          {activeTab === 'obligations' && (
            <ObligationsView obligations={analysis.obligations || []} onSelectCitation={handleCitationSelect} />
          )}
          {activeTab === 'inconsistencies' && (
            <InconsistenciesView inconsistencies={analysis.inconsistencies || []} onSelectCitation={handleCitationSelect} />
          )}
          {activeTab === 'qa' && (
            <GroundedQAView document={document} onSelectCitation={handleCitationSelect} />
          )}
          {activeTab === 'checklist' && <ChecklistView items={analysis.checklist} />}
          {activeTab === 'brief' && <LawyerBriefView brief={analysis.lawyerBrief} />}
          {activeTab === 'compare' && (
            <ComparisonView
              currentDocument={document}
              onSelectSampleDemo={() => {}}
            />
          )}
        </div>
      </div>
    </div>
  );
};

