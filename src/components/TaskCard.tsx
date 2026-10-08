import React, { useState } from 'react';
import { Activity, MapPin, Plane } from 'lucide-react';
import { Task, EnergyType, TaskBarrier } from '../types';
import { BALANCE } from '../game/balance';
import { describeBarrier } from '../game/barriers';
import { sound } from '../services/sound';

interface Props {
  task: Task;
  multiplierActive: boolean;
  onToggleComplete: (task: Task) => void;
  onAbandon?: (task: Task) => void;
  onDelete?: (task: Task) => void; // only passed for user-created tasks
}

// A small hand-drawn waste basket, in the app's line style (no icon library).
const TrashMark: React.FC = () => (
  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 6 h12" />
    <path d="M8 6 V4.5 h4 V6" />
    <path d="M5.4 6 l0.8 9.5 h7.6 l0.8 -9.5" />
    <path d="M8.4 9 v4 M11.6 9 v4" />
  </svg>
);

const CATEGORY: Record<EnergyType, { label: string; dot: string }> = {
  enfoque: { label: 'Enfoque', dot: 'bg-anil' },
  familia: { label: 'Familia', dot: 'bg-rubia' },
  creativo: { label: 'Creativo', dot: 'bg-cochinilla' },
  activo: { label: 'Activo', dot: 'bg-musgo' },
};

const BARRIER_ICON: Record<TaskBarrier['kind'], React.ComponentType<{ className?: string }>> = {
  place: MapPin,
  move: Activity,
  offline: Plane,
};

// An open circle that closes in one stroke when the task is done, like an enso.
const CheckRing: React.FC<{ done: boolean }> = ({ done }) => (
  <svg viewBox="0 0 28 28" className="ui-ring mt-0.5 h-7 w-7 shrink-0" aria-hidden="true">
    <circle cx="14" cy="14" r="11" fill={done ? 'var(--color-jade)' : 'none'} fillOpacity={0.12} stroke="var(--color-piedra)" strokeWidth="1.5" />
    <circle
      cx="14"
      cy="14"
      r="11"
      fill="none"
      stroke="var(--color-jade)"
      strokeWidth="2.6"
      strokeLinecap="round"
      pathLength={100}
      strokeDasharray={`${done ? 93 : 0.01} 100`}
      strokeOpacity={done ? 1 : 0}
      transform="rotate(-120 14 14)"
      style={{ transition: 'stroke-dasharray 450ms ease-out, stroke-opacity 150ms' }}
    />
    <path
      d="M9.6 14.4 l3 3 l5.8 -6.4"
      fill="none"
      stroke="var(--color-jade)"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ opacity: done ? 1 : 0, transition: 'opacity 300ms ease-out 150ms' }}
    />
  </svg>
);

export const TaskCard: React.FC<Props> = ({ task, multiplierActive, onToggleComplete, onAbandon, onDelete }) => {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const cfg = CATEGORY[task.category];
  const barrier = task.barrier ? describeBarrier(task.barrier) : null;
  const BarrierIcon = task.barrier ? BARRIER_ICON[task.barrier.kind] : null;
  const pendingBarrier = !!task.barrier && !task.isCompleted;
  const locked = !!task.barrier && task.isCompleted; // a barrier task cannot be undone

  const isBoosted = multiplierActive || task.isHighPriority;
  const rewardAmount = isBoosted ? task.energyReward * 2 : task.energyReward;
  const dailyCost = Math.abs(task.isHighPriority ? BALANCE.missedPriorityTask : BALANCE.missedTask);

  const handleToggle = () => {
    if (locked) return;
    sound.playTap();
    onToggleComplete(task);
  };

  return (
    <div
      role={pendingBarrier ? 'button' : 'checkbox'}
      aria-checked={pendingBarrier ? undefined : task.isCompleted}
      aria-disabled={locked || undefined}
      aria-label={pendingBarrier && barrier ? `Cumplir ${task.title}. Barrera: ${barrier.name}` : undefined}
      tabIndex={0}
      onClick={handleToggle}
      onKeyDown={e => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleToggle();
        }
      }}
      className={`ui-row flex select-none items-start gap-4 py-4 transition-opacity duration-300 ${
        locked ? 'cursor-default' : 'cursor-pointer'
      } ${task.isCompleted ? 'opacity-55' : ''}`}
    >
      <CheckRing done={task.isCompleted} />

      <div className="min-w-0 flex-1">
        <h4
          className={`text-base font-bold leading-snug ${
            task.isCompleted ? 'line-through decoration-bruma/60 decoration-1' : ''
          }`}
        >
          {task.title}
        </h4>

        {task.description && (
          <p className="mt-0.5 line-clamp-2 text-[14px] leading-relaxed text-bruma">{task.description}</p>
        )}

        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-bruma">
          <span className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
          {task.isHighPriority && <span className="font-bold text-curcuma-hondo">Alta prioridad x2</span>}
        </div>

        {barrier && BarrierIcon && task.barrier && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="flex items-center gap-1.5 font-bold text-tinta" data-barrier={task.barrier.kind}>
              <BarrierIcon className="h-3.5 w-3.5" />
              {barrier.name}
            </span>
            <span className="text-bruma">{barrier.detail}</span>
          </div>
        )}

        {pendingBarrier && (
          <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[12px] text-bruma">
            <span>Pendiente: cada día cuesta {dailyCost} de balance.</span>
            {onAbandon && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  sound.playTap();
                  onAbandon(task);
                }}
                onKeyDown={e => e.stopPropagation()}
                className="underline decoration-trazo underline-offset-4 hover:text-tinta"
              >
                Abandonar
              </button>
            )}
          </div>
        )}

        {locked && task.proof?.photo && (
          <img
            src={task.proof.photo}
            alt="Foto de prueba"
            className="mt-2 h-14 w-14 rounded-xl object-cover ring-1 ring-trazo"
          />
        )}

        {/* Delete confirmation, in the same row — never a blocking window.confirm */}
        {confirmingDelete && onDelete && (
          <div
            className="mt-2.5 flex items-center gap-4 text-[13px]"
            onClick={e => e.stopPropagation()}
            onKeyDown={e => e.stopPropagation()}
          >
            <span className="font-bold text-tinta">¿Eliminar misión?</span>
            <button
              onClick={() => onDelete(task)}
              className="font-bold text-rubia underline decoration-rubia/50 underline-offset-4"
            >
              Sí
            </button>
            <button
              onClick={() => setConfirmingDelete(false)}
              className="text-bruma underline decoration-trazo underline-offset-4 hover:text-tinta"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2 leading-tight">
        <div className="text-right">
          <span className={`tnum text-[15px] font-bold ${isBoosted ? 'text-curcuma-hondo' : ''}`}>+{rewardAmount}</span>
          <span className="block text-[11px] text-bruma">pts</span>
        </div>
        {onDelete && !confirmingDelete && (
          <button
            aria-label="Eliminar misión"
            title="Eliminar misión"
            onClick={e => {
              e.stopPropagation();
              sound.playTap();
              setConfirmingDelete(true);
            }}
            onKeyDown={e => e.stopPropagation()}
            className="-mb-0.5 -mr-1 rounded-md p-1 text-bruma/55 transition-colors hover:text-rubia"
          >
            <TrashMark />
          </button>
        )}
      </div>
    </div>
  );
};
