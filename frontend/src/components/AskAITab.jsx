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
    <div className="space-y-6">
      {/* 1. WOW MOMENT: SUGGESTED QUESTIONS CHIPS */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
        <div className="flex items-center space-x-2 text-slate-300 mb-3">
          <Lightbulb className="w-4 h-4 text-brand-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Suggested Analysis Questions
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">— click any to run instantly</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              disabled={loading}
              onClick={() => handleSelectSuggested(q)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-brand-500/10 hover:border-brand-500/40 text-slate-200 hover:text-brand-300 border border-slate-700/70 transition-all flex items-center space-x-1.5 active:scale-95 disabled:opacity-50"
            >
              <span>{q}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. CHAT / ANALYSIS THREAD */}
      <div className="space-y-6">
        {messages.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-slate-800/80 bg-slate-900/40">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-3 text-brand-400">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Ask your first question</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Select one of the suggested questions above, or ask anything about trends, drivers, regional performance, anomalies, or segment performance.
            </p>
          </div>
        ) : (
          messages.map((item, idx) => {
            const currentChartType = chartTypes[idx] || item.chart_type || 'bar';
            const isCodeExpanded = expandedCodes[idx];

            return (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5"
              >
                {/* User Prompt Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 rounded-lg bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold text-xs">
                      Q
                    </div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      "{item.question}"
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                    Verified Pandas Execution
                  </span>
                </div>

                {/* THE KILLER FEATURE: AI REASONING & ANALYSIS PLAN STEPPER */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
                      <Cpu className="w-3.5 h-3.5 text-brand-400" />
                      <span>Execution Pipeline</span>
                    </div>
                    <button
                      onClick={() => toggleCode(idx)}
                      className="text-[11px] font-mono text-brand-400 hover:text-brand-300 flex items-center space-x-1"
                    >
                      <Code2 className="w-3 h-3" />
                      <span>{isCodeExpanded ? 'Hide Code & Plan' : 'View Code & Plan'}</span>
                      {isCodeExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  {/* Flow Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 flex items-center space-x-1 border border-slate-700/60">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Target: {item.target_column}</span>
                    </span>
                    {item.analysis_plan?.group_by?.length > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 flex items-center space-x-1 border border-slate-700/60">
                        <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                        <span>Group: {item.analysis_plan.group_by.join(', ')}</span>
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 flex items-center space-x-1 border border-slate-700/60">
                      <CheckCircle2 className="w-3 h-3 text-indigo-400" />
                      <span>Metric: {item.metric || 'sum'}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      Source of Truth: Python Kernel
                    </span>
                  </div>

                  {/* Expandable Code & Plan */}
                  {isCodeExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-800 space-y-3">
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-1">
                          Generated Analysis Plan (JSON)
                        </p>
                        <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-brand-300 overflow-x-auto">
                          {JSON.stringify(item.analysis_plan, null, 2)}
                        </pre>
                      </div>

                      {item.executed_python_code && (
                        <div>
                          <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-1">
                            Executed Pandas Code
                          </p>
                          <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto">
                            {item.executed_python_code}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* VISUALIZATION */}
                {item.chart_data && item.chart_data.length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        {item.target_column.replace('_', ' ').toUpperCase()} BREAKDOWN
                      </span>

                      {/* Chart Switcher Buttons */}
                      <div className="flex items-center space-x-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                        <button
                          onClick={() => setCardChartType(idx, 'bar')}
                          className={`p-1 rounded ${currentChartType === 'bar' ? 'bg-slate-800 text-brand-400' : 'text-slate-400 hover:text-slate-200'}`}
                          title="Bar Chart"
                        >
                          <BarChart3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setCardChartType(idx, 'line')}
                          className={`p-1 rounded ${currentChartType === 'line' ? 'bg-slate-800 text-brand-400' : 'text-slate-400 hover:text-slate-200'}`}
                          title="Line Chart"
                        >
                          <LineChart className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setCardChartType(idx, 'area')}
                          className={`p-1 rounded ${currentChartType === 'area' ? 'bg-slate-800 text-brand-400' : 'text-slate-400 hover:text-slate-200'}`}
                          title="Area Chart"
                        >
                          <AreaChart className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setCardChartType(idx, 'pie')}
                          className={`p-1 rounded ${currentChartType === 'pie' ? 'bg-slate-800 text-brand-400' : 'text-slate-400 hover:text-slate-200'}`}
                          title="Donut / Pie Chart"
                        >
                          <PieChart className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <ChartRenderer
                      data={item.chart_data}
                      type={currentChartType}
                      targetColumn={item.target_column}
                      height={260}
                    />
                  </div>
                )}

                {/* VERIFIED AI EXPLANATION */}
                <div className="space-y-3 pt-1">
                  {item.headline && (
                    <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-200 text-xs sm:text-sm font-semibold">
                      {item.headline}
                    </div>
                  )}

                  {item.narrative && (
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {item.narrative}
                    </p>
                  )}

                  {item.why_hypothesis && (
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Why might this be happening?</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {item.why_hypothesis}
                      </p>
                    </div>
                  )}
                </div>

                {/* FOLLOW UP QUESTIONS */}
                {item.follow_up_questions && item.follow_up_questions.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/70">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                      Recommended Follow-up Inquiries:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {item.follow_up_questions.map((fq, fIdx) => (
                        <button
                          key={fIdx}
                          disabled={loading}
                          onClick={() => handleSelectSuggested(fq)}
                          className="px-2.5 py-1 rounded-lg text-xs bg-slate-800/60 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/50 transition-colors text-left flex items-center space-x-1.5"
                        >
                          <HelpCircle className="w-3 h-3 text-brand-400 flex-shrink-0" />
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
      <form onSubmit={handleSubmit} className="sticky bottom-4 z-20">
        <div className="relative flex items-center rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-1.5 focus-within:border-brand-500 transition-all">
          <input
            type="text"
            placeholder="Ask anything (e.g. Which region generated the most revenue? or Why did sales decrease in March?)..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={loading}
            className="flex-1 bg-transparent px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || loading}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-40 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-brand-500/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
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
