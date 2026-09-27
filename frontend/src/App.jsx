import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import UploadZone from './components/UploadZone';
import OverviewTab from './components/OverviewTab';
import InsightsTab from './components/InsightsTab';
import AskAITab from './components/AskAITab';
import ExecutiveReportModal from './components/ExecutiveReportModal';
import SettingsModal from './components/SettingsModal';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [activeDatasetId, setActiveDatasetId] = useState(null);
  const [datasetProfile, setDatasetProfile] = useState(null);
  const [insights, setInsights] = useState([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'insights' | 'ask'
  const [messages, setMessages] = useState([]);
  const [loadingQuery, setLoadingQuery] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [llmStatus, setLlmStatus] = useState(null);

  // Initial load: fetch settings and preload retail_sales sample dataset
  useEffect(() => {
    const initialize = async () => {
      try {
        // Fetch LLM status
        const setRes = await fetch('/api/settings');
        if (setRes.ok) {
          const s = await setRes.json();
          setLlmStatus(s);
        }

        // Preload default sample dataset (Retail Sales 2026) for instantaneous jury presentation
        const sampleRes = await fetch('/api/sample/retail_sales');
        if (sampleRes.ok) {
          const data = await sampleRes.json();
          handleDatasetLoaded(data);

          // Preload the flagship initial query: "Which region generated the most revenue?"
          // so the jury sees the full experience without even clicking!
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

  const handleDatasetLoaded = (data) => {
    setActiveDatasetId(data.dataset_id);
    setDatasetProfile(data.profile);
    setInsights(data.insights || []);

    // Fetch suggested questions
    fetch(`/api/dataset/${data.dataset_id}/suggested-questions`)
      .then((res) => res.json())
      .then((qData) => {
        if (qData.questions) setSuggestedQuestions(qData.questions);
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

  const handleUploadSuccess = (data) => {
    handleDatasetLoaded(data);
    setMessages([]);
    setActiveTab('overview');
    setIsUploadOpen(false);
  };

  const handleSendQuery = async (question) => {
    if (!activeDatasetId || !question.trim()) return;
    setLoadingQuery(true);
    setActiveTab('ask');

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
      // Append fallback error notification in thread
      setMessages((prev) => [
        ...prev,
        {
          question,
          thought_process: "Encountered processing anomaly while parsing schema.",
          headline: "Unable to complete quantitative calculation for this query.",
          narrative: err.message || "Please rephrase your question or select one of the suggested inquiries.",
          chart_data: []
        }
      ]);
    } finally {
      setLoadingQuery(false);
    }
  };

  const handleSelectInsightQuery = (query) => {
    handleSendQuery(query);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        activeDatasetId={activeDatasetId}
        datasetProfile={datasetProfile}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        llmStatus={llmStatus}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {initialLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="w-10 h-10 text-brand-400 animate-spin" />
            <p className="text-sm font-semibold text-slate-300">
              Initializing DataLens AI Intelligence Engine...
            </p>
          </div>
        ) : !activeDatasetId ? (
          <UploadZone
            onUploadSuccess={handleUploadSuccess}
            onLoadSample={(s) => fetch(`/api/sample/${s}`).then(r => r.json()).then(handleUploadSuccess)}
          />
        ) : (
          <div>
            {activeTab === 'overview' && (
              <OverviewTab
                profile={datasetProfile}
                onAskQuestion={handleSendQuery}
              />
            )}

            {activeTab === 'insights' && (
              <InsightsTab
                insights={insights}
                onSelectInsight={handleSelectInsightQuery}
              />
            )}

            {activeTab === 'ask' && (
              <AskAITab
                datasetId={activeDatasetId}
                suggestedQuestions={suggestedQuestions}
                messages={messages}
                onSendQuery={handleSendQuery}
                loading={loadingQuery}
              />
            )}
          </div>
        )}
      </main>

      {/* Upload Modal (if triggered via header) */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white">Load New Dataset</h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                Close
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

      {/* Executive Report Modal */}
      <ExecutiveReportModal
        datasetId={activeDatasetId}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsUpdated={(st) => setLlmStatus(st)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>DataLens AI · Turn any dataset into decisions through conversation.</span>
          <span className="font-mono text-slate-600">Python Ground Truth Engine + Multi-LLM Reasoning</span>
        </div>
      </footer>
    </div>
  );
}
