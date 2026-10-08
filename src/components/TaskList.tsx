import React, { useState } from 'react';
import { Task, EnergyType } from '../types';
import { TaskCard } from './TaskCard';
import { sound } from '../services/sound';
import { Plus, Flame, Sparkles, Filter, X } from 'lucide-react';

interface Props {
  tasks: Task[];
  multiplierActive: boolean;
  multiplierSecondsLeft: number;
  onActivateMultiplier: () => void;
  onToggleComplete: (task: Task) => void;
  onAddTask: (newTask: Omit<Task, 'id' | 'isCompleted'>) => void;
}

export const TaskList: React.FC<Props> = ({
  tasks,
  multiplierActive,
  multiplierSecondsLeft,
  onActivateMultiplier,
  onToggleComplete,
  onAddTask,
}) => {
  const [filter, setFilter] = useState<'all' | EnergyType>('all');
  const [isAddingTask, setIsAddingTask] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<EnergyType>('enfoque');
  const [newIsHighPriority, setNewIsHighPriority] = useState(false);
  const [newReward, setNewReward] = useState(35);

  const filteredTasks = tasks.filter(t => (filter === 'all' ? true : t.category === filter));

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    sound.playTap();
    onAddTask({
      title: newTitle.trim(),
      description: newDesc.trim(),
      category: newCategory,
      energyReward: Number(newReward) || 30,
      isHighPriority: newIsHighPriority,
      isDaily: false,
    });

    setNewTitle('');
    setNewDesc('');
    setIsAddingTask(false);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-3">
      {/* MULTIPLIER X2 STATUS CARD */}
      <div
        className={`p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
          multiplierActive
            ? 'bg-gradient-to-r from-amber-950/60 via-orange-950/50 to-amber-900/40 border-amber-500/50 shadow-lg shadow-amber-500/15'
            : 'bg-slate-900/80 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl transition-all ${
                multiplierActive
                  ? 'bg-amber-500 text-slate-950 animate-bounce'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Flame className="w-5 h-5 fill-current" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-white">Multiplicador x2</h4>
                {multiplierActive ? (
                  <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 animate-pulse">
                    ACTIVO ({formatTimer(multiplierSecondsLeft)})
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-slate-400">En espera</span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Las tareas prioritarias duplican la velocidad de energía y maduración.
              </p>
            </div>
          </div>

          {!multiplierActive && (
            <button
              onClick={() => {
                sound.playMultiplierActivated();
                onActivateMultiplier();
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold whitespace-nowrap transition-colors"
            >
              Activar x2
            </button>
          )}
        </div>
      </div>

      {/* FILTER TABS & QUICK ADD BUTTON */}
      <div className="flex items-center justify-between gap-2">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {(
            [
              { id: 'all', label: 'Todas' },
              { id: 'enfoque', label: '🎯 Enfoque' },
              { id: 'familia', label: '👨‍👩‍👧 Familia' },
              { id: 'creativo', label: '🎨 Creativo' },
              { id: 'activo', label: '⚡ Activo' },
            ] as const
          ).map(tab => {
            const isSel = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playTap();
                  setFilter(tab.id);
                }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSel
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Add Task Button */}
        <button
          onClick={() => {
            sound.playTap();
            setIsAddingTask(prev => !prev);
          }}
          className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shrink-0 transition-transform active:scale-95 shadow-md shadow-indigo-500/20"
          title="Nueva tarea"
        >
          {isAddingTask ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {/* NEW TASK INLINE FORM */}
      {isAddingTask && (
        <form
          onSubmit={handleCreateTask}
          className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/30 shadow-xl space-y-3 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Registrar Nueva Misión Real</span>
            </h4>
            <span className="text-[10px] text-slate-400">Nutre a tu criatura</span>
          </div>

          <div>
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Ej: Terminar informe de Física o Leer 30 min"
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
            />
          </div>

          <div>
            <input
              type="text"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder="Descripción o detalle breve (opcional)"
              className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                Tipo de Energía
              </label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as EnergyType)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-400"
              >
                <option value="enfoque">🎯 Enfoque (Estudio/Trabajo)</option>
                <option value="familia">👨‍👩‍👧 Familia (Vínculo/Hogar)</option>
                <option value="creativo">🎨 Creativo (Arte/Diseño)</option>
                <option value="activo">⚡ Activo (Movimiento)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                Puntos de Energía
              </label>
              <input
                type="number"
                min="10"
                max="100"
                value={newReward}
                onChange={e => setNewReward(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-400 font-mono"
              />
            </div>
          </div>

          {/* High Priority Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={newIsHighPriority}
              onChange={e => setNewIsHighPriority(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0"
            />
            <span className="text-xs text-slate-300 font-medium">
              Marcar como <strong className="text-amber-300">Alta Prioridad (x2 Multiplicador)</strong>
            </span>
          </label>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-95"
          >
            Añadir Tarea
          </button>
        </form>
      )}

      {/* TASK CARDS FEED */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 bg-slate-900/40 rounded-2xl border border-slate-800 p-4">
            <p className="text-xs text-slate-400">No hay tareas en esta categoría.</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              multiplierActive={multiplierActive}
              onToggleComplete={onToggleComplete}
            />
          ))
        )}
      </div>
    </div>
  );
};
