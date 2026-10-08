import React from 'react';
import { FamilyMoment, CreatureState } from '../types';
import { sound } from '../services/sound';

interface Props {
  creature: CreatureState;
  moments: FamilyMoment[];
  onOpenRegisterModal: () => void;
}

export const FamilyReconnectionView: React.FC<Props> = ({ creature, moments, onOpenRegisterModal }) => {
  return (
    <div className="space-y-9 pb-4">
      <div>
        <h2 className="ui-title text-[28px] leading-tight tracking-tight">Paternidad presente</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-bruma">
          La tecnología no debe aislar a tu familia. AnimaTask bloquea el avance evolutivo solitario para
          forzar recuerdos significativos, abrazos y conversaciones entre padres e hijos.
        </p>

        <button
          onClick={() => {
            sound.playTap();
            onOpenRegisterModal();
          }}
          className="btn-sello mt-5 px-6 py-3 text-[15px]"
        >
          Registrar momento de calidad
        </button>
      </div>

      {/* Shown only while the family lock is holding the evolution back */}
      {creature.isEvolutionLocked && (
        <div className="border-l-[3px] border-curcuma pl-4">
          <h5 className="text-[15px] font-bold">Evolución bloqueada: esperando un momento familiar</h5>
          <p className="mt-1 text-[14px] leading-relaxed text-bruma">
            {creature.lockReason ||
              'Se requiere una firma conjunta de padres e hijos para liberar el siguiente peldaño evolutivo.'}
          </p>
          <button
            onClick={() => {
              sound.playTap();
              onOpenRegisterModal();
            }}
            className="mt-2 text-[14px] font-bold text-curcuma-hondo underline decoration-curcuma/60 underline-offset-4"
          >
            Completar misión de reconexión ahora
          </button>
        </div>
      )}

      <div>
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-[15px] font-bold">Bitácora de recuerdos ({moments.length})</h3>
          <span className="text-[13px] text-bruma">+100 Familia por momento</span>
        </div>

        {moments.length === 0 ? (
          <div className="mt-3 border-t border-trazo/70 py-10 text-center">
            <p className="text-[15px]">Aún no hay momentos familiares registrados.</p>
            <p className="mt-1 text-[14px] text-bruma">
              Toca «Registrar momento de calidad» para guardar el primero.
            </p>
          </div>
        ) : (
          <ul className="mt-2 divide-y divide-trazo/70 border-t border-trazo/70">
            {moments.map(m => (
              <li key={m.id} className="py-4">
                <div className="flex items-baseline justify-between gap-3">
                  <h5 className="text-base font-bold leading-snug">{m.title}</h5>
                  <span className="flex shrink-0 items-center gap-1.5 text-xs text-bruma">
                    <span className="h-1.5 w-1.5 rounded-full bg-rubia" />
                    {m.emotion}
                  </span>
                </div>

                <blockquote className="mt-2 border-l-2 border-trazo pl-3 text-[14px] leading-relaxed text-bruma">
                  {m.reflection}
                </blockquote>

                <p className="mt-2 text-xs text-bruma">
                  Firmado por {m.parentName}, {m.createdAt}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
