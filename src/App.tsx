import { createPortal } from 'react-dom';
import React, { useState, useEffect, useRef } from 'react';
import { CreatureState, CreatureAlignment, Task, CameraMission, FamilyMoment, EnergyType, EvolutionBranch, EvolutionTier } from './types';
import { INITIAL_TASKS, SAMPLE_FAMILY_MOMENTS, CREATURE_CATALOG, MAX_TIER, CreatureEvolutionInfo, getCatalogKey } from './data/initialData';
import { BALANCE, GameClock, DayEndReport, addDays, clampBalance, computeDayEnd, dayKey, daysBetween, defaultClock, pathFromBalance, taskBalance } from './game/balance';
import { AppShell } from './components/AppShell';
import { CreatureDisplay } from './components/CreatureDisplay';
import { EnergyBreakdown } from './components/EnergyBreakdown';
import { BalanceMeter } from './components/BalanceMeter';
import { TaskList } from './components/TaskList';
import { CameraMissionsView } from './components/CameraMissionsView';
import { CameraMissionModal } from './components/CameraMissionModal';
import { FamilyReconnectionView } from './components/FamilyReconnectionView';
import { FamilyReconnectionModal } from './components/FamilyReconnectionModal';
import { EvolutionModal } from './components/EvolutionModal';
import { ExportModal } from './components/ExportModal';
import { sound } from './services/sound';

// localStorage can throw (blocked storage, private mode, some in-app browsers,
// quota). The app must keep working without persistence instead of crashing.
function loadSaved<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* persistence is best-effort */
  }
}

const DEFAULT_CREATURE: CreatureState = {
  id: 'companion-1',
  speciesId: 'numbik',
  alignment: 'harmony',
  balance: 0,
  name: CREATURE_CATALOG['numbik_0'].name,
  title: CREATURE_CATALOG['numbik_0'].title,
  tier: 0,
  branch: 'neutral',
  description: CREATURE_CATALOG['numbik_0'].description,
  specialAbility: CREATURE_CATALOG['numbik_0'].specialAbility,
  energies: {
    enfoque: 25,
    familia: 20,
    creativo: 15,
    activo: 15,
  },
  totalEnergy: 75,
  nextTierThreshold: 100,
  isEvolutionLocked: false,
  mood: 'happy',
};

// Name, title, description and ability always follow the catalog entry that
// matches the creature's species / tier / branch / alignment.
function withCatalogIdentity(c: CreatureState): CreatureState {
  const info = CREATURE_CATALOG[getCatalogKey(c.speciesId, c.tier, c.branch, c.alignment)];
  if (!info) return c;
  return {
    ...c,
    branch: info.branch,
    name: info.name,
    title: info.title,
    description: info.description,
    specialAbility: info.specialAbility,
  };
}

// Saves from earlier versions: no balance (the path used to be a manual toggle) and
// possibly another species or the old 3-stage tree. Numbik is the only playable species now.
function migrateCreature(saved: Partial<CreatureState>): CreatureState {
  const merged = { ...DEFAULT_CREATURE, ...saved } as CreatureState;
  if (saved.balance !== undefined && saved.speciesId === 'numbik' && saved.alignment) return merged;
  return withCatalogIdentity({
    ...merged,
    speciesId: 'numbik',
    alignment: saved.alignment ?? 'harmony',
    balance: saved.balance ?? (saved.alignment === 'shadow' ? -10 : 0),
  });
}

export default function App() {
  // Navigation tab
  const [currentTab, setCurrentTab] = useState<'creature' | 'tasks' | 'camera' | 'family'>('creature');

  // Creature State
  const [creature, setCreature] = useState<CreatureState>(() => {
    const saved = loadSaved<Partial<CreatureState>>('animatask_creature');
    return saved ? migrateCreature(saved) : DEFAULT_CREATURE;
  });

  // Task list
  const [tasks, setTasks] = useState<Task[]>(() => loadSaved<Task[]>('animatask_tasks') ?? INITIAL_TASKS);

  // Family moments album
  const [familyMoments, setFamilyMoments] = useState<FamilyMoment[]>(
    () => loadSaved<FamilyMoment[]>('animatask_moments') ?? SAMPLE_FAMILY_MOMENTS
  );

  // Day clock (for "procrastination" and "days without family")
  const [game, setGame] = useState<GameClock>(() => loadSaved<GameClock>('animatask_game') ?? defaultClock());
  const [dayReport, setDayReport] = useState<DayEndReport | null>(null);

  // Latest state for timer callbacks
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;
  const gameRef = useRef(game);
  gameRef.current = game;

  // Multiplier x2 state
  const [multiplierActive, setMultiplierActive] = useState<boolean>(false);
  const [multiplierSecondsLeft, setMultiplierSecondsLeft] = useState<number>(0);

  // Modals state
  const [activeCameraMission, setActiveCameraMission] = useState<CameraMission | null>(null);
  const [showFamilyModal, setShowFamilyModal] = useState<boolean>(false);
  const [showEvolutionModal, setShowEvolutionModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    save('animatask_creature', creature);
  }, [creature]);

  useEffect(() => {
    save('animatask_tasks', tasks);
  }, [tasks]);

  useEffect(() => {
    save('animatask_moments', familyMoments);
  }, [familyMoments]);

  useEffect(() => {
    save('animatask_game', game);
  }, [game]);

  // Close finished days: pending daily tasks and missing family time lower the balance.
  const closeDays = (days: number, newLastDay?: string) => {
    if (days <= 0) return;
    const g = gameRef.current;
    const report = computeDayEnd(tasksRef.current, g.lastFamilyDay, g.lastDay, days);
    const next: GameClock = { ...g, lastDay: newLastDay ?? addDays(g.lastDay, days) };
    gameRef.current = next; // guards against a double call before the next render
    setGame(next);
    setCreature(prev => ({ ...prev, balance: clampBalance(prev.balance + report.delta) }));
    setTasks(prev => prev.map(t => (t.isDaily ? { ...t, isCompleted: false, awardedEnergy: undefined } : t)));
    setDayReport(report);
  };

  // Real midnight: check on load, every minute and when the tab becomes visible again.
  useEffect(() => {
    const check = () => {
      const today = dayKey();
      const elapsed = daysBetween(gameRef.current.lastDay, today);
      if (elapsed > 0) closeDays(Math.min(elapsed, BALANCE.maxCatchUpDays), today);
    };
    check();
    const interval = setInterval(check, 60_000);
    document.addEventListener('visibilitychange', check);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', check);
    };
  }, []);

  useEffect(() => {
    if (!dayReport) return;
    const timer = setTimeout(() => setDayReport(null), 7000);
    return () => clearTimeout(timer);
  }, [dayReport]);

  // Countdown timer for x2 Multiplier
  useEffect(() => {
    if (!multiplierActive || multiplierSecondsLeft <= 0) return;
    const interval = setInterval(() => {
      setMultiplierSecondsLeft(prev => {
        if (prev <= 1) {
          setMultiplierActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [multiplierActive, multiplierSecondsLeft]);

  // Determine dominant energy
  const getDominantEnergy = (): EnergyType => {
    const { enfoque, familia, creativo, activo } = creature.energies;
    const maxVal = Math.max(enfoque, familia, creativo, activo);
    if (enfoque === maxVal) return 'enfoque';
    if (familia === maxVal) return 'familia';
    if (creativo === maxVal) return 'creativo';
    return 'activo';
  };

  const dominantEnergy = getDominantEnergy();

  // Determine next evolution target
  const getNextEvolutionInfo = (): CreatureEvolutionInfo => {
    const nextTier = (Math.min(MAX_TIER, creature.tier + 1)) as EvolutionTier;
    // The path is decided by habits when leaving Principal (stage 1); afterwards it is fixed.
    const path = creature.tier <= 1 ? pathFromBalance(creature.balance) : creature.alignment;
    const targetBranch: EvolutionBranch = nextTier === 1 ? 'neutral' : dominantEnergy;
    const catalogKey = getCatalogKey(creature.speciesId, nextTier, targetBranch, path);
    return CREATURE_CATALOG[catalogKey] || CREATURE_CATALOG['numbik_1'];
  };

  const canEvolve = creature.totalEnergy >= creature.nextTierThreshold && !creature.isEvolutionLocked && creature.tier < MAX_TIER;

  // Multiplier activation
  const activateMultiplier = (durationSec = 180) => {
    setMultiplierActive(true);
    setMultiplierSecondsLeft(durationSec);
  };

  // Add energy to creature
  const grantEnergy = (category: EnergyType, amount: number, balanceDelta = 0) => {
    setCreature(prev => {
      const newEnergies = {
        ...prev.energies,
        [category]: prev.energies[category] + amount,
      };
      const newTotal = prev.totalEnergy + amount;

      // Special Paternidad Presente condition:
      // If Brote (Tier 1) reaches 220 energy and isn't locked, activate mandatory Family Lock!
      let isLocked = prev.isEvolutionLocked;
      let lockReason = prev.lockReason;
      if (prev.tier === 1 && newTotal >= 220 && !prev.isEvolutionLocked && familyMoments.length <= 1) {
        isLocked = true;
        lockReason = 'Pausa evolutiva consciente: Se requiere una Misión de Valoración de Momentos con los padres para liberar la rama especializada.';
      }

      return {
        ...prev,
        energies: newEnergies,
        totalEnergy: newTotal,
        balance: clampBalance(prev.balance + balanceDelta),
        isEvolutionLocked: isLocked,
        lockReason,
      };
    });
  };

  // Task completion toggle
  const handleToggleTask = (task: Task) => {
    const isNowCompleted = !task.isCompleted;

    if (isNowCompleted) {
      const isBoosted = multiplierActive || task.isHighPriority;
      const points = isBoosted ? task.energyReward * 2 : task.energyReward;

      setTasks(prev =>
        prev.map(t => (t.id === task.id ? { ...t, isCompleted: true, awardedEnergy: points } : t))
      );

      sound.playTaskComplete(isBoosted);
      grantEnergy(task.category, points, taskBalance(task));

      // If completing a high priority task, also trigger or extend multiplier boost!
      if (task.isHighPriority && !multiplierActive) {
        sound.playMultiplierActivated();
        activateMultiplier(180);
      }
    } else {
      // Refund exactly what was granted (the x2 boost may have changed since).
      const refund = task.awardedEnergy ?? task.energyReward;

      setTasks(prev =>
        prev.map(t => (t.id === task.id ? { ...t, isCompleted: false, awardedEnergy: undefined } : t))
      );

      setCreature(prev => ({
        ...prev,
        energies: {
          ...prev.energies,
          [task.category]: Math.max(0, prev.energies[task.category] - refund),
        },
        totalEnergy: Math.max(0, prev.totalEnergy - refund),
        balance: clampBalance(prev.balance - taskBalance(task)),
      }));
    }
  };

  // Add custom task
  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'isCompleted'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: `custom-task-${Date.now()}`,
      isCompleted: false,
    };
    setTasks(prev => [newTask, ...prev]);
  };

  // Camera mission completion
  const handleCompleteCameraMission = (mission: CameraMission, earnedEnergy: number) => {
    grantEnergy(mission.rewardCategory, earnedEnergy, BALANCE.camera);
  };

  // Family Moment Save & Unlock
  const handleSaveFamilyMoment = (momentData: Omit<FamilyMoment, 'id' | 'createdAt'>) => {
    const newMoment: FamilyMoment = {
      ...momentData,
      id: `moment-${Date.now()}`,
      createdAt: 'Hace un momento',
    };

    setFamilyMoments(prev => [newMoment, ...prev]);
    grantEnergy('familia', 120, BALANCE.family);
    setGame(g => ({ ...g, lastFamilyDay: dayKey() }));

    // Liberar bloqueo evolutivo
    setCreature(prev => ({
      ...prev,
      isEvolutionLocked: false,
      lockReason: undefined,
    }));
  };

  // Evolution confirmation
  const handleConfirmEvolution = () => {
    const nextInfo = getNextEvolutionInfo();
    const nextThresholds: Record<EvolutionTier, number> = {
      0: 100,
      1: 300,
      2: 750,
      3: 1500,
      4: 3000, // final form: unused
    };

    setCreature(prev => ({
      ...prev,
      name: nextInfo.name,
      title: nextInfo.title,
      tier: nextInfo.tier,
      branch: nextInfo.branch,
      alignment: nextInfo.alignment ?? prev.alignment,
      description: nextInfo.description,
      specialAbility: nextInfo.specialAbility,
      nextTierThreshold: nextThresholds[nextInfo.tier],
    }));
  };

  // Quick Cheat Boost for instantaneous demo verification
  const handleQuickCheatBoost = () => {
    sound.playTaskComplete(true);
    grantEnergy(dominantEnergy, 60);
  };

  // Demo: close the current day right now
  const handleSimulateDayEnd = () => {
    sound.playTap();
    closeDays(1);
  };

  // Demo: choose the good (harmony) or bad (shadow) version.
  // Before the fork (egg / Principal) it steers the next evolution; after it, the current
  // form is swapped for its twin on the other path.
  const demoPath: CreatureAlignment = creature.tier <= 1 ? pathFromBalance(creature.balance) : creature.alignment;

  const handleSetPath = (path: CreatureAlignment) => {
    sound.playTap();
    const balance = path === 'harmony' ? 60 : -60;
    setCreature(prev =>
      prev.tier <= 1 ? { ...prev, balance } : withCatalogIdentity({ ...prev, balance, alignment: path })
    );
  };

  // Demo: fill the energy up to the next threshold and open the evolution right away
  const handleEvolveNow = () => {
    if (creature.tier >= MAX_TIER) return;
    sound.playTaskComplete(true);
    setCreature(prev => {
      const missing = Math.max(0, prev.nextTierThreshold - prev.totalEnergy);
      return {
        ...prev,
        energies: { ...prev.energies, [dominantEnergy]: prev.energies[dominantEnergy] + missing },
        totalEnergy: prev.totalEnergy + missing,
        isEvolutionLocked: false,
        lockReason: undefined,
      };
    });
    setShowEvolutionModal(true);
  };

  // Reset demo state
  const handleResetDemo = () => {
    try {
      localStorage.removeItem('animatask_creature');
      localStorage.removeItem('animatask_tasks');
      localStorage.removeItem('animatask_moments');
      localStorage.removeItem('animatask_game');
    } catch {
      /* storage unavailable: nothing to clear */
    }
    window.location.reload();
  };

  return (
    <AppShell
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      multiplierActive={multiplierActive}
      onOpenExport={() => setShowExportModal(true)}
      onQuickCheatBoost={handleQuickCheatBoost}
      onSimulateDayEnd={handleSimulateDayEnd}
      onResetDemo={handleResetDemo}
      demoPath={demoPath}
      onSetPath={handleSetPath}
      onEvolveNow={handleEvolveNow}
      canEvolveNow={creature.tier < MAX_TIER}
    >
      {/* TAB 1: CREATURE SANCTUARY */}
      {currentTab === 'creature' && (
        <div className="animate-fade-in">
          <CreatureDisplay
            creature={creature}
            canEvolve={canEvolve}
            onOpenEvolution={() => setShowEvolutionModal(true)}
            onOpenFamilyUnlock={() => setShowFamilyModal(true)}
          />

          <BalanceMeter balance={creature.balance} tier={creature.tier} alignment={creature.alignment} />

          <EnergyBreakdown
            energies={creature.energies}
            dominantEnergy={dominantEnergy}
          />
        </div>
      )}

      {/* TAB 2: TASKS & MISSIONS */}
      {currentTab === 'tasks' && (
        <div className="animate-fade-in px-5 pt-2">
          <TaskList
            tasks={tasks}
            multiplierActive={multiplierActive}
            multiplierSecondsLeft={multiplierSecondsLeft}
            onActivateMultiplier={() => activateMultiplier(180)}
            onToggleComplete={handleToggleTask}
            onAddTask={handleAddTask}
          />
        </div>
      )}

      {/* TAB 3: CREATIVE CAMERA MISSIONS */}
      {currentTab === 'camera' && (
        <div className="animate-fade-in px-5 pt-2">
          <CameraMissionsView
            multiplierActive={multiplierActive}
            onSelectMission={mission => setActiveCameraMission(mission)}
          />
        </div>
      )}

      {/* TAB 4: FAMILY RECONNECTION (PATERNIDAD PRESENTE) */}
      {currentTab === 'family' && (
        <div className="animate-fade-in px-5 pt-2">
          <FamilyReconnectionView
            creature={creature}
            moments={familyMoments}
            onOpenRegisterModal={() => setShowFamilyModal(true)}
          />
        </div>
      )}

      {/* CAMERA SCANNER MODAL */}
      {activeCameraMission && (
        <CameraMissionModal
          mission={activeCameraMission}
          multiplierActive={multiplierActive}
          onComplete={handleCompleteCameraMission}
          onClose={() => setActiveCameraMission(null)}
        />
      )}

      {/* FAMILY RECONNECTION MOMENT MODAL */}
      {showFamilyModal && (
        <FamilyReconnectionModal
          isLocked={creature.isEvolutionLocked}
          onSaveMoment={handleSaveFamilyMoment}
          onClose={() => setShowFamilyModal(false)}
        />
      )}

      {/* EVOLUTION CUTSCENE MODAL */}
      {showEvolutionModal && (
        <EvolutionModal
          currentCreature={creature}
          nextCreatureInfo={getNextEvolutionInfo()}
          onConfirmEvolution={handleConfirmEvolution}
          onClose={() => setShowEvolutionModal(false)}
        />
      )}

      {/* EXPORT STANDALONE HTML FOR GITHUB PAGES MODAL */}
      {showExportModal && (
        <ExportModal onClose={() => setShowExportModal(false)} />
      )}
      {/* END-OF-DAY REPORT (portal: escapes the frame's stacking context so it sits above the header) */}
      {dayReport && createPortal(
        <div
          role="status"
          onClick={() => setDayReport(null)}
          className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-1/2 z-[60] w-[calc(100%-2.5rem)] max-w-[22rem] -translate-x-1/2 animate-fade-in cursor-pointer rounded-2xl bg-tinta px-5 py-3.5 text-lino shadow-[0_18px_40px_-16px_rgba(45,38,32,0.6)]"
        >
          <p className="text-[15px] font-bold">Fin del día</p>
          {dayReport.delta < 0 ? (
            <p className="mt-0.5 text-[13px] leading-snug text-lino/80">
              Balance {dayReport.delta}
              {dayReport.missedTasks > 0 && `, ${dayReport.missedTasks} tarea${dayReport.missedTasks > 1 ? 's' : ''} sin completar`}
              {dayReport.noFamilyDays > 0 && ', sin tiempo en familia'}
            </p>
          ) : (
            <p className="mt-0.5 text-[13px] leading-snug text-lino/80">Sin penalizaciones. ¡Buen día!</p>
          )}
        </div>
      , document.body)}
    </AppShell>
  );
}
