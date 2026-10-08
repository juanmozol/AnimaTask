import { CreatureState } from '../types';

/**
 * How far the interface has drifted from its calm self. It is the same app at every step:
 *
 *   0 normal  ->  1 detalles extraños  ->  2 deteriorada  ->  3 corrupta  ->  4 maligna
 *
 * What decides it:
 * - Before the creature picks a path (egg / Principal) the habit balance decides, up to step 2:
 *   the Shadow is gaining ground, but nothing has turned yet.
 * - Once it is on the Shadow path, its form decides: B2 = 2, B3 = 3, B4 = 4. The creature is
 *   fixed, so the interface follows the creature, not the day-to-day balance.
 * - A creature on the Harmony path shows slipping habits up to step 2; past that it falls to the
 *   Shadow (see BALANCE.fall) and the rule above takes over.
 */
export type CorruptionLevel = 0 | 1 | 2 | 3 | 4;

export const CORRUPTION_LEVELS: CorruptionLevel[] = [0, 1, 2, 3, 4];

export const CORRUPTION_NAMES: Record<CorruptionLevel, string> = {
  0: 'Normal',
  1: 'Detalles extraños',
  2: 'Deteriorada',
  3: 'Corrupta',
  4: 'Maligna',
};

// Balance at which each step starts (the balance meter saturates at -40).
const BALANCE_STEPS: Array<[number, CorruptionLevel]> = [
  [-16, 2],
  [-6, 1],
];

const fromBalance = (balance: number): CorruptionLevel => {
  for (const [limit, level] of BALANCE_STEPS) if (balance <= limit) return level;
  return 0;
};

// On the Shadow path the form sets the ceiling (B2 = 2, B3 = 3, B4 = 4) and the balance pulls it
// down as the habits come back: <= -20 full, <= -10 one step less, < 0 two, then 1 until it redeems.
const SHADOW_STEPS: Array<[number, CorruptionLevel]> = [
  [-20, 4],
  [-10, 3],
  [-1, 2],
];
const fromShadowBalance = (balance: number): CorruptionLevel => {
  for (const [limit, level] of SHADOW_STEPS) if (balance <= limit) return level;
  return 1;
};

export function corruptionLevel(c: Pick<CreatureState, 'tier' | 'alignment' | 'balance'>): CorruptionLevel {
  if (c.tier >= 2 && c.alignment === 'shadow') {
    return Math.min(c.tier, fromShadowBalance(c.balance)) as CorruptionLevel;
  }
  return fromBalance(c.balance);
}

// Demo only: lets someone look at any step without waiting for the balance to fall.
export const PREVIEW_KEY = 'animatask_ui_corruption';

export function readPreview(): CorruptionLevel | null {
  try {
    const raw = localStorage.getItem(PREVIEW_KEY);
    if (raw === null) return null;
    const n = Number(raw);
    return n >= 0 && n <= 4 && Number.isInteger(n) ? (n as CorruptionLevel) : null;
  } catch {
    return null;
  }
}

export function writePreview(level: CorruptionLevel | null): void {
  try {
    if (level === null) localStorage.removeItem(PREVIEW_KEY);
    else localStorage.setItem(PREVIEW_KEY, String(level));
  } catch {
    /* storage unavailable: the preview just does not persist */
  }
}
