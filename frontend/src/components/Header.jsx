import React from 'react';
import { Sparkles, FileText, Settings, Database, Upload, Layers, Sun, Moon } from 'lucide-react';

export default function Header({
  activeDatasetId,
  datasetProfile,
  onOpenUpload,
  onOpenReport,
  onOpenSettings,
  activeTab,
  setActiveTab,
  llmStatus,
  isDark,
  onToggleTheme
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-3 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-md shadow-emerald-500/20 flex-shrink-0">
              <Layers className="w-5 h-5 text-white stroke-[2.5]" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  DataLens <span className="text-emerald-600 dark:text-emerald-400">AI</span>
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-full">
                  Decision Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Turn any dataset into decisions through conversation.
              </p>
            </div>
          </div>

          {/* Theme switcher on mobile */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors"
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        {activeDatasetId && (
          <nav className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-950/70 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs self-start md:self-center overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'insights'
                  ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>⚡ Insights</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            </button>
            <button
              onClick={() => setActiveTab('ask')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'ask'
                  ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Ask AI</span>
            </button>
          </nav>
        )}

        {/* Right Action Controls */}
        <div className="flex items-center flex-wrap gap-2 self-end md:self-center">
          {activeDatasetId && (
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300">
              <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-mono font-medium max-w-[130px] truncate">{activeDatasetId}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 dark:text-slate-400 font-semibold">{datasetProfile?.rows?.toLocaleString()} rows</span>
            </div>
          )}

          {activeDatasetId && (
            <button
              onClick={onOpenReport}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/30 transition-all transform active:scale-95"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Executive Report</span>
            </button>
          )}

          <button
            onClick={onOpenUpload}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">{activeDatasetId ? "Change Data" : "Upload Data"}</span>
            <span className="sm:hidden">Upload</span>
          </button>

          {/* Theme switcher on desktop */}
          <button
            onClick={onToggleTheme}
            className="hidden md:flex p-2 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
            title="Toggle Light / Dark mode"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          <button
            onClick={onOpenSettings}
            title="Configure AI Models & Keys"
            className="relative p-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
          >
            <Settings className="w-4 h-4" />
            {llmStatus?.gemini_configured || llmStatus?.groq_configured || llmStatus?.openai_configured || llmStatus?.ollama_available ? (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500"></span>
            ) : null}
          </button>
        </div>
      </div>
    </header>
  );
}
