import React, { useState, useEffect } from 'react';
import { CreatureState, Task, CameraMission, FamilyMoment, EnergyType, EvolutionBranch, EvolutionTier } from './types';
import { INITIAL_TASKS, SAMPLE_FAMILY_MOMENTS, CREATURE_CATALOG, CreatureEvolutionInfo } from './data/initialData';
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

export default function App() {
  // Navigation tab
  const [currentTab, setCurrentTab] = useState<'creature' | 'tasks' | 'camera' | 'family'>('creature');

  // Creature State
  const [creature, setCreature] = useState<CreatureState>(() => {
    const saved = localStorage.getItem('animatask_creature');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return {
      id: 'companion-1',
      name: 'Ovo Astra',
      title: 'Huevo Primordial',
      tier: 0,
      branch: 'neutral',
      description: 'Un huevo místico con runas doradas que palpita con tus hábitos diarios.',
      specialAbility: 'Resonancia Inicial: Acumula las 4 energías esenciales.',
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
  });

  // Task list
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('animatask_tasks');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_TASKS;
  });

  // Family moments album
  const [familyMoments, setFamilyMoments] = useState<FamilyMoment[]>(() => {
    const saved = localStorage.getItem('animatask_moments');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return SAMPLE_FAMILY_MOMENTS;
  });

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
    localStorage.setItem('animatask_creature', JSON.stringify(creature));
  }, [creature]);

  useEffect(() => {
    localStorage.setItem('animatask_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('animatask_moments', JSON.stringify(familyMoments));
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
    const targetBranch: EvolutionBranch = nextTier === 1 ? 'neutral' : dominantEnergy;
    const catalogKey = `${nextTier}_${targetBranch}`;
    return CREATURE_CATALOG[catalogKey] || CREATURE_CATALOG['1_neutral'];
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
      // If Brote (Tier 1) reaches 250 energy and isn't locked, activate mandatory Family Lock!
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

    setTasks(prev =>
      prev.map(t => (t.id === task.id ? { ...t, isCompleted: isNowCompleted } : t))
    );

    const isBoosted = multiplierActive || task.isHighPriority;
    const points = isBoosted ? task.energyReward * 2 : task.energyReward;

    if (isNowCompleted) {
      sound.playTaskComplete(isBoosted);
      grantEnergy(task.category, points);

      // If completing a high priority task, also trigger or extend multiplier boost!
      if (task.isHighPriority && !multiplierActive) {
        sound.playMultiplierActivated();
        activateMultiplier(180);
      }
    } else {
      // Revert energy if unchecking
      setCreature(prev => ({
        ...prev,
        energies: {
          ...prev.energies,
          [task.category]: Math.max(0, prev.energies[task.category] - points),
        },
        totalEnergy: Math.max(0, prev.totalEnergy - points),
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

  // Reset demo state
  const handleResetDemo = () => {
    localStorage.removeItem('animatask_creature');
    localStorage.removeItem('animatask_tasks');
    localStorage.removeItem('animatask_moments');
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
