import type { Task, UserStats } from '../types';

/**
 * Returns the next 12:00 boundary (either 12:00 AM midnight or 12:00 PM noon)
 */
export function getNextCycleTime(now: Date = new Date()): {
  nextDate: Date;
  cycleNameAr: string;
  cycleNameEn: string;
  remainingMs: number;
} {
  const currentHour = now.getHours();
  const next = new Date(now);

  if (currentHour < 12) {
    next.setHours(12, 0, 0, 0);
    return {
      nextDate: next,
      cycleNameAr: '12:00 ظهرًا (منتصف النهار)',
      cycleNameEn: '12:00 PM (Noon)',
      remainingMs: Math.max(0, next.getTime() - now.getTime())
    };
  } else {
    next.setDate(next.getDate() + 1);
    next.setHours(0, 0, 0, 0);
    return {
      nextDate: next,
      cycleNameAr: '12:00 منتصف الليل',
      cycleNameEn: '12:00 AM (Midnight)',
      remainingMs: Math.max(0, next.getTime() - now.getTime())
    };
  }
}

/**
 * Returns the cycle boundary immediately preceding the given date
 */
export function getPrecedingCycleTime(date: Date): Date {
  const preceding = new Date(date);
  const hour = date.getHours();

  if (hour >= 12) {
    preceding.setHours(12, 0, 0, 0);
  } else {
    preceding.setHours(0, 0, 0, 0);
  }
  return preceding;
}

/**
 * Generates an archival cycle tag like "2026-10-22-12PM" or "2026-10-22-12AM"
 */
export function getCycleTag(date: Date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hour = date.getHours();
  const suffix = hour >= 12 ? '12PM' : '12AM';
  return `${yyyy}-${mm}-${dd}-${suffix}`;
}

/**
 * Format remaining time nicely: "04:12:35"
 */
export function formatRemainingTime(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Checks if the 12:00 boundary has crossed since the last check
 */
export function hasCrossed12HourBoundary(lastCheckIso: string, now: Date = new Date()): boolean {
  if (!lastCheckIso) return true;
  const lastCheck = new Date(lastCheckIso);
  const currentBoundary = getPrecedingCycleTime(now);
  return lastCheck.getTime() < currentBoundary.getTime();
}

/**
 * Executes the 12-hour auto-clear:
 * Archives all active tasks where completed === true,
 * records long-term progress in stats, and returns the updated state.
 */
export function execute12HourClear(
  tasks: Task[],
  stats: UserStats,
  now: Date = new Date()
): {
  updatedTasks: Task[];
  updatedStats: UserStats;
  clearedCount: number;
  cycleTag: string;
} {
  const cycleTag = getCycleTag(now);
  const nowIso = now.toISOString();
  const todayKey = nowIso.split('T')[0];

  const completedUnarchived = tasks.filter(t => t.completed && !t.archived);

  if (completedUnarchived.length === 0) {
    return {
      updatedTasks: tasks,
      updatedStats: stats,
      clearedCount: 0,
      cycleTag
    };
  }

  const updatedTasks = tasks.map(task => {
    if (task.completed && !task.archived) {
      return {
        ...task,
        archived: true,
        archivedAt: nowIso,
        cycleTag
      };
    }
    return task;
  });

  const updatedStats = { ...stats };
  const dailyStats = { ...(updatedStats.dailyStats || {}) };

  if (!dailyStats[todayKey]) {
    dailyStats[todayKey] = {
      date: todayKey,
      tasksCompleted: 0,
      focusMinutes: 0,
      pomodorosCount: 0
    };
  }

  const alreadyCredited = dailyStats[todayKey].tasksCompleted;
  const newCount = Math.max(alreadyCredited, completedUnarchived.length);
  dailyStats[todayKey].tasksCompleted = newCount;
  updatedStats.dailyStats = dailyStats;

  return {
    updatedTasks,
    updatedStats,
    clearedCount: completedUnarchived.length,
    cycleTag
  };
}
