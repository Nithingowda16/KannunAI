import React, { useState } from 'react';
import { Bookmark, Search, ExternalLink } from 'lucide-react';
import { ClauseItem } from '../../types/clause';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export interface ClauseExplorerViewProps {
  clauses: ClauseItem[];
  onSelectCitation: (range: { startChar: number; endChar: number; pageNumber: number }) => void;
}

export const ClauseExplorerView: React.FC<ClauseExplorerViewProps> = ({ clauses, onSelectCitation }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredClauses = clauses.filter((clause) => {
    const matchesCategory = selectedCategory === 'all' || clause.category === selectedCategory;
    const matchesSearch =
      clause.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clause.plainLanguage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clause.originalText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = Array.from(new Set(clauses.map((c) => c.category)));

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="glass-panel p-4 rounded-2xl border border-[var(--border-panel)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-[var(--apple-blue-text)]" />
            Clause Explorer & Analysis
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">Inspecting 18+ detected legal clause categories.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-48 flex items-center">
            <Search className="h-3.5 w-3.5 absolute left-3 text-[var(--text-tertiary)] pointer-events-none" />
            <input
              type="text"
              placeholder="Filter clauses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-panel)] rounded-full pl-9 pr-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)]"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[var(--bg-secondary)] border border-[var(--border-panel)] rounded-full px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)]"
          >
            <option value="all">All Categories ({clauses.length})</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.replace(/_/g, ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clauses Grid */}
      <div className="space-y-4">
        {filteredClauses.length === 0 ? (
          <div className="p-8 text-center glass-panel rounded-2xl text-[var(--text-secondary)] text-xs">
            No clauses match the selected category or search term.
          </div>
        ) : (
          filteredClauses.map((clause) => (
            <Card key={clause.id} className="space-y-4 border-l-4 border-l-[var(--apple-blue)] rounded-2xl">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-[var(--text-primary)]">{clause.title}</h4>
                  <Badge variant="slate">{clause.category.replace(/_/g, ' ')}</Badge>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <Badge variant={clause.status === 'Requires Review' ? 'medium' : 'low'}>
                    {clause.status}
                  </Badge>

                  <button
                    onClick={() =>
                      onSelectCitation({
                        startChar: clause.sourceLocation.startChar,
                        endChar: clause.sourceLocation.endChar,
                        pageNumber: clause.sourceLocation.pageNumber
                      })
                    }
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--apple-blue-bg)] text-[var(--apple-blue-text)] border border-[var(--apple-blue-border)] hover:bg-[var(--bg-tertiary)] transition-colors font-medium text-xs"
                    title="Jump to source text snippet"
                  >
                    <span>Page {clause.sourceLocation.pageNumber}</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Original Text Box */}
              <div className="bg-[var(--bg-secondary)] p-3 rounded-xl border border-[var(--border-panel)] text-xs font-mono text-[var(--text-primary)] leading-relaxed max-h-32 overflow-y-auto">
                <span className="text-[10px] text-[var(--text-secondary)] font-sans block mb-1 uppercase tracking-wider font-semibold">
                  Original Legal Text:
                </span>
                "{clause.originalText}"
              </div>

              {/* Explanations & Concern */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-[var(--bg-secondary)] p-3 rounded-xl border border-[var(--border-subtle)]">
                  <span className="font-bold text-[var(--apple-blue-text)] block mb-1">Plain Language:</span>
                  <p className="text-[var(--text-primary)] leading-relaxed">{clause.plainLanguage}</p>
                </div>

                <div className="bg-[var(--bg-secondary)] p-3 rounded-xl border border-[var(--border-subtle)]">
                  <span className="font-bold text-[var(--apple-emerald-text)] block mb-1">Why It Matters:</span>
                  <p className="text-[var(--text-primary)] leading-relaxed">{clause.whyItMatters}</p>
                </div>

                <div className="bg-[var(--bg-secondary)] p-3 rounded-xl border border-[var(--border-subtle)]">
                  <span className="font-bold text-[var(--apple-amber-text)] block mb-1">Potential Concern:</span>
                  <p className="text-[var(--text-primary)] leading-relaxed">{clause.potentialConcern}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
