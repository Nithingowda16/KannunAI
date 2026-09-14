import React, { useState } from 'react';
import { Send, HelpCircle, Sparkles, ExternalLink } from 'lucide-react';
import { UploadedDocument } from '../../types/document';
import { QAPair } from '../../types/qa';
import { askGroundedLegalQuestion } from '../../services/ai/groundedQAEngine';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export interface GroundedQAViewProps {
  document: UploadedDocument;
  onSelectCitation: (range: { startChar: number; endChar: number; pageNumber: number }) => void;
}

const PRESET_QUESTIONS = [
  'What happens if I terminate this agreement early?',
  'Are there any automatic renewal terms or notice deadlines?',
  'Who owns the intellectual property and created work product?',
  'What are my exact payment and fee obligations?',
  'Are there non-compete or non-solicitation restrictions?',
  'Which clauses should I explicitly ask a lawyer about?'
];

export const GroundedQAView: React.FC<GroundedQAViewProps> = ({ document, onSelectCitation }) => {
  const [qaList, setQaList] = useState<QAPair[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    setIsLoading(true);
    setInputQuery('');

    try {
      const resultPair = await askGroundedLegalQuestion(document, queryText, qaList);
      setQaList((prev) => [resultPair, ...prev]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Q&A processing failed.';
      console.error('Q&A error:', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Q&A Header */}
      <div className="glass-panel p-4 rounded-xl border border-[var(--border-panel)] flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-[var(--apple-blue-text)]" />
            Grounded AI Legal Assistant
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Answers are grounded strictly in the provided document with clickable source citations.
          </p>
        </div>
        <Badge variant="info" icon={<Sparkles className="h-3.5 w-3.5" />}>
          Anti-Hallucination RAG
        </Badge>
      </div>

      {/* Preset Questions Bar */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
          Recommended Legal Questions:
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => handleAsk(q)}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-panel)] hover:border-[var(--apple-blue)] hover:bg-[var(--bg-tertiary)] transition-all text-left disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Query Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk(inputQuery);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          placeholder="Ask a question about this legal document..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-panel)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--apple-blue)]"
        />
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          leftIcon={<Send className="h-4 w-4" />}
        >
          Ask
        </Button>
      </form>

      {/* QA History Stream */}
      <div className="space-y-4">
        {qaList.map((qa) => {
          const isGrounded = qa.groundingStatus === 'Grounded';

          return (
            <Card key={qa.id} className="space-y-4 border-l-4 border-l-[var(--apple-blue)]">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                <span className="text-sm font-bold text-[var(--apple-blue-text)]">Q: {qa.question}</span>
                <Badge variant={isGrounded ? 'success' : 'medium'}>
                  {qa.groundingStatus}
                </Badge>
              </div>

              {/* Answer Text */}
              <div className="text-xs text-[var(--text-primary)] leading-relaxed bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-subtle)]">
                <span className="text-[10px] text-[var(--apple-blue-text)] font-bold block mb-1 uppercase tracking-wider">
                  AI Interpretation (Grounded):
                </span>
                {qa.answer}
              </div>

              {/* Source Citations */}
              {qa.citations.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider block">
                    Document Source Evidence:
                  </span>
                  <div className="space-y-2">
                    {qa.citations.map((cit) => (
                      <div
                        key={cit.id}
                        className="bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-panel)] text-xs flex items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <span className="font-bold text-[var(--apple-amber-text)] block">
                            {cit.sectionTitle} (Page {cit.pageNumber})
                          </span>
                          <p className="text-[var(--text-secondary)] font-mono text-[11px] truncate max-w-md">
                            "{cit.snippet}"
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            onSelectCitation({
                              startChar: cit.startChar,
                              endChar: cit.endChar,
                              pageNumber: cit.pageNumber
                            })
                          }
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--apple-blue-bg)] text-[var(--apple-blue-text)] border border-[var(--apple-blue-border)] hover:bg-[var(--bg-tertiary)] transition-colors text-xs font-semibold flex-shrink-0"
                        >
                          <span>Jump to Page {cit.pageNumber}</span>
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
