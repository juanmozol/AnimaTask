import { MoveKind, TaskBarrier } from '../types';

/**
 * Barriers: what a task asks for before it counts as done.
 * The web can verify place (GPS), a live photo (camera), movement (accelerometer) and being offline.
 * It cannot switch airplane mode on, block other apps or read the photo's content.
 */

// Prototype switch: shows an "Atajo demo" link in every barrier so the app can be shown on a laptop.
// Set it to false before real use.
export const DEMO_SHORTCUTS = true;

export const PLACE_RADII = [50, 100, 250];
export const OFFLINE_MINUTES = [15, 25, 45, 60];
export const MAX_ANCHOR_ACCURACY = 150; // meters: a worse fix cannot anchor a place
export const MAX_FIX_AGE_MS = 20_000; // a position older than this is not trusted

export interface MoveSpec {
  name: string;
  hint: string;
  threshold: number; // m/s² away from the resting value that counts as a repetition
  minGapMs: number;
  defaultReps: number;
}

export const MOVES: Record<MoveKind, MoveSpec> = {
  saltos: {
    name: 'Saltos',
    hint: 'Salta con el teléfono en el bolsillo o en la mano.',
    threshold: 7,
    minGapMs: 400,
    defaultReps: 20,
  },
  trote: {
    name: 'Trote en el lugar',
    hint: 'Trota sin avanzar, con el teléfono en el bolsillo.',
    threshold: 3.5,
    minGapMs: 250,
    defaultReps: 60,
  },
};

// ---- place ----

export interface LatLng {
  lat: number;
  lng: number;
}

export const distanceMeters = (a: LatLng, b: LatLng): number => {
  const R = 6_371_000;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
};

// A fix counts as "in the place" when it is inside the radius and precise enough to mean it.
export const isInsidePlace = (distance: number, accuracy: number, radius: number): boolean =>
  distance <= radius && accuracy <= Math.max(50, radius);

export const formatDistance = (m: number): string =>
  m >= 1000 ? `${(m / 1000).toFixed(1).replace('.', ',')} km` : `${Math.round(m)} m`;

// ---- movement ----

/** Counts repetitions from accelerometer samples (m/s², gravity included). */
export class RepCounter {
  count = 0;
  private base = 0;
  private ready = false;
  private last = -Infinity;

  constructor(
    private readonly threshold: number,
    private readonly minGapMs: number
  ) {}

  /** Returns true when this sample closes a repetition. */
  push(x: number, y: number, z: number, now: number): boolean {
    const m = Math.hypot(x, y, z);
    if (!this.ready) {
      this.base = m;
      this.ready = true;
      return false;
    }
    const dev = Math.abs(m - this.base);
    this.base += (m - this.base) * 0.05; // slow baseline: gravity and posture, not spikes
    if (dev >= this.threshold && now - this.last >= this.minGapMs) {
      this.last = now;
      this.count += 1;
      return true;
    }
    return false;
  }
}

// ---- the task form ----

export type BarrierDraft =
  | { kind: 'none' }
  | { kind: 'place'; label: string; radius: number; anchor?: { lat: number; lng: number; accuracy: number } }
  | { kind: 'move'; move: MoveKind; reps: number }
  | { kind: 'offline'; minutes: number };

export const EMPTY_DRAFT: BarrierDraft = { kind: 'none' };

/** null = no barrier; 'incomplete' = the form still needs something (e.g. an anchored place). */
export function draftToBarrier(d: BarrierDraft): TaskBarrier | null | 'incomplete' {
  switch (d.kind) {
    case 'none':
      return null;
    case 'place':
      if (!d.anchor) return 'incomplete';
      return {
        kind: 'place',
        label: d.label.trim() || 'el lugar',
        lat: d.anchor.lat,
        lng: d.anchor.lng,
        radius: d.radius,
      };
    case 'move':
      return { kind: 'move', move: d.move, reps: Math.max(5, Math.min(200, Math.round(d.reps) || MOVES[d.move].defaultReps)) };
    case 'offline':
      return { kind: 'offline', minutes: d.minutes };
  }
}

export const describeBarrier = (b: TaskBarrier): { name: string; detail: string } => {
  switch (b.kind) {
    case 'place':
      return { name: 'Foto en un lugar', detail: `${b.label}, a menos de ${b.radius} m` };
    case 'move':
      return { name: 'Reto físico', detail: `${b.reps} ${MOVES[b.move].name.toLowerCase()}` };
    case 'offline':
      return { name: 'Modo avión', detail: `${b.minutes} min sin conexión` };
  }
};

export interface OfflineRun {
  taskId: string;
  startedAt: number;
}
