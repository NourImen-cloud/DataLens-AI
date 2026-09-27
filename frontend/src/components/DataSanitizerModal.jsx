import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  FileSpreadsheet,
  X,
  Filter,
  Check,
  Loader2
} from 'lucide-react';

export default function DataSanitizerModal({ isOpen, onClose, datasetId, datasetProfile }) {
  const [clipOutliers, setClipOutliers] = useState(true);
  const [fillMissing, setFillMissing] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [stats, setStats] = useState(null);

  if (!isOpen) return null;

  // Compute total outliers
  const totalOutliers = (datasetProfile?.column_profiles || []).reduce((acc, cp) => {
    return acc + (cp.stats?.outliers_count || 0);
  }, 0);

  const missingPct = datasetProfile?.missing_pct || 0;
  const rows = datasetProfile?.rows || 0;
  const approxMissing = Math.round((missingPct / 100) * rows);

  const handleDownload = async () => {
    if (!datasetId) return;
    setDownloading(true);

    try {
      const url = `/api/dataset/${datasetId}/clean-export?clip_outliers=${clipOutliers}&fill_missing=${fillMissing}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Sanitization failed");

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${datasetId}_sanitized.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setStats({
        outliers: res.headers.get('X-Outliers-Treated') || totalOutliers,
        missing: res.headers.get('X-Missing-Imputed') || approxMissing
      });
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 space-y-6 p-6 sm:p-7">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  AI Data Sanitation Engine
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
                  Data Ops
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automated statistical cleaning, Winsorization, and imputation.
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

        {/* Audit Stats */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">3x IQR Outliers</span>
            <div className="flex items-center space-x-1.5 mt-1">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="text-base font-extrabold text-slate-900 dark:text-white">
                {totalOutliers.toLocaleString()}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Isolated beyond bounds</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Missing Values</span>
            <div className="flex items-center space-x-1.5 mt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-base font-extrabold text-slate-900 dark:text-white">
                {approxMissing.toLocaleString()}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Requires imputation</span>
          </div>
        </div>

        {/* Cleaning Options */}
        <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={clipOutliers}
              onChange={(e) => setClipOutliers(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
            />
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Clip 3x IQR Outliers (Statistical Winsorization)
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Smooths extreme values to upper and lower boundaries without dropping rows.
              </span>
            </div>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer pt-2 border-t border-slate-200/60 dark:border-slate-800">
            <input
              type="checkbox"
              checked={fillMissing}
              onChange={(e) => setFillMissing(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
            />
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Intelligent Missing Value Imputation
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Fills numerical nulls with median and categorical nulls with standardized tags.
              </span>
            </div>
          </label>
        </div>

        {/* Success Confirmation if downloaded */}
        {stats && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-950 dark:text-emerald-200 font-semibold flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              Successfully exported! {stats.outliers} outliers treated, {stats.missing} missing values imputed.
            </span>
          </div>
        )}

        {/* Download Action */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-md shadow-emerald-600/30 active:scale-95 disabled:opacity-50"
        >
          {downloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sanitizing & Exporting CSV...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download Sanitized CSV Dataset</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
