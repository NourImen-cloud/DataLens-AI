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
    <div className={`w-full ${isModal ? 'p-1' : 'max-w-4xl mx-auto py-8 px-4'}`}>
      {!isModal && (
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Decision Intelligence</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Upload your data. Ask anything. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Understand everything.
            </span>
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Drop any raw CSV or Excel file (Business, Healthcare, Education, IoT). DataLens AI automatically profiles your dataset and answers questions with zero hallucinations.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-500/40 text-red-700 dark:text-red-200 flex items-center space-x-3 text-xs shadow-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer group rounded-2xl border-2 border-dashed transition-all text-center ${
          isModal ? 'p-6 sm:p-8' : 'p-10 sm:p-14 max-w-2xl mx-auto'
        } ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-900/90 shadow-sm hover:shadow'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 flex items-center justify-center shadow-xs group-hover:border-emerald-500 group-hover:scale-105 transition-all">
            {loading ? (
              <Loader2 className="w-7 h-7 text-emerald-600 animate-spin" />
            ) : (
              <UploadCloud className="w-7 h-7 text-emerald-600 group-hover:text-emerald-500 transition-colors" />
            )}
          </div>

          <div>
            <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {loading ? "Analyzing and profiling dataset..." : "Drop your CSV or Excel file here"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Supports .csv, .xlsx, .xls up to 100MB (Any Domain)
            </p>
          </div>

          <div className="pt-1">
            <span className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-colors shadow-sm">
              Browse Local Files
            </span>
          </div>
        </div>
      </div>

      {/* Multi-Domain Benchmark Datasets for Instant Testing */}
      <div className={`mt-5 ${isModal ? 'w-full' : 'max-w-2xl mx-auto'}`}>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Or test instantly with multi-domain datasets:
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => triggerSample('retail_sales')}
            className="flex items-start p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 hover:bg-emerald-50/40 dark:hover:bg-slate-800 transition-all text-left group shadow-xs hover:shadow"
          >
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 mr-2.5">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-700">
                  Retail Sales 2026
                </p>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                12,450 rows · 14 cols · Commerce, Region, March drop
              </p>
            </div>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => triggerSample('clinical_patients')}
            className="flex items-start p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 hover:bg-emerald-50/40 dark:hover:bg-slate-800 transition-all text-left group shadow-xs hover:shadow"
          >
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 mr-2.5">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-700">
                  Clinical Patients (Health)
                </p>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                3,500 rows · 11 cols · BP, BMI, Risk score, Outcomes
              </p>
            </div>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => triggerSample('student_performance')}
            className="flex items-start p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 hover:bg-emerald-50/40 dark:hover:bg-slate-800 transition-all text-left group shadow-xs hover:shadow"
          >
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 mr-2.5">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-700">
                  Student Academics (Education)
                </p>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                4,200 rows · 8 cols · Study hours, Attendance, Exams
              </p>
            </div>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => triggerSample('saas_churn')}
            className="flex items-start p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 hover:bg-emerald-50/40 dark:hover:bg-slate-800 transition-all text-left group shadow-xs hover:shadow"
          >
            <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 mr-2.5">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-cyan-700">
                  SaaS Churn & MRR
                </p>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                5,200 rows · 9 cols · Recurring revenue & retention
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
