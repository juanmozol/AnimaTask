import React, { useState } from 'react';
import { FamilyMoment } from '../types';
import { sound } from '../services/sound';
import { Heart, Users, ShieldCheck, Sparkles, X, CheckCircle, Smile, BookOpen, Coffee, Sun } from 'lucide-react';

interface Props {
  isLocked: boolean;
  onSaveMoment: (moment: Omit<FamilyMoment, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

export const FamilyReconnectionModal: React.FC<Props> = ({
  isLocked,
  onSaveMoment,
  onClose,
}) => {
  const [selectedActivity, setSelectedActivity] = useState<string>(
    '15 min de charla sin teléfonos ni pantallas'
  );
  const [parentName, setParentName] = useState<string>('Papá / Mamá');
  const [reflection, setReflection] = useState<string>(
    'Nos sentamos a conversar sobre nuestros momentos favoritos del día y nos dimos un fuerte abrazo.'
  );
  const [emotion, setEmotion] = useState<FamilyMoment['emotion']>('Conectados');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const activities = [
    { id: '1', title: '15 min de charla sin teléfonos', icon: Coffee },
    { id: '2', title: 'Cocinando o merendando en equipo', icon: Sun },
    { id: '3', title: 'Lectura o juego de mesa conjunto', icon: BookOpen },
    { id: '4', title: 'Caminata y respiración compartida', icon: Users },
  ];

  const emotions: Array<FamilyMoment['emotion']> = [
    'Conectados',
    'Agradecidos',
    'Inspirados',
    'Tranquilos',
    'Divertidos',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playFamilyReconnection();
    setIsSubmitted(true);

    setTimeout(() => {
      onSaveMoment({
        title: selectedActivity,
        reflection,
        parentName,
        emotion,
        unlockedEvolution: isLocked,
      });
      onClose();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-sm bg-slate-900 border border-rose-900/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-rose-900/30 bg-rose-950/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <Heart className="w-4 h-4 fill-rose-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Módulo de Paternidad Presente</h3>
              <p className="text-[10px] text-rose-300">Misión de Valoración de Momentos</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lock Alert Banner if evolution is locked */}
        {isLocked && (
          <div className="p-3 bg-amber-500/10 border-b border-amber-500/20 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200">
              <strong className="text-white">¡Pausa evolutiva consciente!</strong> Para evitar el
              aislamiento en pantallas, la criatura requiere un momento de calidad real con los
              padres para continuar su desarrollo.
            </p>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4">
          {/* Activity Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              1. Selecciona la Dinámica Compartida
            </label>
            <div className="grid grid-cols-2 gap-2">
              {activities.map(act => {
                const isSel = selectedActivity === act.title;
                const Icon = act.icon;
                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      setSelectedActivity(act.title);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                      isSel
                        ? 'bg-rose-500/20 border-rose-400 text-white shadow-sm'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSel ? 'text-rose-400' : 'text-slate-400'}`} />
                    <span className="text-[11px] font-medium leading-snug">{act.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Parent Signature Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              2. Nombre del Padre / Madre o Tutor
            </label>
            <input
              type="text"
              value={parentName}
              onChange={e => setParentName(e.target.value)}
              placeholder="Ej: Mamá Laura o Papá Carlos"
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
            />
          </div>

          {/* Reflection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              3. Registro de Valoración del Momento
            </label>
            <textarea
              rows={3}
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              placeholder="¿Qué compartieron? ¿Qué sintieron juntos durante este espacio?"
              required
              className="w-full p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400 resize-none leading-relaxed"
            />
          </div>

          {/* Emotion pill selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              4. Emoción Primaria Sentida
            </label>
            <div className="flex flex-wrap gap-1.5">
              {emotions.map(em => (
                <button
                  key={em}
                  type="button"
                  onClick={() => {
                    sound.playTap();
                    setEmotion(em);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    emotion === em
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitted}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-sm shadow-lg shadow-rose-500/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {isSubmitted ? (
                <>
                  <CheckCircle className="w-4 h-4 animate-bounce" />
                  <span>¡Momento Validado y Desbloqueado!</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {isLocked ? 'Firmar y Liberar Progreso Evolutivo' : 'Guardar Recuerdo Familiar (+100 Familia)'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
