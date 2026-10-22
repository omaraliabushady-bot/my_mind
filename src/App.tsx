import { useState, useEffect, useCallback } from 'react';
import type {
  Task,
  Project,
  UserStats,
  UserSettings,
  Badge,
  TimerMode,
  Priority
} from './types';
import {
  loadTasks,
  saveTasks,
  loadProjects,
  saveProjects,
  loadStats,
  saveStats,
  loadSettings,
  saveSettings,
  loadBadges,
  saveBadges,
  clearLocalData
} from './utils/storage';
import {
  hasCrossed12HourBoundary,
  execute12HourClear
} from './utils/autoClear';
import { initAudioOnUserGesture } from './utils/audio';
import {
  supabase,
  isSupabaseConfigured,
  fetchUserTasks,
  saveTaskToCloud,
  deleteTaskFromCloud,
  fetchUserProjects,
  saveProjectToCloud,
  deleteProjectFromCloud,
  fetchUserProfile,
  saveUserProfileToCloud,
  bulkSyncTasksToCloud
} from './lib/supabase';
import { Navbar } from './components/Navbar';
import { TaskManagement } from './components/TaskManagement';
import { ProjectManagement } from './components/ProjectManagement';
import { PomodoroTimer } from './components/PomodoroTimer';
import { GamificationStats } from './components/GamificationStats';
import { ArchiveView } from './components/ArchiveView';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { Sparkles } from 'lucide-react';

export function App() {
  const [settings, setSettings] = useState<UserSettings>(loadSettings);
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [projects, setProjects] = useState<Project[]>(loadProjects);
  const [stats, setStats] = useState<UserStats>(loadStats);
  const [badges, setBadges] = useState<Badge[]>(loadBadges);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    displayName?: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('mymind_auth_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<'tasks' | 'projects' | 'timer' | 'stats' | 'archive'>('tasks');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Initialize Web Audio user gesture unlock
  useEffect(() => {
    initAudioOnUserGesture();
  }, []);

  // Listen to Supabase Auth State Change
  useEffect(() => {
    if (isSupabaseConfigured() && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const userObj = {
            id: session.user.id,
            email: session.user.email || '',
            displayName: session.user.user_metadata?.display_name || session.user.email?.split('@')[0]
          };
          setCurrentUser(userObj);
          localStorage.setItem('mymind_auth_session', JSON.stringify(userObj));
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const userObj = {
            id: session.user.id,
            email: session.user.email || '',
            displayName: session.user.user_metadata?.display_name || session.user.email?.split('@')[0]
          };
          setCurrentUser(userObj);
          localStorage.setItem('mymind_auth_session', JSON.stringify(userObj));
        } else {
          // signed out
          setCurrentUser(null);
          localStorage.removeItem('mymind_auth_session');
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // Cloud Synchronization Handler
  const syncCloudData = useCallback(async (user: { id: string; email: string; displayName?: string }) => {
    if (!isSupabaseConfigured() || !supabase) return;
    setIsSyncing(true);

    try {
      // 1. Fetch Profile & Stats from cloud
      const profile = await fetchUserProfile(user.id);
      if (profile) {
        if (profile.stats) setStats(profile.stats);
        if (profile.settings) setSettings(profile.settings);
        if (profile.badges) setBadges(profile.badges);
      }

      // 2. Fetch Tasks from cloud
      const cloudTasks = await fetchUserTasks(user.id);
      if (cloudTasks && cloudTasks.length > 0) {
        setTasks(cloudTasks);
      } else if (tasks.length > 0) {
        await bulkSyncTasksToCloud(user.id, tasks);
      }

      // 3. Fetch Projects from cloud
      const cloudProjects = await fetchUserProjects(user.id);
      if (cloudProjects && cloudProjects.length > 0) {
        setProjects(cloudProjects);
      } else if (projects.length > 0) {
        for (const p of projects) {
          await saveProjectToCloud(user.id, p);
        }
      }

      showToast(settings.language === 'ar' ? 'تمت مزامنة البيانات مع السحابة بنجاح ☁️' : 'Synced with cloud successfully ☁️');
    } catch (err) {
      console.error('Cloud sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [tasks, projects, settings.language, showToast]);

  // Initial cloud fetch when user is detected
  useEffect(() => {
    if (currentUser && isSupabaseConfigured()) {
      syncCloudData(currentUser);
    }
  }, [currentUser?.id]);

  // Global Tab Switching Keyboard Shortcuts (1-5)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.key === '1') setActiveTab('tasks');
      else if (e.key === '2') setActiveTab('projects');
      else if (e.key === '3') setActiveTab('timer');
      else if (e.key === '4') setActiveTab('stats');
      else if (e.key === '5') setActiveTab('archive');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = settings.language;
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  useEffect(() => {
    saveBadges(badges);
  }, [badges]);

  const checkAndUnlockBadges = useCallback((currentStats: UserStats) => {
    let badgesChanged = false;
    const updated = badges.map(b => {
      if (b.unlocked) return b;

      let shouldUnlock = false;
      if (b.id === 'first_step' && currentStats.totalTasksCompleted >= 1) shouldUnlock = true;
      if (b.id === 'focus_monk' && currentStats.totalFocusMinutes >= 100) shouldUnlock = true;
      if (b.id === 'chain_keeper' && currentStats.streakDays >= 3) shouldUnlock = true;
      if (b.id === 'grand_architect' && currentStats.xp >= 500) shouldUnlock = true;

      if (shouldUnlock) {
        badgesChanged = true;
        showToast(`🏆 وسام جديد تم فتحه: ${settings.language === 'ar' ? b.titleAr : b.titleEn}`);
        return {
          ...b,
          unlocked: true,
          unlockedAt: new Date().toISOString()
        };
      }
      return b;
    });

    if (badgesChanged) {
      setBadges(updated);
    }
  }, [badges, settings.language, showToast]);

  const run12HourAutoClearCheck = useCallback(() => {
    if (!settings.autoArchiveEnabled) return;

    const now = new Date();
    if (hasCrossed12HourBoundary(settings.lastAutoArchiveCheck, now)) {
      const { updatedTasks, updatedStats, clearedCount, cycleTag } = execute12HourClear(tasks, stats, now);

      if (clearedCount > 0) {
        setTasks(updatedTasks);
        setStats(updatedStats);

        if (currentUser) {
          bulkSyncTasksToCloud(currentUser.id, updatedTasks);
          saveUserProfileToCloud(
            currentUser.id,
            currentUser.email,
            updatedStats,
            settings,
            badges,
            currentUser.displayName
          );
        }

        setBadges(prev => prev.map(b => {
          if (b.id === 'clean_slate_hero' && !b.unlocked) {
            return { ...b, unlocked: true, unlockedAt: new Date().toISOString() };
          }
          return b;
        }));

        showToast(
          settings.language === 'ar'
            ? `✨ دورة الـ 12 ساعة (${cycleTag}): تمت أرشفة ${clearedCount} مهمة وتحديث سجل الإنجازات!`
            : `✨ 12-Hour Cycle (${cycleTag}): ${clearedCount} tasks cleared & archived!`
        );
      }

      const nextSettings = {
        ...settings,
        lastAutoArchiveCheck: now.toISOString()
      };
      setSettings(nextSettings);
      saveSettings(nextSettings);
    }
  }, [settings, tasks, stats, badges, currentUser, showToast]);

  useEffect(() => {
    run12HourAutoClearCheck();
    const interval = setInterval(run12HourAutoClearCheck, 15000);
    return () => clearInterval(interval);
  }, [run12HourAutoClearCheck]);

  const handleManualClear = () => {
    const now = new Date();
    const { updatedTasks, updatedStats, clearedCount, cycleTag } = execute12HourClear(tasks, stats, now);

    if (clearedCount > 0) {
      setTasks(updatedTasks);
      setStats(updatedStats);

      if (currentUser) {
        bulkSyncTasksToCloud(currentUser.id, updatedTasks);
        saveUserProfileToCloud(
          currentUser.id,
          currentUser.email,
          updatedStats,
          settings,
          badges,
          currentUser.displayName
        );
      }

      showToast(
        settings.language === 'ar'
          ? `✨ تمت أرشفة ${clearedCount} مهمة مكتملة بنجاح للدورة ${cycleTag}!`
          : `✨ Successfully archived ${clearedCount} completed tasks for ${cycleTag}!`
      );
    } else {
      showToast(
        settings.language === 'ar'
          ? 'لا توجد مهام مكتملة غير مؤرشفة حاليًا.'
          : 'No completed tasks ready to archive.'
      );
    }
  };

  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'createdAt' | 'archived'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      archived: false,
      subtasks: []
    };

    setTasks(prev => [newTask, ...prev]);

    if (currentUser) {
      saveTaskToCloud(currentUser.id, newTask);
    }
  };

  const handleToggleTask = (taskId: string) => {
    const today = new Date().toISOString().split('T')[0];

    setTasks(prev => {
      let changedTask: Task | null = null;
      const updated = prev.map(task => {
        if (task.id === taskId) {
          const willBeCompleted = !task.completed;
          changedTask = {
            ...task,
            completed: willBeCompleted,
            completedAt: willBeCompleted ? new Date().toISOString() : undefined
          };
          return changedTask;
        }
        return task;
      });

      if (currentUser && changedTask) {
        saveTaskToCloud(currentUser.id, changedTask);
      }

      const target = prev.find(t => t.id === taskId);
      if (target && !target.completed) {
        setStats(prevStats => {
          const newXP = prevStats.xp + 15;
          const newLevel = Math.floor(newXP / 200) + 1;
          const totalTasks = prevStats.totalTasksCompleted + 1;

          let streak = prevStats.streakDays;
          if (prevStats.lastActiveDate !== today) {
            streak += 1;
          }

          const dailyStats = { ...(prevStats.dailyStats || {}) };
          if (!dailyStats[today]) {
            dailyStats[today] = {
              date: today,
              tasksCompleted: 0,
              focusMinutes: 0,
              pomodorosCount: 0
            };
          }
          dailyStats[today].tasksCompleted += 1;

          const updatedStats: UserStats = {
            ...prevStats,
            xp: newXP,
            level: newLevel,
            totalTasksCompleted: totalTasks,
            streakDays: streak,
            longestStreak: Math.max(streak, prevStats.longestStreak),
            lastActiveDate: today,
            dailyStats
          };

          checkAndUnlockBadges(updatedStats);

          if (currentUser) {
            saveUserProfileToCloud(
              currentUser.id,
              currentUser.email,
              updatedStats,
              settings,
              badges,
              currentUser.displayName
            );
          }

          return updatedStats;
        });
      }

      return updated;
    });
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => (t.id === updatedTask.id ? updatedTask : t)));
    if (currentUser) {
      saveTaskToCloud(currentUser.id, updatedTask);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (currentUser) {
      deleteTaskFromCloud(currentUser.id, taskId);
    }
  };

  const handleRestoreTask = (taskId: string) => {
    let restored: Task | null = null;
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          restored = { ...t, archived: false };
          return restored;
        }
        return t;
      })
    );
    if (currentUser && restored) {
      saveTaskToCloud(currentUser.id, restored);
    }
    showToast(settings.language === 'ar' ? 'تمت استعادة المهمة إلى اللوحة النشطة' : 'Task restored to active board');
  };

  const handleDeleteArchivedTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (currentUser) {
      deleteTaskFromCloud(currentUser.id, taskId);
    }
  };

  const handleClearEntireArchive = () => {
    const activeOnly = tasks.filter(t => !t.archived);
    setTasks(activeOnly);
    if (currentUser) {
      bulkSyncTasksToCloud(currentUser.id, activeOnly);
    }
    showToast(settings.language === 'ar' ? 'تم تفريغ الأرشيف بالكامل' : 'Archive cleared completely');
  };

  const handleCreateProject = (newProjData: Omit<Project, 'id' | 'createdAt'>) => {
    const newProj: Project = {
      ...newProjData,
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    setProjects(prev => [...prev, newProj]);
    if (currentUser) {
      saveProjectToCloud(currentUser.id, newProj);
    }
    showToast(settings.language === 'ar' ? 'تم إنشاء المشروع بنجاح!' : 'Project created successfully!');
  };

  const handleDeleteProject = (projId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projId));
    setTasks(prev => prev.map(t => (t.projectId === projId ? { ...t, projectId: undefined } : t)));
    if (currentUser) {
      deleteProjectFromCloud(currentUser.id, projId);
    }
  };

  const handleAddMicroTask = (projectId: string, title: string, priority: Priority = 'medium') => {
    handleAddTask({
      title,
      completed: false,
      priority,
      projectId,
      energy: 'quick'
    });
  };

  const handleSessionComplete = (durationMinutes: number, mode: TimerMode) => {
    if (mode === 'work') {
      const today = new Date().toISOString().split('T')[0];

      setStats(prevStats => {
        const xpEarned = 50;
        const newXP = prevStats.xp + xpEarned;
        const newLevel = Math.floor(newXP / 200) + 1;
        const newFocusMins = prevStats.totalFocusMinutes + durationMinutes;

        const dailyStats = { ...(prevStats.dailyStats || {}) };
        if (!dailyStats[today]) {
          dailyStats[today] = {
            date: today,
            tasksCompleted: 0,
            focusMinutes: 0,
            pomodorosCount: 0
          };
        }
        dailyStats[today].focusMinutes += durationMinutes;
        dailyStats[today].pomodorosCount += 1;

        const updatedStats: UserStats = {
          ...prevStats,
          xp: newXP,
          level: newLevel,
          totalFocusMinutes: newFocusMins,
          dailyStats
        };

        checkAndUnlockBadges(updatedStats);

        if (currentUser) {
          saveUserProfileToCloud(
            currentUser.id,
            currentUser.email,
            updatedStats,
            settings,
            badges,
            currentUser.displayName
          );
        }

        return updatedStats;
      });

      showToast(
        settings.language === 'ar'
          ? `🎉 أنجزت جلسة تركيز كاملة (+50 XP)!`
          : `🎉 Deep focus session completed (+50 XP)!`
      );
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('mymind_auth_session');
    setCurrentUser(null);
    clearLocalData();
    setTasks([]);
    setProjects([]);
    setStats({
      xp: 0,
      level: 1,
      streakDays: 0,
      longestStreak: 0,
      lastActiveDate: '',
      totalTasksCompleted: 0,
      totalFocusMinutes: 0,
      dailyStats: {}
    });
    setBadges(prev => prev.map(b => ({ ...b, unlocked: false, unlockedAt: undefined })));
    showToast(settings.language === 'ar' ? 'تم تسجيل الخروج بنجاح' : 'Logged out successfully');
  };

  const handleImportAllData = (backup: {
    tasks: Task[];
    projects: Project[];
    stats: UserStats;
    settings: UserSettings;
    badges: Badge[];
  }) => {
    if (backup.tasks) setTasks(backup.tasks);
    if (backup.projects) setProjects(backup.projects);
    if (backup.stats) setStats(backup.stats);
    if (backup.settings) setSettings(backup.settings);
    if (backup.badges) setBadges(backup.badges);
    showToast(settings.language === 'ar' ? 'تم استيراد كافة البيانات بنجاح!' : 'All data restored successfully!');
  };

  const handleResetData = () => {
    clearLocalData();
    window.location.reload();
  };

  const completedActiveTasksCount = tasks.filter(t => !t.archived && t.completed).length;

  return (
    <div className="min-h-screen bg-[#0d0f17] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={settings.language}
        onLanguageChange={(lang) => setSettings({ ...settings, language: lang })}
        stats={stats}
        settings={settings}
        onSettingsChange={setSettings}
        onManualClear={handleManualClear}
        completedTasksCount={completedActiveTasksCount}
        onOpenSettings={() => setIsSettingsOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onSyncNow={() => currentUser && syncCloudData(currentUser)}
        isSyncing={isSyncing}
      />

      {toastMessage && (
        <div className="fixed bottom-16 md:bottom-8 left-1/2 -translate-x-1/2 z-50 glass-panel px-5 py-3 rounded-2xl shadow-2xl border border-cyan-500/40 text-sm font-semibold text-cyan-200 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {activeTab === 'tasks' && (
          <TaskManagement
            tasks={tasks}
            projects={projects}
            language={settings.language}
            soundEnabled={settings.soundEnabled}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onUpdateTask={handleUpdateTask}
            onManualClear={handleManualClear}
            onOpenArchive={() => setActiveTab('archive')}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectManagement
            projects={projects}
            tasks={tasks}
            language={settings.language}
            soundEnabled={settings.soundEnabled}
            onCreateProject={handleCreateProject}
            onDeleteProject={handleDeleteProject}
            onAddMicroTask={handleAddMicroTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
          />
        )}

        {activeTab === 'timer' && (
          <PomodoroTimer
            language={settings.language}
            settings={settings}
            stats={stats}
            projects={projects}
            onSettingsChange={setSettings}
            onSessionComplete={handleSessionComplete}
            activeTaskTitle={tasks.find(t => !t.completed && !t.archived)?.title}
          />
        )}

        {activeTab === 'stats' && (
          <GamificationStats
            stats={stats}
            badges={badges}
            language={settings.language}
          />
        )}

        {activeTab === 'archive' && (
          <ArchiveView
            tasks={tasks}
            language={settings.language}
            onRestoreTask={handleRestoreTask}
            onDeleteArchivedTask={handleDeleteArchivedTask}
            onClearEntireArchive={handleClearEntireArchive}
          />
        )}
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
        language={settings.language}
        onManualClear={handleManualClear}
        tasks={tasks}
        projects={projects}
        stats={stats}
        badges={badges}
        onImportAllData={handleImportAllData}
        onResetData={handleResetData}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        language={settings.language}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          syncCloudData(user);
        }}
      />

      <footer className="w-full border-t border-white/5 py-6 text-center text-xs text-slate-500 glass-panel mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="font-semibold text-slate-400">My Mind (دِماغ مبرمِج)</span>
            <span>—</span>
            <span>نظام التركيز والإنتاجية الفائقة</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>☁️ مزامنة سحابية (Supabase Cloud Sync)</span>
            <span>•</span>
            <span>💾 دعم العمل دون اتصال (Offline-first)</span>
            <span>•</span>
            <span>⚡ Web Audio API</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
