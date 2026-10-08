import React from 'react';
import { Task, EnergyType } from '../types';
import { sound } from '../services/sound';
import { Target, Heart, Palette, Zap, Check, Flame } from 'lucide-react';

interface Props {
  task: Task;
  multiplierActive: boolean;
  onToggleComplete: (task: Task) => void;
}

export const TaskCard: React.FC<Props> = ({
  task,
  multiplierActive,
  onToggleComplete,
}) => {
  const getCategoryConfig = (cat: EnergyType) => {
    switch (cat) {
      case 'enfoque':
        return {
          label: 'Enfoque',
          icon: Target,
          color: 'text-cyan-400',
          border: 'border-cyan-500/30',
          badgeBg: 'bg-cyan-500/10 text-cyan-300',
        };
      case 'familia':
        return {
          label: 'Familia',
          icon: Heart,
          color: 'text-rose-400',
          border: 'border-rose-500/30',
          badgeBg: 'bg-rose-500/10 text-rose-300',
        };
      case 'creativo':
        return {
          label: 'Creativo',
          icon: Palette,
          color: 'text-purple-400',
          border: 'border-purple-500/30',
          badgeBg: 'bg-purple-500/10 text-purple-300',
        };
      case 'activo':
        return {
          label: 'Activo',
          icon: Zap,
          color: 'text-emerald-400',
          border: 'border-emerald-500/30',
          badgeBg: 'bg-emerald-500/10 text-emerald-300',
        };
    }
  };

  const cfg = getCategoryConfig(task.category);
  const Icon = cfg.icon;

  const isBoosted = multiplierActive || task.isHighPriority;
  const rewardAmount = isBoosted ? task.energyReward * 2 : task.energyReward;

  const handleClick = () => {
    sound.playTap();
    onToggleComplete(task);
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none ${
        task.isCompleted
          ? 'bg-slate-900/40 border-slate-800/60 opacity-65'
          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:shadow-lg'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Interactive Checkbox Circle */}
        <div
          className={`w-6 h-6 rounded-lg mt-0.5 flex items-center justify-center transition-all ${
            task.isCompleted
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
              : 'border-2 border-slate-700 bg-slate-800/80 group-hover:border-slate-500'
          }`}
        >
          {task.isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            {/* Category tag */}
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md ${cfg.badgeBg}`}
            >
              <Icon className="w-3 h-3" />
              <span>{cfg.label}</span>
            </span>

            {/* High Priority Multiplier Tag */}
            {task.isHighPriority && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
                <Flame className="w-3 h-3 fill-amber-400" />
                <span>Alta Prioridad · x2</span>
              </span>
            )}
          </div>

          <h4
            className={`text-sm font-semibold leading-snug tracking-tight transition-colors ${
              task.isCompleted ? 'text-slate-500 line-through' : 'text-white'
            }`}
          >
            {task.title}
          </h4>

          {task.description && (
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>

        {/* Reward Pill */}
        <div className="text-right shrink-0">
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-bold font-mono px-2 py-1 rounded-lg ${
              isBoosted
                ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            <span>+{rewardAmount}</span>
            <span className="text-[10px] font-normal text-slate-400">pts</span>
          </span>
        </div>
      </div>
    </div>
  );
};
