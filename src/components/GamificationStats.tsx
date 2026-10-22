import React from 'react';
import {
  Trophy,
  Flame,
  Target,
  Clock,
  Sparkles,
  Award,
  TrendingUp,
  BarChart3,
  CalendarDays,
  ShieldCheck
} from 'lucide-react';
import type { UserStats, Badge, Language } from '../types';
import { translations } from '../utils/i18n';

interface GamificationStatsProps {
  stats: UserStats;
  badges: Badge[];
  language: Language;
}

export const GamificationStats: React.FC<GamificationStatsProps> = ({
  stats,
  badges,
  language
}) => {
  const t = translations[language];

  const xpCurrentLevelBase = (stats.level - 1) * 200;
  const xpNextLevelThreshold = stats.level * 200;
  const xpInCurrentLevel = Math.max(0, stats.xp - xpCurrentLevelBase);
  const xpNeededForNextLevel = xpNextLevelThreshold - xpCurrentLevelBase;
  const levelProgress = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100));

  const currentLevelName =
    t.levelNames[Math.min(stats.level - 1, t.levelNames.length - 1)] || t.levelNames[0];

  const streakDays = Array.from({ length: 35 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (34 - idx));
    const dateStr = d.toISOString().split('T')[0];
    const stat = stats.dailyStats[dateStr];
    const tasksCount = stat?.tasksCompleted || 0;
    const focusMins = stat?.focusMinutes || 0;

    let intensity = 0;
    if (tasksCount >= 5 || focusMins >= 100) intensity = 4;
    else if (tasksCount >= 3 || focusMins >= 60) intensity = 3;
    else if (tasksCount >= 1 || focusMins >= 25) intensity = 2;
    else if (tasksCount > 0) intensity = 1;

    return {
      date: dateStr,
      tasksCount,
      focusMins,
      intensity,
      isToday: idx === 34
    };
  });

  const last7Days = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    const dateStr = d.toISOString().split('T')[0];
    const stat = stats.dailyStats[dateStr];
    const dayName = d.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'short' });

    return {
      date: dateStr,
      dayName,
      focusHours: ((stat?.focusMinutes || 0) / 60).toFixed(1),
      tasksCompleted: stat?.tasksCompleted || 0
    };
  });

  const maxFocusHours = Math.max(1, ...last7Days.map(d => parseFloat(d.focusHours)));
  const maxTasks = Math.max(1, ...last7Days.map(d => d.tasksCompleted));

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Mind Power & Level Showcase Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden bg-gradient-to-br from-indigo-950/30 via-slate-900/60 to-purple-950/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-1 shadow-xl shadow-cyan-500/20">
                <div className="w-full h-full bg-[#0d0f17] rounded-[22px] flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {t.levelLabel}
                  </span>
                  <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-200 to-white">
                    {stats.level}
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-300 mb-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>{currentLevelName}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-100">
                {t.mindPowerTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {t.xpLabel}: <span className="font-mono font-bold text-amber-300">{stats.xp} XP</span> • {t.nextLevelLabel} {xpNeededForNextLevel - xpInCurrentLevel} XP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-rose-400 text-xs font-bold mb-1">
                <Flame className="w-4 h-4 fill-rose-500/20" />
                <span>{t.currentStreakDays}</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-slate-100">
                {stats.streakDays}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-cyan-400 text-xs font-bold mb-1">
                <Target className="w-4 h-4" />
                <span>{t.totalTasksTitle}</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-slate-100">
                {stats.totalTasksCompleted}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-purple-400 text-xs font-bold mb-1">
                <Clock className="w-4 h-4" />
                <span>{t.totalFocusTitle}</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-slate-100">
                {Math.round(stats.totalFocusMinutes / 60)}h
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/5 space-y-2">
          <div className="flex justify-between text-xs text-slate-400 font-medium">
            <span>{t.levelLabel} {stats.level}</span>
            <span className="font-mono text-cyan-300 font-bold">{levelProgress}%</span>
            <span>{t.levelLabel} {stats.level + 1}</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-950/80 overflow-hidden border border-white/5 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 shadow-md shadow-cyan-500/30 transition-all duration-500"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Streak Matrix: Never Break The Chain */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-rose-400" />
              {t.streakMatrixTitle}
            </h3>
            <p className="text-xs text-slate-400">
              {t.streakMatrixSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 self-end sm:self-auto">
            <span>أقل نشاط</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-slate-900/60 border border-white/5" />
              <div className="w-3 h-3 rounded bg-cyan-950 border border-cyan-800/50" />
              <div className="w-3 h-3 rounded bg-cyan-700/60 border border-cyan-500/50" />
              <div className="w-3 h-3 rounded bg-cyan-500 border border-cyan-400" />
              <div className="w-3 h-3 rounded bg-cyan-300 shadow-sm shadow-cyan-400" />
            </div>
            <span>أعلى إنجاز</span>
          </div>
        </div>

        <div className="grid grid-cols-7 sm:grid-cols-7 md:grid-cols-7 gap-2.5 pt-2">
          {streakDays.map((cell) => {
            const intensityBg = {
              0: 'bg-slate-900/60 border-white/5 hover:border-white/20',
              1: 'bg-cyan-950/80 border-cyan-800/50 hover:border-cyan-600',
              2: 'bg-cyan-700/60 border-cyan-500/50 hover:border-cyan-400',
              3: 'bg-cyan-500 border-cyan-400 shadow-sm shadow-cyan-500/30 hover:border-white',
              4: 'bg-gradient-to-tr from-cyan-400 to-purple-400 border-white shadow-md shadow-cyan-400/40 hover:scale-105'
            }[cell.intensity];

            return (
              <div
                key={cell.date}
                className={`h-12 rounded-xl border p-1.5 flex flex-col justify-between transition-all duration-200 cursor-pointer ${intensityBg} ${
                  cell.isToday ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-[#0d0f17]' : ''
                }`}
                title={`${cell.date}: ${cell.tasksCount} مهام منجزة • ${cell.focusMins} دقيقة تركيز`}
              >
                <div className="flex justify-between items-center text-[10px] text-slate-300 font-mono">
                  <span>{cell.date.slice(8)}</span>
                  {cell.tasksCount > 0 && (
                    <span className="font-bold text-cyan-200">{cell.tasksCount}✓</span>
                  )}
                </div>
                {cell.focusMins > 0 && (
                  <div className="text-[9px] font-mono text-cyan-200/90 truncate">
                    {cell.focusMins}m
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Charts: Weekly Focus Hours & Task Completion Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              {t.weeklyChartTitle}
            </h3>
            <span className="text-xs font-mono font-bold text-cyan-300">ساعات التركيز</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
            {last7Days.map((day) => {
              const val = parseFloat(day.focusHours);
              const heightPct = Math.max(12, Math.round((val / maxFocusHours) * 100));

              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[10px] font-mono text-cyan-300 opacity-0 group-hover:opacity-100 transition duration-150">
                    {val}h
                  </span>
                  <div className="w-full max-w-[36px] bg-slate-900/80 rounded-xl overflow-hidden border border-white/5 flex items-end h-full">
                    <div
                      className="w-full rounded-xl bg-gradient-to-t from-cyan-500 to-blue-400 shadow-lg shadow-cyan-500/20 group-hover:from-cyan-400 group-hover:to-white transition-all duration-500"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200">
                    {day.dayName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              {t.completionTrendTitle}
            </h3>
            <span className="text-xs font-mono font-bold text-purple-300">المهام المكتملة</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
            {last7Days.map((day) => {
              const val = day.tasksCompleted;
              const heightPct = Math.max(12, Math.round((val / maxTasks) * 100));

              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[10px] font-mono text-purple-300 opacity-0 group-hover:opacity-100 transition duration-150">
                    {val}
                  </span>
                  <div className="w-full max-w-[36px] bg-slate-900/80 rounded-xl overflow-hidden border border-white/5 flex items-end h-full">
                    <div
                      className="w-full rounded-xl bg-gradient-to-t from-purple-600 via-indigo-500 to-pink-500 shadow-lg shadow-purple-500/20 group-hover:from-purple-400 group-hover:to-pink-300 transition-all duration-500"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200">
                    {day.dayName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Badges & Achievements Grid */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 space-y-5">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            {t.badgesTitle}
          </h3>
          <p className="text-xs text-slate-400">
            أوسمة التحفيز التي فتحتها أثناء رحلتك نحو الإنتاجية المطلقة
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border transition-all duration-200 flex items-start gap-3.5 ${
                badge.unlocked
                  ? 'glass-panel-interactive border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-purple-600/5'
                  : 'bg-slate-900/40 border-white/5 opacity-50'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                  badge.unlocked
                    ? 'bg-gradient-to-tr from-amber-500/20 to-purple-500/20 border border-amber-400/40 shadow-md shadow-amber-500/10'
                    : 'bg-slate-800 border border-slate-700'
                }`}
              >
                {badge.unlocked ? (
                  badge.icon === 'Zap' ? '⚡' : badge.icon === 'Target' ? '🎯' : badge.icon === 'Flame' ? '🔥' : badge.icon === 'Sparkles' ? '✨' : badge.icon === 'Moon' ? '🌙' : '👑'
                ) : (
                  '🔒'
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-sm font-bold text-slate-100 truncate">
                    {language === 'ar' ? badge.titleAr : badge.titleEn}
                  </h4>
                  {badge.unlocked && (
                    <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  {language === 'ar' ? badge.descAr : badge.descEn}
                </p>
                {badge.unlocked && badge.unlockedAt && (
                  <span className="inline-block mt-2 text-[10px] text-amber-300/80 font-mono">
                    ✓ تم الفتح
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
