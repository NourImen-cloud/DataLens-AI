import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, Sparkles, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

export default function UploadZone({ onUploadSuccess, onLoadSample, isModal = false, onClose = () => {} }) {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file) => {
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Upload failed');
      }

      const data = await response.json();
      onUploadSuccess(data);
      if (isModal) onClose();
    } catch (err) {
      setError(err.message || 'Error uploading file');
    } finally {
      setLoading(false);
    }
  };

  const triggerSample = async (sampleKey) => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(`/api/sample/${sampleKey}`);
      if (!response.ok) throw new Error('Could not load sample dataset');
      const data = await response.json();
      onUploadSuccess(data);
      if (isModal) onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full ${isModal ? 'p-2' : 'max-w-4xl mx-auto py-12 px-4'}`}>
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Data Intelligence</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Upload your data. Ask anything. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-brand-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
            Understand everything.
          </span>
        </h2>
        <p className="mt-3 text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
          Drop any raw CSV or Excel file. DataLens AI automatically profiles your dataset, detects anomalies, generates verified analysis plans, and executes Python code with zero hallucinations.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 flex items-center space-x-3 text-sm max-w-2xl mx-auto">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer group rounded-2xl border-2 border-dashed transition-all p-10 sm:p-14 text-center max-w-2xl mx-auto ${
          isDragging
            ? 'border-brand-400 bg-brand-950/30 scale-[1.01]'
            : 'border-slate-700/80 bg-slate-900/60 hover:border-brand-500/60 hover:bg-slate-900/90 shadow-2xl'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600 flex items-center justify-center shadow-inner group-hover:border-brand-500/50 group-hover:scale-105 transition-all">
            {loading ? (
              <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8 text-brand-400 group-hover:text-brand-300 transition-colors" />
            )}
          </div>

          <div>
            <p className="text-base font-semibold text-white">
              {loading ? "Analyzing and profiling dataset..." : "Drop your CSV or Excel file here"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports .csv, .xlsx, .xls up to 100MB
            </p>
          </div>

          <div className="pt-2">
            <span className="inline-flex items-center px-4 py-2 rounded-lg bg-brand-500 text-slate-950 font-semibold text-xs hover:bg-brand-400 transition-colors shadow-lg shadow-brand-500/25">
              Browse Files
            </span>
          </div>
        </div>
      </div>

      {/* Instant Demo Datasets for Jury & Fast Evaluation */}
      <div className="mt-8 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Or test instantly with pre-loaded benchmark data:
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => triggerSample('retail_sales')}
            className="flex items-start p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-brand-500/50 hover:bg-slate-850 transition-all text-left group"
          >
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mr-3 group-hover:bg-emerald-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-white group-hover:text-brand-300">
                  Retail Sales 2026
                </p>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                12,450 rows · 14 cols · Regional revenue, March anomalies & Product A dynamics
              </p>
            </div>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => triggerSample('saas_churn')}
            className="flex items-start p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850 transition-all text-left group"
          >
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 mr-3 group-hover:bg-cyan-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-white group-hover:text-cyan-300">
                  SaaS Churn & MRR
                </p>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                5,200 rows · 9 cols · Recurring revenue, ticket correlations & retention
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
