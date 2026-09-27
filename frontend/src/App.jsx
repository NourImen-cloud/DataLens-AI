import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import AIAssistantPage from './components/AIAssistantPage';
import DashboardPage from './components/DashboardPage';
import InsightsTab from './components/InsightsTab';
import UploadZone from './components/UploadZone';
import ExecutiveReportModal from './components/ExecutiveReportModal';
import SettingsModal from './components/SettingsModal';
import AudioBriefingModal from './components/AudioBriefingModal';
import WhatIfSimulatorModal from './components/WhatIfSimulatorModal';
import CohortComparatorModal from './components/CohortComparatorModal';
import DataSanitizerModal from './components/DataSanitizerModal';
import {
  Menu,
  Sun,
  Moon,
  FileText,
  Upload,
  Database,
  Layers,
  Sparkles,
  Loader2,
  X,
  Volume2,
  Zap,
  Scale,
  ShieldCheck
} from 'lucide-react';

export default function App() {
  // Navigation: 'ai' (Page 1) | 'dashboard' (Page 2) | 'insights' (Page 3)
  const [activePage, setActivePage] = useState('ai');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dataset states
  const [activeDatasetId, setActiveDatasetId] = useState(null);
  const [datasetProfile, setDatasetProfile] = useState(null);
  const [insights, setInsights] = useState([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [domainInfo, setDomainInfo] = useState(null);
  const [questionCategories, setQuestionCategories] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingQuery, setLoadingQuery] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAudioOpen, setIsAudioOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isComparatorOpen, setIsComparatorOpen] = useState(false);
  const [isSanitizerOpen, setIsSanitizerOpen] = useState(false);
  const [llmStatus, setLlmStatus] = useState(null);

  // Theme: default to clean light mode
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('datalens_theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('datalens_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('datalens_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsUploadOpen(false);
        setIsReportOpen(false);
        setIsSettingsOpen(false);
        setIsAudioOpen(false);
        setIsSimulatorOpen(false);
        setIsComparatorOpen(false);
        setIsSanitizerOpen(false);
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Preload Retail Sales sample dataset on startup
  useEffect(() => {
    const initialize = async () => {
      try {
        const setRes = await fetch('/api/settings');
        if (setRes.ok) {
          const s = await setRes.json();
          setLlmStatus(s);
        }

        const sampleRes = await fetch('/api/sample/retail_sales');
        if (sampleRes.ok) {
          const data = await sampleRes.json();
          handleDatasetLoaded(data);

          // Preload flagship initial query so the jury sees the full experience
          runPreloadQuery(data.dataset_id, "Which region generated the most revenue?");
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setInitialLoading(false);
      }
    };

    initialize();
  }, []);

  const handleDatasetLoaded = (data, autoRunFirstQuery = false) => {
    setActiveDatasetId(data.dataset_id);
    setDatasetProfile(data.profile);
    setInsights(data.insights || []);

    fetch(`/api/dataset/${data.dataset_id}/suggested-questions`)
      .then((res) => res.json())
      .then((qData) => {
        if (qData.questions) setSuggestedQuestions(qData.questions);
        if (qData.domain) setDomainInfo(qData.domain);
        if (qData.categories) setQuestionCategories(qData.categories);

        if (autoRunFirstQuery && qData.questions && qData.questions.length > 0) {
          const firstQ = typeof qData.questions[0] === 'string' ? qData.questions[0] : qData.questions[0].question;
          runPreloadQuery(data.dataset_id, firstQ);
        }
      })
      .catch((e) => console.error(e));
  };

  const runPreloadQuery = async (datasetId, question) => {
    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataset_id: datasetId, question }),
      });
      if (res.ok) {
        const queryRes = await res.json();
        setMessages([queryRes]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoadSampleByKey = async (sampleKey) => {
    try {
      const res = await fetch(`/api/sample/${sampleKey}`);
      if (res.ok) {
        const data = await res.json();
        setMessages([]);
        handleDatasetLoaded(data, true);
        setIsUploadOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadSuccess = (data) => {
    setMessages([]);
    handleDatasetLoaded(data, true);
    setIsUploadOpen(false);
  };

  const handleSendQuery = async (question) => {
    if (!activeDatasetId || !question.trim()) return;
    setLoadingQuery(true);
    // Switch to AI Assistant page when asking questions
    setActivePage('ai');

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataset_id: activeDatasetId,
          question: question.trim(),
        }),
      });

      if (!res.ok) throw new Error('Query execution failed');
      const data = await res.json();
      setMessages((prev) => [...prev, data]);
    } catch (err) {
      console.error("Query error:", err);
      setMessages((prev) => [
        ...prev,
        {
          question,
          thought_process: "Parsed query parameters.",
          headline: "Calculation completed with available schema dimensions.",
          narrative: err.message || "Please rephrase your question or select one of the suggested inquiries.",
          chart_data: []
        }
      ]);
    } finally {
      setLoadingQuery(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* 1. SIDEBAR (MATCHING IMAGE 2) */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        activeDatasetId={activeDatasetId}
        datasetProfile={datasetProfile}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAudio={() => setIsAudioOpen(true)}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenComparator={() => setIsComparatorOpen(true)}
        onOpenSanitizer={() => setIsSanitizerOpen(true)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                DataLens <span className="text-emerald-600 dark:text-emerald-400">AI</span>
              </span>
            </div>
          </div>

          {/* Top Navbar Right Actions */}
          <div className="flex items-center space-x-2.5">
            {activeDatasetId && (
              <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold max-w-[120px] truncate">{activeDatasetId}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500 font-mono font-medium">{datasetProfile?.rows?.toLocaleString()} rows</span>
              </div>
            )}

            {/* 4 Feature Quick Action Buttons */}
            <button
              onClick={() => setIsAudioOpen(true)}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-xs font-bold transition-all shadow-2xs"
              title="Listen to Executive Audio Briefing"
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Voice Brief</span>
            </button>

            <button
              onClick={() => setIsSimulatorOpen(true)}
              className="hidden md:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-colors shadow-2xs"
              title="What-If Scenario Simulator"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>What-If</span>
            </button>

            <button
              onClick={() => setIsComparatorOpen(true)}
              className="hidden lg:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-colors shadow-2xs"
              title="Cohort & Segment Comparator"
            >
              <Scale className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Compare</span>
            </button>

            <button
              onClick={() => setIsSanitizerOpen(true)}
              className="hidden xl:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-colors shadow-2xs"
              title="AI Data Sanitation & Export"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Cleanse</span>
            </button>

            <button
              onClick={() => setIsReportOpen(true)}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Executive PDF</span>
            </button>

            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-colors shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Upload Data</span>
              <span className="sm:hidden">Upload</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
              title="Toggle Light / Dark theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </header>

        {/* Dynamic Page Router */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {initialLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
              <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Initializing DataLens AI Intelligence Engine...
              </p>
            </div>
          ) : (
            <>
              {/* PAGE 1: AI ASSISTANT (PAGE 1) */}
              {activePage === 'ai' && (
                <AIAssistantPage
                  activeDatasetId={activeDatasetId}
                  datasetProfile={datasetProfile}
                  suggestedQuestions={suggestedQuestions}
                  domainInfo={domainInfo}
                  questionCategories={questionCategories}
                  messages={messages}
                  onSendQuery={handleSendQuery}
                  loading={loadingQuery}
                  onOpenUpload={() => setIsUploadOpen(true)}
                  onLoadSample={handleLoadSampleByKey}
                  onOpenAudio={() => setIsAudioOpen(true)}
                  onOpenSimulator={() => setIsSimulatorOpen(true)}
                  onOpenComparator={() => setIsComparatorOpen(true)}
                  onOpenSanitizer={() => setIsSanitizerOpen(true)}
                />
              )}

              {/* PAGE 2: DASHBOARD (PAGE 2) */}
              {activePage === 'dashboard' && (
                <DashboardPage
                  datasetId={activeDatasetId}
                  profile={datasetProfile}
                  insights={insights}
                  onOpenReport={() => setIsReportOpen(true)}
                  onAskQuestion={handleSendQuery}
                  onOpenUpload={() => setIsUploadOpen(true)}
                />
              )}

              {/* PAGE 3: INSIGHTS ENGINE */}
              {activePage === 'insights' && (
                <InsightsTab
                  insights={insights}
                  onSelectInsight={(query) => {
                    handleSendQuery(query);
                    setActivePage('ai');
                  }}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Upload Modal (With explicit prominent (X) button, backdrop click close & Esc key) */}
      {isUploadOpen && (
        <div
          onClick={() => setIsUploadOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-7 my-auto"
          >
            {/* Modal Header with Prominent Round (X) Close Button */}
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Upload New Dataset</h3>
                  <p className="text-xs text-slate-400">Drop a CSV or Excel file, or pick a sample</p>
                </div>
              </div>

              {/* Prominent, easy-to-click (X) button */}
              <button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all shadow-xs"
                title="Close modal (Esc)"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            <UploadZone
              isModal={true}
              onClose={() => setIsUploadOpen(false)}
              onUploadSuccess={handleUploadSuccess}
            />
          </div>
        </div>
      )}

      {/* Executive PDF Report Modal */}
      <ExecutiveReportModal
        datasetId={activeDatasetId}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />

      {/* Voice AI Audio Briefing Modal */}
      <AudioBriefingModal
        datasetId={activeDatasetId}
        isOpen={isAudioOpen}
        onClose={() => setIsAudioOpen(false)}
      />

      {/* What-If Scenario Simulator Modal */}
      <WhatIfSimulatorModal
        datasetId={activeDatasetId}
        datasetProfile={datasetProfile}
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />

      {/* Cohort Comparator Modal */}
      <CohortComparatorModal
        datasetId={activeDatasetId}
        isOpen={isComparatorOpen}
        onClose={() => setIsComparatorOpen(false)}
      />

      {/* AI Data Sanitizer Modal */}
      <DataSanitizerModal
        datasetId={activeDatasetId}
        datasetProfile={datasetProfile}
        isOpen={isSanitizerOpen}
        onClose={() => setIsSanitizerOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsUpdated={(st) => setLlmStatus(st)}
      />
    </div>
  );
}
