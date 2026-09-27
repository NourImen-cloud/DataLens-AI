import React from 'react';
import {
  TrendingUp,
  AlertOctagon,
  GitCommit,
  Layers,
  HelpCircle,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Activity
} from 'lucide-react';

export default function InsightsTab({ insights = [], onSelectInsight }) {
  const getIcon = (type) => {
    switch (type) {
      case 'trend':
        return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case 'anomaly':
      case 'outlier':
        return <AlertOctagon className="w-5 h-5 text-amber-400" />;
      case 'correlation':
        return <GitCommit className="w-5 h-5 text-cyan-400" />;
      case 'category_leader':
        return <Layers className="w-5 h-5 text-purple-400" />;
      case 'missing_data':
        return <HelpCircle className="w-5 h-5 text-rose-400" />;
      default:
        return <Activity className="w-5 h-5 text-brand-400" />;
    }
  };

  const getBadgeStyle = (severity) => {
    switch (severity) {
      case 'positive':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      case 'danger':
      case 'warning':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'info':
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 relative overflow-hidden shadow-lg">
        <div className="max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Insight Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Proactive Findings Detected Without Prompting
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
            Our Python statistical algorithms continuously scan for non-linear patterns, structural outliers, correlation dynamics, and segment dominance before you even type a prompt.
          </p>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60">
                    {getIcon(insight.type)}
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full border ${getBadgeStyle(
                      insight.severity
                    )}`}
                  >
                    {insight.badge}
                  </span>
                </div>
                {insight.metric && (
                  <span className="text-sm font-bold font-mono text-white bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/40">
                    {insight.metric}
                  </span>
                )}
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors">
                {insight.title}
              </h3>

              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                {insight.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                Target: {insight.target_col || 'Dataset-wide'}
              </span>

              {insight.suggested_query && (
                <button
                  onClick={() => onSelectInsight(insight.suggested_query)}
                  className="flex items-center space-x-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                >
                  <span>Investigate with AI</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
