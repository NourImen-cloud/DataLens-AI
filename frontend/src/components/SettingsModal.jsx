import React, { useState, useEffect } from 'react';
import { X, Key, Cpu, Check, AlertCircle, Save, Sparkles, CheckCircle2 } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, onSettingsUpdated }) {
  const [geminiKey, setGeminiKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [ollamaModel, setOllamaModel] = useState('llama3');
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        if (data.ollama_model) setOllamaModel(data.ollama_model);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gemini_api_key: geminiKey || undefined,
          groq_api_key: groqKey || undefined,
          openai_api_key: openaiKey || undefined,
          ollama_model: ollamaModel,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setStatus(data.current);
        setSavedSuccess(true);
        if (onSettingsUpdated) onSettingsUpdated(data.current);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-brand-400">
              <Key className="w-5 h-5" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">AI Intelligence & Model Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          {/* Active Provider Indicator */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                Current Reasoning Engine
              </span>
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 capitalize">
                {status?.active_provider || 'Deterministic Statistical Engine'}
              </p>
            </div>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
            </span>
          </div>

          <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
            DataLens AI executes queries and verifies numbers using the local Python/Pandas kernel. You can optionally connect Gemini, Groq, Ollama, or OpenAI to enhance natural language reasoning.
          </p>

          {/* Gemini API Key */}
          <div className="space-y-1.5">
            <label className="text-slate-700 dark:text-slate-300 font-semibold flex items-center justify-between">
              <span>Google Gemini API Key</span>
              {status?.gemini_configured && (
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-bold">Active ✓</span>
              )}
            </label>
            <input
              type="password"
              placeholder={status?.gemini_configured ? "•••••••••••••••••••••• (Active)" : "AIzaSy..."}
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-600 font-mono"
            />
          </div>

          {/* Groq API Key */}
          <div className="space-y-1.5">
            <label className="text-slate-700 dark:text-slate-300 font-semibold flex items-center justify-between">
              <span>Groq API Key (Ultra-Fast)</span>
              {status?.groq_configured && (
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-bold">Active ✓</span>
              )}
            </label>
            <input
              type="password"
              placeholder={status?.groq_configured ? "•••••••••••••••••••••• (Active)" : "gsk_..."}
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-600 font-mono"
            />
          </div>

          {/* Ollama Local Model */}
          <div className="space-y-1.5">
            <label className="text-slate-700 dark:text-slate-300 font-semibold flex items-center justify-between">
              <span>Local Ollama Model</span>
              <span className={`text-[10px] font-mono font-bold ${status?.ollama_available ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}`}>
                {status?.ollama_available ? 'Ollama Online ✓' : 'Ollama Offline'}
              </span>
            </label>
            <input
              type="text"
              placeholder="llama3, mistral, qwen2.5, phi3"
              value={ollamaModel}
              onChange={(e) => setOllamaModel(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-600 font-mono"
            />
          </div>

          {savedSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-center space-x-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Settings updated successfully!</span>
            </div>
          )}

          <div className="pt-3 flex justify-end space-x-2.5 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors font-semibold"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
