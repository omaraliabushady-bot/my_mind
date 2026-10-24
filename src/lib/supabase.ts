import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-project.supabase.co');
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// جلب المهام
export async function fetchUserTasks(userId: string) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Error fetching tasks:', error.message);
    return [];
  }
  return data || [];
}

// حفظ أو تعديل مهمة
export async function saveTaskToCloud(userId: string, task: any) {
  if (!supabase) return;
  const { error } = await supabase
    .from('tasks')
    .upsert({ ...task, user_id: userId });

  if (error) {
    console.error('Error saving task to cloud:', error.message);
  }
}

// حذف مهمة
export async function deleteTaskFromCloud(userId: string, taskId: string) {
  if (!supabase) return;
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting task from cloud:', error.message);
  }
}

// لمشاريع
export async function fetchUserProjects(userId: string) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId);

  if (error) return [];
  return data || [];
}

export async function saveProjectToCloud(userId: string, project: any) {
  if (!supabase) return;
  await supabase.from('projects').upsert({ ...project, user_id: userId });
}

export async function deleteProjectFromCloud(userId: string, projectId: string) {
  if (!supabase) return;
  await supabase.from('projects').delete().eq('id', projectId).eq('user_id', userId);
}

// البروفايل
export async function fetchUserProfile(userId: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data;
}

export async function saveUserProfileToCloud(
  userId: string,
  email: string,
  stats: any,
  settings: any,
  badges: any,
  displayName?: string
) {
  if (!supabase) return;
  await supabase.from('profiles').upsert({
    id: userId,
    email,
    display_name: displayName,
    stats,
    settings,
    badges,
    updated_at: new Date().toISOString()
  });
}

// مزامنة جماعية
export async function bulkSyncTasksToCloud(userId: string, tasks: any[]) {
  if (!supabase || tasks.length === 0) return;
  const payload = tasks.map(t => ({ ...t, user_id: userId }));
  await supabase.from('tasks').upsert(payload);
}
