export type Priority = 'high' | 'medium' | 'low';
export type EnergyLevel = 'quick' | 'deep' | 'routine';
export type TimerMode = 'work' | 'short_break' | 'long_break';
export type AmbientSoundType = 'none' | 'brown' | 'rain' | 'binaural';
export type Language = 'ar' | 'en';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string; // ISO string
  createdAt: string;    // ISO string
  priority: Priority;
  projectId?: string;
  energy: EnergyLevel;
  dueDate?: string;
  archived: boolean;
  archivedAt?: string;  // ISO string
  cycleTag?: string;    // e.g. "2026-10-22-12AM"
  subtasks?: Subtask[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  color: string; // Hex color for neon accent
  icon: string;
  targetDate?: string;
  createdAt: string;
}

export interface PomodoroSession {
  id: string;
  durationMinutes: number;
  completedAt: string;
  mode: TimerMode;
  projectId?: string;
  taskTitle?: string;
}

export interface DailyStat {
  date: string; // YYYY-MM-DD
  tasksCompleted: number;
  focusMinutes: number;
  pomodorosCount: number;
}

export interface UserStats {
  xp: number;
  level: number;
  streakDays: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  totalTasksCompleted: number;
  totalFocusMinutes: number;
  dailyStats: Record<string, DailyStat>; // Keyed by YYYY-MM-DD
}

export interface UserSettings {
  language: Language;
  soundEnabled: boolean;
  soundVolume: number;
  ambientSound: AmbientSoundType;
  ambientVolume: number;
  workDuration: number;        // in minutes (default: 25)
  shortBreakDuration: number;  // in minutes (default: 5)
  longBreakDuration: number;   // in minutes (default: 15)
  autoArchiveEnabled: boolean; // 12-hour auto-clear cycle
  lastAutoArchiveCheck: string;// ISO string
  tickSoundEnabled?: boolean;  // subtle clock ticking during focus
}

export interface Badge {
  id: string;
  icon: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}
