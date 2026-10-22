import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  Circle,
  Sparkles,
  Layers
} from 'lucide-react';
import type { Project, Task, Language, Priority } from '../types';
import { translations } from '../utils/i18n';
import { playTaskCompletionSound, playClickSound } from '../utils/audio';
import { fireTaskConfetti } from '../utils/confetti';

interface ProjectManagementProps {
  projects: Project[];
  tasks: Task[];
  language: Language;
  soundEnabled: boolean;
  onCreateProject: (proj: Omit<Project, 'id' | 'createdAt'>) => void;
  onDeleteProject: (projId: string) => void;
  onAddMicroTask: (projectId: string, title: string, priority?: Priority) => void;
  onToggleTask: (taskId: string, e?: React.MouseEvent) => void;
  onDeleteTask: (taskId: string) => void;
}

export const ProjectManagement: React.FC<ProjectManagementProps> = ({
  projects,
  tasks,
  language,
  soundEnabled,
  onCreateProject,
  onDeleteProject,
  onAddMicroTask,
  onToggleTask,
  onDeleteTask
}) => {
  const t = translations[language];

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#00f2fe');
  const [targetDate, setTargetDate] = useState('');

  const [microInputs, setMicroInputs] = useState<Record<string, string>>({});

  const presetColors = ['#00f2fe', '#b026ff', '#00f5a0', '#f5af19', '#ff007f', '#3b82f6'];

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateProject({
      title: title.trim(),
      description: description.trim(),
      color,
      icon: 'FolderKanban',
      targetDate: targetDate || undefined
    });

    setTitle('');
    setDescription('');
    setTargetDate('');
    setShowModal(false);
    playClickSound();
  };

  const handleMicroInputSubmit = (projectId: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const taskTitle = microInputs[projectId]?.trim();
    if (!taskTitle) return;

    onAddMicroTask(projectId, taskTitle, 'medium');
    playClickSound();

    setMicroInputs(prev => ({ ...prev, [projectId]: '' }));
  };

  const handleToggle = (task: Task, e: React.MouseEvent) => {
    if (!task.completed && soundEnabled) {
      playTaskCompletionSound(0.6);
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      fireTaskConfetti(x, y);
    } else {
      playClickSound();
    }
    onToggleTask(task.id, e);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center">
            <FolderKanban className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              {t.navProjects}
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold">
                {projects.length}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.noProjectsDesc}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            playClickSound();
            setShowModal(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition cursor-pointer self-stretch sm:self-auto justify-center"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{t.newProjectBtn}</span>
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-4 border border-white/5">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Layers className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-200">{t.noProjectsTitle}</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">{t.noProjectsDesc}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((proj) => {
            const projTasks = tasks.filter(t => t.projectId === proj.id && !t.archived);
            const totalCount = projTasks.length;
            const completedCount = projTasks.filter(t => t.completed).length;
            const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

            return (
              <div
                key={proj.id}
                className="glass-panel p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between hover:border-cyan-500/40 relative overflow-hidden group shadow-xl"
                style={{
                  borderTopColor: proj.color,
                  borderTopWidth: '3px'
                }}
              >
                <div
                  className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
                  style={{ backgroundColor: proj.color }}
                />

                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full shadow-sm"
                        style={{ backgroundColor: proj.color, boxShadow: `0 0 10px ${proj.color}` }}
                      />
                      <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-200 transition">
                        {proj.title}
                      </h3>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(t.deleteProjectConfirm)) {
                          playClickSound();
                          onDeleteProject(proj.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {proj.description && (
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      {proj.description}
                    </p>
                  )}

                  {proj.targetDate && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/60 border border-white/5 text-[11px] text-slate-300 mb-4">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{t.targetDate}: {proj.targetDate}</span>
                    </div>
                  )}

                  <div className="space-y-1.5 mb-5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">
                        {t.completedMicroTasks}: {completedCount} / {totalCount}
                      </span>
                      <span className="font-mono font-bold text-cyan-300">
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950/80 overflow-hidden border border-white/5">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: proj.color,
                          boxShadow: `0 0 12px ${proj.color}`
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      {t.microTasksTitle}
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {projTasks.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic py-1">
                        لا توجد مهام مصغرة مضافة بعد.
                      </p>
                    ) : (
                      projTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/40 hover:bg-slate-900/70 border border-white/5 transition text-xs"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <button
                              onClick={(e) => handleToggle(task, e)}
                              className="text-slate-400 hover:text-cyan-400 transition cursor-pointer"
                            >
                              {task.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                            <span
                              className={`truncate font-medium ${
                                task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                              }`}
                            >
                              {task.title}
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              playClickSound();
                              onDeleteTask(task.id);
                            }}
                            className="text-slate-500 hover:text-rose-400 transition cursor-pointer p-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <form
                    onSubmit={(e) => handleMicroInputSubmit(proj.id, e)}
                    className="flex items-center gap-2 pt-1"
                  >
                    <input
                      type="text"
                      value={microInputs[proj.id] || ''}
                      onChange={(e) =>
                        setMicroInputs(prev => ({ ...prev, [proj.id]: e.target.value }))
                      }
                      placeholder={t.addMicroTaskPlaceholder}
                      className="flex-1 glass-input text-xs px-3 py-2 rounded-xl text-slate-200 placeholder-slate-500 focus:border-cyan-400"
                    />
                    <button
                      type="submit"
                      disabled={!microInputs[proj.id]?.trim()}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-cyan-400 border border-white/10 text-xs font-semibold transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 max-w-lg w-full shadow-2xl relative space-y-5">
            <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-cyan-400" />
              {t.createProjectModalTitle}
            </h3>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t.projectTitle} *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: ترقية معمارية الـ API"
                  className="w-full glass-input text-sm px-4 py-2.5 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t.projectDesc}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="الهدف الأساسي والمخرجات المتوقعة لهذا المشروع..."
                  className="w-full glass-input text-sm px-4 py-2.5 rounded-xl text-slate-100 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  {t.projectColor}
                </label>
                <div className="flex items-center gap-3">
                  {presetColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full transition-transform cursor-pointer ${
                        color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#0d0f17]' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c, boxShadow: `0 0 10px ${c}60` }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t.targetDate}
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full glass-input text-sm px-4 py-2 rounded-xl text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-200 transition cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 transition cursor-pointer disabled:opacity-40"
                >
                  {t.saveProject}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
