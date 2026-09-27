import React from 'react';
import { Sparkles, FileText, Settings, Database, Upload, Layers } from 'lucide-react';

export default function Header({
  activeDatasetId,
  datasetProfile,
  onOpenUpload,
  onOpenReport,
  onOpenSettings,
  activeTab,
  setActiveTab,
  llmStatus
}) {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-emerald-600 shadow-lg shadow-brand-500/20">
            <Layers className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white">DataLens AI</h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-full">
                Decision Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Turn any dataset into decisions through conversation.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        {activeDatasetId && (
          <nav className="flex items-center space-x-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-slate-800 text-brand-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'insights'
                  ? 'bg-slate-800 text-brand-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Insights</span>
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400"></span>
            </button>
            <button
              onClick={() => setActiveTab('ask')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'ask'
                  ? 'bg-slate-800 text-brand-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Ask AI</span>
            </button>
          </nav>
        )}

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {activeDatasetId && (
            <div className="hidden md:flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono text-slate-200 max-w-[120px] truncate">{activeDatasetId}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">{datasetProfile?.rows?.toLocaleString()} rows</span>
            </div>
          )}

          {activeDatasetId && (
            <button
              onClick={onOpenReport}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white shadow-md shadow-emerald-950/40 transition-all transform active:scale-95"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Executive Report</span>
              <span className="sm:hidden">Report</span>
            </button>
          )}

          <button
            onClick={onOpenUpload}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">{activeDatasetId ? "Change Data" : "Upload CSV"}</span>
          </button>

          <button
            onClick={onOpenSettings}
            title="Configure AI Models & Keys"
            className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
            {llmStatus?.gemini_configured || llmStatus?.groq_configured || llmStatus?.openai_configured || llmStatus?.ollama_available ? (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400"></span>
            ) : null}
          </button>
        </div>
      </div>
    </header>
  );
}
