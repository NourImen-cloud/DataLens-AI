import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Paperclip,
  Send,
  Cpu,
  Code2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  BarChart3,
  LineChart,
  AreaChart,
  PieChart,
  HelpCircle,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  Loader2,
  Activity,
  Compass,
  CheckCheck
} from 'lucide-react';
import ChartRenderer from './ChartRenderer';

export default function AIAssistantPage({
  activeDatasetId,
  datasetProfile,
  suggestedQuestions = [],
  messages = [],
  onSendQuery,
  loading = false,
  onOpenUpload,
  onLoadSample
}) {
  const [inputQuery, setInputQuery] = useState('');
  const [expandedCodes, setExpandedCodes] = useState({});
  const [chartTypes, setChartTypes] = useState({});
  const fileInputRef = useRef(null);

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

  const handleDirectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      fetch('/api/upload', { method: 'POST', body: formData })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && onLoadSample) {
            onLoadSample(data);
          }
        })
        .catch((err) => console.error(err));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-6 sm:py-10">
      {/* 1. TOP SPHERE / ORB HERO (EXACT AESTHETIC OF IMAGE 1) */}
      <div className="text-center space-y-4">
        {/* Floating Glowing Sphere */}
        <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-400 via-indigo-300 to-emerald-300 opacity-60 blur-xl animate-pulse-glow" />
          {/* Inner 3D sphere gradient matching Image 1 */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-indigo-200 via-purple-300 to-indigo-500 shadow-2xl shadow-purple-500/30 flex items-center justify-center border border-white/60">
            {/* Specular highlight */}
            <div className="absolute top-2 left-3 w-7 h-5 rounded-full bg-white/70 blur-xs" />
            <Sparkles className="w-8 h-8 text-white/90 drop-shadow-md" />
          </div>
        </div>

        {/* Greeting & Headline */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            How can I assist you today?
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto mt-2 leading-relaxed">
            Upload any dataset (Business, Healthcare, Education, IoT). DataLens AI runs verified Python code to answer questions without hallucinated numbers.
          </p>
        </div>
      </div>

      {/* 2. CENTER INPUT CARD (MATCHING IMAGE 1'S PROMPT CONTAINER) */}
      <div className="relative">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-4 sm:p-5 space-y-3 transition-all focus-within:border-purple-400 dark:focus-within:border-purple-500"
        >
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv,.xlsx,.xls"
            onChange={handleDirectFile}
            className="hidden"
          />

          {/* Active Dataset Pill if loaded */}
          {activeDatasetId && (
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-slate-900 dark:text-white">{activeDatasetId}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500 font-mono">{datasetProfile?.rows?.toLocaleString()} rows</span>
              </div>
              <button
                type="button"
                onClick={onOpenUpload}
                className="text-[11px] font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 transition-colors"
              >
                Change Dataset
              </button>
            </div>
          )}

          {/* Text Area */}
          <textarea
            rows={2}
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask me anything about your dataset (trends, anomalies, segment comparisons, correlations)..."
            className="w-full resize-none bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />

          {/* Bottom Toolbar inside card (Matching Image 1) */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Deep Reasoning</span>
              </span>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>Attach CSV / Excel</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={!inputQuery.trim() || loading}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-md shadow-purple-600/30 active:scale-95"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </form>

        {/* Multi-Domain Benchmark Chips */}
        <div className="mt-3 flex items-center flex-wrap gap-2 justify-center text-xs">
          <span className="text-slate-400 font-medium mr-1 text-[11px]">Quick Load Domain Data:</span>
          <button
            onClick={() => onLoadSample('retail_sales')}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold transition-colors"
          >
            🛒 Retail Sales 2026
          </button>
          <button
            onClick={() => onLoadSample('clinical_patients')}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold transition-colors"
          >
            🏥 Patient Health (Clinical)
          </button>
          <button
            onClick={() => onLoadSample('student_performance')}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold transition-colors"
          >
            🎓 Student Academics (Education)
          </button>
          <button
            onClick={() => onLoadSample('saas_churn')}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold transition-colors"
          >
            💼 SaaS Retention & MRR
          </button>
        </div>
      </div>

      {/* 3. SUGGESTIONS PROMPTS CARDS (MATCHING BOTTOM OF IMAGE 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <button
          onClick={() => handleSelectSuggested(suggestedQuestions[0] || 'What are the main trends in the dataset?')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-500/50 hover:shadow-md transition-all text-left group"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Activity className="w-4.5 h-4.5" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            Synthesize Key Trends
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {suggestedQuestions[0] || 'Examine timeline patterns and core trajectory.'}
          </p>
        </button>

        <button
          onClick={() => handleSelectSuggested(suggestedQuestions[1] || 'Are there unusual values or outliers?')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-500/50 hover:shadow-md transition-all text-left group"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Compass className="w-4.5 h-4.5" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            Detect Outliers & Spikes
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {suggestedQuestions[3] || 'Isolate unusual records using 3x IQR verification.'}
          </p>
        </button>

        <button
          onClick={() => handleSelectSuggested(suggestedQuestions[2] || 'Which categories perform best?')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-500/50 hover:shadow-md transition-all text-left group"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <CheckCheck className="w-4.5 h-4.5" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            Segment Comparison
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {suggestedQuestions[2] || 'Rank categories and discover dominant drivers.'}
          </p>
        </button>
      </div>

      {/* 4. CONVERSATIONAL ANALYSIS THREAD */}
      {messages.length > 0 && (
        <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Analytical Inquiry Thread ({messages.length})
            </span>
          </div>

          {messages.map((item, idx) => {
            const currentChartType = chartTypes[idx] || item.chart_type || 'bar';
            const isCodeExpanded = expandedCodes[idx];

            return (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6"
              >
                {/* Question Header */}
                <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm">
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

                {/* Execution Pipeline Stepper */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <Cpu className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span>Execution Pipeline & Transparency</span>
                    </div>
                    <button
                      onClick={() => toggleCode(idx)}
                      className="text-xs font-mono font-semibold text-purple-700 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center space-x-1"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>{isCodeExpanded ? 'Hide Code & Plan' : 'View Code & Plan'}</span>
                      {isCodeExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Flow Badges */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center space-x-1.5 border border-slate-200 dark:border-slate-700 shadow-2xs font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
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

                  {/* Expandable Code */}
                  {isCodeExpanded && (
                    <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-slate-800 space-y-3">
                      <div>
                        <p className="text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider mb-1">
                          Generated Analysis Plan (JSON)
                        </p>
                        <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                          {JSON.stringify(item.analysis_plan, null, 2)}
                        </pre>
                      </div>

                      {item.executed_python_code && (
                        <div>
                          <p className="text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider mb-1">
                            Executed Pandas Code
                          </p>
                          <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto">
                            {item.executed_python_code}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Visualization */}
                {item.chart_data && item.chart_data.length > 0 && (
                  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        {item.target_column.replace('_', ' ').toUpperCase()} VISUALIZATION
                      </span>

                      {/* Chart Switcher */}
                      <div className="flex items-center space-x-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                        <button
                          onClick={() => setCardChartType(idx, 'bar')}
                          className={`p-1.5 rounded-lg ${currentChartType === 'bar' ? 'bg-purple-50 dark:bg-slate-800 text-purple-700 dark:text-purple-400 font-bold' : 'text-slate-500'}`}
                          title="Bar Chart"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCardChartType(idx, 'line')}
                          className={`p-1.5 rounded-lg ${currentChartType === 'line' ? 'bg-purple-50 dark:bg-slate-800 text-purple-700 dark:text-purple-400 font-bold' : 'text-slate-500'}`}
                          title="Line Chart"
                        >
                          <LineChart className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCardChartType(idx, 'area')}
                          className={`p-1.5 rounded-lg ${currentChartType === 'area' ? 'bg-purple-50 dark:bg-slate-800 text-purple-700 dark:text-purple-400 font-bold' : 'text-slate-500'}`}
                          title="Area Chart"
                        >
                          <AreaChart className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCardChartType(idx, 'pie')}
                          className={`p-1.5 rounded-lg ${currentChartType === 'pie' ? 'bg-purple-50 dark:bg-slate-800 text-purple-700 dark:text-purple-400 font-bold' : 'text-slate-500'}`}
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

                {/* Verified AI Explanation */}
                <div className="space-y-4 pt-1">
                  {item.headline && (
                    <div className="p-4 rounded-2xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-purple-950 dark:text-purple-200 text-xs sm:text-sm font-bold">
                      {item.headline}
                    </div>
                  )}

                  {item.narrative && (
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                      {item.narrative}
                    </p>
                  )}

                  {item.why_hypothesis && (
                    <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-slate-950/60 border border-amber-200/80 dark:border-slate-800/80">
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

                {/* Follow-up Questions */}
                {item.follow_up_questions && item.follow_up_questions.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                      Recommended Next Inquiries:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {item.follow_up_questions.map((fq, fIdx) => (
                        <button
                          key={fIdx}
                          disabled={loading}
                          onClick={() => handleSelectSuggested(fq)}
                          className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 hover:text-purple-800 dark:hover:text-white border border-slate-200 dark:border-slate-700/50 transition-colors text-left flex items-center space-x-1.5 shadow-2xs font-medium"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                          <span>{fq}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
