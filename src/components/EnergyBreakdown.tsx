import React from 'react';
import { EnergyBalance, EnergyType } from '../types';
import { Target, Heart, Palette, Zap, Sparkles } from 'lucide-react';

interface Props {
  energies: EnergyBalance;
  dominantEnergy: EnergyType;
}

export const EnergyBreakdown: React.FC<Props> = ({ energies, dominantEnergy }) => {
  const energyConfigs: Array<{
    type: EnergyType;
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
    value: number;
    accentColor: string;
    dotColor: string;
  }> = [
    {
      type: 'enfoque',
      label: 'Enfoque',
      sublabel: 'Académico & Profesional',
      icon: Target,
      value: energies.enfoque,
      accentColor: 'text-cyan-400',
      dotColor: 'bg-cyan-400',
    },
    {
      type: 'familia',
      label: 'Familia',
      sublabel: 'Reconexión & Calidad',
      icon: Heart,
      value: energies.familia,
      accentColor: 'text-rose-400',
      dotColor: 'bg-rose-400',
    },
    {
      type: 'creativo',
      label: 'Creativo',
      sublabel: 'Arte, Cámara & 3D',
      icon: Palette,
      value: energies.creativo,
      accentColor: 'text-purple-400',
      dotColor: 'bg-purple-400',
    },
    {
      type: 'activo',
      label: 'Activo',
      sublabel: 'Ejercicio & Deporte',
      icon: Zap,
      value: energies.activo,
      accentColor: 'text-emerald-400',
      dotColor: 'bg-emerald-400',
    },
  ];

  const maxVal = Math.max(1, ...Object.values(energies));

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm select-none">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-slate-400" />
          <span>Matriz de Energías</span>
        </h3>
        <span className="text-[11px] text-slate-400">
          Dominante: <strong className="text-white capitalize">{dominantEnergy}</strong>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {energyConfigs.map(cfg => {
          const isDominant = cfg.type === dominantEnergy;
          const percentage = Math.round((cfg.value / Math.max(100, maxVal * 1.2)) * 100);

          return (
            <div
              key={cfg.type}
              className={`p-3 rounded-xl border transition-all ${
                isDominant
                  ? 'bg-slate-800/80 border-slate-700 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800/80'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${cfg.dotColor}`} />
                  <span className="text-xs font-semibold text-slate-200">{cfg.label}</span>
                </div>
                <span className="text-xs font-bold text-white font-mono">{cfg.value}</span>
              </div>

              {/* Minimal bar */}
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${cfg.dotColor} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(100, percentage)}%` }}
                />
              </div>

              <p className="text-[10px] text-slate-500 mt-1 truncate">{cfg.sublabel}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
