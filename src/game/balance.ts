import { CreatureAlignment, Task } from '../types';

/**
 * Habit balance: decides which evolution path the creature takes.
 *
 * - Doing chores / camera missions / family moments pushes toward Armonía (+).
 * - Daily tasks left undone and days without family time push toward Sombra (-).
 * - The path is decided when the creature leaves "Principal" (stage 1): balance >= 0 → Armonía
 *   (P2 → P3 → P4), balance < 0 → Abismo (B2 → B3 → B4). After that it stays fixed.
 */
export const BALANCE = {
  min: -100,
  max: 100,
  task: 2,
  priorityTask: 3,
  camera: 2,
  family: 10,
  mode: 3, // finishing a disconnect mode
  modeAbandoned: -2, // leaving a disconnect mode before the time is up
  abandon: -8, // giving up a task that has a barrier
  abandonPriority: -12, // same, for a high priority task
  barrierBreak: -3, // coming back online during an airplane-mode block
  missedTask: -2,
  missedPriorityTask: -4,
  noFamilyDay: -5,
  noFamilyAfterDays: 3, // days since the last family moment before it starts to hurt
  maxCatchUpDays: 3, // coming back after a long break never costs more than this many days
} as const;

export const clampBalance = (n: number): number => Math.max(BALANCE.min, Math.min(BALANCE.max, n));

// Tasks the user creates carry this id prefix; the seed tasks (task-1..task-7) do not.
// Only user tasks can be deleted.
export const CUSTOM_TASK_PREFIX = 'custom-task-';
export const isUserTask = (t: Pick<Task, 'id'>): boolean => t.id.startsWith(CUSTOM_TASK_PREFIX);

export const pathFromBalance = (balance: number): CreatureAlignment => (balance >= 0 ? 'harmony' : 'shadow');

export const taskBalance = (task: Pick<Task, 'isHighPriority'>): number =>
  task.isHighPriority ? BALANCE.priorityTask : BALANCE.task;

// ---- calendar days as 'YYYY-MM-DD' (local) ----

const pad = (n: number) => String(n).padStart(2, '0');

export const dayKey = (d: Date = new Date()): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const toUtc = (key: string): number => {
  const [y, m, d] = key.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};

export const daysBetween = (from: string, to: string): number => Math.round((toUtc(to) - toUtc(from)) / 86_400_000);

export const addDays = (key: string, n: number): string => {
  const t = new Date(toUtc(key) + n * 86_400_000);
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
};

// ---- day end ----

export interface GameClock {
  lastDay: string; // the in-progress game day
  lastFamilyDay: string; // last day a family moment was registered
  lastModeDay?: string; // last day a disconnect mode was completed
  streak?: number; // consecutive days with a completed mode, as of lastModeDay
}

export const defaultClock = (today: string = dayKey()): GameClock => ({
  lastDay: today,
  lastFamilyDay: addDays(today, -1),
});

export interface DayEndReport {
  delta: number;
  missedTasks: number;
  noFamilyDays: number;
}

/**
 * Balance change for `days` days that just ended, starting at `fromDay`.
 * The first day only counts the daily tasks still pending; any further day
 * means the app was not opened, so every daily task counts as missed.
 */
export function computeDayEnd(tasks: Task[], lastFamilyDay: string, fromDay: string, days: number): DayEndReport {
  const daily = tasks.filter(t => t.isDaily);
  // A task with a barrier cannot be put off: while it is pending it costs balance every day.
  const committed = tasks.filter(t => !t.isDaily && t.barrier && !t.isCompleted);
  let delta = 0;
  let missedTasks = 0;
  let noFamilyDays = 0;

  for (let i = 0; i < days; i++) {
    const missed = [...(i === 0 ? daily.filter(t => !t.isCompleted) : daily), ...committed];
    for (const t of missed) {
      delta += t.isHighPriority ? BALANCE.missedPriorityTask : BALANCE.missedTask;
      missedTasks++;
    }
    if (daysBetween(lastFamilyDay, addDays(fromDay, i)) >= BALANCE.noFamilyAfterDays) {
      delta += BALANCE.noFamilyDay;
      noFamilyDays++;
    }
  }

  return { delta, missedTasks, noFamilyDays };
}
