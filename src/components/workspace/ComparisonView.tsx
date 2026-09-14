import React, { useState } from 'react';
import { GitCompare } from 'lucide-react';
import { UploadedDocument } from '../../types/document';
import { ComparisonResult, DiffCategory } from '../../types/comparison';
import { GeminiAIProvider } from '../../services/ai/geminiProvider';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface ComparisonViewProps {
  currentDocument: UploadedDocument | null;
  onSelectSampleDemo: (type: 'saas_v1') => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = () => {
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [activeCategory, setActiveCategory] = useState<DiffCategory>('all');
  const [isComparing, setIsComparing] = useState(false);

  const handleRunComparison = async (docA: UploadedDocument, docB: UploadedDocument) => {
    setIsComparing(true);
    try {
      const provider = new GeminiAIProvider();
      const result = await provider.compareDocuments(docA, docB);
      setComparisonResult(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Comparison failed.';
      console.error('Comparison error:', message);
    } finally {
      setIsComparing(false);
    }
  };

  const handleDemoComparison = async () => {
    const { getSampleDocument } = await import('../../utils/sampleDocuments');
    const docA = getSampleDocument('saas_v1');
    const docB = getSampleDocument('saas_v2');
    handleRunComparison(docA, docB);
  };

  const filteredDiffs = comparisonResult
    ? comparisonResult.differences.filter((d) => activeCategory === 'all' || d.category === activeCategory)
    : [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-[var(--border-panel)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <GitCompare className="h-6 w-6 text-[var(--apple-purple-text)]" />
            Side-by-Side Contract Comparison
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Compare Contract Version A vs Version B to identify structural diffs in liability, termination, and payment terms.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleDemoComparison}
          isLoading={isComparing}
          leftIcon={<GitCompare className="h-4 w-4" />}
        >
          Run Demo Comparison (SaaS V1 vs V2)
        </Button>
      </div>

      {/* Comparison Results */}
      {comparisonResult ? (
        <div className="space-y-6">
          {/* Summary Box */}
          <Card className="space-y-3 bg-[var(--apple-purple-bg)] border-[var(--apple-purple-border)]">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[var(--apple-purple-text)]">Comparison Executive Summary</h4>
              <Badge variant="high">{comparisonResult.highRiskCount} High Attention Changes</Badge>
            </div>
            <p className="text-xs text-[var(--text-primary)] leading-relaxed">{comparisonResult.overallSummary}</p>
          </Card>

          {/* Filter Bar */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'obligations', 'financial', 'termination', 'privacy', 'liability'] as DiffCategory[]).map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    activeCategory === cat
                      ? 'bg-[var(--apple-purple-bg)] text-[var(--apple-purple-text)] border-[var(--apple-purple-border)]'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-panel)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {cat.replace(/_/g, ' ').toUpperCase()}
                </button>
              )
            )}
          </div>

          {/* Differences Matrix */}
          <div className="space-y-4">
            {filteredDiffs.map((diff) => (
              <Card key={diff.id} className="space-y-4 border-l-4 border-l-[var(--apple-purple-text)]">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={diff.changeType === 'added' ? 'success' : diff.changeType === 'removed' ? 'high' : 'medium'}>
                      {diff.changeType.toUpperCase()}
                    </Badge>
                    <h4 className="text-base font-bold text-[var(--text-primary)]">{diff.title}</h4>
                  </div>
                  <Badge variant={diff.severity}>{diff.severity.toUpperCase()} IMPACT</Badge>
                </div>

                {/* Side by side diff boxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  {diff.oldText && (
                    <div className="bg-[var(--apple-rose-bg)] p-3 rounded-lg border border-[var(--apple-rose-border)] text-[var(--apple-rose-text)]">
                      <span className="text-[10px] text-[var(--apple-rose-text)] font-sans block mb-1 font-bold uppercase">
                        Version A (Old Provision):
                      </span>
                      "{diff.oldText}"
                    </div>
                  )}

                  {diff.newText && (
                    <div className="bg-[var(--apple-emerald-bg)] p-3 rounded-lg border border-[var(--apple-emerald-border)] text-[var(--apple-emerald-text)]">
                      <span className="text-[10px] text-[var(--apple-emerald-text)] font-sans block mb-1 font-bold uppercase">
                        Version B (New Provision):
                      </span>
                      "{diff.newText}"
                    </div>
                  )}
                </div>

                {/* Explanations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-subtle)]">
                    <span className="font-bold text-[var(--text-primary)] block mb-1">What Changed:</span>
                    <p className="text-[var(--text-secondary)] leading-relaxed">{diff.whatChanged}</p>
                  </div>

                  <div className="bg-[var(--apple-purple-bg)] p-3 rounded-lg border border-[var(--apple-purple-border)]">
                    <span className="font-bold text-[var(--apple-purple-text)] block mb-1">Why It May Matter:</span>
                    <p className="text-[var(--text-primary)] leading-relaxed">{diff.whyItMayMatter}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center glass-panel rounded-2xl border border-dashed border-[var(--border-panel)] space-y-4">
          <GitCompare className="h-12 w-12 text-[var(--apple-purple-text)] mx-auto" />
          <h4 className="text-lg font-bold text-[var(--text-primary)]">Compare Two Versions of an Agreement</h4>
          <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
            Click the button above to launch a side-by-side comparison between SaaS Agreement V1 and SaaS Agreement V2.
          </p>
        </div>
      )}
    </div>
  );
};
