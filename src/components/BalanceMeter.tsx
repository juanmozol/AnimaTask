import React from 'react';
import { CreatureAlignment, EvolutionTier } from '../types';
import { Sun, Moon } from 'lucide-react';

interface Props {
  balance: number;
  tier: EvolutionTier;
  alignment: CreatureAlignment;
}

// The marker saturates at +/-40 so a few good (or bad) days are enough to see it move.
const RANGE = 40;

export const BalanceMeter: React.FC<Props> = ({ balance, tier, alignment }) => {
  const clamped = Math.max(-RANGE, Math.min(RANGE, balance));
  const pct = ((clamped + RANGE) / (RANGE * 2)) * 100;
  const pathLocked = tier >= 2;
  const leaning: CreatureAlignment = balance >= 0 ? 'harmony' : 'shadow';
  const shown = pathLocked ? alignment : leaning;

  const headline = pathLocked
    ? shown === 'harmony'
      ? 'Senda de Armonía fijada'
      : 'Senda del Abismo fijada'
    : shown === 'harmony'
      ? 'Vas hacia la Armonía'
      : 'La Sombra gana terreno';

  const hint = pathLocked
    ? 'Tu criatura ya eligió camino y seguirá evolucionando por él.'
    : 'Completa tareas y registra momentos en familia para inclinarte a la Armonía. Dejar tareas pendientes o pasar días sin familia te acerca a la Sombra. La senda se decide al evolucionar de Principal.';

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-xs font-bold text-white tracking-tight">Balance de hábitos</h3>
        <span
          className={`text-[11px] font-semibold ${shown === 'harmony' ? 'text-amber-300' : 'text-emerald-300'}`}
        >
          {headline}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Moon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <div className="relative flex-1 h-2.5 rounded-full bg-gradient-to-r from-emerald-600/70 via-slate-700 to-amber-500/80 border border-slate-800">
          <div
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all duration-500 ${
              pathLocked ? 'bg-slate-500' : shown === 'harmony' ? 'bg-amber-400' : 'bg-emerald-400'
            }`}
            style={{ left: `${pct}%` }}
            aria-label={`Balance ${balance}`}
          />
        </div>
        <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      </div>

      <div className="flex justify-between text-[10px] text-slate-500 mt-1.5 font-mono">
        <span>Sombra</span>
        <span>{balance > 0 ? `+${balance}` : balance}</span>
        <span>Armonía</span>
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed mt-2.5 pt-2.5 border-t border-slate-800/80">{hint}</p>
    </div>
  );
};
