import React from 'react';
import { EnergyBalance, EnergyType } from '../types';

interface Props {
  energies: EnergyBalance;
  dominantEnergy: EnergyType;
}

// Natural-dye pigments: indigo, madder, cochineal, moss.
const ENERGIES: Array<{ type: EnergyType; label: string; sublabel: string; color: string }> = [
  { type: 'enfoque', label: 'Enfoque', sublabel: 'Académico y profesional', color: 'bg-anil' },
  { type: 'familia', label: 'Familia', sublabel: 'Reconexión y calidad', color: 'bg-rubia' },
  { type: 'creativo', label: 'Creativo', sublabel: 'Arte, cámara y 3D', color: 'bg-cochinilla' },
  { type: 'activo', label: 'Activo', sublabel: 'Ejercicio y deporte', color: 'bg-musgo' },
];

export const EnergyBreakdown: React.FC<Props> = ({ energies, dominantEnergy }) => {
  const dominant = ENERGIES.find(e => e.type === dominantEnergy) ?? ENERGIES[0];
  const others = ENERGIES.filter(e => e.type !== dominant.type);
  const summary = ENERGIES.map(e => `${e.label} ${energies[e.type]}`).join(', ');

  return (
    <section className="px-5 pb-6 pt-9 select-none">
      <h3 className="text-[15px] font-bold">Energías</h3>

      {/* One strip: each energy takes the share of the whole that it has earned */}
      <div role="img" aria-label={summary} className="mt-4 flex h-[10px] gap-[3px]">
        {ENERGIES.map(cfg => (
          <div
            key={cfg.type}
            className={`${cfg.color} rounded-[3px] transition-[flex-grow] duration-700 ease-out`}
            style={{ flexGrow: Math.max(energies[cfg.type], 0.01), flexBasis: 0, minWidth: energies[cfg.type] > 0 ? 6 : 0 }}
          />
        ))}
      </div>

      {/* The one that leads gets the room; the rest are a line each */}
      <div className="mt-5 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[13px] text-bruma">Domina</p>
          <p className="flex items-center gap-2 text-[24px] font-bold leading-tight">
            <span className={`h-3 w-3 shrink-0 rounded-[4px] ${dominant.color}`} />
            {dominant.label}
          </p>
          <p className="text-[13px] text-bruma">{dominant.sublabel}</p>
        </div>
        <p className="tnum text-[40px] font-bold leading-none">{energies[dominant.type]}</p>
      </div>

      <ul className="mt-5 space-y-2.5 border-t border-trazo/70 pt-4">
        {others.map(cfg => (
          <li key={cfg.type} className="flex items-baseline justify-between gap-3">
            <span className="flex min-w-0 items-baseline gap-2.5">
              <span className={`h-2 w-2 shrink-0 translate-y-px rounded-[3px] ${cfg.color}`} />
              <span className="font-bold">{cfg.label}</span>
              <span className="truncate text-[13px] text-bruma">{cfg.sublabel}</span>
            </span>
            <span className="tnum font-bold">{energies[cfg.type]}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};
