import React, { useState, useEffect } from 'react';
import {
  Scale,
  Sparkles,
  ArrowRight,
  X,
  Trophy,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Loader2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export default function CohortComparatorModal({ isOpen, onClose, datasetId }) {
  const [optionsData, setOptionsData] = useState(null);
  const [selectedCol, setSelectedCol] = useState('');
  const [cohortA, setCohortA] = useState('');
  const [cohortB, setCohortB] = useState('');
  const [comparisonResult, setComparisonResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load options when opened
  useEffect(() => {
    if (!isOpen || !datasetId) return;

    fetch(`/api/dataset/${datasetId}/compare-options`)
      .then((res) => res.json())
      .then((data) => {
        setOptionsData(data);
        if (data.categorical_columns && data.categorical_columns.length > 0) {
          const firstCol = data.categorical_columns[0];
          setSelectedCol(firstCol);
          const vals = data.options[firstCol] || [];
          if (vals.length >= 2) {
            setCohortA(vals[0]);
            setCohortB(vals[1]);
          }
        }
      })
      .catch((err) => console.error(err));
  }, [isOpen, datasetId]);

  // When selectedCol changes, update cohort choices
  const handleColChange = (newCol) => {
    setSelectedCol(newCol);
    const vals = optionsData?.options?.[newCol] || [];
    if (vals.length >= 2) {
      setCohortA(vals[0]);
      setCohortB(vals[1]);
    }
  };

  // Run comparison when cohorts are set
  useEffect(() => {
    if (!isOpen || !datasetId || !selectedCol || !cohortA || !cohortB || cohortA === cohortB) {
      return;
    }

    setLoading(true);
    fetch(`/api/dataset/${datasetId}/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category_col: selectedCol,
        cohort_a: cohortA,
        cohort_b: cohortB
      })
    })
      .then((res) => res.json())
      .then((data) => {
        setComparisonResult(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [isOpen, datasetId, selectedCol, cohortA, cohortB]);

  if (!isOpen) return null;

  const catCols = optionsData?.categorical_columns || [];
  const currentOptions = (optionsData?.options && optionsData.options[selectedCol]) || [];

  const chartData = (comparisonResult?.metrics || []).slice(0, 5).map((m) => ({
    name: m.metric.replace('_', ' '),
    [cohortA]: m.cohort_a_mean,
    [cohortB]: m.cohort_b_mean
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 space-y-6 p-6 sm:p-7 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shadow-2xs">
              <Scale className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  Cohort & Segment Comparator
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cyan-100 text-cyan-800 dark:bg-cyan-500/10 dark:text-cyan-300">
                  Side-by-Side
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct head-to-head benchmarking across all statistical dimensions.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selection Ribbon */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              Comparison Dimension
            </label>
            <select
              value={selectedCol}
              onChange={(e) => handleColChange(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
            >
              {catCols.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
              Cohort A (Baseline)
            </label>
            <select
              value={cohortA}
              onChange={(e) => setCohortA(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            >
              {currentOptions.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 block mb-1">
              Cohort B (Challenger)
            </label>
            <select
              value={cohortB}
              onChange={(e) => setCohortB(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
            >
              {currentOptions.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Cohort Volume Comparison Cards */}
        {comparisonResult && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 block">
                  Cohort A: {comparisonResult.cohort_a.name}
                </span>
                <span className="text-lg font-extrabold text-emerald-950 dark:text-emerald-100 block mt-0.5">
                  {comparisonResult.cohort_a.count.toLocaleString()} records
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {comparisonResult.cohort_a.share}% Share
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-cyan-700 dark:text-cyan-400 block">
                  Cohort B: {comparisonResult.cohort_b.name}
                </span>
                <span className="text-lg font-extrabold text-cyan-950 dark:text-cyan-100 block mt-0.5">
                  {comparisonResult.cohort_b.count.toLocaleString()} records
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-white dark:bg-slate-900 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                {comparisonResult.cohort_b.share}% Share
              </span>
            </div>
          </div>
        )}

        {/* Side-by-Side Chart */}
        {chartData.length > 0 && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              Average Metric Comparison: {cohortA} vs {cohortB}
            </span>
            <div className="w-full h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.4} />
                  <XAxis dataKey="name" fontSize={11} stroke="#64748b" tickLine={false} />
                  <YAxis fontSize={11} stroke="#64748b" tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Bar dataKey={cohortA} fill="#059669" name={cohortA} radius={[4, 4, 0, 0]} />
                  <Bar dataKey={cohortB} fill="#0891b2" name={cohortB} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Metrics Scorecard Table */}
        {comparisonResult?.metrics && (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-950 font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Metric</th>
                  <th className="p-3">{cohortA} Mean</th>
                  <th className="p-3">{cohortB} Mean</th>
                  <th className="p-3">Variance (%)</th>
                  <th className="p-3 text-right">Advantage Leader</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 font-medium">
                {comparisonResult.metrics.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                    <td className="p-3 font-bold text-slate-900 dark:text-white capitalize">
                      {row.metric.replace('_', ' ')}
                    </td>
                    <td className="p-3 font-mono">{row.cohort_a_mean.toLocaleString()}</td>
                    <td className="p-3 font-mono">{row.cohort_b_mean.toLocaleString()}</td>
                    <td className="p-3 font-mono font-bold">
                      <span className={row.pct_diff >= 0 ? 'text-emerald-600' : 'text-cyan-600'}>
                        {row.pct_diff >= 0 ? `+${row.pct_diff}%` : `${row.pct_diff}%`}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.leader === cohortA
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                          : 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300'
                      }`}>
                        <Trophy className="w-3 h-3" />
                        <span>{row.leader}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Narrative Summary */}
        {comparisonResult?.summary && (
          <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800 text-xs sm:text-sm text-cyan-950 dark:text-cyan-200 font-semibold flex items-start space-x-2.5">
            <Sparkles className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
            <span>{comparisonResult.summary}</span>
          </div>
        )}
      </div>
    </div>
  );
}
