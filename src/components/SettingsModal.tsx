import React, { useRef } from 'react';
import {
  X,
  Volume2,
  Bell,
  Clock,
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  Keyboard,
  ShieldCheck,
  Check
} from 'lucide-react';
import type { UserSettings, Language, Task, Project, UserStats, Badge } from '../types';
import { translations } from '../utils/i18n';
import { playClickSound, playTaskCompletionSound } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSettingsChange: (settings: UserSettings) => void;
  language: Language;
  onManualClear: () => void;
  tasks: Task[];
  projects: Project[];
  stats: UserStats;
  badges: Badge[];
  onImportAllData: (data: {
    tasks: Task[];
    projects: Project[];
    stats: UserStats;
    settings: UserSettings;
    badges: Badge[];
  }) => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  language,
  onManualClear,
  tasks,
  projects,
  stats,
  badges,
  onImportAllData,
  onResetData
}) => {
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportBackup = () => {
    playClickSound();
    const backup = {
      version: '2.5',
      exportDate: new Date().toISOString(),
      tasks,
      projects,
      stats,
      settings,
      badges
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `my-mind-full-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.tasks && json.projects && json.stats) {
          onImportAllData(json);
          playTaskCompletionSound(0.5);
          alert(language === 'ar' ? 'تم استيراد النسخة الاحتياطية بنجاح!' : 'Backup imported successfully!');
          onClose();
        } else {
          alert(language === 'ar' ? 'الملف غير صالح أو لا يحتوي على بنية البيانات المطلوبة' : 'Invalid backup format');
        }
      } catch {
        alert(language === 'ar' ? 'تعذر قراءة ملف JSON' : 'Failed to parse JSON file');
      }
    };
    reader.readAsText(file);
  };

  const testChime = () => {
    playTaskCompletionSound(settings.soundVolume);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                {language === 'ar' ? 'إعدادات النظام والتركيز' : 'System & Focus Settings'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'ar' ? 'تخصيص أوقات المؤقت، الأصوات، والنسخ الاحتياطي' : 'Customize timer intervals, audio, and backups'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Pomodoro Durations */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{language === 'ar' ? 'تخصيص فترات مؤقت البومودورو' : 'Pomodoro Intervals (Minutes)'}</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {t.timerWork}
              </label>
              <select
                value={settings.workDuration}
                onChange={(e) =>
                  onSettingsChange({ ...settings, workDuration: parseInt(e.target.value) })
                }
                className="w-full glass-input text-xs font-semibold px-3 py-2 rounded-xl border border-white/10 text-slate-200 bg-[#121726] cursor-pointer"
              >
                {[15, 20, 25, 30, 45, 50, 60].map((m) => (
                  <option key={m} value={m}>
                    {m} {language === 'ar' ? 'دقيقة' : 'min'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {t.timerShortBreak}
              </label>
              <select
                value={settings.shortBreakDuration}
                onChange={(e) =>
                  onSettingsChange({ ...settings, shortBreakDuration: parseInt(e.target.value) })
                }
                className="w-full glass-input text-xs font-semibold px-3 py-2 rounded-xl border border-white/10 text-slate-200 bg-[#121726] cursor-pointer"
              >
                {[3, 5, 7, 10].map((m) => (
                  <option key={m} value={m}>
                    {m} {language === 'ar' ? 'دقيقة' : 'min'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {t.timerLongBreak}
              </label>
              <select
                value={settings.longBreakDuration}
                onChange={(e) =>
                  onSettingsChange({ ...settings, longBreakDuration: parseInt(e.target.value) })
                }
                className="w-full glass-input text-xs font-semibold px-3 py-2 rounded-xl border border-white/10 text-slate-200 bg-[#121726] cursor-pointer"
              >
                {[10, 15, 20, 25, 30].map((m) => (
                  <option key={m} value={m}>
                    {m} {language === 'ar' ? 'دقيقة' : 'min'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Audio & Feedback */}
        <div className="space-y-4 pt-2 border-t border-white/5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4" />
            <span>{language === 'ar' ? 'المؤثرات الصوتية والتعزيز الفوري' : 'Audio & Feedback'}</span>
          </h4>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/40 border border-white/5">
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">
                    {language === 'ar' ? 'رنين إنجاز المهام الموسيقي' : 'Task Completion Chime'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {language === 'ar' ? 'نغمة بلورية متناغمة عبر Web Audio API' : 'Synthesized multi-harmonic crystal bell'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={testChime}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-[11px] font-semibold border border-cyan-500/20 cursor-pointer"
                >
                  {language === 'ar' ? 'تجربة الصوت 🔊' : 'Test Sound 🔊'}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onSettingsChange({ ...settings, soundEnabled: !settings.soundEnabled })
                  }
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    settings.soundEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-slate-950 transition-transform absolute top-1 ${
                      settings.soundEnabled
                        ? language === 'ar'
                          ? 'left-1'
                          : 'right-1'
                        : language === 'ar'
                        ? 'right-1'
                        : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Volume slider */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/40 border border-white/5">
              <span className="text-xs text-slate-300">
                {language === 'ar' ? 'مستوى صوت المؤثرات' : 'Sound Effects Volume'}
              </span>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={settings.soundVolume}
                onChange={(e) =>
                  onSettingsChange({ ...settings, soundVolume: parseFloat(e.target.value) })
                }
                className="w-32 accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section 3: 12-Hour Clean Slate Cycle */}
        <div className="space-y-4 pt-2 border-t border-white/5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>{language === 'ar' ? 'دورة المسح التلقائي كل 12 ساعة' : '12-Hour Auto-Clear Cycle'}</span>
          </h4>

          <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-white/5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-200">
                  {language === 'ar' ? 'تفعيل المسح عند (12:00 ص و 12:00 م)' : 'Enable 12:00 AM & 12:00 PM auto-clear'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {language === 'ar'
                    ? 'ترحيل المهام المكتملة إلى الإحصائيات وبدء صفحة جديدة كل 12 ساعة'
                    : 'Archives completed tasks into statistics and resets active board'}
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  onSettingsChange({
                    ...settings,
                    autoArchiveEnabled: !settings.autoArchiveEnabled
                  })
                }
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.autoArchiveEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-slate-950 transition-transform absolute top-1 ${
                    settings.autoArchiveEnabled
                      ? language === 'ar'
                        ? 'left-1'
                        : 'right-1'
                      : language === 'ar'
                      ? 'right-1'
                      : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {language === 'ar' ? 'ترغب في تفريغ وأرشفة المنجز حاليًا فورًا؟' : 'Archive completed tasks now?'}
              </span>
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  onManualClear();
                }}
                className="px-3 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold border border-emerald-500/30 cursor-pointer"
              >
                {language === 'ar' ? 'أرشفة المنجز الآن' : 'Archive Now'}
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: Keyboard Shortcuts Reference */}
        <div className="space-y-3 pt-2 border-t border-white/5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Keyboard className="w-4 h-4" />
            <span>{language === 'ar' ? 'اختصارات لوحة المفاتيح السريعة' : 'Keyboard Shortcuts'}</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
              <span className="text-slate-400">{language === 'ar' ? 'بدء / إيقاف المؤقت' : 'Play / Pause Timer'}</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-mono text-[10px]">Space</kbd>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
              <span className="text-slate-400">{language === 'ar' ? 'وضع الزِن' : 'Zen Fullscreen'}</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-mono text-[10px]">Z</kbd>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
              <span className="text-slate-400">{language === 'ar' ? 'إغلاق النوافذ' : 'Close / Exit Zen'}</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-mono text-[10px]">ESC</kbd>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
              <span className="text-slate-400">{language === 'ar' ? 'التنقل بين الأقسام' : 'Switch Tabs'}</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-mono text-[10px]">1 - 5</kbd>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
              <span className="text-slate-400">{language === 'ar' ? 'إضافة سريعة' : 'Add Task'}</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-mono text-[10px]">Enter</kbd>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
              <span className="text-slate-400">{language === 'ar' ? 'تركيز حقل الإدخال' : 'Focus Input'}</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-mono text-[10px]">N</kbd>
            </div>
          </div>
        </div>

        {/* Section 5: Backup & Reset */}
        <div className="space-y-3 pt-2 border-t border-white/5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Download className="w-4 h-4" />
            <span>{language === 'ar' ? 'إدارة البيانات والنسخ الاحتياطي' : 'Data Management & Backup'}</span>
          </h4>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportBackup}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تصدير نسخة كاملة (JSON)' : 'Export Full Backup'}</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'استيراد نسخة احتياطية' : 'Import Backup'}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => {
                if (
                  confirm(
                    language === 'ar'
                      ? 'هل أنت متأكد من رغبتك في إعادة تعيين البيانات إلى النماذج الافتراضية؟'
                      : 'Reset all data to default demo state?'
                  )
                ) {
                  onResetData();
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition cursor-pointer ltr:ml-auto rtl:mr-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'إعادة ضبط المصنع' : 'Reset Data'}</span>
            </button>
          </div>
        </div>

        {/* Footer Close */}
        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{language === 'ar' ? 'تم وحفظ' : 'Done & Save'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
