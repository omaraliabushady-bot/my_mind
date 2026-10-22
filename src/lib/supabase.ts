import { createClient } from '@supabase/supabase-js';
import type { Task, Project, UserStats, UserSettings, Badge } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.trim().length > 0 &&
    !supabaseUrl.includes('your-supabase-url') &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.trim().length > 0 &&
    !supabaseAnonKey.includes('your-supabase-anon-key')
  );
};

// Create client or fallback dummy if not configured yet
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

// ============================================================================
// Database Sync Services (Tasks, Projects, Profile, Stats)
// ============================================================================

export interface CloudProfile {
  id: string;
  email: string;
  display_name?: string;
  xp: number;
  level: number;
  streak_days: number;
  longest_streak: number;
  last_active_date?: string;
  total_tasks_completed: number;
  total_focus_minutes: number;
  daily_stats?: Record<string, unknown>;
  settings?: UserSettings;
  badges?: Badge[];
}

/**
 * Fetch all tasks for the logged in user
 */
export async function fetchUserTasks(userId: string): Promise<Task[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching tasks from Supabase:', error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      completed: !!row.completed,
      completedAt: row.completed_at || undefined,
      createdAt: row.created_at,
      priority: row.priority || 'medium',
      projectId: row.project_id || undefined,
      energy: row.energy || 'deep',
      dueDate: row.due_date || undefined,
      archived: !!row.archived,
      archivedAt: row.archived_at || undefined,
      cycleTag: row.cycle_tag || undefined,
      subtasks: row.subtasks || []
    }));
  } catch (err) {
    console.error('Fetch tasks exception:', err);
    return [];
  }
}

/**
 * Upsert a task to Supabase
 */
export async function saveTaskToCloud(userId: string, task: Task): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('tasks').upsert({
      id: task.id,
      user_id: userId,
      title: task.title,
      description: task.description || null,
      completed: task.completed,
      completed_at: task.completedAt || null,
      created_at: task.createdAt,
      priority: task.priority,
      project_id: task.projectId || null,
      energy: task.energy,
      due_date: task.dueDate || null,
      archived: task.archived,
      archived_at: task.archivedAt || null,
      cycle_tag: task.cycleTag || null,
      subtasks: task.subtasks || []
    });

    if (error) {
      console.warn('Error saving task to Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Save task exception:', err);
    return false;
  }
}

/**
 * Bulk save tasks to Supabase
 */
export async function bulkSyncTasksToCloud(userId: string, tasks: Task[]): Promise<boolean> {
  if (!supabase || tasks.length === 0) return false;
  try {
    const payload = tasks.map(task => ({
      id: task.id,
      user_id: userId,
      title: task.title,
      description: task.description || null,
      completed: task.completed,
      completed_at: task.completedAt || null,
      created_at: task.createdAt,
      priority: task.priority,
      project_id: task.projectId || null,
      energy: task.energy,
      due_date: task.dueDate || null,
      archived: task.archived,
      archived_at: task.archivedAt || null,
      cycle_tag: task.cycleTag || null,
      subtasks: task.subtasks || []
    }));

    const { error } = await supabase.from('tasks').upsert(payload);
    if (error) {
      console.warn('Error bulk syncing tasks:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Bulk sync tasks error:', err);
    return false;
  }
}

/**
 * Delete a task from Supabase
 */
export async function deleteTaskFromCloud(userId: string, taskId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', userId);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Fetch all projects for the logged in user
 */
export async function fetchUserProjects(userId: string): Promise<Project[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching projects from Supabase:', error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description || '',
      color: row.color || '#00f2fe',
      icon: row.icon || 'FolderKanban',
      targetDate: row.target_date || undefined,
      createdAt: row.created_at
    }));
  } catch (err) {
    console.error('Fetch projects exception:', err);
    return [];
  }
}

/**
 * Upsert a project to Supabase
 */
export async function saveProjectToCloud(userId: string, project: Project): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('projects').upsert({
      id: project.id,
      user_id: userId,
      title: project.title,
      description: project.description || '',
      color: project.color,
      icon: project.icon,
      target_date: project.targetDate || null,
      created_at: project.createdAt
    });

    return !error;
  } catch {
    return false;
  }
}

/**
 * Delete a project from Supabase
 */
export async function deleteProjectFromCloud(userId: string, projectId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', userId);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Fetch user profile & stats from Supabase
 */
export async function fetchUserProfile(userId: string): Promise<{
  stats?: UserStats;
  settings?: UserSettings;
  badges?: Badge[];
  displayName?: string;
} | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    const stats: UserStats = {
      xp: data.xp || 0,
      level: data.level || 1,
      streakDays: data.streak_days || 0,
      longestStreak: data.longest_streak || 0,
      lastActiveDate: data.last_active_date || '',
      totalTasksCompleted: data.total_tasks_completed || 0,
      totalFocusMinutes: data.total_focus_minutes || 0,
      dailyStats: data.daily_stats || {}
    };

    return {
      stats,
      settings: data.settings || undefined,
      badges: data.badges || undefined,
      displayName: data.display_name || undefined
    };
  } catch {
    return null;
  }
}

/**
 * Save user profile, stats, settings & badges to Supabase
 */
export async function saveUserProfileToCloud(
  userId: string,
  email: string,
  stats: UserStats,
  settings: UserSettings,
  badges: Badge[],
  displayName?: string
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      email,
      display_name: displayName || null,
      xp: stats.xp,
      level: stats.level,
      streak_days: stats.streakDays,
      longest_streak: stats.longestStreak,
      last_active_date: stats.lastActiveDate || null,
      total_tasks_completed: stats.totalTasksCompleted,
      total_focus_minutes: stats.totalFocusMinutes,
      daily_stats: stats.dailyStats || {},
      settings,
      badges,
      updated_at: new Date().toISOString()
    });

    return !error;
  } catch (err) {
    console.error('Save profile exception:', err);
    return false;
  }
}
