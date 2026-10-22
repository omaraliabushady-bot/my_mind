import type { Task, Project, UserStats, UserSettings, Badge } from '../types';

const STORAGE_KEYS = {
  TASKS: 'mymind_tasks_v2',
  PROJECTS: 'mymind_projects_v2',
  STATS: 'mymind_stats_v2',
  SETTINGS: 'mymind_settings_v2',
  BADGES: 'mymind_badges_v2'
};

const DEFAULT_SETTINGS: UserSettings = {
  language: 'ar',
  soundEnabled: true,
  soundVolume: 0.6,
  ambientSound: 'none',
  ambientVolume: 0.5,
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  autoArchiveEnabled: true,
  lastAutoArchiveCheck: new Date().toISOString()
};

// Clean Reset: 100% clean slate, zero mock projects
const DEFAULT_PROJECTS: Project[] = [];

// Clean Reset: 100% clean slate, zero mock tasks
const DEFAULT_TASKS: Task[] = [];

// Clean Reset: New user starts at zero
function generateInitialStats(): UserStats {
  return {
    xp: 0,
    level: 1,
    streakDays: 0,
    longestStreak: 0,
    lastActiveDate: '',
    totalTasksCompleted: 0,
    totalFocusMinutes: 0,
    dailyStats: {}
  };
}

// Clean Reset: All badges locked initially until earned
const DEFAULT_BADGES: Badge[] = [
  {
    id: 'first_step',
    icon: 'Zap',
    titleAr: 'أول شرارة ⚡',
    titleEn: 'First Spark ⚡',
    descAr: 'أكملت أول مهمة في مسار إنتاجيتك.',
    descEn: 'Completed your very first task.',
    unlocked: false
  },
  {
    id: 'focus_monk',
    icon: 'Target',
    titleAr: 'عقل فولاذي 🎯',
    titleEn: 'Steel Mind 🎯',
    descAr: 'أنجزت 4 جلسات بومودورو تركيز عميق.',
    descEn: 'Completed 4 deep focus Pomodoro sessions.',
    unlocked: false
  },
  {
    id: 'chain_keeper',
    icon: 'Flame',
    titleAr: 'سيد السلسلة 🔥',
    titleEn: 'Chain Keeper 🔥',
    descAr: 'حافظت على سلسلة إنجاز يومي متتالية لمدة 3 أيام على الأقل.',
    descEn: 'Maintained a daily streak of at least 3 consecutive days.',
    unlocked: false
  },
  {
    id: 'clean_slate_hero',
    icon: 'Sparkles',
    titleAr: 'الصفحة النقية ✨',
    titleEn: 'Clean Slate ✨',
    descAr: 'شهدت دورة مسح تلقائي كاملة لـ 12 ساعة مع حفظ البيانات في التاريخ.',
    descEn: 'Experienced a 12-hour clean slate archival cycle.',
    unlocked: false
  },
  {
    id: 'zen_master',
    icon: 'Moon',
    titleAr: 'هدوء المحيط 🌙',
    titleEn: 'Ocean Zen 🌙',
    descAr: 'فعّلت المؤثرات الصوتية المحيطية أو وضع شاشة الزِن.',
    descEn: 'Used ambient focus sounds or entered Zen mode.',
    unlocked: false
  },
  {
    id: 'grand_architect',
    icon: 'Crown',
    titleAr: 'العقل الخارق 👑',
    titleEn: 'Supermind 👑',
    descAr: 'حققت أكثر من 500 نقطة خبرة XP وبلغت المستوى الثالث.',
    descEn: 'Accumulated over 500 XP and reached Level 3.',
    unlocked: false
  }
];

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) return DEFAULT_TASKS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_TASKS;
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks:', err);
  }
}

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) return DEFAULT_PROJECTS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PROJECTS;
  }
}

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to save projects:', err);
  }
}

export function loadStats(): UserStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (!raw) return generateInitialStats();
    return JSON.parse(raw);
  } catch {
    return generateInitialStats();
  }
}

export function saveStats(stats: UserStats): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (err) {
    console.error('Failed to save stats:', err);
  }
}

export function loadBadges(): Badge[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BADGES);
    if (!raw) return DEFAULT_BADGES;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_BADGES;
  }
}

export function saveBadges(badges: Badge[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(badges));
  } catch (err) {
    console.error('Failed to save badges:', err);
  }
}

export function clearLocalData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.STATS);
    localStorage.removeItem(STORAGE_KEYS.BADGES);
    // Keep settings so language preference is preserved
  } catch {
    // ignore
  }
}
