import React from 'react';
import { CameraMission } from '../types';
import { CAMERA_MISSIONS } from '../data/initialData';
import { sound } from '../services/sound';
import { Camera, Sparkles, Scan, ArrowRight, Eye } from 'lucide-react';

interface Props {
  multiplierActive: boolean;
  onSelectMission: (mission: CameraMission) => void;
}

export const CameraMissionsView: React.FC<Props> = ({
  multiplierActive,
  onSelectMission,
}) => {
  return (
    <div className="space-y-4">
      {/* Hero Banner for Creative Camera */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-purple-900/60 via-indigo-950/70 to-slate-900 border border-purple-500/30 relative overflow-hidden shadow-lg">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-bold border border-purple-400/30">
            <Eye className="w-3.5 h-3.5" />
            <span>Exploración del Mundo Real</span>
          </div>

          <h3 className="text-base font-bold text-white tracking-tight">
            Misiones de Visión Creativa
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed">
            Conecta tu entorno físico con tu criatura. Escanea colores, texturas y objetos de estudio
            para desbloquear ráfagas de energía creativa.
          </p>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-purple-600/20 blur-2xl pointer-events-none" />
      </div>

      {/* Mission Cards List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Desafíos Disponibles Hoy
          </h4>
          <span className="text-[10px] text-purple-400 font-semibold">AR Sensor Listo</span>
        </div>

        {CAMERA_MISSIONS.map(m => {
          const reward = multiplierActive ? m.energyReward * 2 : m.energyReward;
          return (
            <div
              key={m.id}
              onClick={() => {
                sound.playTap();
                onSelectMission(m);
              }}
              className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900 transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform"
                  style={{
                    backgroundColor: `${m.targetColor}25`,
                    borderColor: m.targetColor,
                    borderWidth: 1,
                  }}
                >
                  <Camera className="w-5 h-5" style={{ color: m.targetColor }} />
                </div>

                <div>
                  <h5 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                    {m.title}
                  </h5>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                    {m.prompt}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-xs font-bold font-mono text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded-lg border border-purple-800/40">
                  +{reward} pts
                </span>
                <span className="text-[10px] text-slate-500 flex items-center gap-0.5 group-hover:text-purple-400 transition-colors">
                  <span>Escanear</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
