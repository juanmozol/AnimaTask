import React from 'react';
import { GameClock, daysBetween } from '../game/balance';
import { DisconnectMode, MODES, ModeOption, formatMinutes, liveStreak } from '../game/modes';
import { EnergyType } from '../types';
import { sound } from '../services/sound';

interface Props {
  game: GameClock;
  onStart: (mode: DisconnectMode, option: ModeOption) => void;
}

const DOT: Record<EnergyType, string> = {
  enfoque: 'bg-anil',
  familia: 'bg-rubia',
  creativo: 'bg-cochinilla',
  activo: 'bg-musgo',
};

export const ModesView: React.FC<Props> = ({ game, onStart }) => {
  const streak = liveStreak(game);
  const todayDone = game.lastModeDay === game.lastDay;
  const sinceLast = game.lastModeDay ? daysBetween(game.lastModeDay, game.lastDay) : 0;

  // Last 7 days, oldest to today. A day is filled when it belongs to the live streak.
  const days = Array.from({ length: 7 }, (_, i) => {
    const back = 6 - i;
    return streak > 0 && back >= sinceLast && back < sinceLast + streak;
  });

  return (
    <div className="space-y-9 pb-4">
      <div>
        <h2 className="ui-title text-[28px] leading-tight tracking-tight">Modos</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-bruma">
          Pon el teléfono en pausa y tu criatura crece mientras descansas de la pantalla.
        </p>
      </div>

      <div>
        <p className="tnum text-[40px] font-bold leading-none">
          {streak}
          <span className="ml-2 text-[15px] font-medium text-bruma">
            {streak === 1 ? 'día' : 'días'} desconectado
          </span>
        </p>
        <div className="mt-3 flex items-center gap-2" aria-hidden="true">
          {days.map((on, i) => (
            <span
              key={i}
              className={`h-2.5 w-2.5 rounded-full ${on ? 'bg-jade' : 'bg-trazo'} ${i === 6 ? 'ring-2 ring-offset-2 ring-offset-arena ring-piedra/60' : ''}`}
            />
          ))}
        </div>
        <p className="mt-3 text-[13px] leading-snug text-bruma">
          {streak === 0
            ? 'Completa un modo hoy para empezar tu racha.'
            : todayDone
              ? 'Hoy ya cuenta. Cada día seguido le da energía extra a tu criatura.'
              : 'Completa un modo hoy para mantener la racha.'}
        </p>
      </div>

      <div>
        <h3 className="text-[15px] font-bold">Elige un modo</h3>
        <ul className="mt-2 divide-y divide-trazo/70 border-t border-trazo/70">
          {MODES.map(m => (
            <li key={m.id} className="py-5">
              <div className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${DOT[m.category]}`} />
                <h4 className="text-base font-bold leading-snug">{m.name}</h4>
              </div>
              <p className="mt-0.5 text-[14px] leading-relaxed text-bruma">{m.tagline}</p>
              <p className="mt-2 text-[13px] leading-snug text-bruma">
                <span className="font-bold text-tinta">Bloquea</span> {m.blocked.join(', ')}
              </p>
              <p className="mt-0.5 text-[13px] leading-snug text-bruma">
                <span className="font-bold text-tinta">Deja</span> {m.allowed.join(', ')}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {m.options.map(o => (
                  <button
                    key={o.minutes}
                    onClick={() => {
                      sound.playTap();
                      onStart(m, o);
                    }}
                    className="btn-contorno px-4 py-2 text-[13px]"
                  >
                    {formatMinutes(o.minutes)} <span className="tnum font-medium opacity-70">+{o.energy}</span>
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-[12px] leading-snug text-bruma">
        Versión de prueba: el bloqueo es simulado. En el teléfono real usaría Tiempo de uso (iPhone) y Bienestar
        digital (Android).
      </p>
    </div>
  );
};
