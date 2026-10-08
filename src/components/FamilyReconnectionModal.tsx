import React, { useState } from 'react';
import { FamilyMoment } from '../types';
import { sound } from '../services/sound';
import { X, BookOpen, Coffee, Sun, Footprints } from 'lucide-react';

interface Props {
  isLocked: boolean;
  onSaveMoment: (moment: Omit<FamilyMoment, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

const activities = [
  { id: '1', title: '15 min de charla sin teléfonos', icon: Coffee },
  { id: '2', title: 'Cocinando o merendando en equipo', icon: Sun },
  { id: '3', title: 'Lectura o juego de mesa conjunto', icon: BookOpen },
  { id: '4', title: 'Caminata y respiración compartida', icon: Footprints },
];

const emotions: Array<FamilyMoment['emotion']> = ['Conectados', 'Agradecidos', 'Inspirados', 'Tranquilos', 'Divertidos'];

const label = 'block text-[13px] font-bold';

export const FamilyReconnectionModal: React.FC<Props> = ({ isLocked, onSaveMoment, onClose }) => {
  const [selectedActivity, setSelectedActivity] = useState<string>('15 min de charla sin teléfonos');
  const [parentName, setParentName] = useState<string>('Papá / Mamá');
  const [reflection, setReflection] = useState<string>(
    'Nos sentamos a conversar sobre nuestros momentos favoritos del día y nos dimos un fuerte abrazo.'
  );
  const [emotion, setEmotion] = useState<FamilyMoment['emotion']>('Conectados');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

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
    <div className="fixed inset-0 z-50 flex animate-fade-in select-none items-end justify-center bg-tinta/55 sm:items-center">
      <div
        role="dialog"
        aria-label="Paternidad presente"
        className="flex max-h-[94dvh] w-full max-w-[440px] animate-sheet-up flex-col overflow-hidden rounded-t-[28px] bg-lino sm:rounded-[28px]"
      >
        <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-5">
          <div>
            <h3 className="ui-title text-[19px] leading-tight">Paternidad presente</h3>
            <p className="text-[13px] text-bruma">Misión de valoración de momentos</p>
          </div>

          <button
            onClick={onClose}
            className="-mr-2 grid h-9 w-9 place-items-center rounded-full text-bruma transition-colors hover:bg-tinta/5 hover:text-tinta"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLocked && (
          <div className="mx-5 mb-2 border-l-[3px] border-curcuma pl-4">
            <p className="text-[14px] leading-relaxed text-bruma">
              <strong className="font-bold text-tinta">Pausa evolutiva consciente.</strong> Para evitar el
              aislamiento en pantallas, la criatura requiere un momento de calidad real con los padres para
              continuar su desarrollo.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto px-5 pb-6 pt-3">
          <fieldset>
            <legend className={label}>Dinámica compartida</legend>
            <div role="radiogroup" className="mt-1 divide-y divide-trazo/70 border-y border-trazo/70">
              {activities.map(act => {
                const isSel = selectedActivity === act.title;
                const Icon = act.icon;
                return (
                  <button
                    key={act.id}
                    type="button"
                    role="radio"
                    aria-checked={isSel}
                    onClick={() => {
                      sound.playTap();
                      setSelectedActivity(act.title);
                    }}
                    className="flex w-full items-center gap-3 py-3 text-left"
                  >
                    <Icon className={`h-[18px] w-[18px] shrink-0 ${isSel ? 'text-jade' : 'text-bruma'}`} />
                    <span className={`flex-1 text-[14px] ${isSel ? 'font-bold' : 'text-bruma'}`}>{act.title}</span>
                    <span
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-[1.5px] ${
                        isSel ? 'border-jade' : 'border-piedra'
                      }`}
                    >
                      <span className={`h-2.5 w-2.5 rounded-full transition-colors ${isSel ? 'bg-jade' : 'bg-transparent'}`} />
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <label className="block">
            <span className={label}>Nombre del padre, madre o tutor</span>
            <input
              type="text"
              value={parentName}
              onChange={e => setParentName(e.target.value)}
              placeholder="Ej: Mamá Laura o Papá Carlos"
              required
              className="mt-1 w-full border-0 border-b border-piedra bg-transparent px-0 py-2 text-[15px] placeholder:text-bruma/70 focus:border-jade focus:outline-none focus-visible:outline-none"
            />
          </label>

          <label className="block">
            <span className={label}>Cómo fue el momento</span>
            <textarea
              rows={3}
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              placeholder="¿Qué compartieron? ¿Qué sintieron juntos durante este espacio?"
              required
              className="mt-2 w-full resize-none rounded-xl bg-arena/60 p-3 text-[14px] leading-relaxed ring-1 ring-trazo placeholder:text-bruma/70 focus:outline-none focus:ring-2 focus:ring-jade"
            />
          </label>

          <fieldset>
            <legend className={label}>Emoción principal</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {emotions.map(em => (
                <button
                  key={em}
                  type="button"
                  aria-pressed={emotion === em}
                  onClick={() => {
                    sound.playTap();
                    setEmotion(em);
                  }}
                  className="chip"
                >
                  {em}
                </button>
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={isSubmitted}
            className="btn-sello w-full py-3.5 text-[15px]"
          >
            {isSubmitted
              ? '¡Momento validado y desbloqueado!'
              : isLocked
                ? 'Firmar y liberar progreso evolutivo'
                : 'Guardar recuerdo familiar (+100 Familia)'}
          </button>
        </form>
      </div>
    </div>
  );
};
