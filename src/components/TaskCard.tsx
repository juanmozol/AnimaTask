import React from 'react';
import { Task, EnergyType } from '../types';
import { sound } from '../services/sound';

interface Props {
  task: Task;
  multiplierActive: boolean;
  onToggleComplete: (task: Task) => void;
}

const CATEGORY: Record<EnergyType, { label: string; dot: string }> = {
  enfoque: { label: 'Enfoque', dot: 'bg-anil' },
  familia: { label: 'Familia', dot: 'bg-rubia' },
  creativo: { label: 'Creativo', dot: 'bg-cochinilla' },
  activo: { label: 'Activo', dot: 'bg-musgo' },
};

// An open circle that closes in one stroke when the task is done, like an enso.
const CheckRing: React.FC<{ done: boolean }> = ({ done }) => (
  <svg viewBox="0 0 28 28" className="mt-0.5 h-7 w-7 shrink-0" aria-hidden="true">
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

export const TaskCard: React.FC<Props> = ({ task, multiplierActive, onToggleComplete }) => {
  const cfg = CATEGORY[task.category];

  const isBoosted = multiplierActive || task.isHighPriority;
  const rewardAmount = isBoosted ? task.energyReward * 2 : task.energyReward;

  const handleToggle = () => {
    sound.playTap();
    onToggleComplete(task);
  };

  return (
    <div
      role="checkbox"
      aria-checked={task.isCompleted}
      tabIndex={0}
      onClick={handleToggle}
      onKeyDown={e => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleToggle();
        }
      }}
      className={`flex cursor-pointer select-none items-start gap-4 py-4 transition-opacity duration-300 ${
        task.isCompleted ? 'opacity-55' : ''
      }`}
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
      </div>

      <div className="shrink-0 text-right leading-tight">
        <span className={`tnum text-[15px] font-bold ${isBoosted ? 'text-curcuma-hondo' : ''}`}>+{rewardAmount}</span>
        <span className="block text-[11px] text-bruma">pts</span>
      </div>
    </div>
  );
};
