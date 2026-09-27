import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  Download,
  FileText,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ExecutiveReportModal({ datasetId, isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && datasetId) {
      fetchReport();
    }
  }, [isOpen, datasetId]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/executive-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataset_id: datasetId }),
      });
      if (!res.ok) throw new Error('Failed to generate report');
      const data = await res.json();
      setReportData(data);
      // Trigger subtle celebration
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  const rawData = reportData?.report_data;
  const report = reportData?.report;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-brand-500/10 border border-emerald-200 dark:border-brand-500/30 text-emerald-600 dark:text-brand-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Executive Decision Briefing</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Board-Ready Intelligence Summary · DataLens AI</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {report && (
              <button
                onClick={handlePrint}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print / Export PDF</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 print:p-0 print:bg-white print:text-black">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-10 h-10 text-emerald-600 dark:text-brand-400 animate-spin mx-auto" />
              <p className="text-sm font-bold text-slate-900 dark:text-white">Synthesizing Executive Decision Report...</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Evaluating multi-dimensional patterns, risks, and strategic levers.</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-500/40 text-red-700 dark:text-red-200 text-xs">
              {error}
            </div>
          ) : report ? (
            <div className="space-y-6">
              {/* Document Header */}
              <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-brand-500/10 text-emerald-800 dark:text-brand-400 border border-emerald-200 dark:border-brand-500/20 text-[10px] font-extrabold uppercase tracking-wider">
                  Confidential · Strategic Decision Brief
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2.5">
                  {report.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span>Dataset: <strong className="text-slate-800 dark:text-slate-200">{datasetId}</strong></span>
                  <span>•</span>
                  <span>Records: <strong className="text-slate-800 dark:text-slate-200">{rawData?.rows?.toLocaleString()}</strong></span>
                  <span>•</span>
                  <span>Cumulative Metric: <strong className="text-emerald-700 dark:text-emerald-400 font-mono">${rawData?.total_revenue?.toLocaleString()}</strong></span>
                  {rawData?.profit_margin && (
                    <>
                      <span>•</span>
                      <span>Net Margin: <strong className="text-slate-800 dark:text-brand-300 font-mono">{rawData.profit_margin}%</strong></span>
                    </>
                  )}
                </div>
              </div>

              {/* 1. Executive Summary */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Executive Summary
                </h3>
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                  {report.executive_summary}
                </p>
              </div>

              {/* 2. Key Findings */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center space-x-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-brand-400" />
                  <span>Key Quantitative Findings</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {report.key_findings?.map((f, i) => (
                    <div key={i} className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                            {f.impact} Impact
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          {f.finding}
                        </p>
                      </div>
                      <div className="mt-3.5 pt-2.5 border-t border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white">
                        {f.metric}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Anomalies & Risks */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Identified Anomalies & Operational Risks</span>
                </h3>
                <div className="space-y-3">
                  {report.anomalies_and_risks?.map((r, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{r.risk}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 pl-6 leading-relaxed">{r.evidence}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 self-start sm:self-center">
                        {r.urgency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Strategic Recommendations */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-brand-400" />
                  <span>Recommended Strategic Actions</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {report.strategic_recommendations?.map((rec, i) => (
                    <div key={i} className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
                      <div className="text-[10px] uppercase font-bold text-slate-500">
                        Recommendation 0{i + 1}
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                        {rec.action}
                      </p>
                      <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
                        <p className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">ROI: {rec.expected_roi}</p>
                        <p className="text-slate-500">Owner: {rec.owner}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
