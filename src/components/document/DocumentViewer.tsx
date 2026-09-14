import React, { useState, useEffect, useRef } from 'react';
import { FileText, Search, ZoomIn, ZoomOut, Bookmark } from 'lucide-react';
import { UploadedDocument } from '../../types/document';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export interface DocumentViewerProps {
  document: UploadedDocument;
  activeCitationRange?: { startChar: number; endChar: number; pageNumber?: number } | null;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, activeCitationRange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(100);
  const containerRef = useRef<HTMLDivElement>(null);
  const highlightedRef = useRef<HTMLSpanElement>(null);

  // Auto scroll to active citation when clicked
  useEffect(() => {
    if (activeCitationRange && highlightedRef.current) {
      highlightedRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeCitationRange]);

  const renderDocumentContent = () => {
    const text = document.rawText;

    if (!activeCitationRange) {
      if (!searchQuery.trim()) {
        return <div className="whitespace-pre-wrap leading-relaxed">{text}</div>;
      }

      // Highlight search query occurrences
      const parts = text.split(new RegExp(`(${escapeRegExp(searchQuery)})`, 'gi'));
      return (
        <div className="whitespace-pre-wrap leading-relaxed">
          {parts.map((part, i) =>
            part.toLowerCase() === searchQuery.toLowerCase() ? (
              <mark key={i} className="bg-[var(--apple-amber-bg)] text-[var(--apple-amber-text)] border border-[var(--apple-amber-border)] rounded px-1 font-semibold">
                {part}
              </mark>
            ) : (
              part
            )
          )}
        </div>
      );
    }

    // Render text with specific active citation highlight
    const start = Math.max(0, activeCitationRange.startChar);
    const end = Math.min(text.length, activeCitationRange.endChar);

    const before = text.substring(0, start);
    const citedText = text.substring(start, end);
    const after = text.substring(end);

    return (
      <div className="whitespace-pre-wrap leading-relaxed">
        {before}
        <span
          ref={highlightedRef}
          className="citation-highlight ring-2 ring-[var(--apple-amber)] font-medium"
        >
          {citedText}
        </span>
        {after}
      </div>
    );
  };

  return (
    <div className="glass-panel rounded-3xl border border-[var(--border-panel)] flex flex-col h-full overflow-hidden shadow-lg">
      {/* Viewer Floating Apple Header Controls */}
      <div className="p-3 bg-[var(--bg-panel-solid)] border-b border-[var(--border-panel)] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
          <div className="p-1.5 bg-[var(--apple-blue-bg)] text-[var(--apple-blue-text)] rounded-lg flex-shrink-0 flex items-center justify-center">
            <FileText className="h-4 w-4" />
          </div>
          <span className="truncate max-w-[180px]" title={document.filename}>
            {document.filename}
          </span>
          <Badge variant="slate">{document.pageCount} {document.pageCount === 1 ? 'page' : 'pages'}</Badge>
        </div>

        {/* Search Bar with Centered Icon */}
        <div className="relative flex-1 max-w-xs flex items-center">
          <Search className="h-3.5 w-3.5 absolute left-3 text-[var(--text-secondary)] pointer-events-none" />
          <input
            type="text"
            placeholder="Search in contract..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-panel)] rounded-full pl-9 pr-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)]"
          />
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-[var(--bg-secondary)] border border-[var(--border-panel)] rounded-full p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoomLevel(Math.max(80, zoomLevel - 10))}
            className="p-1 h-6 w-6 rounded-full flex items-center justify-center"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <span className="text-[10px] text-[var(--text-secondary)] w-8 text-center font-mono">{zoomLevel}%</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
            className="p-1 h-6 w-6 rounded-full flex items-center justify-center"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Document Text Body */}
      <div
        ref={containerRef}
        style={{ fontSize: `${(14 * zoomLevel) / 100}px` }}
        className="p-6 overflow-y-auto flex-1 font-mono text-[var(--text-primary)] bg-[var(--bg-base)] selection:bg-[var(--apple-blue-bg)] selection:text-[var(--apple-blue)]"
        tabIndex={0}
        aria-label="Legal document text viewer"
      >
        {renderDocumentContent()}
      </div>

      {/* Citation Active Banner */}
      {activeCitationRange && (
        <div className="p-3 bg-[var(--apple-amber-bg)] border-t border-[var(--apple-amber-border)] text-[var(--apple-amber-text)] text-xs flex items-center justify-between px-4">
          <span className="flex items-center gap-2 font-medium">
            <Bookmark className="h-4 w-4 text-[var(--apple-amber-text)]" />
            Jumping to cited section (Page {activeCitationRange.pageNumber || 1})
          </span>
          <span className="text-[10px] bg-[var(--bg-panel-solid)] px-2.5 py-0.5 rounded-full font-mono border border-[var(--apple-amber-border)]">
            Chars {activeCitationRange.startChar}-{activeCitationRange.endChar}
          </span>
        </div>
      )}
    </div>
  );
};

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
