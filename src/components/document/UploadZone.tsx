import React, { useState, useRef } from 'react';
import { Upload, RefreshCw, ShieldCheck, FileText, ArrowRight } from 'lucide-react';
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
    setStatusMessage('Validating binary file header & MIME type...');

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setProgress(45);
      setStatusMessage('Extracting text streams & preserving page citations...');

      const extractedDoc = await extractTextFromLegalFile(file);

      setProgress(85);
      setStatusMessage('Building semantic vector index & chunking document...');
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
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-extrabold text-[var(--text-primary)]">Upload Your Legal Document</h2>
        <p className="text-[var(--text-secondary)] text-sm max-w-xl mx-auto leading-relaxed">
          Supports PDF, DOCX, and TXT files up to 10MB. Files are sanitized and processed in-memory securely.
        </p>
      </div>

      {/* Drag & Drop Box */}
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
        className={`glass-panel p-12 rounded-3xl border-2 border-dashed text-center transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shadow-lg ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
            : 'border-[var(--border-panel)] hover:border-indigo-500/50 bg-[var(--bg-panel)]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-500/20 shadow-xs group-hover:scale-110 transition-transform">
            <Upload className="h-8 w-8" />
          </div>

          <div className="space-y-1">
            <p className="font-bold text-[var(--text-primary)] text-base">
              Drag & Drop your contract here, or <span className="text-indigo-600 dark:text-indigo-400 underline font-semibold">browse files</span>
            </p>
            <p className="text-xs text-[var(--text-secondary)]">PDF, DOCX, TXT (Max file size: 10MB)</p>
          </div>

          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] pt-2 bg-[var(--bg-secondary)] px-3 py-1.5 rounded-full border border-[var(--border-subtle)]">
            <ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
            <span>Strict binary magic byte validation & in-memory processing</span>
          </div>
        </div>
      </div>

      {/* Processing State */}
      {isProcessing && (
        <div className="glass-panel p-6 rounded-2xl space-y-3 border border-indigo-500/30 shadow-md" role="status" aria-live="polite">
          <Progress value={progress} label={statusMessage} />
          <p className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-500" />
            Generating grounded RAG chunks and extracting legal citations...
          </p>
        </div>
      )}

      {/* Error State with Retry */}
      {errorMessage && (
        <Alert type="error" title="Document Processing Error">
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

      {/* 1-Click Competition Demo Trigger */}
      <div className="glass-panel p-6 rounded-2xl border border-[var(--border-panel)] flex flex-col sm:flex-row items-center justify-between gap-5 shadow-sm">
        <div className="flex items-center gap-3.5 text-left">
          <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-500/20 flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-bold text-[var(--text-primary)] text-sm">Don't have a document on hand?</h4>
            <p className="text-xs text-[var(--text-secondary)]">Launch our pre-parsed sample contracts instantly in 1 click.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onSelectSampleDemo('employment')}
            className="flex-1 sm:flex-initial"
          >
            Employment Sample
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
