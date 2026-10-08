import React, { useState, useEffect } from 'react';
import { CreatureState, CreatureAlignment, Task, CameraMission, FamilyMoment, EnergyType, EvolutionBranch, EvolutionTier } from './types';
import { INITIAL_TASKS, SAMPLE_FAMILY_MOMENTS, CREATURE_CATALOG, AVAILABLE_SPECIES, CreatureEvolutionInfo, getCatalogKey } from './data/initialData';
import { PhoneFrame } from './components/PhoneFrame';
import { CreatureDisplay } from './components/CreatureDisplay';
import { EnergyBreakdown } from './components/EnergyBreakdown';
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

// Saves from earlier versions have no speciesId / alignment.
function migrateCreature(saved: Partial<CreatureState>): CreatureState {
  const merged = { ...DEFAULT_CREATURE, ...saved } as CreatureState;
  if (saved.speciesId && saved.alignment) return merged;
  return withCatalogIdentity({
    ...merged,
    speciesId: saved.speciesId ?? 'numbik',
    alignment: saved.alignment ?? 'harmony',
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
    const nextTier = (Math.min(3, creature.tier + 1)) as EvolutionTier;
    // Numbik follows the Senda (alignment) the player chose; other species follow the dominant energy.
    const targetBranch: EvolutionBranch = nextTier === 1 ? 'neutral' : dominantEnergy;
    const catalogKey = getCatalogKey(creature.speciesId, nextTier, targetBranch, creature.alignment);
    return CREATURE_CATALOG[catalogKey] || CREATURE_CATALOG['numbik_1'];
  };

  const canEvolve = creature.totalEnergy >= creature.nextTierThreshold && !creature.isEvolutionLocked && creature.tier < 3;

  // Multiplier activation
  const activateMultiplier = (durationSec = 180) => {
    setMultiplierActive(true);
    setMultiplierSecondsLeft(durationSec);
  };

  // Add energy to creature
  const grantEnergy = (category: EnergyType, amount: number) => {
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
      grantEnergy(task.category, points);

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
    grantEnergy(mission.rewardCategory, earnedEnergy);
  };

  // Family Moment Save & Unlock
  const handleSaveFamilyMoment = (momentData: Omit<FamilyMoment, 'id' | 'createdAt'>) => {
    const newMoment: FamilyMoment = {
      ...momentData,
      id: `moment-${Date.now()}`,
      createdAt: 'Hace un momento',
    };

    setFamilyMoments(prev => [newMoment, ...prev]);
    grantEnergy('familia', 120);

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

  // Senda switch (Numbik): the card follows the chosen path
  const handleToggleAlignment = (alignment: CreatureAlignment) => {
    setCreature(prev => (prev.alignment === alignment ? prev : withCatalogIdentity({ ...prev, alignment })));
  };

  // Active companion switch
  const handleSelectSpecies = (speciesId: string) => {
    setCreature(prev => {
      if (prev.speciesId === speciesId) return prev;
      const species = AVAILABLE_SPECIES.find(sp => sp.id === speciesId);
      return withCatalogIdentity({ ...prev, speciesId, alignment: species?.defaultAlignment ?? 'harmony' });
    });
  };

  // Quick Cheat Boost for instantaneous demo verification
  const handleQuickCheatBoost = () => {
    sound.playTaskComplete(true);
    grantEnergy(dominantEnergy, 60);
  };

  // Reset demo state
  const handleResetDemo = () => {
    try {
      localStorage.removeItem('animatask_creature');
      localStorage.removeItem('animatask_tasks');
      localStorage.removeItem('animatask_moments');
    } catch {
      /* storage unavailable: nothing to clear */
    }
    window.location.reload();
  };

  return (
    <PhoneFrame
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      multiplierActive={multiplierActive}
      onOpenExport={() => setShowExportModal(true)}
      onQuickCheatBoost={handleQuickCheatBoost}
      onResetDemo={handleResetDemo}
    >
      {/* TAB 1: CREATURE SANCTUARY */}
      {currentTab === 'creature' && (
        <div className="space-y-4 animate-fade-in">
          <CreatureDisplay
            creature={creature}
            canEvolve={canEvolve}
            onOpenEvolution={() => setShowEvolutionModal(true)}
            onOpenFamilyUnlock={() => setShowFamilyModal(true)}
            onToggleAlignment={handleToggleAlignment}
            onSelectSpecies={handleSelectSpecies}
          />

          <EnergyBreakdown
            energies={creature.energies}
            dominantEnergy={dominantEnergy}
          />
        </div>
      )}

      {/* TAB 2: TASKS & MISSIONS */}
      {currentTab === 'tasks' && (
        <div className="animate-fade-in">
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
        <div className="animate-fade-in">
          <CameraMissionsView
            multiplierActive={multiplierActive}
            onSelectMission={mission => setActiveCameraMission(mission)}
          />
        </div>
      )}

      {/* TAB 4: FAMILY RECONNECTION (PATERNIDAD PRESENTE) */}
      {currentTab === 'family' && (
        <div className="animate-fade-in">
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
    </PhoneFrame>
  );
}
