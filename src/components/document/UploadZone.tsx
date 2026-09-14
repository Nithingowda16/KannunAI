import React, { useState, useRef } from 'react';
import { Upload, RefreshCw, ShieldCheck, FileText, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Progress } from '../ui/Progress';
import { Alert } from '../ui/Alert';
import { validateLegalDocumentFile } from '../../services/security/fileValidator';
import { extractTextFromLegalFile } from '../../services/document/textExtractor';
import { UploadedDocument } from '../../types/document';

export interface UploadZoneProps {
  onDocumentProcessed: (doc: UploadedDocument) => void;
  onSelectSampleDemo: (type: 'employment' | 'saas_v1') => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onDocumentProcessed, onSelectSampleDemo }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setErrorMessage(null);
    const validation = validateLegalDocumentFile(file);

    if (!validation.isValid) {
      setErrorMessage(validation.error || 'Invalid file uploaded.');
      return;
    }

    setIsProcessing(true);
    setProgress(15);
    setStatusMessage('Validating binary file header & MIME integrity...');

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setProgress(45);
      setStatusMessage('Extracting text streams & preserving page citations...');

      const extractedDoc = await extractTextFromLegalFile(file);

      setProgress(85);
      setStatusMessage('Building Unicode semantic vector index & chunking document...');
      await new Promise((resolve) => setTimeout(resolve, 300));

      setProgress(100);
      setStatusMessage('Analysis complete!');
      await new Promise((resolve) => setTimeout(resolve, 200));

      setIsProcessing(false);
      onDocumentProcessed(extractedDoc);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err.message || 'Failed to extract text from the provided file. Please try again.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Title & Subtitle */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--apple-blue-text)]">
          SECURE LEGAL INGESTION PIPELINE
        </span>
        <h2 className="text-3xl font-extrabold text-[var(--text-primary)]">Upload Your Legal Document</h2>
        <p className="text-[var(--text-secondary)] text-sm max-w-xl mx-auto leading-relaxed">
          Sanitized and processed strictly in-memory. Supports PDF, DOCX, and TXT files up to 10MB.
        </p>
      </div>

      {/* Main Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        tabIndex={0}
        role="button"
        aria-label="Upload document area. Press Enter or Space to choose a file."
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={`glass-panel p-10 sm:p-14 rounded-3xl border-2 border-dashed text-center transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--apple-blue)] shadow-lg relative group ${
          isDragging
            ? 'border-[var(--apple-blue)] bg-[var(--apple-blue-bg)] scale-[1.01]'
            : 'border-[var(--border-panel)] hover:border-[var(--apple-blue-border)] bg-[var(--bg-panel)]'
        }`}
      >
        {/* Strictly Hidden Native File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
          className="hidden"
        />

        <div className="flex flex-col items-center space-y-5">
          {/* Animated Upload Icon Box */}
          <div className="relative p-4 rounded-2xl bg-gradient-to-br from-[#0284c7] via-[#7c3aed] to-[#059669] text-white shadow-md group-hover:scale-110 transition-transform duration-300">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#0284c7] to-[#7c3aed] opacity-40 blur-md transition-opacity duration-300 group-hover:opacity-80" />
            <Upload className="h-8 w-8 relative z-10 text-white" />
          </div>

          {/* Text Instructions */}
          <div className="space-y-1.5 max-w-md">
            <p className="font-bold text-[var(--text-primary)] text-base">
              Drag & drop your contract here, or <span className="text-[var(--apple-blue-text)] underline font-semibold">browse files</span>
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              PDF, DOCX, or TXT format (Maximum 10 MB per document)
            </p>
          </div>

          {/* Supported Format Badges */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">.PDF</span>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">.DOCX</span>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">.TXT</span>
          </div>

          {/* Security & Privacy Guarantee */}
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] pt-3 bg-[var(--bg-secondary)] px-4 py-2 rounded-full border border-[var(--border-subtle)]">
            <Lock className="h-3.5 w-3.5 text-[var(--apple-emerald-text)] flex-shrink-0" />
            <span>Binary Magic Byte Verification & In-Memory Ephemeral Storage</span>
          </div>
        </div>
      </div>

      {/* Processing State */}
      {isProcessing && (
        <div className="glass-panel p-6 rounded-2xl space-y-3 border border-[var(--apple-blue-border)] shadow-md" role="status" aria-live="polite">
          <Progress value={progress} label={statusMessage} />
          <p className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-[var(--apple-blue-text)]" />
            Generating grounded Unicode vector chunks and extracting legal citations...
          </p>
        </div>
      )}

      {/* Error State with Retry */}
      {errorMessage && (
        <Alert type="error" title="Document Ingestion Error">
          <p className="mb-3 text-xs leading-relaxed">{errorMessage}</p>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={() => {
              setErrorMessage(null);
              fileInputRef.current?.click();
            }}
          >
            Try Again
          </Button>
        </Alert>
      )}

      {/* 1-Click Sample Demo Contracts */}
      <div className="glass-panel p-6 rounded-2xl border border-[var(--border-panel)] flex flex-col sm:flex-row items-center justify-between gap-5 shadow-sm">
        <div className="flex items-center gap-3.5 text-left">
          <div className="p-3 bg-[var(--apple-blue-bg)] text-[var(--apple-blue-text)] rounded-xl border border-[var(--apple-blue-border)] flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-bold text-[var(--text-primary)] text-sm">Don't have a document ready?</h4>
            <p className="text-xs text-[var(--text-secondary)]">Test KannunAI instantly with pre-parsed sample legal contracts.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onSelectSampleDemo('employment')}
            className="flex-1 sm:flex-initial"
          >
            Employment Agreement
          </Button>
          <Button
            size="sm"
            variant="secondary"
            rightIcon={<ArrowRight className="h-3.5 w-3.5 opacity-60" />}
            onClick={() => onSelectSampleDemo('saas_v1')}
            className="flex-1 sm:flex-initial"
          >
            SaaS Master Terms
          </Button>
        </div>
      </div>
    </div>
  );
};
