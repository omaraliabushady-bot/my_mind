import React, { useState, useEffect } from 'react';
import {
  Brain,
  CheckCircle2,
  FolderKanban,
  Timer,
  Trophy,
  Volume2,
  VolumeX,
  Languages,
  Archive,
  Sparkles,
  Info,
  Settings,
  User,
  LogOut,
  RefreshCw
} from 'lucide-react';
import type { Language, UserStats, UserSettings } from '../types';
import { translations } from '../utils/i18n';
import { getNextCycleTime, formatRemainingTime } from '../utils/autoClear';
import { playClickSound } from '../utils/audio';
import { isSupabaseConfigured } from '../lib/supabase';

interface NavbarProps {
  activeTab: 'tasks' | 'projects' | 'timer' | 'stats' | 'archive';
  setActiveTab: (tab: 'tasks' | 'projects' | 'timer' | 'stats' | 'archive') => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  stats: UserStats;
  settings: UserSettings;
  onSettingsChange: (settings: UserSettings) => void;
  onManualClear: () => void;
  completedTasksCount: number;
  onOpenSettings: () => void;
  currentUser: { id: string; email: string; displayName?: string } | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onSyncNow: () => void;
  isSyncing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  language,
  onLanguageChange,
  stats,
  settings,
  onSettingsChange,
  onManualClear,
  completedTasksCount,
  onOpenSettings,
  currentUser,
  onOpenAuth,
  onLogout,
  onSyncNow,
  isSyncing
}) => {
  const t = translations[language];
  const [remainingTime, setRemainingTime] = useState<string>('00:00:00');
  const [cycleLabel, setCycleLabel] = useState<string>('');
  const [showClearTooltip, setShowClearTooltip] = useState<boolean>(false);
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);

  useEffect(() => {
    const updateCountdown = () => {
      const { remainingMs, cycleNameAr, cycleNameEn } = getNextCycleTime();
      setRemainingTime(formatRemainingTime(remainingMs));
      setCycleLabel(language === 'ar' ? cycleNameAr : cycleNameEn);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [language]);

  const toggleSound = () => {
    playClickSound();
    onSettingsChange({
      ...settings,
      soundEnabled: !settings.soundEnabled
    });
  };

  const navItems = [
    { id: 'tasks', label: t.navTasks, icon: CheckCircle2 },
    { id: 'projects', label: t.navProjects, icon: FolderKanban },
    { id: 'timer', label: t.navTimer, icon: Timer },
    { id: 'stats', label: t.navStats, icon: Trophy },
    { id: 'archive', label: t.navArchive, icon: Archive }
  ] as const;

  const userInitial = currentUser?.displayName
    ? currentUser.displayName.charAt(0).toUpperCase()
    : currentUser?.email
    ? currentUser.email.charAt(0).toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                playClickSound();
                setActiveTab('tasks');
              }}
              className="group flex items-center gap-3 text-start transition-transform active:scale-95 cursor-pointer"
            >
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-[2px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-400/40 transition duration-300">
                <div className="w-full h-full bg-[#0d0f17] rounded-[14px] flex items-center justify-center">
                  <Brain className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300 group-hover:scale-110 transition duration-300 animate-pulse" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-purple-300">
                    {t.appName}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Cloud v3
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 hidden sm:block font-medium truncate max-w-[280px]">
                  {t.appSubtitle}
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/60 border border-white/5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    playClickSound();
                    setActiveTab(item.id);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Controls: 12-Hour Cycle, Stats XP, Sound, Lang, Auth */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* 12-Hour Auto-Clear Live Countdown Pill */}
            <div className="relative">
              <button
                onClick={() => setShowClearTooltip(!showClearTooltip)}
                onMouseEnter={() => setShowClearTooltip(true)}
                onMouseLeave={() => setShowClearTooltip(false)}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/20 hover:border-purple-500/40 text-xs text-purple-200 transition-all cursor-pointer"
                title={t.autoClearTooltip}
              >
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping group-hover:scale-125" />
                <span className="hidden xl:inline text-purple-300 font-medium">
                  {t.autoClearBadge}:
                </span>
                <span className="font-mono font-bold text-cyan-300 tracking-wider">
                  {remainingTime}
                </span>
                <Info className="w-3.5 h-3.5 text-purple-400/80 group-hover:text-purple-300" />
              </button>

              {/* Informative Popover / Actions */}
              {showClearTooltip && (
                <div
                  onMouseEnter={() => setShowClearTooltip(true)}
                  onMouseLeave={() => setShowClearTooltip(false)}
                  className={`absolute ${language === 'ar' ? 'left-0' : 'right-0'} mt-2 w-80 glass-panel p-4 rounded-2xl shadow-2xl z-50 text-xs text-slate-300 border border-purple-500/30 animate-in fade-in zoom-in-95`}
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 font-bold text-slate-100">
                    <span className="flex items-center gap-1.5 text-cyan-300">
                      <Sparkles className="w-4 h-4" />
                      {t.autoClearCycle}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300">
                      {cycleLabel}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed mb-3">
                    {t.autoClearTooltip}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="text-[11px] text-slate-400">
                      {completedTasksCount > 0
                        ? `${completedTasksCount} ${language === 'ar' ? 'مهمة منجزة جاهزة' : 'ready to clear'}`
                        : t.noCompletedToArchive}
                    </span>
                    <button
                      onClick={() => {
                        playClickSound();
                        onManualClear();
                        setShowClearTooltip(false);
                      }}
                      disabled={completedTasksCount === 0}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 disabled:opacity-40 disabled:pointer-events-none text-cyan-300 font-semibold border border-cyan-500/30 text-[11px] transition-all cursor-pointer"
                    >
                      {t.autoClearNowBtn}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Level / XP Pill */}
            <div
              onClick={() => {
                playClickSound();
                setActiveTab('stats');
              }}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-white/10 hover:border-cyan-500/40 transition cursor-pointer"
              title={`${stats.xp} XP - ${t.levelLabel} ${stats.level}`}
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500 to-purple-600 flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
                {stats.level}
              </div>
              <span className="font-mono text-xs font-semibold text-amber-300">
                {stats.xp} <span className="text-[10px] text-slate-400">XP</span>
              </span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-xl transition cursor-pointer ${
                settings.soundEnabled
                  ? 'bg-slate-800/80 text-cyan-400 hover:bg-slate-700/80 border border-cyan-500/30'
                  : 'bg-slate-900/60 text-slate-500 hover:text-slate-300 border border-white/5'
              }`}
              title={settings.soundEnabled ? 'Mute Sound' : 'Enable Sound'}
              aria-label="Sound settings"
            >
              {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Language Switcher Toggle */}
            <button
              onClick={() => {
                playClickSound();
                const nextLang = language === 'ar' ? 'en' : 'ar';
                onLanguageChange(nextLang);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-white/10 hover:border-cyan-500/40 text-xs font-semibold transition cursor-pointer"
              title="Toggle Language (العربية / English)"
            >
              <Languages className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            {/* Settings Modal Button */}
            <button
              onClick={() => {
                playClickSound();
                onOpenSettings();
              }}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/40 transition cursor-pointer"
              title={language === 'ar' ? 'الإعدادات المتقدمة' : 'System Settings'}
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Authentication / User Profile Dropdown */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 p-1 pl-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-cyan-500/30 transition cursor-pointer"
                  title={currentUser.email}
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center text-xs font-black text-slate-950 shadow-md">
                    {userInitial}
                  </div>
                  <div className="hidden sm:flex flex-col text-start">
                    <span className="text-[11px] font-bold text-slate-200 truncate max-w-[90px]">
                      {currentUser.displayName || currentUser.email.split('@')[0]}
                    </span>
                    <span className="text-[9px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {isSupabaseConfigured() ? 'Cloud Sync' : 'Active'}
                    </span>
                  </div>
                </button>

                {showUserDropdown && (
                  <div
                    className={`absolute ${language === 'ar' ? 'left-0' : 'right-0'} mt-2 w-56 glass-panel p-3 rounded-2xl shadow-2xl z-50 text-xs border border-white/10 animate-in fade-in space-y-2.5`}
                  >
                    <div className="pb-2 border-b border-white/10">
                      <div className="text-[11px] text-slate-400">
                        {language === 'ar' ? 'الحساب الحالي:' : 'Signed in as:'}
                      </div>
                      <div className="text-xs font-bold text-cyan-300 truncate">
                        {currentUser.email}
                      </div>
                    </div>

                    {/* Sync Now button */}
                    <button
                      onClick={() => {
                        playClickSound();
                        onSyncNow();
                      }}
                      disabled={isSyncing}
                      className="w-full flex items-center gap-2 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer text-xs"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? (language === 'ar' ? 'جاري المزامنة...' : 'Syncing...') : (language === 'ar' ? 'مزامنة السحابة الآن' : 'Sync Cloud Now')}</span>
                    </button>

                    {/* Logout Button */}
                    <button
                      onClick={() => {
                        playClickSound();
                        setShowUserDropdown(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition cursor-pointer text-xs font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      <span>{language === 'ar' ? 'تسجيل الخروج' : 'Log Out'}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  playClickSound();
                  onOpenAuth();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition cursor-pointer"
              >
                <User className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">{language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
              </button>
            )}

          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden flex items-center justify-around py-2.5 px-2 bg-[#0d0f17]/95 border-t border-white/10 backdrop-blur-xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                playClickSound();
                setActiveTab(item.id);
              }}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[11px] font-medium transition cursor-pointer ${
                isActive
                  ? 'text-cyan-400 bg-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
