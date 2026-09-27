import React, { useState } from 'react';
import {
  Send,
  Sparkles,
  Code2,
  Cpu,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  BarChart3,
  LineChart,
  PieChart,
  AreaChart,
  Lightbulb,
  HelpCircle,
  Loader2,
  Bot
} from 'lucide-react';
import ChartRenderer from './ChartRenderer';

export default function AskAITab({
  datasetId,
  suggestedQuestions = [],
  messages = [],
  onSendQuery,
  loading = false
}) {
  const [inputQuery, setInputQuery] = useState('');
  const [expandedCodes, setExpandedCodes] = useState({});
  const [chartTypes, setChartTypes] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputQuery.trim() || loading) return;
    onSendQuery(inputQuery);
    setInputQuery('');
  };

  const handleSelectSuggested = (q) => {
    if (loading) return;
    onSendQuery(q);
  };

  const toggleCode = (idx) => {
    setExpandedCodes((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const setCardChartType = (idx, type) => {
    setChartTypes((prev) => ({ ...prev, [idx]: type }));
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. SUGGESTED QUESTIONS CHIPS ("THE WOW MOMENT") */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
        <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
          <div className="p-1 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Lightbulb className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Suggested Analysis Questions
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">— click any prompt to calculate instantly</span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              disabled={loading}
              onClick={() => handleSelectSuggested(q)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-brand-500/10 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-brand-300 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
            >
              <span>{q}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. CHAT / ANALYSIS THREAD */}
      <div className="space-y-8">
        {messages.length === 0 ? (
          <div className="p-16 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 flex items-center justify-center mx-auto mb-3.5 text-emerald-600 dark:text-brand-400">
              <Bot className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Ask your first question</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
              Select one of the suggested prompts above or type your inquiry. The system generates an internal plan, verifies calculations on Python, and visualizes the results.
            </p>
          </div>
        ) : (
          messages.map((item, idx) => {
            const currentChartType = chartTypes[idx] || item.chart_type || 'bar';
            const isCodeExpanded = expandedCodes[idx];

            return (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow transition-shadow space-y-6"
              >
                {/* User Prompt Header */}
                <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0">
                      Q
                    </div>
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                      "{item.question}"
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-500/20 whitespace-nowrap">
                    Python Kernel Verified
                  </span>
                </div>

                {/* THE KILLER FEATURE: AI REASONING & ANALYSIS PLAN STEPPER */}
                <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <Cpu className="w-4 h-4 text-emerald-600 dark:text-brand-400" />
                      <span>Execution Pipeline & Transparency</span>
                    </div>
                    <button
                      onClick={() => toggleCode(idx)}
                      className="text-xs font-mono font-semibold text-emerald-700 dark:text-brand-400 hover:text-emerald-800 dark:hover:text-brand-300 flex items-center space-x-1"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>{isCodeExpanded ? 'Hide Code & Plan' : 'View Code & Plan'}</span>
                      {isCodeExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Flow Pills */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center space-x-1.5 border border-slate-200 dark:border-slate-700 shadow-2xs font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Target: {item.target_column}</span>
                    </span>
                    {item.analysis_plan?.group_by?.length > 0 && (
                      <span className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center space-x-1.5 border border-slate-200 dark:border-slate-700 shadow-2xs font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
                        <span>Group: {item.analysis_plan.group_by.join(', ')}</span>
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center space-x-1.5 border border-slate-200 dark:border-slate-700 shadow-2xs font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Metric: {item.metric || 'sum'}</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 font-bold">
                      Zero Hallucination
                    </span>
                  </div>

                  {/* Expandable Code & Plan */}
                  {isCodeExpanded && (
                    <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-slate-800 space-y-4">
                      <div>
                        <p className="text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider mb-1.5">
                          Generated Analysis Plan (JSON)
                        </p>
                        <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                          {JSON.stringify(item.analysis_plan, null, 2)}
                        </pre>
                      </div>

                      {item.executed_python_code && (
                        <div>
                          <p className="text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider mb-1.5">
                            Executed Pandas Code (Ground Truth)
                          </p>
                          <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto">
                            {item.executed_python_code}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* VISUALIZATION */}
                {item.chart_data && item.chart_data.length > 0 && (
                  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        {item.target_column.replace('_', ' ').toUpperCase()} BREAKDOWN
                      </span>

                      {/* Chart Switcher Buttons */}
                      <div className="flex items-center space-x-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs self-start sm:self-center">
                        <button
                          onClick={() => setCardChartType(idx, 'bar')}
                          className={`p-1.5 rounded-lg transition-colors ${currentChartType === 'bar' ? 'bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-brand-400 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                          title="Bar Chart"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCardChartType(idx, 'line')}
                          className={`p-1.5 rounded-lg transition-colors ${currentChartType === 'line' ? 'bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-brand-400 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                          title="Line Chart"
                        >
                          <LineChart className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCardChartType(idx, 'area')}
                          className={`p-1.5 rounded-lg transition-colors ${currentChartType === 'area' ? 'bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-brand-400 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                          title="Area Chart"
                        >
                          <AreaChart className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCardChartType(idx, 'pie')}
                          className={`p-1.5 rounded-lg transition-colors ${currentChartType === 'pie' ? 'bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-brand-400 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                          title="Donut / Pie Chart"
                        >
                          <PieChart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <ChartRenderer
                      data={item.chart_data}
                      type={currentChartType}
                      targetColumn={item.target_column}
                      height={280}
                    />
                  </div>
                )}

                {/* VERIFIED AI EXPLANATION */}
                <div className="space-y-4 pt-1">
                  {item.headline && (
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-brand-500/10 border border-emerald-200 dark:border-brand-500/20 text-emerald-950 dark:text-brand-200 text-xs sm:text-sm font-bold leading-snug">
                      {item.headline}
                    </div>
                  )}

                  {item.narrative && (
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                      {item.narrative}
                    </p>
                  )}

                  {item.why_hypothesis && (
                    <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-slate-950/60 border border-amber-200/80 dark:border-slate-800/80">
                      <div className="flex items-center space-x-2 text-xs font-bold text-amber-900 dark:text-amber-400 mb-1.5">
                        <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>Why might this be happening? (Deep Reasoning)</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-400 leading-relaxed">
                        {item.why_hypothesis}
                      </p>
                    </div>
                  )}
                </div>

                {/* FOLLOW UP QUESTIONS */}
                {item.follow_up_questions && item.follow_up_questions.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 block">
                      Recommended Strategic Drill-downs:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {item.follow_up_questions.map((fq, fIdx) => (
                        <button
                          key={fIdx}
                          disabled={loading}
                          onClick={() => handleSelectSuggested(fq)}
                          className="px-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-white border border-slate-200 dark:border-slate-700/50 transition-colors text-left flex items-center space-x-1.5 shadow-2xs font-medium"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-brand-400 flex-shrink-0" />
                          <span>{fq}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 3. INPUT BAR */}
      <form onSubmit={handleSubmit} className="sticky bottom-6 z-20">
        <div className="relative flex items-center rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-300 dark:border-slate-700/80 shadow-xl p-2 focus-within:border-emerald-600 transition-all">
          <input
            type="text"
            placeholder="Ask anything (e.g. Which region generated the most revenue? or Why did sales decrease in March?)..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={loading}
            className="flex-1 bg-transparent px-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || loading}
            className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs transition-colors shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Analyzing...</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">Analyze</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
