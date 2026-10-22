import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Search,
  CheckCircle,
  Circle,
  Trash2,
  Calendar,
  Flame,
  Zap,
  Brain,
  ListTodo,
  Sparkles,
  Archive,
  Volume2,
  Edit3,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { Task, Project, Priority, EnergyLevel, Language, Subtask } from '../types';
import { translations } from '../utils/i18n';
import { playTaskCompletionSound, playClickSound } from '../utils/audio';
import { fireTaskConfetti } from '../utils/confetti';

interface TaskManagementProps {
  tasks: Task[];
  projects: Project[];
  language: Language;
  soundEnabled: boolean;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'archived'>) => void;
  onToggleTask: (taskId: string, e?: React.MouseEvent) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (task: Task) => void;
  onManualClear: () => void;
  onOpenArchive: () => void;
}

export const TaskManagement: React.FC<TaskManagementProps> = ({
  tasks,
  projects,
  language,
  soundEnabled,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
  onManualClear,
  onOpenArchive
}) => {
  const t = translations[language];
  const inputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [energy, setEnergy] = useState<EnergyLevel>('deep');
  const [projectId, setProjectId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');

  // Filters State
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('all');
  const [selectedEnergyFilter, setSelectedEnergyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Expanded Tasks for Subtasks
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});
  const [newSubtaskInputs, setNewSubtaskInputs] = useState<Record<string, string>>({});

  // Inline editing state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleCreateTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      completed: false,
      priority,
      energy,
      projectId: projectId || undefined,
      dueDate: dueDate || undefined,
      subtasks: []
    });

    playClickSound();

    setTitle('');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  const handleCheckboxClick = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
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

  // Toggle subtask completion
  const handleToggleSubtask = (task: Task, subtaskId: string) => {
    const updatedSubtasks = (task.subtasks || []).map(st => {
      if (st.id === subtaskId) {
        const nextState = !st.completed;
        if (nextState && soundEnabled) {
          playTaskCompletionSound(0.4);
        } else {
          playClickSound();
        }
        return { ...st, completed: nextState };
      }
      return st;
    });

    onUpdateTask({ ...task, subtasks: updatedSubtasks });
  };

  // Add new subtask to task
  const handleAddSubtask = (task: Task, e: React.FormEvent) => {
    e.preventDefault();
    const stTitle = newSubtaskInputs[task.id]?.trim();
    if (!stTitle) return;

    const newSubtask: Subtask = {
      id: `st-${Date.now()}`,
      title: stTitle,
      completed: false
    };

    const updatedSubtasks = [...(task.subtasks || []), newSubtask];
    onUpdateTask({ ...task, subtasks: updatedSubtasks });
    setNewSubtaskInputs(prev => ({ ...prev, [task.id]: '' }));
    playClickSound();
  };

  const handleDeleteSubtask = (task: Task, subtaskId: string) => {
    const updatedSubtasks = (task.subtasks || []).filter(st => st.id !== subtaskId);
    onUpdateTask({ ...task, subtasks: updatedSubtasks });
    playClickSound();
  };

  const toggleTaskExpansion = (taskId: string) => {
    playClickSound();
    setExpandedTaskIds(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const startEditTask = (task: Task) => {
    playClickSound();
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title);
  };

  const saveEditTask = (task: Task) => {
    if (!editingTaskTitle.trim()) return;
    onUpdateTask({ ...task, title: editingTaskTitle.trim() });
    setEditingTaskId(null);
    playClickSound();
  };

  const activeBoardTasks = tasks.filter(t => !t.archived);

  const filteredTasks = activeBoardTasks.filter(task => {
    if (activeFilter === 'active' && task.completed) return false;
    if (activeFilter === 'completed' && !task.completed) return false;

    if (selectedProjectFilter !== 'all' && task.projectId !== selectedProjectFilter) return false;
    if (selectedEnergyFilter !== 'all' && task.energy !== selectedEnergyFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(q);
      const matchesDesc = task.description?.toLowerCase().includes(q);
      const matchesSubtask = task.subtasks?.some(st => st.title.toLowerCase().includes(q));
      if (!matchesTitle && !matchesDesc && !matchesSubtask) return false;
    }

    return true;
  });

  const completedCount = activeBoardTasks.filter(t => t.completed).length;
  const activeCount = activeBoardTasks.filter(t => !t.completed).length;

  const priorityColors: Record<Priority, { border: string; bg: string; text: string; icon: string }> = {
    high: { border: 'border-rose-500/40', bg: 'bg-rose-500/10', text: 'text-rose-400', icon: '🔥' },
    medium: { border: 'border-amber-500/40', bg: 'bg-amber-500/10', text: 'text-amber-400', icon: '⚡' },
    low: { border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: '🌿' }
  };

  // Due date format helper
  const renderDueDateBadge = (dueDateStr?: string) => {
    if (!dueDateStr) return null;
    const todayStr = new Date().toISOString().split('T')[0];

    const isToday = dueDateStr === todayStr;
    const isPast = dueDateStr < todayStr;

    return (
      <span
        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold flex items-center gap-1 border ${
          isPast
            ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
            : isToday
            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse'
            : 'bg-slate-800 text-slate-400 border-white/5'
        }`}
      >
        <Calendar className="w-3 h-3" />
        <span>
          {isToday ? (language === 'ar' ? 'اليوم 🔥' : 'Today 🔥') : isPast ? (language === 'ar' ? 'متأخر ⚠️' : 'Overdue ⚠️') : dueDateStr}
        </span>
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* 12-Hour Clean Slate Banner */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/20 via-slate-900/60 to-purple-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-100">
                {t.autoClearCycle}
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold">
                Clean Slate Mode
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              {t.autoClearTooltip}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            onClick={() => {
              playClickSound();
              onOpenArchive();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-xs font-semibold text-slate-300 transition cursor-pointer"
          >
            <Archive className="w-3.5 h-3.5 text-purple-400" />
            <span>{t.navArchive}</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              onManualClear();
            }}
            disabled={completedCount === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>{t.autoClearNowBtn}</span>
            {completedCount > 0 && (
              <span className="bg-slate-950 text-cyan-300 rounded-full px-1.5 py-0.2 text-[10px]">
                {completedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Fast-Paced Task Entry Form */}
      <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <form onSubmit={handleCreateTask} className="space-y-4 relative z-10">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.taskInputPlaceholder}
              className="w-full glass-input text-base sm:text-lg font-medium text-slate-100 placeholder-slate-400/70 px-5 py-4 rounded-2xl focus:border-cyan-400 transition pr-28 sm:pr-32"
            />
            <button
              type="submit"
              disabled={!title.trim()}
              className="absolute top-2.5 ltr:right-2.5 rtl:left-2.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-sm shadow-md shadow-cyan-500/25 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">{t.taskAddBtn}</span>
            </button>
          </div>

          {/* Quick Attribute Selectors */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Priority Select */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/60 border border-white/5">
                {(['high', 'medium', 'low'] as Priority[]).map((p) => {
                  const isSelected = priority === p;
                  const label = p === 'high' ? t.priorityHigh : p === 'medium' ? t.priorityMedium : t.priorityLow;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setPriority(p);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        isSelected
                          ? `${priorityColors[p].bg} ${priorityColors[p].text} border ${priorityColors[p].border}`
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Energy Tag */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/60 border border-white/5">
                {(['deep', 'quick', 'routine'] as EnergyLevel[]).map((e) => {
                  const isSelected = energy === e;
                  const label = e === 'deep' ? t.energyDeep : e === 'quick' ? t.energyQuick : t.energyRoutine;
                  return (
                    <button
                      key={e}
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setEnergy(e);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        isSelected
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full sm:w-auto glass-input text-xs font-medium text-slate-300 px-3 py-2 rounded-xl border border-white/10 bg-[#121726] focus:border-cyan-400 cursor-pointer"
              >
                <option value="">{t.projectTagNone}</option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    📁 {proj.title}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                title={t.dueDate}
                className="glass-input text-xs font-medium text-slate-300 px-3 py-2 rounded-xl border border-white/10 bg-[#121726] focus:border-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </form>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 text-cyan-400/90 font-medium">
            <Volume2 className="w-3.5 h-3.5" />
            {t.soundCueNotice}
          </span>
          <span className="hidden sm:inline">
            اضغط <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300">Enter</kbd> للحفظ السريع
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/60 border border-white/5 overflow-x-auto">
          <button
            onClick={() => {
              playClickSound();
              setActiveFilter('all');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.filterAll} ({activeBoardTasks.length})
          </button>
          <button
            onClick={() => {
              playClickSound();
              setActiveFilter('active');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeFilter === 'active'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.filterActive} ({activeCount})
          </button>
          <button
            onClick={() => {
              playClickSound();
              setActiveFilter('completed');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeFilter === 'completed'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.filterCompleted} ({completedCount})
          </button>
        </div>

        {/* Project, Energy, Search Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Energy Filter */}
          <select
            value={selectedEnergyFilter}
            onChange={(e) => setSelectedEnergyFilter(e.target.value)}
            className="glass-input text-xs font-medium text-slate-300 px-3 py-1.5 rounded-xl border border-white/10 bg-[#121726] cursor-pointer"
          >
            <option value="all">كل الطاقات</option>
            <option value="deep">🧠 تركيز عميق</option>
            <option value="quick">⚡ مهام سريعة</option>
            <option value="routine">📋 روتيني</option>
          </select>

          {/* Project Filter */}
          {projects.length > 0 && (
            <select
              value={selectedProjectFilter}
              onChange={(e) => setSelectedProjectFilter(e.target.value)}
              className="glass-input text-xs font-medium text-slate-300 px-3 py-1.5 rounded-xl border border-white/10 bg-[#121726] cursor-pointer"
            >
              <option value="all">كل المشاريع</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          )}

          {/* Search Box */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute top-2.5 ltr:left-3 rtl:right-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full glass-input text-xs font-medium text-slate-200 placeholder-slate-400/60 ltr:pl-8 rtl:pr-8 py-1.5 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="glass-panel p-10 rounded-3xl text-center space-y-3 border border-white/5">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <ListTodo className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-200">{t.noTasksTitle}</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">{t.noTasksDesc}</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const project = projects.find(p => p.id === task.projectId);
            const prio = priorityColors[task.priority];
            const isExpanded = !!expandedTaskIds[task.id];
            const isEditing = editingTaskId === task.id;

            const subtasks = task.subtasks || [];
            const completedSubtasksCount = subtasks.filter(st => st.completed).length;

            return (
              <div
                key={task.id}
                className={`group glass-panel rounded-2xl border transition-all duration-200 overflow-hidden ${
                  task.completed
                    ? 'border-emerald-500/20 bg-emerald-950/10 opacity-75'
                    : 'border-white/10 hover:border-cyan-500/30 hover:bg-slate-800/40'
                }`}
              >
                {/* Main Task Header Row */}
                <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
                    {/* Generous Checkbox Button */}
                    <button
                      onClick={(e) => handleCheckboxClick(task, e)}
                      className="shrink-0 p-1 rounded-xl text-slate-400 hover:text-cyan-400 transition cursor-pointer active:scale-90"
                      title={task.completed ? 'Mark uncompleted' : 'Mark completed'}
                    >
                      {task.completed ? (
                        <CheckCircle className="w-7 h-7 text-emerald-400 fill-emerald-400/20 transition-all duration-300" />
                      ) : (
                        <Circle className="w-7 h-7 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                      )}
                    </button>

                    <div className="flex flex-col min-w-0 flex-1">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingTaskTitle}
                            onChange={(e) => setEditingTaskTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEditTask(task);
                              if (e.key === 'Escape') setEditingTaskId(null);
                            }}
                            autoFocus
                            className="w-full glass-input text-base font-semibold px-3 py-1.5 rounded-xl text-slate-100"
                          />
                          <button
                            onClick={() => saveEditTask(task)}
                            className="p-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold"
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`text-base font-semibold truncate transition-all duration-200 ${
                            task.completed
                              ? 'line-through text-slate-400'
                              : 'text-slate-100 group-hover:text-cyan-200'
                          }`}
                        >
                          {task.title}
                        </span>
                      )}

                      {/* Metadata tags */}
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${prio.bg} ${prio.text} ${prio.border}`}>
                          {task.priority === 'high' ? '🔥 عاجل' : task.priority === 'medium' ? '⚡ متوسط' : '🌿 عادي'}
                        </span>

                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1">
                          {task.energy === 'deep' ? <Brain className="w-3 h-3" /> : task.energy === 'quick' ? <Zap className="w-3 h-3" /> : <Flame className="w-3 h-3" />}
                          {task.energy === 'deep' ? 'تركيز عميق' : task.energy === 'quick' ? 'سريع' : 'روتيني'}
                        </span>

                        {project && (
                          <span
                            className="px-2 py-0.5 rounded-md text-[10px] font-semibold border flex items-center gap-1"
                            style={{
                              borderColor: `${project.color}40`,
                              backgroundColor: `${project.color}15`,
                              color: project.color
                            }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: project.color }} />
                            {project.title}
                          </span>
                        )}

                        {renderDueDateBadge(task.dueDate)}

                        {subtasks.length > 0 && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-slate-800 text-cyan-300 border border-white/5">
                            {completedSubtasksCount} / {subtasks.length} {language === 'ar' ? 'مهام فرعية' : 'subtasks'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleTaskExpansion(task.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 transition cursor-pointer"
                      title={isExpanded ? 'Collapse subtasks' : 'Expand subtasks'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => startEditTask(task)}
                      className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 transition cursor-pointer"
                      title="Edit Title"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        playClickSound();
                        onDeleteTask(task.id);
                      }}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                      title={t.taskDeleted}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expandable Subtasks Checklist Section */}
                {isExpanded && (
                  <div className="px-5 pb-4 pt-2 border-t border-white/5 bg-slate-950/40 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <span>{language === 'ar' ? 'قائمة المهام الفرعية (Checklist)' : 'Subtasks Checklist'}</span>
                      {subtasks.length > 0 && (
                        <span className="text-cyan-400 font-mono text-[11px]">
                          {Math.round((completedSubtasksCount / subtasks.length) * 100)}%
                        </span>
                      )}
                    </div>

                    {/* Subtasks list */}
                    <div className="space-y-1.5">
                      {subtasks.map((st) => (
                        <div
                          key={st.id}
                          className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/60 border border-white/5 text-xs"
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <button
                              type="button"
                              onClick={() => handleToggleSubtask(task, st.id)}
                              className="text-slate-400 hover:text-cyan-400 transition cursor-pointer"
                            >
                              {st.completed ? (
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-500" />
                              )}
                            </button>
                            <span
                              className={`truncate ${
                                st.completed ? 'line-through text-slate-500' : 'text-slate-200'
                              }`}
                            >
                              {st.title}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteSubtask(task, st.id)}
                            className="text-slate-500 hover:text-rose-400 transition cursor-pointer p-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add subtask input */}
                    <form
                      onSubmit={(e) => handleAddSubtask(task, e)}
                      className="flex items-center gap-2 pt-1"
                    >
                      <input
                        type="text"
                        value={newSubtaskInputs[task.id] || ''}
                        onChange={(e) =>
                          setNewSubtaskInputs(prev => ({ ...prev, [task.id]: e.target.value }))
                        }
                        placeholder={language === 'ar' ? 'أضف خطوة فرعية...' : 'Add subtask step...'}
                        className="flex-1 glass-input text-xs px-3 py-1.5 rounded-xl text-slate-200 placeholder-slate-500 focus:border-cyan-400"
                      />
                      <button
                        type="submit"
                        disabled={!newSubtaskInputs[task.id]?.trim()}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-cyan-400 border border-white/10 text-xs font-semibold transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
