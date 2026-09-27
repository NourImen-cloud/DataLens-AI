import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  X,
  Sliders,
  RotateCcw,
  Zap,
  ArrowRight,
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

export default function WhatIfSimulatorModal({ isOpen, onClose, datasetId, datasetProfile }) {
  const [targetMetric, setTargetMetric] = useState('');
  const [categoryCol, setCategoryCol] = useState('');
  const [adjustmentPct, setAdjustmentPct] = useState(15.0);
  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize columns when opened
  useEffect(() => {
    if (isOpen && datasetProfile) {
      const numCols = datasetProfile.numerical_cols || [];
      const catCols = datasetProfile.categorical_cols || [];
      const primaryMetric = numCols.find((c) => /rev|sales|amount|mrr|score|total|profit/i.test(c)) || numCols[0] || '';
      const primaryCat = catCols[0] || '';
      setTargetMetric(primaryMetric);
      setCategoryCol(primaryCat);
      setAdjustmentPct(15.0);
    }
  }, [isOpen, datasetProfile]);

  // Execute simulation when inputs change
  useEffect(() => {
    if (!isOpen || !datasetId || !targetMetric) return;

    setLoading(true);
    fetch(`/api/dataset/${datasetId}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_metric: targetMetric,
        adjustment_pct: adjustmentPct,
        category_col: categoryCol
      })
    })
      .then((res) => res.json())
      .then((data) => {
        setSimResult(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [isOpen, datasetId, targetMetric, categoryCol, adjustmentPct]);

  if (!isOpen) return null;

  const numCols = datasetProfile?.numerical_cols || [];
  const catCols = datasetProfile?.categorical_cols || [];

  const formatNumber = (val) => {
    if (typeof val !== 'number') return val;
    if (Math.abs(val) >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M`;
    if (Math.abs(val) >= 1_000) return `${(val / 1_000).toFixed(1)}k`;
    return val.toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 space-y-6 p-6 sm:p-7 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs">
              <Zap className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  What-If Scenario Simulator
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
                  Prescriptive AI
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Simulate business interventions and project quantitative shifts in real time.
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

        {/* Simulation Controls Ribbon */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              Target Metric
            </label>
            <select
              value={targetMetric}
              onChange={(e) => setTargetMetric(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            >
              {numCols.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              Segment Dimension
            </label>
            <select
              value={categoryCol}
              onChange={(e) => setCategoryCol(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            >
              {catCols.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Simulated Adjustment
              </label>
              <span className={`text-xs font-bold font-mono ${adjustmentPct >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                {adjustmentPct > 0 ? `+${adjustmentPct}%` : `${adjustmentPct}%`}
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="100"
              step="5"
              value={adjustmentPct}
              onChange={(e) => setAdjustmentPct(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            {/* Presets */}
            <div className="flex items-center justify-between gap-1 mt-1 text-[10px] font-bold">
              {[-20, -10, 5, 10, 25, 50].map((p) => (
                <button
                  key={p}
                  onClick={() => setAdjustmentPct(p)}
                  className={`px-1.5 py-0.5 rounded ${
                    adjustmentPct === p
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                  }`}
                >
                  {p > 0 ? `+${p}%` : `${p}%`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Delta Scorecard */}
        {simResult && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Baseline Total</span>
              <span className="text-base font-extrabold text-slate-900 dark:text-white block mt-0.5">
                {formatNumber(simResult.baseline_total)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
              <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">Projected Total</span>
              <span className="text-base font-extrabold text-emerald-950 dark:text-emerald-200 block mt-0.5">
                {formatNumber(simResult.projected_total)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Projected Delta</span>
              <span className={`text-base font-extrabold block mt-0.5 ${simResult.delta_absolute >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                {simResult.delta_absolute >= 0 ? `+${formatNumber(simResult.delta_absolute)}` : formatNumber(simResult.delta_absolute)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Variance Shift</span>
              <div className="flex items-center space-x-1 mt-0.5">
                {simResult.delta_pct >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-rose-500" />
                )}
                <span className={`text-base font-extrabold ${simResult.delta_pct >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {simResult.delta_pct >= 0 ? `+${simResult.delta_pct}%` : `${simResult.delta_pct}%`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Comparative Dual Chart: Baseline vs Projected */}
        {simResult?.cohort_comparison && simResult.cohort_comparison.length > 0 && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              Cohort Impact Breakdown: Baseline vs Projected {targetMetric}
            </span>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={simResult.cohort_comparison} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.4} />
                  <XAxis dataKey="name" fontSize={11} stroke="#64748b" tickLine={false} />
                  <YAxis fontSize={11} stroke="#64748b" tickLine={false} tickFormatter={formatNumber} />
                  <Tooltip
                    formatter={(val, name) => [`${typeof val === 'number' ? val.toLocaleString() : val}`, name === 'baseline' ? 'Baseline' : 'Projected']}
                    contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Bar dataKey="baseline" fill="#94a3b8" name="Baseline" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="projected" fill="#059669" name={`Projected (${adjustmentPct >= 0 ? '+' : ''}${adjustmentPct}%)`} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Executive Takeaway */}
        {simResult?.executive_takeaway && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm text-emerald-950 dark:text-emerald-200 font-semibold flex items-start space-x-2.5">
            <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>{simResult.executive_takeaway}</span>
          </div>
        )}
      </div>
    </div>
  );
}
