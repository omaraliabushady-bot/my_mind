import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Volume2,
  Headphones,
  CheckCircle2,
  Quote,
  FolderKanban
} from 'lucide-react';
import type { TimerMode, AmbientSoundType, Language, UserSettings, UserStats, Project } from '../types';
import { translations } from '../utils/i18n';
import { FlipDigit } from './FlipDigit';
import {
  playPomodoroFinishSound,
  playClickSound,
  ambientEngine
} from '../utils/audio';
import { firePomodoroCelebration } from '../utils/confetti';

interface PomodoroTimerProps {
  language: Language;
  settings: UserSettings;
  stats: UserStats;
  projects?: Project[];
  onSettingsChange: (settings: UserSettings) => void;
  onSessionComplete: (durationMinutes: number, mode: TimerMode, projectId?: string) => void;
  activeTaskTitle?: string;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  language,
  settings,
  projects = [],
  onSettingsChange,
  onSessionComplete,
  activeTaskTitle
}) => {
  const t = translations[language];

  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState<number>(settings.workDuration * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>(settings.ambientSound);
  const [ambientVolume, setAmbientVolume] = useState<number>(settings.ambientVolume);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRunning) {
      const mins =
        mode === 'work'
          ? settings.workDuration
          : mode === 'short_break'
          ? settings.shortBreakDuration
          : settings.longBreakDuration;
      setTimeLeft(mins * 60);
    }
  }, [mode, settings.workDuration, settings.shortBreakDuration, settings.longBreakDuration, isRunning]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode]);

  useEffect(() => {
    if (ambientSound !== 'none') {
      ambientEngine.play(ambientSound, ambientVolume);
    } else {
      ambientEngine.stop();
    }
  }, [ambientSound, ambientVolume]);

  // Keyboard Shortcuts: Space (Play/Pause), Z (Zen Mode), ESC (Exit Zen)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        toggleTimer();
      } else if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        playClickSound();
        setIsZenMode(prev => !prev);
      } else if (e.key === 'Escape' && isZenMode) {
        setIsZenMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZenMode, isRunning]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);

    if (settings.soundEnabled) {
      playPomodoroFinishSound(settings.soundVolume);
    }
    firePomodoroCelebration();

    const duration =
      mode === 'work'
        ? settings.workDuration
        : mode === 'short_break'
        ? settings.shortBreakDuration
        : settings.longBreakDuration;

    onSessionComplete(duration, mode, selectedProjectId || undefined);

    if (mode === 'work') {
      setMode('short_break');
      setTimeLeft(settings.shortBreakDuration * 60);
    } else {
      setMode('work');
      setTimeLeft(settings.workDuration * 60);
    }
  };

  const toggleTimer = () => {
    playClickSound();
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    playClickSound();
    setIsRunning(false);
    const mins =
      mode === 'work'
        ? settings.workDuration
        : mode === 'short_break'
        ? settings.shortBreakDuration
        : settings.longBreakDuration;
    setTimeLeft(mins * 60);
  };

  const handleModeChange = (newMode: TimerMode) => {
    playClickSound();
    setMode(newMode);
    setIsRunning(false);
    const mins =
      newMode === 'work'
        ? settings.workDuration
        : newMode === 'short_break'
        ? settings.shortBreakDuration
        : settings.longBreakDuration;
    setTimeLeft(mins * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (isZenMode) {
    return (
      <div className="fixed inset-0 z-50 bg-[#090b11] flex flex-col items-center justify-between p-8 sm:p-12 animate-in fade-in duration-300 select-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-cyan-500/15 via-purple-600/15 to-transparent rounded-full blur-3xl zen-glow-orb pointer-events-none" />

        <div className="w-full flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-sm font-semibold tracking-wider text-cyan-300 uppercase">
              {mode === 'work' ? t.timerWork : mode === 'short_break' ? t.timerShortBreak : t.timerLongBreak}
            </span>
          </div>

          <button
            onClick={() => {
              playClickSound();
              setIsZenMode(false);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition cursor-pointer"
          >
            <Minimize2 className="w-4 h-4 text-cyan-400" />
            <span>{t.timerExitZen}</span>
          </button>
        </div>

        <div className="flex flex-col items-center justify-center my-auto relative z-10">
          <div className="flex items-center gap-4 sm:gap-8">
            <FlipDigit value={minutes} label={t.timerMinutes} size="zen" />
            <div className="flex flex-col gap-4 text-cyan-400 font-bold text-4xl sm:text-6xl animate-pulse">
              <span>:</span>
            </div>
            <FlipDigit value={seconds} label={t.timerSeconds} size="zen" />
          </div>

          <div className="flex items-center gap-4 mt-12">
            <button
              onClick={toggleTimer}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-lg shadow-xl shadow-cyan-500/30 hover:scale-105 active:scale-95 transition flex items-center gap-3 cursor-pointer"
            >
              {isRunning ? <Pause className="w-6 h-6 fill-slate-950" /> : <Play className="w-6 h-6 fill-slate-950" />}
              <span>{isRunning ? t.timerPause : t.timerStart}</span>
            </button>

            <button
              onClick={resetTimer}
              className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition cursor-pointer"
              title={t.timerReset}
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="text-center relative z-10 max-w-xl mx-auto">
          <p className="text-xs sm:text-sm text-slate-400/80 italic font-medium leading-relaxed">
            {t.focusQuote}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-white/10 mb-6 z-10">
          <button
            onClick={() => handleModeChange('work')}
            className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
              mode === 'work'
                ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.timerWork}
          </button>
          <button
            onClick={() => handleModeChange('short_break')}
            className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
              mode === 'short_break'
                ? 'bg-gradient-to-r from-emerald-500/30 to-teal-500/30 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.timerShortBreak}
          </button>
          <button
            onClick={() => handleModeChange('long_break')}
            className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
              mode === 'long_break'
                ? 'bg-gradient-to-r from-purple-500/30 to-indigo-500/30 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.timerLongBreak}
          </button>
        </div>

        {/* Project Selector for Focus Attribution */}
        {projects.length > 0 && mode === 'work' && (
          <div className="flex items-center gap-2 mb-4 z-10">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <FolderKanban className="w-3.5 h-3.5 text-cyan-400" />
              {language === 'ar' ? 'ربط الجلسة بمشروع:' : 'Link to Project:'}
            </span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="glass-input text-xs font-semibold px-3 py-1 rounded-xl text-slate-200 border border-white/10 bg-[#121726] cursor-pointer"
            >
              <option value="">{language === 'ar' ? 'تركيز عام (بدون مشروع)' : 'General Focus'}</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 3D Flip Clock */}
        <div className="my-6 z-10">
          <div className="flex items-center gap-3 sm:gap-6">
            <FlipDigit value={minutes} label={t.timerMinutes} size="lg" />
            <div className="flex flex-col gap-3 text-cyan-400 font-bold text-3xl sm:text-5xl animate-pulse">
              <span>:</span>
            </div>
            <FlipDigit value={seconds} label={t.timerSeconds} size="lg" />
          </div>
        </div>

        {activeTaskTitle && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/60 border border-cyan-500/20 text-xs text-cyan-300 font-medium mb-6 z-10 max-w-md truncate">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">{activeTaskTitle}</span>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-3 sm:gap-4 z-10">
          <button
            onClick={toggleTimer}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-base shadow-xl shadow-cyan-500/25 hover:scale-105 active:scale-95 transition flex items-center gap-2.5 cursor-pointer"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-slate-950" />
                <span>{t.timerPause}</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-slate-950" />
                <span>{t.timerStart}</span>
              </>
            )}
          </button>

          <button
            onClick={resetTimer}
            className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-white/10 hover:border-white/20 transition cursor-pointer"
            title={t.timerReset}
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              playClickSound();
              setIsZenMode(true);
            }}
            className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 border border-cyan-500/20 hover:border-cyan-500/40 text-xs font-bold transition cursor-pointer"
            title={t.timerZenMode}
          >
            <Maximize2 className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">{t.timerZenMode}</span>
          </button>
        </div>

        <div className="mt-4 text-[11px] text-slate-400 z-10">
          <span>اختصار سريع: اضغط <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-mono text-[10px]">Space</kbd> للتشغيل/الإيقاف • <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-mono text-[10px]">Z</kbd> لوضع الزِن</span>
        </div>

      </div>

      {/* Ambient Sound Deck */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Headphones className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">{t.ambientSoundTitle}</h3>
              <p className="text-[11px] text-slate-400">محاكاة ترددات التركيز مباشرة داخل المتصفح عبر Web Audio API</p>
            </div>
          </div>

          {ambientSound !== 'none' && (
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Volume2 className="w-4 h-4 text-slate-400" />
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={ambientVolume}
                onChange={(e) => {
                  const vol = parseFloat(e.target.value);
                  setAmbientVolume(vol);
                  ambientEngine.setVolume(vol);
                }}
                className="w-28 accent-cyan-400 cursor-pointer"
                title={t.ambientVolume}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'none', label: t.ambientNone, desc: 'بدون صوت', icon: '🔇' },
            { id: 'brown', label: 'Brown Noise', desc: 'ضجيج بني عميق', icon: '🌊' },
            { id: 'rain', label: 'Window Rain', desc: 'مطر على النافذة', icon: '🌧️' },
            { id: 'binaural', label: 'Alpha 432Hz', desc: 'موجات تدفق ذهني', icon: '🧠' }
          ].map((item) => {
            const isSelected = ambientSound === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  playClickSound();
                  const nextType = item.id as AmbientSoundType;
                  setAmbientSound(nextType);
                  onSettingsChange({
                    ...settings,
                    ambientSound: nextType
                  });
                }}
                className={`p-3 rounded-2xl text-start border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-purple-950/40 border-purple-500/40 text-purple-200 shadow-lg shadow-purple-500/10'
                    : 'bg-slate-900/40 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center justify-between text-base mb-1">
                  <span>{item.icon}</span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  )}
                </div>
                <div className="text-xs font-bold text-slate-100">{item.label}</div>
                <div className="text-[10px] text-slate-400">{item.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-3.5 text-xs text-slate-400 italic">
        <Quote className="w-5 h-5 text-cyan-400 shrink-0" />
        <p className="leading-relaxed">
          {t.focusQuote}
        </p>
      </div>

    </div>
  );
};
