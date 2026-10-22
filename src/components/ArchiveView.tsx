import React, { useState } from 'react';
import {
  Archive,
  RotateCcw,
  Trash2,
  Search,
  Download,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import type { Task, Language } from '../types';
import { translations } from '../utils/i18n';
import { playClickSound } from '../utils/audio';

interface ArchiveViewProps {
  tasks: Task[];
  language: Language;
  onRestoreTask: (taskId: string) => void;
  onDeleteArchivedTask: (taskId: string) => void;
  onClearEntireArchive: () => void;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({
  tasks,
  language,
  onRestoreTask,
  onDeleteArchivedTask,
  onClearEntireArchive
}) => {
  const t = translations[language];
  const [search, setSearch] = useState('');

  const archivedTasks = tasks.filter(t => t.archived);

  const filteredArchived = archivedTasks.filter(t => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return t.title.toLowerCase().includes(q) || (t.cycleTag && t.cycleTag.toLowerCase().includes(q));
  });

  const cyclesMap: Record<string, Task[]> = {};
  filteredArchived.forEach(task => {
    const cycle = task.cycleTag || 'دورة سابقة';
    if (!cyclesMap[cycle]) {
      cyclesMap[cycle] = [];
    }
    cyclesMap[cycle].push(task);
  });

  const exportArchiveJson = () => {
    playClickSound();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(archivedTasks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `my-mind-archive-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header bar */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
            <Archive className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              {t.archivedTasksTitle}
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold">
                {archivedTasks.length}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              كل 12 ساعة (12:00 ص / 12:00 م) يتم تفريغ المهام المكتملة هنا لبدء صفحة ذهنية جديدة.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            onClick={exportArchiveJson}
            disabled={archivedTasks.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 border border-white/10 text-xs font-semibold disabled:opacity-40 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>تصدير JSON</span>
          </button>

          {archivedTasks.length > 0 && (
            <button
              onClick={() => {
                if (confirm('هل أنت متأكد من مسح كافة سجل الأرشيف نهائيًا؟ لن تتأثر الإحصائيات العامة.')) {
                  playClickSound();
                  onClearEntireArchive();
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>تفريغ الأرشيف</span>
            </button>
          )}
        </div>
      </div>

      {archivedTasks.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 absolute top-3 ltr:left-3 rtl:right-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث في المهام المؤرشفة أو بالدورة التاريخية..."
            className="w-full glass-input text-sm text-slate-200 placeholder-slate-400/60 ltr:pl-9 rtl:pr-9 py-2.5 rounded-2xl"
          />
        </div>
      )}

      {archivedTasks.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-4 border border-white/5">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-cyan-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-200">{t.emptyArchiveTitle}</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">{t.emptyArchiveDesc}</p>
        </div>
      ) : Object.keys(cyclesMap).length === 0 ? (
        <div className="glass-panel p-8 rounded-2xl text-center text-slate-400 text-sm">
          لم يتم العثور على أي مهمة مطابقة للبحث في الأرشيف.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(cyclesMap).map(([cycleTag, cycleTasks]) => (
            <div key={cycleTag} className="glass-panel p-5 rounded-3xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                  <h4 className="text-sm font-bold text-slate-200 font-mono">
                    {cycleTag}
                  </h4>
                </div>
                <span className="text-xs text-purple-300 font-medium">
                  {cycleTasks.length} {language === 'ar' ? 'مهام مؤرشفة' : 'archived tasks'}
                </span>
              </div>

              <div className="space-y-2">
                {cycleTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/40 hover:bg-slate-900/70 border border-white/5 text-xs transition"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-slate-200 font-medium truncate">
                          {task.title}
                        </span>
                        {task.archivedAt && (
                          <span className="text-[10px] text-slate-500">
                            تمت الأرشفة: {new Date(task.archivedAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          playClickSound();
                          onRestoreTask(task.id);
                        }}
                        className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                        title={t.restoreTask}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{t.restoreTask}</span>
                      </button>

                      <button
                        onClick={() => {
                          playClickSound();
                          onDeleteArchivedTask(task.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                        title={t.deleteArchived}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
