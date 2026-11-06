import { createClient, type RealtimeChannel } from '@supabase/supabase-js';
import type { Task, Project, UserStats, UserSettings, Badge } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.trim().length > 0 &&
    !supabaseUrl.includes('your-project-id') &&
    supabaseAnonKey.trim().length > 0
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

/**
 * 🔒 1. فحص أمان الجلسة (Session Check):
 * التأكد من وجود مستخدم مسجل دخول بالفعل واسترجاع بيانات جلسته الحالية
 */
export async function getCurrentSession() {
  if (!supabase) return null;
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session || !session.user) {
      return null;
    }
    return session;
  } catch (err) {
    console.error('Session retrieval error:', err);
    return null;
  }
}

/**
 * دالة مساعدة للحصول على معرف المستخدم النشط حالياً
 */
export async function getActiveUserId(fallbackUserId?: string): Promise<string | null> {
  const session = await getCurrentSession();
  if (session?.user?.id) {
    return session.user.id;
  }
  return fallbackUserId || null;
}

/**
 * 📥 2. جلب المهام (Fetch Tasks):
 * استعلام جدول tasks مع فلتر .eq('user_id', session.user.id)
 * لضمان جلب مهام المستخدم الحالي فقط ومنع أي اختلاط في البيانات
 */
export async function fetchUserTasks(providedUserId?: string): Promise<Task[]> {
  if (!supabase) return [];

  // التحقق الأمني من الجلسة
  const userId = await getActiveUserId(providedUserId);
  if (!userId) {
    console.warn('⚠️ تم إلغاء جلب المهام: لا توجد جلسة مستخدم نشطة.');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ خطأ أثناء جلب المهام من Supabase:', error.message);
      return [];
    }

    // تحويل حقول قاعدة البيانات بأمان إلى واجهة Task في التطبيق
    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      completed: Boolean(row.completed),
      completedAt: row.completed_at || row.completedAt || undefined,
      createdAt: row.created_at || row.createdAt || new Date().toISOString(),
      priority: row.priority || 'medium',
      projectId: row.project_id || row.projectId || undefined,
      energy: row.energy || 'deep',
      dueDate: row.due_date || row.dueDate || undefined,
      archived: Boolean(row.archived),
      archivedAt: row.archived_at || row.archivedAt || undefined,
      cycleTag: row.cycle_tag || row.cycleTag || undefined,
      subtasks: row.subtasks || []
    }));
  } catch (err) {
    console.error('Fetch tasks exception:', err);
    return [];
  }
}

/**
 * ➕ 3. إدراج مهمة جديدة (Add Task):
 * تمرير حقل user_id بقيمة معرف المستخدم المسجل (session.user.id) تلقائياً
 */
export async function addTaskToCloud(
  taskData: Omit<Task, 'id' | 'createdAt' | 'archived'> & Partial<Task>,
  providedUserId?: string
): Promise<Task | null> {
  if (!supabase) return null;

  // التحقق الأمني من الجلسة
  const userId = await getActiveUserId(providedUserId);
  if (!userId) {
    console.warn('⚠️ تعذر إدراج المهمة: لا توجد جلسة مستخدم مسجل دخول.');
    return null;
  }

  const taskId = taskData.id || `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const createdAt = taskData.createdAt || new Date().toISOString();

  // تجهيز صف المهمة مع إدراج user_id الصارم
  const dbPayload = {
    id: taskId,
    user_id: userId, // ربط مباشر ودقيق بمعرف المستخدم الحالي
    title: taskData.title,
    description: taskData.description || null,
    completed: Boolean(taskData.completed),
    completed_at: taskData.completedAt || null,
    created_at: createdAt,
    priority: taskData.priority || 'medium',
    project_id: taskData.projectId || null,
    energy: taskData.energy || 'deep',
    due_date: taskData.dueDate || null,
    archived: Boolean(taskData.archived),
    archived_at: taskData.archivedAt || null,
    cycle_tag: taskData.cycleTag || null,
    subtasks: taskData.subtasks || []
  };

  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([dbPayload])
      .select()
      .single();

    if (error) {
      console.error('❌ خطأ أثناء إدراج المهمة في Supabase:', error.message);
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description || undefined,
      completed: Boolean(data.completed),
      completedAt: data.completed_at || undefined,
      createdAt: data.created_at,
      priority: data.priority,
      projectId: data.project_id || undefined,
      energy: data.energy,
      dueDate: data.due_date || undefined,
      archived: Boolean(data.archived),
      archivedAt: data.archived_at || undefined,
      cycleTag: data.cycle_tag || undefined,
      subtasks: data.subtasks || []
    };
  } catch (err) {
    console.error('Add task exception:', err);
    return null;
  }
}

/**
 * 💾 4. حفظ أو تعديل مهمة (Save/Upsert Task):
 * تضمن إرفاق user_id الخاص بالجلسة النشطة ومطابقة قيود RLS
 * تدعم كلا النمطين: saveTaskToCloud(task) أو saveTaskToCloud(userId, task)
 */
export async function saveTaskToCloud(
  param1: string | Task,
  param2?: Task
): Promise<boolean> {
  if (!supabase) return false;

  const task = (typeof param1 === 'object' ? param1 : param2) as Task;
  const providedUserId = typeof param1 === 'string' ? param1 : undefined;

  if (!task) return false;

  const userId = await getActiveUserId(providedUserId);
  if (!userId) {
    console.warn('⚠️ تعذر حفظ المهمة: لا توجد جلسة مستخدم مسجل.');
    return false;
  }

  const dbPayload = {
    id: task.id,
    user_id: userId, // ربط صارم بالمستخدم
    title: task.title,
    description: task.description || null,
    completed: Boolean(task.completed),
    completed_at: task.completedAt || null,
    created_at: task.createdAt || new Date().toISOString(),
    priority: task.priority || 'medium',
    project_id: task.projectId || null,
    energy: task.energy || 'deep',
    due_date: task.dueDate || null,
    archived: Boolean(task.archived),
    archived_at: task.archivedAt || null,
    cycle_tag: task.cycleTag || null,
    subtasks: task.subtasks || []
  };

  try {
    const { error } = await supabase
      .from('tasks')
      .upsert(dbPayload, { onConflict: 'id' });

    if (error) {
      console.error('❌ خطأ أثناء حفظ المهمة:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Save task exception:', err);
    return false;
  }
}

/**
 * 🗑️ 5. حذف مهمة (Delete Task):
 * الحذف يتم بالشرطين معاً: معرف المهمة ومعرف المستخدم (id AND user_id)
 * تدعم كلا النمطين: deleteTaskFromCloud(taskId) أو deleteTaskFromCloud(userId, taskId)
 */
export async function deleteTaskFromCloud(
  param1: string,
  param2?: string
): Promise<boolean> {
  if (!supabase) return false;

  const taskId = param2 ? param2 : param1;
  const providedUserId = param2 ? param1 : undefined;

  const userId = await getActiveUserId(providedUserId);
  if (!userId) {
    console.warn('⚠️ تعذر حذف المهمة: لا توجد جلسة مستخدم نشطة.');
    return false;
  }

  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', userId); // حماية صارمة لمنع حذف مهام مستخدم آخر

    if (error) {
      console.error('❌ خطأ أثناء حذف المهمة:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Delete task exception:', err);
    return false;
  }
}

/**
 * 🔄 6. المزامنة الحية للمهام (Real-time Sync):
 * الاشتراك في تغييرات جدول المهام المرتبطة حصرياً بـ user_id الحالي
 */
export function subscribeToUserTasks(
  userId: string,
  onTasksChanged: () => void
): RealtimeChannel | null {
  if (!supabase) return null;

  try {
    const channel = supabase
      .channel(`realtime:tasks:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${userId}`
        },
        () => {
          onTasksChanged();
        }
      )
      .subscribe();

    return channel;
  } catch (err) {
    console.error('Real-time subscription error:', err);
    return null;
  }
}

/**
 * مزامنة جماعية لقائمة المهام دفعة واحدة
 */
export async function bulkSyncTasksToCloud(
  userId: string,
  tasks: Task[]
): Promise<boolean> {
  if (!supabase || tasks.length === 0) return false;

  const activeUserId = await getActiveUserId(userId);
  if (!activeUserId) return false;

  const payload = tasks.map(task => ({
    id: task.id,
    user_id: activeUserId,
    title: task.title,
    description: task.description || null,
    completed: Boolean(task.completed),
    completed_at: task.completedAt || null,
    created_at: task.createdAt || new Date().toISOString(),
    priority: task.priority || 'medium',
    project_id: task.projectId || null,
    energy: task.energy || 'deep',
    due_date: task.dueDate || null,
    archived: Boolean(task.archived),
    archived_at: task.archivedAt || null,
    cycle_tag: task.cycleTag || null,
    subtasks: task.subtasks || []
  }));

  try {
    const { error } = await supabase
      .from('tasks')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error('❌ خطأ أثناء المزامنة الجماعية:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Bulk sync tasks error:', err);
    return false;
  }
}

// ============================================================================
// إدارة المشاريع (Projects)
// ============================================================================

export async function fetchUserProjects(providedUserId?: string): Promise<Project[]> {
  if (!supabase) return [];
  const userId = await getActiveUserId(providedUserId);
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error.message);
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
  } catch {
    return [];
  }
}

export async function saveProjectToCloud(userId: string, project: Project): Promise<boolean> {
  if (!supabase) return false;
  const activeUserId = await getActiveUserId(userId);
  if (!activeUserId) return false;

  try {
    const { error } = await supabase.from('projects').upsert({
      id: project.id,
      user_id: activeUserId,
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

export async function deleteProjectFromCloud(userId: string, projectId: string): Promise<boolean> {
  if (!supabase) return false;
  const activeUserId = await getActiveUserId(userId);
  if (!activeUserId) return false;

  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', activeUserId);

    return !error;
  } catch {
    return false;
  }
}

// ============================================================================
// الملف الشخصي والإحصائيات (Profiles & Stats)
// ============================================================================

export async function fetchUserProfile(providedUserId?: string): Promise<{
  stats?: UserStats;
  settings?: UserSettings;
  badges?: Badge[];
  displayName?: string;
} | null> {
  if (!supabase) return null;
  const userId = await getActiveUserId(providedUserId);
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

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

export async function saveUserProfileToCloud(
  userId: string,
  email: string,
  stats: UserStats,
  settings: UserSettings,
  badges: Badge[],
  displayName?: string
): Promise<boolean> {
  if (!supabase) return false;
  const activeUserId = await getActiveUserId(userId);
  if (!activeUserId) return false;

  try {
    const { error } = await supabase.from('profiles').upsert({
      id: activeUserId,
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
