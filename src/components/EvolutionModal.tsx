import React, { useState, useEffect } from 'react';
import { CreatureState } from '../types';
import { CREATURE_CATALOG, CreatureEvolutionInfo } from '../data/initialData';
import { sound } from '../services/sound';
import { Sparkles, Zap, Award, CheckCircle, ArrowRight } from 'lucide-react';

interface Props {
  currentCreature: CreatureState;
  nextCreatureInfo: CreatureEvolutionInfo;
  onConfirmEvolution: () => void;
  onClose: () => void;
}

export const EvolutionModal: React.FC<Props> = ({
  currentCreature,
  nextCreatureInfo,
  onConfirmEvolution,
  onClose,
}) => {
  const [phase, setPhase] = useState<'charging' | 'flash' | 'revealed'>('charging');
  const [confettiActive, setConfettiActive] = useState(false);

  useEffect(() => {
    // Start charge audio & animation
    sound.playEvolutionCharge();

    const flashTimer = setTimeout(() => {
      setPhase('flash');
    }, 2400);

    const revealTimer = setTimeout(() => {
      setPhase('revealed');
      sound.playEvolutionFanfare();
      setConfettiActive(true);
    }, 2800);

    return () => {
      clearTimeout(flashTimer);
      clearTimeout(revealTimer);
    };
  }, []);

  const handleFinish = () => {
    onConfirmEvolution();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-fade-in select-none">
      {/* Background Rotating Cosmic Aura */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -inset-[50%] opacity-40 bg-[conic-gradient(from_0deg,#38bdf8,#a855f7,#f43f5e,#10b981,#38bdf8)] transition-transform duration-1000 ${
            phase === 'charging' ? 'animate-[spin_4s_linear_infinite]' : 'animate-[spin_12s_linear_infinite]'
          }`}
          style={{ filter: 'blur(90px)' }}
        />
        {/* Particle Stars */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-25" />
      </div>

      {/* Screen White Flash */}
      {phase === 'flash' && (
        <div className="absolute inset-0 bg-white z-50 animate-ping opacity-90 duration-300" />
      )}

      {/* Main Container */}
      <div className="relative w-full max-w-sm bg-slate-900/90 border border-white/20 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center z-10 overflow-hidden">
        {/* Glow Halo behind Creature */}
        <div
          className="absolute w-64 h-64 rounded-full blur-3xl opacity-60 -top-10 transition-all duration-700"
          style={{ backgroundColor: nextCreatureInfo.colors.primary }}
        />

        {phase === 'charging' && (
          <div className="flex flex-col items-center py-8 space-y-6">
            <div className="relative">
              {/* Outer pulsing ring */}
              <div className="w-36 h-36 rounded-full border-4 border-indigo-500/40 animate-ping" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/50 animate-pulse">
                  <Zap className="w-12 h-12 text-white animate-bounce" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-indigo-400 font-black animate-pulse">
                Canalizando Esencia...
              </span>
              <h3 className="text-xl font-bold text-white">¡Mutación en Proceso!</h3>
              <p className="text-xs text-slate-300 max-w-xs">
                Tus hábitos y energías acumuladas están reconfigurando la estructura de tu compañero...
              </p>
            </div>

            {/* Convergence indicator */}
            <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div className="h-full bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-400 animate-[pulse_1s_ease-in-out_infinite] w-full" />
            </div>
          </div>
        )}

        {phase === 'revealed' && (
          <div className="flex flex-col items-center space-y-4 py-2 w-full animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>¡EVOLUCIÓN COMPLETADA!</span>
            </div>

            {/* Evolution Step Visualizer */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-medium text-slate-300">{currentCreature.name}</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-white">{nextCreatureInfo.name}</span>
            </div>

            {/* Creature Avatar Glow Box */}
            <div
              className="w-52 h-40 rounded-2xl flex items-center justify-center p-1.5 border border-white/20 shadow-2xl relative my-1 overflow-hidden"
              style={{
                background: `radial-gradient(circle, ${nextCreatureInfo.colors.glow}, rgba(15, 23, 42, 0.9))`,
              }}
            >
              {nextCreatureInfo.imageUrl ? (
                <img
                  src={nextCreatureInfo.imageUrl}
                  alt={nextCreatureInfo.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-4xl animate-bounce">✨</span>
                </div>
              )}
            </div>

            {/* Title & Lore */}
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white tracking-tight">
                {nextCreatureInfo.name}
              </h2>
              <p className="text-xs font-semibold text-cyan-400">{nextCreatureInfo.title}</p>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${nextCreatureInfo.alignment === 'shadow' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {nextCreatureInfo.elementLabel}
              </p>
              <p className="text-xs text-slate-300 px-2 line-clamp-2 mt-1">
                {nextCreatureInfo.description}
              </p>
            </div>

            {/* Newly Unlocked Ability Card */}
            <div className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl p-3 text-left space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Award className="w-3.5 h-3.5" />
                <span>Nueva Habilidad Desbloqueada:</span>
              </div>
              <p className="text-xs text-slate-200 font-medium">
                {nextCreatureInfo.specialAbility}
              </p>
            </div>

            {/* Finish Button */}
            <button
              onClick={handleFinish}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white font-bold text-sm shadow-lg shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Abrazar Nueva Forma</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
