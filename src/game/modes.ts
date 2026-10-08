import { EnergyType } from '../types';
import { GameClock, daysBetween } from './balance';

/**
 * Disconnect modes. In this prototype the blocking is simulated: the app turns itself
 * gray, runs the timer and lists what a real phone would lock. Real blocking needs a
 * native app (Screen Time on iOS, Digital Wellbeing / accessibility on Android).
 */
export interface ModeOption {
  minutes: number;
  energy: number;
}

export interface DisconnectMode {
  id: 'estudio' | 'salida' | 'basico';
  name: string;
  tagline: string;
  category: EnergyType;
  options: ModeOption[];
  blocked: string[];
  allowed: string[];
}

export interface ModeRun {
  mode: DisconnectMode;
  option: ModeOption;
  startedAt: number;
}

export interface ModeResult {
  modeName: string;
  category: EnergyType;
  energy: number; // total, bonus included
  bonus: number;
  streak: number;
  exits: number;
}

export const MODES: DisconnectMode[] = [
  {
    id: 'estudio',
    name: 'Modo Estudio',
    tagline: 'Un bloque de foco, sin redes.',
    category: 'enfoque',
    options: [
      { minutes: 25, energy: 40 },
      { minutes: 50, energy: 90 },
    ],
    blocked: ['Instagram', 'TikTok', 'X', 'YouTube', 'Juegos'],
    allowed: ['Notas', 'Calculadora', 'Llamadas'],
  },
  {
    id: 'salida',
    name: 'Modo Salida',
    tagline: 'Presente con tus amigos o tu familia.',
    category: 'familia',
    options: [
      { minutes: 120, energy: 60 },
      { minutes: 240, energy: 120 },
    ],
    blocked: ['Instagram', 'TikTok', 'X', 'YouTube', 'Correo', 'Juegos'],
    allowed: ['Cámara', 'Llamadas', 'Mapas'],
  },
  {
    id: 'basico',
    name: 'Teléfono básico',
    tagline: 'Solo llamadas y mensajes, como un teléfono sin pantalla.',
    category: 'activo',
    options: [
      { minutes: 60, energy: 60 },
      { minutes: 180, energy: 150 },
    ],
    blocked: ['Redes sociales', 'Navegador', 'Streaming', 'Juegos'],
    allowed: ['Llamadas', 'Mensajes'],
  },
];

/** Streak after completing a mode on game day `g.lastDay`. */
export const nextStreak = (g: GameClock): number => {
  if (g.lastModeDay === g.lastDay) return Math.max(g.streak ?? 1, 1);
  if (g.lastModeDay && g.streak && daysBetween(g.lastModeDay, g.lastDay) === 1) return g.streak + 1;
  return 1;
};

/** Streak still alive: last completed today or yesterday. */
export const liveStreak = (g: GameClock): number => {
  if (!g.lastModeDay || !g.streak) return 0;
  return daysBetween(g.lastModeDay, g.lastDay) <= 1 ? g.streak : 0;
};

/** Extra energy per streak day after the first, up to 5 days. */
export const streakBonus = (streak: number): number => Math.min(Math.max(streak - 1, 0), 5) * 5;

export const formatMinutes = (m: number): string => (m % 60 === 0 ? `${m / 60} h` : `${m} min`);
