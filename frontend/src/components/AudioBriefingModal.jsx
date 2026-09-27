import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';

export default function AudioBriefingModal({ isOpen, onClose, datasetId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [copied, setCopied] = useState(false);
  const [activeSentenceIdx, setActiveSentenceIdx] = useState(-1);
  const [availableVoices, setAvailableVoices] = useState([]);

  const currentSentenceRef = useRef(0);
  const isPlayingRef = useRef(false);
  const isPausedRef = useRef(false);
  const rateRef = useRef(1.0);

  // Sync ref with state
  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  // Load voices smoothly on mount
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const populateVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        setAvailableVoices(v);
      }
    };

    populateVoices();
    window.speechSynthesis.onvoiceschanged = populateVoices;

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Fetch audio briefing when opened
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

  // Break script into sentences for chunked speech (prevents Chrome 15s freeze bug & enables subtitle highlighting)
  const sentences = useMemo(() => {
    if (!data?.script) return [];
    const matches = data.script.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g);
    return matches ? matches.map((s) => s.trim()).filter(Boolean) : [data.script];
  }, [data?.script]);

  const speakSentence = (index) => {
    if (!('speechSynthesis' in window) || index >= sentences.length) {
      handleStop();
      return;
    }

    currentSentenceRef.current = index;
    setActiveSentenceIdx(index);

    const sentence = sentences[index];
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.rate = rateRef.current;
    utterance.pitch = 1.0;

    // Pick best English voice
    const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
    const naturalVoice =
      voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') ||
            v.name.includes('Google') ||
            v.name.includes('Samantha') ||
            v.name.includes('David') ||
            v.name.includes('Jenny'))
      ) || voices.find((v) => v.lang.startsWith('en'));

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      isPlayingRef.current = true;
      isPausedRef.current = false;
    };

    utterance.onend = () => {
      if (isPlayingRef.current && !isPausedRef.current) {
        if (index + 1 < sentences.length) {
          speakSentence(index + 1);
        } else {
          handleStop();
        }
      }
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      if (index + 1 < sentences.length && isPlayingRef.current) {
        speakSentence(index + 1);
      } else {
        handleStop();
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePlay = () => {
    if (!('speechSynthesis' in window) || sentences.length === 0) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      isPlayingRef.current = true;
      isPausedRef.current = false;
      return;
    }

    window.speechSynthesis.cancel();
    isPlayingRef.current = true;
    isPausedRef.current = false;
    setIsPlaying(true);
    setIsPaused(false);
    speakSentence(0);
  };

  const handlePause = () => {
    if (!('speechSynthesis' in window)) return;
    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
      isPlayingRef.current = false;
      isPausedRef.current = true;
    }
  };

  const handleStop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    isPlayingRef.current = false;
    isPausedRef.current = false;
    setActiveSentenceIdx(-1);
    currentSentenceRef.current = 0;
  };

  const handleCopy = () => {
    if (data?.script) {
      navigator.clipboard.writeText(data.script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  const hasSpeech = 'speechSynthesis' in window;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div
        className="fixed inset-0"
        onClick={() => {
          handleStop();
          onClose();
        }}
      />
      <div className="relative w-full max-w-xl max-h-[92vh] sm:max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 sm:px-6 py-3.5 shrink-0 bg-white/95 dark:bg-slate-900/95">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 pr-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs shrink-0">
              <Radio className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                  Executive Audio Briefing
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300 shrink-0">
                  Voice AI
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                Boardroom-ready spoken intelligence from ground truth data.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleStop();
              onClose();
            }}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto px-4 sm:px-6 py-4 space-y-4 flex-1">
          {/* Audio Waveform Equalizer Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 text-white flex flex-col items-center justify-center space-y-3.5 shadow-inner relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-emerald-500/10 pointer-events-none" />

            {/* Equalizer bars (responsive) */}
            <div className="flex items-end justify-center space-x-1 sm:space-x-1.5 h-10 sm:h-12 w-full max-w-xs">
              {[40, 75, 55, 90, 65, 80, 45, 95, 60, 85, 50, 70, 90, 60, 40].map((h, i) => (
                <span
                  key={i}
                  style={{
                    height: isPlaying ? `${Math.max(15, (h * (Math.sin((i + Date.now()) * 0.05) + 1.2)) % 100)}%` : '15%',
                    transition: 'height 0.15s ease'
                  }}
                  className={`w-1 sm:w-1.5 rounded-full ${
                    isPlaying ? 'bg-gradient-to-t from-emerald-500 to-teal-300 animate-pulse' : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Status indicator */}
            <div className="text-center px-2">
              <span className="text-[11px] sm:text-xs font-mono font-bold text-emerald-400">
                {isPlaying
                  ? `Speaking (${activeSentenceIdx + 1}/${sentences.length}): Executive Brief in Progress...`
                  : isPaused
                  ? 'Audio Briefing Paused'
                  : 'Ready to Play Audio Briefing'}
              </span>
            </div>

            {/* Responsive Audio Controls Row */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-1 w-full">
              {isPlaying ? (
                <button
                  onClick={handlePause}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-transform active:scale-95 shadow-lg shadow-emerald-600/30"
                  title="Pause Speech"
                >
                  <Pause className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handlePlay}
                  disabled={loading || !hasSpeech}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white flex items-center justify-center transition-transform active:scale-95 shadow-lg shadow-emerald-600/30"
                  title="Play Audio Briefing"
                >
                  <Play className="w-5 h-5 translate-x-0.5" />
                </button>
              )}

              <button
                onClick={handleStop}
                className="p-2.5 sm:p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Reset to Beginning"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Speed Selector */}
              <div className="flex items-center space-x-1 bg-slate-800/80 px-2 py-1 rounded-xl text-xs font-mono">
                <span className="text-slate-400 text-[10px]">Speed:</span>
                {[1.0, 1.2, 1.5].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setRate(s);
                      if (isPlaying) {
                        // Restart at current sentence with new rate
                        window.speechSynthesis.cancel();
                        speakSentence(currentSentenceRef.current);
                      }
                    }}
                    className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                      rate === s ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              {/* Copy Script Button */}
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1.5 rounded-xl text-xs text-slate-300 transition-colors"
                title="Copy script to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[11px] font-semibold">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Spoken Script with live sentence highlight */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Executive Transcript</span>
              </div>
              <span className="text-[10px] lowercase text-slate-500 font-normal">
                {sentences.length} sentences
              </span>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans max-h-36 sm:max-h-44 overflow-y-auto">
              {loading ? (
                <p className="text-slate-400 animate-pulse">Generating real-time audio briefing...</p>
              ) : sentences.length > 0 ? (
                <p>
                  {sentences.map((sentence, idx) => (
                    <span
                      key={idx}
                      className={`transition-colors rounded px-0.5 ${
                        isPlaying && activeSentenceIdx === idx
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-medium'
                          : ''
                      }`}
                    >
                      {sentence}{' '}
                    </span>
                  ))}
                </p>
              ) : (
                data?.script || 'No script available.'
              )}
            </div>
          </div>

          {/* Key Metric Takeaways */}
          {data?.bullet_points && data.bullet_points.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Key Strategic Highlights
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {data.bullet_points.map((bp, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-2 p-2.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-snug">{bp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
