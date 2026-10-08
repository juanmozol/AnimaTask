import React from 'react';
import { CreatureAlignment, EvolutionTier } from '../types';

interface Props {
  balance: number;
  tier: EvolutionTier;
  alignment: CreatureAlignment;
}

// The stone saturates at +/-40 so a few good (or bad) days are enough to see it move.
const RANGE = 40;

export const BalanceMeter: React.FC<Props> = ({ balance, tier, alignment }) => {
  const clamped = Math.max(-RANGE, Math.min(RANGE, balance));
  const pct = ((clamped + RANGE) / (RANGE * 2)) * 100;
  const pathLocked = tier >= 2;
  const leaning: CreatureAlignment = balance >= 0 ? 'harmony' : 'shadow';
  const shown = pathLocked ? alignment : leaning;

  const headline = pathLocked
    ? shown === 'harmony'
      ? balance < 0
        ? 'La Sombra acecha'
        : 'Senda de Armonía'
      : balance >= 0
        ? 'La Sombra retrocede'
        : 'Senda del Abismo'
    : shown === 'harmony'
      ? 'Vas hacia la Armonía'
      : 'La Sombra gana terreno';

  const hint = pathLocked
    ? shown === 'harmony'
      ? 'Sigue con tus tareas y tu familia. Si las descuidas y el balance llega a −20, tu criatura cae a la Sombra.'
      : 'Si vuelves a tus tareas y a tu familia, la Sombra retrocede paso a paso. Con el balance en +10, tu criatura regresa a la Armonía.'
    : 'Completa tareas y registra momentos en familia para inclinarte a la Armonía. Dejar tareas pendientes o pasar días sin familia te acerca a la Sombra. La senda se decide al evolucionar de Principal.';

  return (
    <section className="px-5 pt-9">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[15px] font-bold">Balance de hábitos</h3>
        <span className={`text-[13px] font-bold ${shown === 'harmony' ? 'text-curcuma-hondo' : 'text-humo'}`}>
          {headline}
        </span>
      </div>

      {/* A line between the two paths, and a stone that rests where the habits have put it */}
      <div className="relative mt-5 h-6">
        <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-gradient-to-r from-humo/60 via-trazo to-curcuma/75" />
        <div className="absolute left-1/2 top-1/2 h-3 w-px -translate-y-1/2 bg-piedra" />
        <div
          aria-label={`Balance ${balance}`}
          className={`absolute top-1/2 h-[18px] w-6 -translate-x-1/2 -translate-y-1/2 rounded-[50%_46%_52%_48%/58%_50%_50%_42%] ring-[5px] ring-arena transition-all duration-700 ease-out ${
            pathLocked ? 'bg-bruma' : 'bg-tinta'
          }`}
          style={{ left: `${pct}%` }}
        />
      </div>

      <div className="mt-1 flex justify-between text-xs text-bruma">
        <span>Sombra</span>
        <span className="tnum font-bold text-tinta">{balance > 0 ? `+${balance}` : balance}</span>
        <span>Armonía</span>
      </div>

      <p className="mt-4 text-[13px] leading-relaxed text-bruma">{hint}</p>
    </section>
  );
};
