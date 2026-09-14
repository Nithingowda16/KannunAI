import React, { useState } from 'react';
import { Briefcase, Printer, Plus, Trash2 } from 'lucide-react';
import { LawyerBrief, PotentialConcern } from '../../types/lawyerBrief';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export interface LawyerBriefViewProps {
  brief: LawyerBrief;
}

export const LawyerBriefView: React.FC<LawyerBriefViewProps> = ({ brief: initialBrief }) => {
  const [brief, setBrief] = useState<LawyerBrief>(initialBrief);
  const [newQuestion, setNewQuestion] = useState('');

  const questionsList = brief.recommendedQuestions || brief.recommendedNextSteps || [];
  const overviewText = brief.executiveSummary || brief.overview || 'Legal document analysis summary.';
  const datesList = brief.importantDates || [];
  const concernsList: PotentialConcern[] = brief.potentialConcerns || (brief.criticalRiskFactors || []).map((f) => ({ title: f, description: f }));

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    setBrief((prev) => ({
      ...prev,
      recommendedQuestions: [...(prev.recommendedQuestions || prev.recommendedNextSteps || []), newQuestion.trim()]
    }));
    setNewQuestion('');
  };

  const handleRemoveQuestion = (index: number) => {
    setBrief((prev) => ({
      ...prev,
      recommendedQuestions: (prev.recommendedQuestions || prev.recommendedNextSteps || []).filter((_, i) => i !== index)
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header & Export Actions (Hidden during print) */}
      <div className="glass-panel p-6 rounded-2xl border border-[var(--border-panel)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
        <div>
          <h3 className="text-xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-[var(--apple-emerald-text)]" />
            Prepare for a Lawyer — Brief Generator
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            A concise legal brief summarizing obligations, dates, flagged concerns, and custom questions for your attorney.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handlePrint}
          leftIcon={<Printer className="h-4 w-4" />}
        >
          Print / Export PDF Brief
        </Button>
      </div>

      {/* Printable Brief Area */}
      <div className="print-area space-y-6 glass-panel p-8 rounded-2xl border border-[var(--border-panel)] bg-[var(--bg-panel-solid)] text-[var(--text-primary)]">
        {/* Report Meta Header */}
        <div className="border-b border-[var(--border-panel)] pb-6 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Legal Preparation Brief: {brief.documentTitle || 'Legal Document'}
            </h2>
            <Badge variant="info">Generated {brief.generatedAt || new Date().toLocaleDateString()}</Badge>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Prepared by KannunAI Legal Document Intelligence Platform. Confidential Client Handoff Brief.
          </p>
        </div>

        {/* Overview */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-[var(--apple-blue-text)] uppercase tracking-wider">
            1. Document Executive Summary
          </h3>
          <p className="text-xs text-[var(--text-primary)] leading-relaxed bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-panel)]">
            {overviewText}
          </p>
        </div>

        {/* Key Obligations & Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[var(--apple-teal-text)] uppercase tracking-wider">
              2. Key Obligations
            </h3>
            <ul className="space-y-1.5 text-xs text-[var(--text-primary)]">
              {(brief.keyObligations || []).map((ob, i) => (
                <li key={i} className="flex items-start gap-2 bg-[var(--bg-secondary)] p-2.5 rounded-lg border border-[var(--border-subtle)]">
                  <span className="text-[var(--apple-blue-text)] font-bold">•</span>
                  <span>{ob}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[var(--apple-amber-text)] uppercase tracking-wider">
              3. Important Dates & Deadlines
            </h3>
            <ul className="space-y-1.5 text-xs text-[var(--text-primary)]">
              {datesList.map((d, i) => (
                <li key={i} className="flex items-start gap-2 bg-[var(--bg-secondary)] p-2.5 rounded-lg border border-[var(--border-subtle)]">
                  <span className="text-[var(--apple-amber-text)] font-bold">•</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Potential Concerns */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[var(--apple-rose-text)] uppercase tracking-wider">
            4. Flagged Provisions Deserving Professional Review ({concernsList.length})
          </h3>
          <div className="space-y-2">
            {concernsList.map((c, i) => (
              <div key={i} className="bg-[var(--apple-rose-bg)] p-3 rounded-xl border border-[var(--apple-rose-border)] text-xs space-y-1">
                <span className="font-bold text-[var(--apple-rose-text)]">{c.title} ({c.section || 'General Clause'})</span>
                <p className="text-[var(--text-primary)] leading-relaxed">{c.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Questions to Ask Lawyer */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--apple-emerald-text)] uppercase tracking-wider">
              5. Questions to Ask Your Lawyer
            </h3>
          </div>

          <div className="space-y-2">
            {questionsList.map((q, i) => (
              <div key={i} className="flex items-center justify-between gap-3 bg-[var(--bg-secondary)] p-3 rounded-xl border border-[var(--border-subtle)] text-xs">
                <span className="text-[var(--text-primary)] font-medium">{i + 1}. {q}</span>
                <button
                  onClick={() => handleRemoveQuestion(i)}
                  className="text-[var(--text-tertiary)] hover:text-[var(--apple-rose-text)] no-print"
                  title="Remove question"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add custom question input */}
          <div className="flex gap-2 pt-2 no-print">
            <input
              type="text"
              placeholder="Add your own custom question for the lawyer..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddQuestion();
                }
              }}
              className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-panel)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)]"
            />
            <Button size="sm" variant="secondary" onClick={handleAddQuestion} leftIcon={<Plus className="h-4 w-4" />}>
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
