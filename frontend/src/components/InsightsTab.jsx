import React from 'react';
import {
  TrendingUp,
  AlertOctagon,
  GitCommit,
  Layers,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Activity
} from 'lucide-react';

export default function InsightsTab({ insights = [], onSelectInsight }) {
  const getIcon = (type) => {
    switch (type) {
      case 'trend':
        return <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'anomaly':
      case 'outlier':
        return <AlertOctagon className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'correlation':
        return <GitCommit className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />;
      case 'category_leader':
        return <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'missing_data':
        return <HelpCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
      default:
        return <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  const getBadgeStyle = (severity) => {
    switch (severity) {
      case 'positive':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30';
      case 'danger':
      case 'warning':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30';
      case 'info':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/30';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border border-emerald-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100/70 dark:bg-brand-500/10 border border-emerald-200 dark:border-brand-500/20 text-emerald-800 dark:text-brand-400 text-xs font-bold uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Statistical Scanner</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Proactive Insights Detected by Engine
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Our Python statistical algorithms continuously scan for non-linear patterns, structural outliers, correlation dynamics, and segment dominance before you even type a single query.
          </p>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-sm">
                    {getIcon(insight.type)}
                  </div>
                  <span
                    className={`px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase rounded-full border ${getBadgeStyle(
                      insight.severity
                    )}`}
                  >
                    {insight.badge}
                  </span>
                </div>
                {insight.metric && (
                  <span className="text-xs font-bold font-mono text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800/60 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700/40">
                    {insight.metric}
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-brand-300 transition-colors tracking-tight">
                {insight.title}
              </h3>

              <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                {insight.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">
                Target: <strong>{insight.target_col || 'Dataset-wide'}</strong>
              </span>

              {insight.suggested_query && (
                <button
                  onClick={() => onSelectInsight(insight.suggested_query)}
                  className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700 dark:text-brand-400 hover:text-emerald-800 dark:hover:text-brand-300 transition-colors"
                >
                  <span>Investigate with AI</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
