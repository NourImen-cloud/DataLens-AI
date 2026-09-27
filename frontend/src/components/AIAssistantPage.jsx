import React, { useState, useRef, useMemo } from 'react';
import {
  Sparkles,
  Paperclip,
  Send,
  Code2,
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
  CheckCheck,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  AlertTriangle,
  GitBranch,
  Database,
  Calendar,
  ShieldCheck,
  Zap,
  Tag,
  ShoppingBag,
  GraduationCap,
  Users,
  Cpu,
  BarChart2,
  X,
  SlidersHorizontal,
  Lightbulb
} from 'lucide-react';
import ChartRenderer from './ChartRenderer';

export default function AIAssistantPage({
  activeDatasetId,
  datasetProfile,
  suggestedQuestions = [],
  domainInfo = null,
  questionCategories = [],
  messages = [],
  onSendQuery,
  loading = false,
  onOpenUpload,
  onLoadSample
}) {
  const [inputQuery, setInputQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedCodes, setExpandedCodes] = useState({});
  const [chartTypes, setChartTypes] = useState({});
  const fileInputRef = useRef(null);

  // Normalize questions array (can be array of objects or strings)
  const normalizedQuestions = useMemo(() => {
    if (!suggestedQuestions || suggestedQuestions.length === 0) return [];
    return suggestedQuestions.map((q, idx) => {
      if (typeof q === 'string') {
        return {
          id: `q_${idx}`,
          category: idx === 0 ? 'performance' : (idx === 1 ? 'trends' : (idx === 2 ? 'anomalies' : 'distribution')),
          pillar: idx === 0 ? 'Performance' : (idx === 1 ? 'Trends' : (idx === 2 ? 'Anomalies' : 'Distribution')),
          badge: idx === 0 ? 'Top Driver' : (idx === 1 ? 'Timeline' : (idx === 2 ? 'Outliers' : 'Breakdown')),
          question: q,
          hypothesis: 'Evaluates distribution and key drivers across schema dimensions.'
        };
      }
      return q;
    });
  }, [suggestedQuestions]);

  // Filter questions based on active category tab
  const filteredQuestions = useMemo(() => {
    if (activeCategory === 'all') return normalizedQuestions;
    return normalizedQuestions.filter((q) => q.category === activeCategory);
  }, [normalizedQuestions, activeCategory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputQuery.trim() || loading) return;
    onSendQuery(inputQuery);
    setInputQuery('');
  };

  const handleSelectSuggested = (qText) => {
    if (loading) return;
    onSendQuery(qText);
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

  // Helper for domain icon
  const getDomainIcon = (iconName) => {
    switch (iconName) {
      case 'activity':
        return <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'shopping-bag':
        return <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'graduation-cap':
        return <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'bar-chart-2':
        return <BarChart2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'users':
        return <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'cpu':
        return <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  // Safe category list
  const categoryTabs = useMemo(() => {
    if (questionCategories && questionCategories.length > 0) {
      return questionCategories;
    }
    return [
      { id: 'all', label: 'All Inquiries', count: normalizedQuestions.length },
      { id: 'performance', label: 'Performance', count: normalizedQuestions.filter((q) => q.category === 'performance').length },
      { id: 'trends', label: 'Trends & Timeline', count: normalizedQuestions.filter((q) => q.category === 'trends').length },
      { id: 'anomalies', label: 'Anomalies & Outliers', count: normalizedQuestions.filter((q) => q.category === 'anomalies').length },
      { id: 'correlations', label: 'Drivers & Correlations', count: normalizedQuestions.filter((q) => q.category === 'correlations').length },
      { id: 'distribution', label: 'Distribution & Spread', count: normalizedQuestions.filter((q) => q.category === 'distribution').length }
    ].filter((c) => c.id === 'all' || c.count > 0);
  }, [questionCategories, normalizedQuestions]);

  return (
    <div className="space-y-7 pb-12 max-w-6xl mx-auto">
      {/* 1. DYNAMIC DOMAIN INTELLIGENCE & SCHEMA CONTEXT BAR */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center flex-shrink-0 shadow-2xs">
              {getDomainIcon(domainInfo?.icon)}
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {domainInfo?.name || 'DataLens Intelligence Workspace'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-500/30">
                  {domainInfo?.badge || 'Live Studio'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {domainInfo?.summary || 'Interactive natural language data workspace. Ask questions or explore automated hypotheses.'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={onOpenUpload}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Change Dataset</span>
            </button>
          </div>
        </div>

        {/* Schema Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Dataset</span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
              {activeDatasetId || 'Active Data'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Rows Count</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
              {datasetProfile?.rows ? datasetProfile.rows.toLocaleString() : 'N/A'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Features</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
              {datasetProfile?.columns || 0} Dimensions
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
            <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">Primary Metric</span>
            <span className="font-bold text-emerald-900 dark:text-emerald-200 truncate block mt-0.5">
              {domainInfo?.primary_metric || datasetProfile?.numerical_cols?.[0] || 'Metric'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Primary Dimension</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
              {domainInfo?.primary_dimension || datasetProfile?.categorical_cols?.[0] || 'Category'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Data Hygiene</span>
            <div className="flex items-center space-x-1 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {100 - (datasetProfile?.missing_pct || 0)}% Verified
              </span>
            </div>
          </div>
        </div>

        {/* Quick Sample Switcher Chips */}
        <div className="pt-2 flex items-center flex-wrap gap-2 text-xs">
          <span className="text-slate-400 font-bold text-[11px] mr-1">Benchmark Datasets:</span>
          <button
            onClick={() => onLoadSample('retail_sales')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold transition-colors"
          >
            🛒 Retail Sales 2026
          </button>
          <button
            onClick={() => onLoadSample('clinical_patients')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold transition-colors"
          >
            🏥 Patient Health (Clinical)
          </button>
          <button
            onClick={() => onLoadSample('student_performance')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold transition-colors"
          >
            🎓 Student Academics (Education)
          </button>
          <button
            onClick={() => onLoadSample('saas_churn')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold transition-colors"
          >
            💼 SaaS Retention & MRR
          </button>
        </div>
      </div>

      {/* 2. WORKSPACE NATURAL LANGUAGE QUERY CONSOLE */}
      <div className="relative">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg p-3 sm:p-4 space-y-3 transition-all focus-within:border-emerald-500 focus-within:shadow-emerald-500/10"
        >
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv,.xlsx,.xls"
            onChange={handleDirectFile}
            className="hidden"
          />

          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything about this dataset or select an investigation below..."
              className="flex-1 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
            {inputQuery && (
              <button
                type="button"
                onClick={() => setInputQuery('')}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach CSV/Excel"
              className="hidden sm:flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
            >
              <Paperclip className="w-3.5 h-3.5 text-slate-500" />
              <span>Attach</span>
            </button>
            <button
              type="submit"
              disabled={!inputQuery.trim() || loading}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white flex items-center space-x-2 text-xs sm:text-sm font-bold transition-all shadow-md shadow-emerald-600/30 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Computing...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Run Analysis</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 3. AUTOMATED CATEGORIZED INVESTIGATION GRID (SOLVES "I DON'T KNOW WHAT TO ASK") */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Automated Investigation Hypotheses for this Dataset
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Click any hypothesis to execute verified analysis
          </span>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categoryTabs.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                activeCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <span>{cat.label}</span>
              {cat.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeCategory === cat.id
                      ? 'bg-emerald-700 text-emerald-100'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {cat.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Categorized Question Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredQuestions.map((q, idx) => (
            <button
              key={q.id || idx}
              onClick={() => handleSelectSuggested(q.question)}
              disabled={loading}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-500/60 hover:shadow-md transition-all text-left flex flex-col justify-between group space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                    {q.badge || q.pillar || 'Investigation'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                  {q.question}
                </h4>
              </div>

              {q.hypothesis && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-2">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Hypothesis: </span>
                  {q.hypothesis}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 4. WORKSPACE INVESTIGATION CANVAS */}
      <div className="space-y-6 pt-2">
        {/* Loading Banner */}
        {loading && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/60 shadow-md space-y-3 animate-pulse">
            <div className="flex items-center space-x-3">
              <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                DataLens Analysis Engine is Computing Ground Truth...
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 pl-8">
              Compiling Python / Pandas execution plan, aggregating records, computing exact ground truth numbers, and formulating executive synthesis.
            </p>
          </div>
        )}

        {/* Executed Investigation Cards */}
        {messages.length > 0 ? (
          messages.map((item, idx) => {
            const currentChartType = chartTypes[idx] || item.chart_type || 'bar';
            const isCodeExpanded = expandedCodes[idx];

            return (
              <div
                key={idx}
                className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xs flex-shrink-0 shadow-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Workspace Investigation
                      </span>
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                        "{item.question}"
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-500/20 whitespace-nowrap">
                      Python Ground Truth
                    </span>
                  </div>
                </div>

                {/* Visualization Canvas */}
                {item.chart_data && item.chart_data.length > 0 && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        {item.target_column?.replace('_', ' ')?.toUpperCase() || 'METRIC'} BREAKDOWN
                      </span>

                      <div className="flex items-center space-x-2">
                        {/* Discreet Code Inspector Toggle */}
                        {item.executed_python_code && (
                          <button
                            onClick={() => toggleCode(idx)}
                            className="flex items-center space-x-1 text-[11px] font-mono text-slate-500 hover:text-emerald-600 transition-colors px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs"
                            title="Inspect underlying Pandas code"
                          >
                            <Code2 className="w-3.5 h-3.5" />
                            <span>{isCodeExpanded ? 'Hide Code' : 'Inspect Code'}</span>
                          </button>
                        )}

                        {/* Chart Switcher */}
                        <div className="flex items-center space-x-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                          <button
                            onClick={() => setCardChartType(idx, 'bar')}
                            className={`p-1.5 rounded-lg ${currentChartType === 'bar' ? 'bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-700'}`}
                            title="Bar Chart"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setCardChartType(idx, 'line')}
                            className={`p-1.5 rounded-lg ${currentChartType === 'line' ? 'bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-700'}`}
                            title="Line Chart"
                          >
                            <LineChart className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setCardChartType(idx, 'area')}
                            className={`p-1.5 rounded-lg ${currentChartType === 'area' ? 'bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-700'}`}
                            title="Area Chart"
                          >
                            <AreaChart className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setCardChartType(idx, 'pie')}
                            className={`p-1.5 rounded-lg ${currentChartType === 'pie' ? 'bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-700'}`}
                            title="Donut / Pie Chart"
                          >
                            <PieChart className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <ChartRenderer
                      data={item.chart_data}
                      type={currentChartType}
                      targetColumn={item.target_column}
                      height={270}
                    />

                    {/* Expandable Code snippet if clicked */}
                    {isCodeExpanded && item.executed_python_code && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                          Executed Python / Pandas Engine
                        </p>
                        <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto">
                          {item.executed_python_code}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Findings & Narrative */}
                <div className="space-y-3.5">
                  {item.headline && (
                    <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-200 text-sm font-bold flex items-start space-x-2.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0"></span>
                      <span>{item.headline}</span>
                    </div>
                  )}

                  {item.narrative && (
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                      {item.narrative}
                    </p>
                  )}

                  {item.why_hypothesis && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-slate-300 mb-1">
                        <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Root-Cause Hypothesis & Contextual Reasoning:</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.why_hypothesis}
                      </p>
                    </div>
                  )}
                </div>

                {/* Follow-up Drilldowns */}
                {item.follow_up_questions && item.follow_up_questions.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                      Recommended Follow-up Drilldowns:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {item.follow_up_questions.map((fq, fIdx) => (
                        <button
                          key={fIdx}
                          disabled={loading}
                          onClick={() => handleSelectSuggested(fq)}
                          className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 transition-colors text-left flex items-center space-x-1.5 font-medium shadow-2xs"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>{fq}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          !loading && (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Ready to Investigate {activeDatasetId}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select an automated hypothesis above or enter any natural language question to start your investigation.
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
