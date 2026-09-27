import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  X,
  Radio,
  Sliders,
  CheckCircle2
} from 'lucide-react';

export default function AudioBriefingModal({ isOpen, onClose, datasetId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1.0);
  const utteranceRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !datasetId) {
      handleStop();
      return;
    }

    setLoading(true);
    fetch(`/api/dataset/${datasetId}/audio-briefing`)
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });

    return () => {
      handleStop();
    };
  }, [isOpen, datasetId]);

  const handlePlay = () => {
    if (!('speechSynthesis' in window) || !data?.script) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(data.script);
    utterance.rate = rate;
    utterance.pitch = 1.0;

    // Pick a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (!('speechSynthesis' in window)) return;
    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div
        className="fixed inset-0"
        onClick={() => {
          handleStop();
          onClose();
        }}
      />
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 space-y-5 p-6 sm:p-7">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  Executive Audio Briefing
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
                  Voice AI
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Boardroom-ready spoken intelligence generated from ground-truth data.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleStop();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio Waveform Equalizer Display */}
        <div className="p-5 rounded-2xl bg-slate-950 text-white flex flex-col items-center justify-center space-y-4 shadow-inner relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-emerald-500/10 pointer-events-none" />

          {/* Equalizer bars */}
          <div className="flex items-end space-x-1.5 h-12">
            {[40, 75, 55, 90, 65, 80, 45, 95, 60, 85, 50, 70, 90, 60, 40].map((h, i) => (
              <span
                key={i}
                style={{
                  height: isPlaying ? `${Math.max(15, (h * (Math.sin((i + Date.now()) * 0.05) + 1.2)) % 100)}%` : '15%',
                  transition: 'height 0.15s ease'
                }}
                className={`w-1.5 rounded-full ${
                  isPlaying ? 'bg-gradient-to-t from-emerald-500 to-teal-300 animate-pulse' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="text-center">
            <span className="text-xs font-mono font-bold text-emerald-400">
              {isPlaying ? 'Speaking: Executive Synthesis in Progress...' : isPaused ? 'Audio Briefing Paused' : 'Ready to Speak'}
            </span>
          </div>

          {/* Audio Controls */}
          <div className="flex items-center space-x-3 pt-1">
            {isPlaying ? (
              <button
                onClick={handlePause}
                className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-transform active:scale-95 shadow-lg shadow-emerald-600/30"
                title="Pause"
              >
                <Pause className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handlePlay}
                disabled={loading}
                className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white flex items-center justify-center transition-transform active:scale-95 shadow-lg shadow-emerald-600/30"
                title="Play Audio Briefing"
              >
                <Play className="w-5 h-5 translate-x-0.5" />
              </button>
            )}

            <button
              onClick={handleStop}
              className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Stop"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Speed Selector */}
            <div className="flex items-center space-x-1 bg-slate-800/80 px-2 py-1 rounded-xl text-xs font-mono">
              <span className="text-slate-400 text-[10px]">Speed:</span>
              {[1.0, 1.2, 1.5].map((s) => (
                <button
                  key={s}
                  onClick={() => setRate(s)}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                    rate === s ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Written Speech Script */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Spoken Script & Executive Takeaways</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans max-h-36 overflow-y-auto">
            {loading ? (
              <p className="text-slate-400 animate-pulse">Generating real-time audio briefing...</p>
            ) : (
              data?.script
            )}
          </div>

          {/* Key Metric Bullets */}
          {data?.bullet_points && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
              {data.bullet_points.map((bp, idx) => (
                <div key={idx} className="flex items-start space-x-2 p-2 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="leading-snug">{bp}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
