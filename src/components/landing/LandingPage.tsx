import React from 'react';
import {
  FileText,
  ShieldAlert,
  GitCompare,
  CheckSquare,
  Briefcase,
  HelpCircle,
  ShieldCheck,
  Eye,
  ChevronRight
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export interface LandingPageProps {
  onStartUpload: () => void;
  onTrySampleDemo: (type: 'employment' | 'saas_v1') => void;
  onOpenCompare: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartUpload,
  onTrySampleDemo
}) => {
  return (
    <div className="space-y-24 pb-20">
      {/* NxtWave-Inspired Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden text-center space-y-8 max-w-4xl mx-auto px-4">
        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.12]">
          Understand your legal documents <br className="hidden sm:inline" />
          <span className="text-gradient block mt-1">before you sign.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed font-normal">
          AI-powered document analysis that helps you understand clauses, compare agreements, identify areas that deserve attention, and prepare better questions for a legal professional.
        </p>

        {/* Hero Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={onStartUpload}
            className="px-7 py-3 text-base shadow-sm"
          >
            Analyze a Document
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => onTrySampleDemo('employment')}
            className="px-6 py-3 text-base"
          >
            Try Sample Employment Demo
          </Button>
        </div>

        {/* Quick Demo Option Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto pt-8 text-left">
          <div
            onClick={() => onTrySampleDemo('employment')}
            className="group glass-panel p-6 rounded-3xl border border-[var(--border-panel)] hover:border-[var(--apple-blue-border)] cursor-pointer flex items-center justify-between gap-4 transition-all duration-300 hover:scale-[1.01]"
          >
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-[var(--apple-blue-bg)] text-[var(--apple-blue-text)] rounded-2xl border border-[var(--apple-blue-border)] flex-shrink-0">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-[var(--text-primary)] text-sm group-hover:text-[var(--apple-blue)] transition-colors">
                  Sample Employment Agreement
                </h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Non-compete, auto-renewal, 60-day notice & IP assignment
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--text-tertiary)] group-hover:text-[var(--apple-blue)] transition-all flex-shrink-0" />
          </div>

          <div
            onClick={() => onTrySampleDemo('saas_v1')}
            className="group glass-panel p-6 rounded-3xl border border-[var(--border-panel)] hover:border-[var(--apple-purple-border)] cursor-pointer flex items-center justify-between gap-4 transition-all duration-300 hover:scale-[1.01]"
          >
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-[var(--apple-purple-bg)] text-[var(--apple-purple-text)] rounded-2xl border border-[var(--apple-purple-border)] flex-shrink-0">
                <GitCompare className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-[var(--text-primary)] text-sm group-hover:text-[var(--apple-purple-text)] transition-colors">
                  Sample SaaS Master Agreement
                </h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Auto-renewal fees, 3-month liability cap & Net-30 terms
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--text-tertiary)] group-hover:text-[var(--apple-purple-text)] transition-all flex-shrink-0" />
          </div>
        </div>
      </section>

      {/* Official PromptWars Alignment: How KannunAI Helps (6 Pillars) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--apple-blue-bg)] border border-[var(--apple-blue-border)] text-xs font-bold text-[var(--apple-blue-text)]">
            <span>AI for Legal Assistance & Access</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)]">
            How KannunAI Empowers Non-Lawyers
          </h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-sm leading-relaxed">
            Legal documents are often dense, confusing, and intimidating. KannunAI turns complex contracts into accessible, verified, and actionable insights across six core pillars.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Pillar 1: Understand */}
          <Card hoverable className="space-y-4 p-6 rounded-3xl border-t-4 border-t-[var(--apple-blue-text)]">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-[var(--apple-blue-bg)] text-[var(--apple-blue-text)] rounded-2xl border border-[var(--apple-blue-border)]">
                <FileText className="h-6 w-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--apple-blue-text)] bg-[var(--apple-blue-bg)] px-2.5 py-1 rounded-lg">
                Pillar 1
              </span>
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Understand Plainly</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Translates complex legalese into clear, everyday language. Highlights governing jurisdiction, key parties, term durations, and warns when essential terms are absent.
            </p>
          </Card>

          {/* Pillar 2: Identify Risks */}
          <Card hoverable className="space-y-4 p-6 rounded-3xl border-t-4 border-t-[var(--apple-rose-text)]">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-[var(--apple-rose-bg)] text-[var(--apple-rose-text)] rounded-2xl border border-[var(--apple-rose-border)]">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--apple-rose-text)] bg-[var(--apple-rose-bg)] px-2.5 py-1 rounded-lg">
                Pillar 2
              </span>
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Identify Critical Risks</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Breaks down flagged clauses into 4 actionable parts: what the contract says, why it matters in practice, what to consider, and exact source text.
            </p>
          </Card>

          {/* Pillar 3: Map Obligations */}
          <Card hoverable className="space-y-4 p-6 rounded-3xl border-t-4 border-t-[var(--apple-teal-text)]">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-[var(--apple-emerald-bg)] text-[var(--apple-emerald-text)] rounded-2xl border border-[var(--apple-emerald-border)]">
                <CheckSquare className="h-6 w-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--apple-emerald-text)] bg-[var(--apple-emerald-bg)] px-2.5 py-1 rounded-lg">
                Pillar 3
              </span>
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Map Legal Obligations</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Explicitly breaks commitments down into Who owes What, to Whom, by When, and the Consequences of non-performance, with one-click citation jumps.
            </p>
          </Card>

          {/* Pillar 4: Reveal Inconsistencies */}
          <Card hoverable className="space-y-4 p-6 rounded-3xl border-t-4 border-t-[var(--apple-amber-text)]">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-[var(--apple-amber-bg)] text-[var(--apple-amber-text)] rounded-2xl border border-[var(--apple-amber-border)]">
                <GitCompare className="h-6 w-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--apple-amber-text)] bg-[var(--apple-amber-bg)] px-2.5 py-1 rounded-lg">
                Pillar 4
              </span>
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Detect Contradictions</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Identifies conflicting contract terms—such as immediate vs 30-day notice termination, fixed term vs indefinite survival, or unilateral liability waivers.
            </p>
          </Card>

          {/* Pillar 5: Ask Grounded Questions */}
          <Card hoverable className="space-y-4 p-6 rounded-3xl border-t-4 border-t-[var(--apple-purple-text)]">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-[var(--apple-purple-bg)] text-[var(--apple-purple-text)] rounded-2xl border border-[var(--apple-purple-border)]">
                <HelpCircle className="h-6 w-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--apple-purple-text)] bg-[var(--apple-purple-bg)] px-2.5 py-1 rounded-lg">
                Pillar 5
              </span>
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Grounded Q&A</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Ask practical questions ("Can they terminate early?", "What happens to my IP?") and get direct answers backed by cited contractual excerpts.
            </p>
          </Card>

          {/* Pillar 6: Act & Prepare */}
          <Card hoverable className="space-y-4 p-6 rounded-3xl border-t-4 border-t-[var(--apple-blue-text)]">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-[var(--apple-blue-bg)] text-[var(--apple-blue-text)] rounded-2xl border border-[var(--apple-blue-border)]">
                <Briefcase className="h-6 w-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--apple-blue-text)] bg-[var(--apple-blue-bg)] px-2.5 py-1 rounded-lg">
                Pillar 6
              </span>
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Prepare for Action</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Categorized pre-signing checklists (Review, Clarify, Negotiate, Confirm, Ask a Lawyer) and an 8-part exportable dossier for your legal counsel.
            </p>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
            WORKFLOW
          </span>
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">How KannunAI Works</h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto text-sm">
            Four simple steps from raw contract text to plain-language legal clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card hoverable className="space-y-4 p-6 rounded-3xl">
            <div className="w-10 h-10 rounded-2xl bg-[var(--apple-blue-bg)] text-[var(--apple-blue-text)] flex items-center justify-center font-bold text-sm border border-[var(--apple-blue-border)] flex-shrink-0">
              01
            </div>
            <h3 className="font-bold text-[var(--text-primary)] text-base">Upload Document</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Drag & drop your PDF, DOCX, or TXT contract. Sanitized and processed securely.
            </p>
          </Card>

          <Card hoverable className="space-y-4 p-6 rounded-3xl">
            <div className="w-10 h-10 rounded-2xl bg-[var(--apple-purple-bg)] text-[var(--apple-purple-text)] flex items-center justify-center font-bold text-sm border border-[var(--apple-purple-border)] flex-shrink-0">
              02
            </div>
            <h3 className="font-bold text-[var(--text-primary)] text-base">RAG Chunking & Indexing</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Legal text is parsed into semantic chunks with page and section citation metadata.
            </p>
          </Card>

          <Card hoverable className="space-y-4 p-6 rounded-3xl">
            <div className="w-10 h-10 rounded-2xl bg-[var(--apple-amber-bg)] text-[var(--apple-amber-text)] flex items-center justify-center font-bold text-sm border border-[var(--apple-amber-border)] flex-shrink-0">
              03
            </div>
            <h3 className="font-bold text-[var(--text-primary)] text-base">Risk Radar & Clauses</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Identifies 18+ clause types and categorizes potential attention areas (Low, Med, High).
            </p>
          </Card>

          <Card hoverable className="space-y-4 p-6 rounded-3xl">
            <div className="w-10 h-10 rounded-2xl bg-[var(--apple-emerald-bg)] text-[var(--apple-emerald-text)] flex items-center justify-center font-bold text-sm border border-[var(--apple-emerald-border)] flex-shrink-0">
              04
            </div>
            <h3 className="font-bold text-[var(--text-primary)] text-base">Lawyer Brief & Q&A</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Ask grounded questions with source citations, generate checklists, and print lawyer briefs.
            </p>
          </Card>
        </div>
      </section>

      {/* Comprehensive Legal Assistance Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
            INTELLIGENCE FEATURES
          </span>
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">Comprehensive Legal Assistance</h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto text-sm">
            Designed like a modern legal workspace rather than a basic chatbot.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hoverable className="space-y-4 p-6 rounded-3xl">
            <div className="p-3 bg-[var(--apple-blue-bg)] text-[var(--apple-blue-text)] rounded-2xl w-fit border border-[var(--apple-blue-border)]">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Plain-Language Summaries</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Instant document overview establishing doc type, parties, effective dates, obligations, and explicit warnings for absent data.
            </p>
          </Card>

          <Card hoverable className="space-y-4 p-6 rounded-3xl">
            <div className="p-3 bg-[var(--apple-rose-bg)] text-[var(--apple-rose-text)] rounded-2xl w-fit border border-[var(--apple-rose-border)]">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Accessible Risk Radar</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Categorizes findings into Low, Medium, and High attention areas using non-conclusion language, evidence snippets, and suggested questions.
            </p>
          </Card>

          <Card hoverable className="space-y-4 p-6 rounded-3xl">
            <div className="p-3 bg-[var(--apple-purple-bg)] text-[var(--apple-purple-text)] rounded-2xl w-fit border border-[var(--apple-purple-border)]">
              <HelpCircle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Grounded Document Q&A</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Ask natural questions and receive answers strictly anchored in the document text with clickable section and page citations.
            </p>
          </Card>

          <Card hoverable className="space-y-4 p-6 rounded-3xl">
            <div className="p-3 bg-[var(--apple-blue-bg)] text-[var(--apple-blue-text)] rounded-2xl w-fit border border-[var(--apple-blue-border)]">
              <GitCompare className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Side-by-Side Contract Comparison</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Upload two versions of an agreement (Contract A vs B) to see classified diffs across financial terms, liability, and notice windows.
            </p>
          </Card>

          <Card hoverable className="space-y-4 p-6 rounded-3xl">
            <div className="p-3 bg-[var(--apple-amber-bg)] text-[var(--apple-amber-text)] rounded-2xl w-fit border border-[var(--apple-amber-border)]">
              <CheckSquare className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Actionable Pre-Signing Checklist</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Interactive pre-signing checklist tracking payment verification, termination notices, IP assignments, and liability caps.
            </p>
          </Card>

          <Card hoverable className="space-y-4 p-6 rounded-3xl">
            <div className="p-3 bg-[var(--apple-emerald-bg)] text-[var(--apple-emerald-text)] rounded-2xl w-fit border border-[var(--apple-emerald-border)]">
              <Briefcase className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Lawyer Preparation Brief</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Generate a structured, exportable report summarizing obligations, dates, flagged concerns, and custom questions for legal counsel.
            </p>
          </Card>
        </div>
      </section>

      {/* Target WCAG & Security Vertical Timeline Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
            SECURITY & ACCESSIBILITY ARCHITECTURE
          </span>
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">Target WCAG 2.2 AA & Security Architecture</h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto text-sm">
            Target WCAG 2.2 AA Accessibility standards on the left, Enterprise Security controls on the right.
          </p>
        </div>

        {/* NxtWave / Apple Fusion Central Line Timeline Container */}
        <div className="timeline-container">
          {/* Central Vertical Line */}
          <div className="timeline-central-line" />

          {/* Row 1 */}
          <div className="timeline-row timeline-row-left">
            <div className="timeline-node-circle">1</div>
            <div className="timeline-card-box">
              <div className="glass-panel p-5 rounded-2xl border border-[var(--border-panel)] space-y-2 text-left hover:border-[var(--apple-purple-border)] transition-all">
                <div className="flex items-center gap-2">
                  <Eye className="h-4.5 w-4.5 text-[var(--apple-purple-text)] flex-shrink-0" />
                  <h4 className="font-bold text-[var(--text-primary)] text-sm">Dual Encoding & Visual Indicators</h4>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Risk levels never rely on color alone; every status badge pairs accessible contrast with clear text labels and SVG icons.
                </p>
              </div>
            </div>
          </div>

          <div className="timeline-row timeline-row-right">
            <div className="timeline-node-circle">2</div>
            <div className="timeline-card-box">
              <div className="glass-panel p-5 rounded-2xl border border-[var(--border-panel)] space-y-2 text-left hover:border-[var(--apple-blue-border)] transition-all">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4.5 w-4.5 text-[var(--apple-emerald-text)] flex-shrink-0" />
                  <h4 className="font-bold text-[var(--text-primary)] text-sm">Prompt Injection Protection</h4>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Indirect prompt injection shields treat uploaded legal documents strictly as untrusted text data.
                </p>
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="timeline-row timeline-row-left">
            <div className="timeline-node-circle">3</div>
            <div className="timeline-card-box">
              <div className="glass-panel p-5 rounded-2xl border border-[var(--border-panel)] space-y-2 text-left hover:border-[var(--apple-purple-border)] transition-all">
                <div className="flex items-center gap-2">
                  <Eye className="h-4.5 w-4.5 text-[var(--apple-purple-text)] flex-shrink-0" />
                  <h4 className="font-bold text-[var(--text-primary)] text-sm">Full Keyboard Navigation</h4>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Complete focus ring visibility, logical tab ordering, keyboard traps prevention, and screen reader live regions.
                </p>
              </div>
            </div>
          </div>

          <div className="timeline-row timeline-row-right">
            <div className="timeline-node-circle">4</div>
            <div className="timeline-card-box">
              <div className="glass-panel p-5 rounded-2xl border border-[var(--border-panel)] space-y-2 text-left hover:border-[var(--apple-blue-border)] transition-all">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4.5 w-4.5 text-[var(--apple-emerald-text)] flex-shrink-0" />
                  <h4 className="font-bold text-[var(--text-primary)] text-sm">Server-Side File Integrity</h4>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Binary magic byte verification prevents file type spoofing and executable injection before AI processing.
                </p>
              </div>
            </div>
          </div>

          {/* Row 3 */}
          <div className="timeline-row timeline-row-left">
            <div className="timeline-node-circle">5</div>
            <div className="timeline-card-box">
              <div className="glass-panel p-5 rounded-2xl border border-[var(--border-panel)] space-y-2 text-left hover:border-[var(--apple-purple-border)] transition-all">
                <div className="flex items-center gap-2">
                  <Eye className="h-4.5 w-4.5 text-[var(--apple-purple-text)] flex-shrink-0" />
                  <h4 className="font-bold text-[var(--text-primary)] text-sm">Accessible Contrast Palette</h4>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  High-contrast text and UI palette rigorously tuned to meet and exceed WCAG 2.2 AA 4.5:1 ratio across light and dark modes.
                </p>
              </div>
            </div>
          </div>

          <div className="timeline-row timeline-row-right">
            <div className="timeline-node-circle">6</div>
            <div className="timeline-card-box">
              <div className="glass-panel p-5 rounded-2xl border border-[var(--border-panel)] space-y-2 text-left hover:border-[var(--apple-blue-border)] transition-all">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4.5 w-4.5 text-[var(--apple-emerald-text)] flex-shrink-0" />
                  <h4 className="font-bold text-[var(--text-primary)] text-sm">In-Memory Data Minimization</h4>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Document text is processed strictly in-memory and permanently purged after session termination.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-6 py-4">
        <div className="glass-panel p-10 sm:p-14 rounded-3xl border border-[var(--border-panel)] space-y-6">
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">Ready to inspect your contract?</h2>
          <p className="text-[var(--text-secondary)] text-sm max-w-md mx-auto leading-relaxed">
            Upload your legal document or launch the instant sample demo workspace now.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button size="lg" variant="primary" onClick={onStartUpload}>
              Upload Document Now
            </Button>
            <Button size="lg" variant="outline" onClick={() => onTrySampleDemo('employment')}>
              Launch Sample Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
