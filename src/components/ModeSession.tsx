import React, { useEffect, useRef, useState } from 'react';
import { Check, Lock } from 'lucide-react';
import { BALANCE } from '../game/balance';
import { ModeResult, ModeRun } from '../game/modes';
import { EnergyType } from '../types';
import { sound } from '../services/sound';

interface Props {
  run: ModeRun | null;
  result: ModeResult | null;
  creatureName: string;
  onFinish: (exits: number) => void;
  onAbandon: () => void;
  onCloseResult: () => void;
}

const ENERGY_LABEL: Record<EnergyType, string> = {
  enfoque: 'Enfoque',
  familia: 'Familia',
  creativo: 'Creativo',
  activo: 'Activo',
};

const clock = (ms: number): string => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-baseline justify-between gap-4 py-3">
    <dt className="text-[14px] text-bruma">{label}</dt>
    <dd className="tnum text-[15px] font-bold">{value}</dd>
  </div>
);

export const ModeSession: React.FC<Props> = ({
  run,
  result,
  creatureName,
  onFinish,
  onAbandon,
  onCloseResult,
}) => {
  const [now, setNow] = useState(() => Date.now());
  const [exits, setExits] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const exitsRef = useRef(0);
  const doneRef = useRef(false);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onFinishRef.current(exitsRef.current);
  };

  // Countdown
  useEffect(() => {
    if (!run) return;
    const endsAt = run.startedAt + run.option.minutes * 60_000;
    const tick = () => {
      const t = Date.now();
      setNow(t);
      if (t >= endsAt) finish();
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [run]);

  // The one real signal a web page has: leaving the app while the mode is on.
  useEffect(() => {
    if (!run) return;
    let wasHidden = document.visibilityState === 'hidden';
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        wasHidden = true;
      } else if (wasHidden) {
        wasHidden = false;
        exitsRef.current += 1;
        setExits(exitsRef.current);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [run]);

  if (result) {
    return (
      <div className="fixed inset-0 z-[70] animate-fade-in overflow-y-auto bg-arena select-none" role="dialog" aria-label="Modo completado">
        <div className="mx-auto flex min-h-full w-full max-w-[440px] flex-col px-6 pb-8 pt-12">
          <p className="text-[13px] text-bruma">{result.modeName}</p>
          <h2 className="ui-title mt-1 text-[32px] leading-tight tracking-tight">Bloque completo</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-bruma">
            {creatureName} recibió la energía de tu tiempo sin pantalla.
          </p>

          <dl className="mt-8 divide-y divide-trazo/70 border-y border-trazo/70">
            <Row label={`Energía · ${ENERGY_LABEL[result.category]}`} value={`+${result.energy - result.bonus}`} />
            {result.bonus > 0 && <Row label={`Racha de ${result.streak} días`} value={`+${result.bonus}`} />}
            <Row label="Balance de hábitos" value={`+${BALANCE.mode}`} />
            <Row label="Salidas de la app" value={result.exits === 0 ? 'Ninguna' : String(result.exits)} />
          </dl>

          <p className="mt-4 text-[13px] leading-snug text-bruma">
            Racha: {result.streak} {result.streak === 1 ? 'día' : 'días'} desconectado.
          </p>

          <button
            onClick={() => {
              sound.playTap();
              onCloseResult();
            }}
            className="btn-sello mt-auto w-full py-3.5 text-[15px]"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (!run) return null;

  const total = run.option.minutes * 60_000;
  const remaining = Math.max(0, run.startedAt + total - now);
  const progress = Math.min(1, 1 - remaining / total);

  return (
    <div
      className="fixed inset-0 z-[70] animate-drain overflow-y-auto bg-arena select-none"
      role="dialog"
      aria-label={`${run.mode.name} activo`}
    >
      <div className="mx-auto flex min-h-full w-full max-w-[440px] flex-col px-6 pb-8 pt-10">
        <p className="text-[13px] text-bruma">{run.mode.name}</p>
        <h2 className="ui-title mt-1 text-[26px] leading-tight tracking-tight">Teléfono en pausa</h2>

        <div className="relative mx-auto my-8 h-60 w-60">
          <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--color-trazo)" strokeWidth="3" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="var(--color-tinta)"
              strokeWidth="7"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={`${Math.max(progress * 100, 0.01)} 100`}
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dasharray 250ms linear' }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <p className="tnum text-[44px] font-bold leading-none tracking-tight" role="timer">
                {clock(remaining)}
              </p>
              <p className="mt-2 text-[13px] text-bruma">{creatureName} te espera</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 border-t border-trazo pt-5">
          <div>
            <p className="text-[13px] font-bold">Bloqueadas</p>
            <ul className="mt-2 space-y-1.5">
              {run.mode.blocked.map(app => (
                <li key={app} className="flex items-center gap-2 text-[14px] text-bruma">
                  <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="line-through decoration-bruma/50">{app}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[13px] font-bold">Disponibles</p>
            <ul className="mt-2 space-y-1.5">
              {run.mode.allowed.map(app => (
                <li key={app} className="flex items-center gap-2 text-[14px]">
                  <Check className="h-3.5 w-3.5 shrink-0 text-jade" aria-hidden="true" />
                  <span>{app}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {exits > 0 && (
          <p className="mt-5 text-[13px] text-bruma">
            Saliste de la app {exits} {exits === 1 ? 'vez' : 'veces'}.
          </p>
        )}

        <div className="mt-auto pt-8">
          {confirming ? (
            <div className="rounded-2xl bg-lino p-4 ring-1 ring-trazo">
              <p className="text-[14px] font-bold">¿Salir antes de tiempo?</p>
              <p className="mt-0.5 text-[13px] leading-snug text-bruma">
                No sumas energía y la Sombra gana terreno (balance {BALANCE.modeAbandoned}).
              </p>
              <div className="mt-3 flex gap-3">
                <button
                  onClick={() => setConfirming(false)}
                  className="btn-sello flex-1 py-2.5 text-[14px]"
                >
                  Seguir en pausa
                </button>
                <button
                  onClick={() => {
                    doneRef.current = true;
                    onAbandon();
                  }}
                  className="btn-contorno flex-1 py-2.5 text-[14px]"
                >
                  Salir
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => setConfirming(true)}
                className="text-[14px] text-bruma underline decoration-trazo underline-offset-4 hover:text-tinta"
              >
                Terminar antes
              </button>
              <button
                onClick={finish}
                title="Atajo de demo: salta al final del tiempo"
                className="text-[13px] text-bruma/80 hover:text-tinta"
              >
                Atajo demo: terminar ya
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
