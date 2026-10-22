import { describe, it, expect } from 'vitest';
import {
  getNextCycleTime,
  getPrecedingCycleTime,
  getCycleTag,
  formatRemainingTime,
  hasCrossed12HourBoundary,
  execute12HourClear
} from '../utils/autoClear';
import { translations } from '../utils/i18n';
import type { Task, UserStats } from '../types';

describe('12-Hour Auto-Clear Cycle Algorithm', () => {
  it('correctly calculates next cycle time before noon (e.g. 09:30 AM -> 12:00 PM)', () => {
    const testDate = new Date(2026, 9, 22, 9, 30, 0); // 09:30 AM
    const { nextDate, cycleNameAr, cycleNameEn, remainingMs } = getNextCycleTime(testDate);

    expect(nextDate.getHours()).toBe(12);
    expect(nextDate.getMinutes()).toBe(0);
    expect(nextDate.getDate()).toBe(22);
    expect(cycleNameAr).toContain('12:00 ظهرًا');
    expect(cycleNameEn).toContain('12:00 PM');
    expect(remainingMs).toBe(2.5 * 3600 * 1000); // 2.5 hours remaining
  });

  it('correctly calculates next cycle time after noon (e.g. 15:45 PM -> 12:00 AM next day)', () => {
    const testDate = new Date(2026, 9, 22, 15, 45, 0); // 03:45 PM
    const { nextDate, cycleNameAr, cycleNameEn } = getNextCycleTime(testDate);

    expect(nextDate.getHours()).toBe(0);
    expect(nextDate.getMinutes()).toBe(0);
    expect(nextDate.getDate()).toBe(23); // next day
    expect(cycleNameAr).toContain('12:00 منتصف الليل');
    expect(cycleNameEn).toContain('12:00 AM');
  });

  it('correctly identifies preceding boundary', () => {
    const morning = new Date(2026, 9, 22, 8, 15, 0);
    const precedingMorning = getPrecedingCycleTime(morning);
    expect(precedingMorning.getHours()).toBe(0);

    const afternoon = new Date(2026, 9, 22, 16, 20, 0);
    const precedingAfternoon = getPrecedingCycleTime(afternoon);
    expect(precedingAfternoon.getHours()).toBe(12);
  });

  it('generates consistent cycle tags (12AM vs 12PM)', () => {
    const morning = new Date(2026, 9, 22, 10, 0, 0);
    expect(getCycleTag(morning)).toBe('2026-10-22-12AM');

    const afternoon = new Date(2026, 9, 22, 14, 0, 0);
    expect(getCycleTag(afternoon)).toBe('2026-10-22-12PM');
  });

  it('detects when 12:00 boundary has been crossed', () => {
    // Last checked at 11:55 AM, current is 12:05 PM -> crossed noon!
    const lastCheck = new Date(2026, 9, 22, 11, 55, 0).toISOString();
    const now = new Date(2026, 9, 22, 12, 5, 0);
    expect(hasCrossed12HourBoundary(lastCheck, now)).toBe(true);

    // Last checked at 13:00 PM, current is 13:30 PM -> not crossed!
    const sameAfternoonLast = new Date(2026, 9, 22, 13, 0, 0).toISOString();
    const sameAfternoonNow = new Date(2026, 9, 22, 13, 30, 0);
    expect(hasCrossed12HourBoundary(sameAfternoonLast, sameAfternoonNow)).toBe(false);

    // Last checked at 23:55 PM, current is 00:05 AM next day -> crossed midnight!
    const lastNight = new Date(2026, 9, 22, 23, 55, 0).toISOString();
    const nextMorning = new Date(2026, 9, 23, 0, 5, 0);
    expect(hasCrossed12HourBoundary(lastNight, nextMorning)).toBe(true);
  });

  it('executes 12-hour clear: archives completed tasks and retains active tasks', () => {
    const tasks: Task[] = [
      {
        id: '1',
        title: 'Completed Task',
        completed: true,
        priority: 'high',
        energy: 'deep',
        createdAt: new Date().toISOString(),
        archived: false
      },
      {
        id: '2',
        title: 'Active Incomplete Task',
        completed: false,
        priority: 'medium',
        energy: 'quick',
        createdAt: new Date().toISOString(),
        archived: false
      }
    ];

    const stats: UserStats = {
      xp: 100,
      level: 1,
      streakDays: 2,
      longestStreak: 2,
      lastActiveDate: '2026-10-22',
      totalTasksCompleted: 5,
      totalFocusMinutes: 100,
      dailyStats: {}
    };

    const clearTime = new Date(2026, 9, 22, 12, 0, 0);
    const result = execute12HourClear(tasks, stats, clearTime);

    expect(result.clearedCount).toBe(1);
    expect(result.updatedTasks[0].archived).toBe(true);
    expect(result.updatedTasks[0].cycleTag).toBe('2026-10-22-12PM');
    expect(result.updatedTasks[1].archived).toBe(false);
  });

  it('formats remaining time correctly (HH:MM:SS)', () => {
    const oneHourThirtyMins = (1 * 3600 + 30 * 60 + 45) * 1000;
    expect(formatRemainingTime(oneHourThirtyMins)).toBe('01:30:45');

    const zero = 0;
    expect(formatRemainingTime(zero)).toBe('00:00:00');
  });
});

describe('Internationalization (i18n) Completeness', () => {
  it('ensures Arabic and English translations have identical key sets', () => {
    const arKeys = Object.keys(translations.ar).sort();
    const enKeys = Object.keys(translations.en).sort();

    expect(arKeys).toEqual(enKeys);
  });

  it('ensures all level names have 5 defined tiers', () => {
    expect(translations.ar.levelNames).toHaveLength(5);
    expect(translations.en.levelNames).toHaveLength(5);
  });
});
