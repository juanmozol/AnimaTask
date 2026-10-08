import React from 'react';
import { FamilyMoment, CreatureState } from '../types';
import { sound } from '../services/sound';
import { Heart, Users, ShieldAlert, Sparkles, Plus, Clock, Smile } from 'lucide-react';

interface Props {
  creature: CreatureState;
  moments: FamilyMoment[];
  onOpenRegisterModal: () => void;
}

export const FamilyReconnectionView: React.FC<Props> = ({
  creature,
  moments,
  onOpenRegisterModal,
}) => {
  return (
    <div className="space-y-4">
      {/* Hero Banner for Family Reconnection */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-rose-950/70 via-pink-950/50 to-slate-900 border border-rose-500/30 relative overflow-hidden shadow-lg">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-bold border border-rose-400/30">
            <Heart className="w-3.5 h-3.5 fill-rose-400" />
            <span>Paternidad Presente · Conexión Real</span>
          </div>

          <h3 className="text-base font-bold text-white tracking-tight">
            Módulo de Valoración de Momentos
          </h3>

          <p className="text-xs text-rose-200/90 leading-relaxed">
            La tecnología no debe aislar a tu familia. AnimaTask bloquea el avance evolutivo solitario
            para forzar recuerdos significativos, abrazos y conversaciones entre padres e hijos.
          </p>

          <div className="pt-1">
            <button
              onClick={() => {
                sound.playTap();
                onOpenRegisterModal();
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs shadow-md shadow-rose-500/25 flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Momento de Calidad</span>
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-rose-600/20 blur-2xl pointer-events-none" />
      </div>

      {/* Lock Warning if currently locked */}
      {creature.isEvolutionLocked && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 animate-pulse">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="text-xs font-bold text-amber-300">
              Evolución Bloqueada: Esperando Momento Familiar
            </h5>
            <p className="text-xs text-slate-300 leading-snug">
              {creature.lockReason || 'Se requiere una firma conjunta de padres e hijos para liberar el siguiente peldaño evolutivo.'}
            </p>
            <button
              onClick={() => {
                sound.playTap();
                onOpenRegisterModal();
              }}
              className="mt-1 text-xs font-bold text-amber-400 hover:text-amber-300 underline"
            >
              Completar Misión de Reconexión Ahora →
            </button>
          </div>
        </div>
      )}

      {/* Family Memory Album Feed */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Bitácora de Recuerdos ({moments.length})
          </h4>
          <span className="text-[10px] text-rose-400 font-semibold">+100 Familia por Momento</span>
        </div>

        {moments.length === 0 ? (
          <div className="text-center py-8 bg-slate-900/40 rounded-2xl border border-slate-800 p-4">
            <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Aún no hay momentos familiares registrados.</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Haz clic en "Registrar Momento de Calidad" para guardar el primero.
            </p>
          </div>
        ) : (
          moments.map(m => (
            <div
              key={m.id}
              className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-rose-500/20 text-rose-400 text-xs">
                    <Heart className="w-3.5 h-3.5 fill-rose-400" />
                  </span>
                  <h5 className="text-xs font-bold text-white">{m.title}</h5>
                </div>

                <span className="text-[10px] font-semibold text-rose-300 bg-rose-950 px-2 py-0.5 rounded-full border border-rose-800/40 flex items-center gap-1">
                  <Smile className="w-3 h-3" />
                  <span>{m.emotion}</span>
                </span>
              </div>

              <p className="text-xs text-slate-300 italic leading-relaxed">
                "{m.reflection}"
              </p>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                <span>Firmado por: <strong className="text-slate-400">{m.parentName}</strong></span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{m.createdAt}</span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
