import React, { useState } from 'react';
import { Task, EnergyType } from '../types';
import { TaskCard } from './TaskCard';
import { BarrierPicker } from './BarrierPicker';
import { BarrierDraft, EMPTY_DRAFT, draftToBarrier } from '../game/barriers';
import { isUserTask } from '../game/balance';
import { sound } from '../services/sound';

interface Props {
  tasks: Task[];
  multiplierActive: boolean;
  multiplierSecondsLeft: number;
  onActivateMultiplier: () => void;
  onToggleComplete: (task: Task) => void;
  onAddTask: (newTask: Omit<Task, 'id' | 'isCompleted'>) => void;
  onAbandon: (task: Task) => void;
  onDelete: (task: Task) => void;
  onOpenPermissions: () => void;
}

const FILTERS: Array<{ id: 'all' | EnergyType; label: string }> = [
  { id: 'all', label: 'Todas' },
  { id: 'enfoque', label: 'Enfoque' },
  { id: 'familia', label: 'Familia' },
  { id: 'creativo', label: 'Creativo' },
  { id: 'activo', label: 'Activo' },
];

// The brush stroke shared with the creature's progress line.
const BRUSH = 'M4 8 C 60 4, 110 11, 170 7 S 290 4, 396 8';

const field =
  'w-full border-0 border-b border-piedra bg-transparent px-0 py-2 text-[15px] placeholder:text-bruma/70 focus:border-jade focus:outline-none focus-visible:outline-none';

export const TaskList: React.FC<Props> = ({
  tasks,
  multiplierActive,
  multiplierSecondsLeft,
  onActivateMultiplier,
  onToggleComplete,
  onAddTask,
  onAbandon,
  onDelete,
  onOpenPermissions,
}) => {
  const [filter, setFilter] = useState<'all' | EnergyType>('all');
  const [isAddingTask, setIsAddingTask] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<EnergyType>('enfoque');
  const [newIsHighPriority, setNewIsHighPriority] = useState(false);
  const [newReward, setNewReward] = useState(35);
  const [draft, setDraft] = useState<BarrierDraft>(EMPTY_DRAFT);
  const barrier = draftToBarrier(draft);

  const filteredTasks = tasks.filter(t => (filter === 'all' ? true : t.category === filter));
  const doneCount = tasks.filter(t => t.isCompleted).length;
  const rawToday = new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
  const today = rawToday.charAt(0).toUpperCase() + rawToday.slice(1);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || barrier === 'incomplete') return;

    sound.playTap();
    onAddTask({
      title: newTitle.trim(),
      description: newDesc.trim(),
      category: newCategory,
      energyReward: Number(newReward) || 30,
      isHighPriority: newIsHighPriority,
      isDaily: false,
      ...(barrier ? { barrier } : {}),
    });

    setNewTitle('');
    setNewDesc('');
    setNewIsHighPriority(false);
    setDraft(EMPTY_DRAFT);
    setIsAddingTask(false);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-7 pb-4">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="ui-title text-[28px] leading-tight tracking-tight">Hoy</h2>
            <p className="text-[15px] text-bruma">{today}</p>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              setIsAddingTask(prev => !prev);
            }}
            className="btn-sello mt-1 shrink-0 px-4 py-2 text-[13px]"
            title="Nueva tarea"
            aria-label="Nueva tarea"
            aria-expanded={isAddingTask}
          >
            {isAddingTask ? 'Cerrar' : 'Nueva tarea'}
          </button>
        </div>

        {/* The day as one brush stroke: the same one that paints the creature's progress */}
        <svg viewBox="0 0 400 14" className="mt-4 block w-full" aria-hidden="true">
          <path d={BRUSH} pathLength={100} fill="none" stroke="var(--color-trazo)" strokeWidth={3} strokeLinecap="round" />
          <path
            d={BRUSH}
            pathLength={100}
            fill="none"
            stroke="var(--color-jade)"
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={`${tasks.length ? Math.max((doneCount / tasks.length) * 100, 0.01) : 0.01} 100`}
            style={{ transition: 'stroke-dasharray 600ms ease-out' }}
          />
        </svg>
        <p className="tnum mt-1.5 text-[13px] text-bruma">
          <strong className="font-bold text-tinta">{doneCount}</strong> de {tasks.length} hechas
        </p>
      </div>

      {/* Multiplier: a line in the page, not a card; it only colors itself while it is on */}
      <div
        className={`flex items-center justify-between gap-4 border-y py-3.5 transition-colors duration-300 ${
          multiplierActive ? '-mx-3 border-curcuma/50 bg-curcuma/10 px-3' : 'border-trazo/70'
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
            className="btn-contorno shrink-0 whitespace-nowrap px-4 py-2 text-[13px]"
          >
            Activar x2
          </button>
        )}
      </div>

      {/* New task */}
      {isAddingTask && (
        <form
          onSubmit={handleCreateTask}
          className="animate-fade-in space-y-5 border-l-[3px] border-jade pl-4"
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
              className="check-sello"
            />
            <span className="text-[14px]">
              Alta prioridad <span className="text-bruma">(multiplicador x2)</span>
            </span>
          </label>

          <BarrierPicker value={draft} onChange={setDraft} />

          <button
            type="submit"
            disabled={barrier === 'incomplete'}
            className="btn-sello w-full py-3 text-[15px]"
          >
            Añadir tarea
          </button>
          {barrier === 'incomplete' && (
            <p className="-mt-2 text-center text-[12px] text-bruma">Ancla el lugar para poder añadirla.</p>
          )}
        </form>
      )}

      {/* Nothing left to do: the whole list is empty */}
      {tasks.length === 0 ? (
        <div className="border-t border-trazo pt-10 text-center">
          <p className="text-[15px] text-bruma">Aún no has creado misiones.</p>
          <button
            onClick={() => {
              sound.playTap();
              setIsAddingTask(true);
            }}
            className="btn-sello mt-5 px-5 py-2.5 text-[14px]"
          >
            Crear mi primera misión
          </button>
        </div>
      ) : (
      /* Filters and tasks share one rule */
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
                onAbandon={onAbandon}
                onDelete={isUserTask(task) ? onDelete : undefined}
              />
            ))
          )}
        </div>
      </div>
      )}

      {/* Setup, not part of the day: it lives at the end */}
      <div>
        <button
          onClick={() => {
            sound.playTap();
            onOpenPermissions();
          }}
          className="btn-trazo text-[13px] font-medium"
        >
          Permisos del dispositivo
        </button>
        <p className="mt-1.5 text-[12px] leading-snug text-bruma">Ubicación, cámara y movimiento para las barreras.</p>
      </div>
    </div>
  );
};
