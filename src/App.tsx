import React, { useState, useEffect, lazy, Suspense } from 'react';
import { DisclaimerBanner } from './components/layout/DisclaimerBanner';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './components/landing/LandingPage';
import { UploadZone } from './components/document/UploadZone';
import { Skeleton } from './components/ui/Skeleton';
import { UploadedDocument } from './types/document';
import { DocumentAnalysis } from './types/analysis';
import { GeminiAIProvider } from './services/ai/geminiProvider';
import { getSampleDocument } from './utils/sampleDocuments';

const AnalysisWorkspace = lazy(() => import('./components/workspace/AnalysisWorkspace').then((m) => ({ default: m.AnalysisWorkspace })));
const ComparisonView = lazy(() => import('./components/workspace/ComparisonView').then((m) => ({ default: m.ComparisonView })));

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'landing' | 'upload' | 'workspace' | 'compare'>('landing');
  const [currentDocument, setCurrentDocument] = useState<UploadedDocument | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<DocumentAnalysis | null>(null);
  
  // Apple Theme State (Light vs Dark Mode)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('lexora_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

// Synchronize HTML theme class
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('lexora_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleDocumentProcessed = async (doc: UploadedDocument) => {
    setCurrentDocument(doc);

    try {
      const provider = new GeminiAIProvider();
      const analysis = await provider.analyzeDocument(doc);
      setCurrentAnalysis(analysis);
      setActiveView('workspace');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Document analysis failed.';
      console.error('Error analyzing document:', message);
    }
  };

  const handleSelectSampleDemo = async (type: 'employment' | 'saas_v1') => {
    const doc = getSampleDocument(type);
    await handleDocumentProcessed(doc);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-300">
      {/* Top Responsible AI Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Accessible Header Navigation with Theme Switcher */}
      <Header
        activeView={activeView === 'upload' ? 'landing' : activeView}
        onNavigate={(view) => setActiveView(view)}
        onTryDemo={() => handleSelectSampleDemo('employment')}
        hasAnalyzedDoc={!!currentAnalysis}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'landing' && (
          <LandingPage
            onStartUpload={() => setActiveView('upload')}
            onTrySampleDemo={handleSelectSampleDemo}
            onOpenCompare={() => setActiveView('compare')}
          />
        )}

        {activeView === 'upload' && (
          <div className="py-8">
            <UploadZone
              onDocumentProcessed={handleDocumentProcessed}
              onSelectSampleDemo={handleSelectSampleDemo}
            />
          </div>
        )}

        <Suspense fallback={<Skeleton className="h-64 w-full rounded-2xl" />}>
          {activeView === 'workspace' && currentDocument && currentAnalysis && (
            <AnalysisWorkspace document={currentDocument} analysis={currentAnalysis} />
          )}

          {activeView === 'compare' && (
            <ComparisonView
              currentDocument={currentDocument}
              onSelectSampleDemo={() => handleSelectSampleDemo('saas_v1')}
            />
          )}
        </Suspense>
      </main>

      {/* Accessible Footer */}
      <Footer />
    </div>
  );
};

export default App;
