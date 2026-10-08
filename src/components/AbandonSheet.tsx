import React, { useEffect, useRef, useState } from 'react';
import { Sheet } from './Sheet';
import { Task } from '../types';
import { BALANCE } from '../game/balance';

interface Props {
  task: Task;
  onConfirm: () => void;
  onClose: () => void;
}

const HOLD_MS = 3000;

/** Giving up a task has a price and takes three seconds of holding, so it cannot happen by accident. */
export const AbandonSheet: React.FC<Props> = ({ task, onConfirm, onClose }) => {
  const penalty = Math.abs(task.isHighPriority ? BALANCE.abandonPriority : BALANCE.abandon);
  const [progress, setProgress] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const firedRef = useRef(false);

  const stop = () => {
    startRef.current = null;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (!firedRef.current) setProgress(0);
  };

  const tick = () => {
    if (startRef.current === null) return;
    const p = Math.min(1, (performance.now() - startRef.current) / HOLD_MS);
    setProgress(p);
    if (p >= 1) {
      firedRef.current = true;
      startRef.current = null;
      onConfirm();
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  };

  const begin = () => {
    if (firedRef.current || startRef.current !== null) return;
    startRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <Sheet title="Abandonar la tarea" subtitle={task.title} onClose={onClose}>
      <p className="text-[15px] leading-relaxed">
        Esta tarea tiene una barrera, así que no se puede borrar gratis. Abandonarla cuesta{' '}
        <strong className="tnum">{penalty} de balance</strong> y la Sombra gana terreno.
      </p>
      <p className="mt-2 text-[13px] leading-snug text-bruma">
        Si prefieres cumplirla, vuelve y pasa la barrera: es la única forma de sumar energía.
      </p>

      <div className="mt-5 flex gap-3">
        <button onClick={onClose} className="btn-sello flex-1 py-3.5 text-[15px]">
          Mantener la tarea
        </button>
        <button
          onPointerDown={begin}
          onPointerUp={stop}
          onPointerLeave={stop}
          onPointerCancel={stop}
          onKeyDown={e => {
            if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
              e.preventDefault();
              begin();
            }
          }}
          onKeyUp={e => {
            if (e.key === ' ' || e.key === 'Enter') stop();
          }}
          onContextMenu={e => e.preventDefault()}
          className="cut relative flex-1 touch-none overflow-hidden border-[1.5px] border-rubia py-3.5 text-[15px] font-bold text-rubia"
          aria-label="Mantén presionado 3 segundos para abandonar"
        >
          <span
            aria-hidden="true"
            className="absolute inset-y-0 left-0 bg-rubia/20"
            style={{ width: `${progress * 100}%` }}
          />
          <span className="relative">{progress > 0 ? 'Sigue presionando...' : 'Mantén para abandonar'}</span>
        </button>
      </div>
    </Sheet>
  );
};
