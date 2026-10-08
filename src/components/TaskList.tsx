import React, { useState } from 'react';
import { Task, EnergyType } from '../types';
import { TaskCard } from './TaskCard';
import { sound } from '../services/sound';
import { Plus, X } from 'lucide-react';

interface Props {
  tasks: Task[];
  multiplierActive: boolean;
  multiplierSecondsLeft: number;
  onActivateMultiplier: () => void;
  onToggleComplete: (task: Task) => void;
  onAddTask: (newTask: Omit<Task, 'id' | 'isCompleted'>) => void;
}

const FILTERS: Array<{ id: 'all' | EnergyType; label: string }> = [
  { id: 'all', label: 'Todas' },
  { id: 'enfoque', label: 'Enfoque' },
  { id: 'familia', label: 'Familia' },
  { id: 'creativo', label: 'Creativo' },
  { id: 'activo', label: 'Activo' },
];

const field =
  'w-full border-0 border-b border-piedra bg-transparent px-0 py-2 text-[15px] placeholder:text-bruma/70 focus:border-jade focus:outline-none focus-visible:outline-none';

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
  const doneCount = tasks.filter(t => t.isCompleted).length;
  const rawToday = new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
  const today = rawToday.charAt(0).toUpperCase() + rawToday.slice(1);

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
    <div className="space-y-7 pb-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-bold leading-tight tracking-tight">Hoy</h2>
          <p className="text-[15px] text-bruma">{today}</p>
          <p className="tnum mt-1 text-[13px] text-bruma">
            <strong className="font-bold text-tinta">{doneCount}</strong> de {tasks.length} hechas
          </p>
        </div>

        <button
          onClick={() => {
            sound.playTap();
            setIsAddingTask(prev => !prev);
          }}
          className="mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-jade text-lino transition-transform active:scale-90"
          title="Nueva tarea"
          aria-label="Nueva tarea"
        >
          {isAddingTask ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        </button>
      </div>

      {/* Multiplier */}
      <div
        className={`flex items-center justify-between gap-4 rounded-2xl px-4 py-3.5 transition-colors duration-300 ${
          multiplierActive ? 'bg-curcuma/15 ring-1 ring-curcuma/50' : 'ring-1 ring-trazo'
        }`}
      >
        <div>
          <h4 className="text-[15px] font-bold">
            Multiplicador x2{' '}
            {multiplierActive ? (
              <span className="tnum text-curcuma-hondo">activo {formatTimer(multiplierSecondsLeft)}</span>
            ) : (
              <span className="font-medium text-bruma">en espera</span>
            )}
          </h4>
          <p className="mt-0.5 text-[13px] leading-snug text-bruma">
            Las tareas prioritarias duplican la velocidad de energía y maduración.
          </p>
        </div>

        {!multiplierActive && (
          <button
            onClick={() => {
              sound.playMultiplierActivated();
              onActivateMultiplier();
            }}
            className="shrink-0 whitespace-nowrap rounded-full border border-tinta px-4 py-2 text-[13px] font-bold transition-colors hover:bg-tinta hover:text-lino"
          >
            Activar x2
          </button>
        )}
      </div>

      {/* New task */}
      {isAddingTask && (
        <form
          onSubmit={handleCreateTask}
          className="animate-fade-in space-y-5 rounded-2xl bg-lino p-5 ring-1 ring-trazo"
        >
          <div>
            <h4 className="text-[15px] font-bold">Nueva misión real</h4>
            <p className="text-[13px] text-bruma">Cada tarea que cumples nutre a tu criatura.</p>
          </div>

          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Ej: terminar el informe de Física o leer 30 min"
            required
            className={field}
          />

          <input
            type="text"
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            placeholder="Detalle breve (opcional)"
            className={field}
          />

          <div className="grid grid-cols-2 gap-5">
            <label className="block">
              <span className="text-xs text-bruma">Tipo de energía</span>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as EnergyType)}
                className={`${field} mt-1`}
              >
                <option value="enfoque">Enfoque</option>
                <option value="familia">Familia</option>
                <option value="creativo">Creativo</option>
                <option value="activo">Activo</option>
              </select>
            </label>

            <label className="block">
              <span className="text-xs text-bruma">Puntos de energía</span>
              <input
                type="number"
                min="10"
                max="100"
                value={newReward}
                onChange={e => setNewReward(Number(e.target.value))}
                className={`${field} tnum mt-1`}
              />
            </label>
          </div>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={newIsHighPriority}
              onChange={e => setNewIsHighPriority(e.target.checked)}
              className="h-4 w-4 accent-jade"
            />
            <span className="text-[14px]">
              Alta prioridad <span className="text-bruma">(multiplicador x2)</span>
            </span>
          </label>

          <button
            type="submit"
            className="w-full rounded-full bg-jade py-3 text-[15px] font-bold text-lino transition-transform active:scale-[0.98]"
          >
            Añadir tarea
          </button>
        </form>
      )}

      {/* Filters and tasks share one rule */}
      <div>
        <div className="no-scrollbar flex items-center gap-6 overflow-x-auto border-b border-trazo">
          {FILTERS.map(tab => {
            const isSel = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playTap();
                  setFilter(tab.id);
                }}
                className={`-mb-px whitespace-nowrap border-b-2 pb-2.5 pt-1 text-[14px] transition-colors ${
                  isSel ? 'border-tinta font-bold text-tinta' : 'border-transparent text-bruma hover:text-tinta'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="divide-y divide-trazo/70">
          {filteredTasks.length === 0 ? (
            <p className="py-10 text-center text-[14px] text-bruma">No hay tareas en esta categoría.</p>
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
    </div>
  );
};
