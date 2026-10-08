export type EnergyType = 'enfoque' | 'familia' | 'creativo' | 'activo';

export interface EnergyBalance {
  enfoque: number;
  familia: number;
  creativo: number;
  activo: number;
}

export type EvolutionBranch = 'neutral' | 'enfoque' | 'familia' | 'creativo' | 'activo';

export type EvolutionTier = 0 | 1 | 2 | 3 | 4; // 0: Huevo, 1: Principal, 2-4: etapas de la senda (P2-P4 armonía / B2-B4 sombra)

export type CreatureAlignment = 'harmony' | 'shadow'; // Good (Luz/Armonía) vs Bad (Sombra/Abismo)

export interface CreatureState {
  id: string;
  speciesId: string; // 'numbik' | 'chronowl' | 'kindor' | 'voltkin'
  name: string;
  title: string;
  tier: EvolutionTier;
  branch: EvolutionBranch;
  alignment: CreatureAlignment; // Senda: se fija al evolucionar de Principal (1) a la etapa 2
  balance: number; // Hábitos: -100 (Sombra) .. +100 (Armonía). Decide la senda.
  description: string;
  specialAbility: string;
  energies: EnergyBalance;
  totalEnergy: number;
  nextTierThreshold: number;
  isEvolutionLocked: boolean;
  lockReason?: string;
  mood: 'happy' | 'focused' | 'energetic' | 'loving' | 'excited' | 'sleeping';
  imageUrl?: string;
}

export interface SpeciesEntry {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  description: string;
  hasBipolarPaths: boolean; // Good and Bad branches (like Numbik)
  defaultAlignment: CreatureAlignment;
  previewImage?: string;
}

export interface Task {
  id: string;
  title: string;
  category: EnergyType;
  description: string;
  energyReward: number;
  isHighPriority: boolean; // Triggers or benefits from x2 multiplier
  isCompleted: boolean;
  completedAt?: string;
  awardedEnergy?: number; // Energy actually granted on completion (so unchecking refunds the exact amount)
  isDaily: boolean;
}

export interface CameraMission {
  id: string;
  title: string;
  prompt: string;
  targetObjectDescription: string;
  targetColor: string;
  rewardCategory: EnergyType;
  energyReward: number;
  iconName: string;
}

export interface FamilyMoment {
  id: string;
  title: string;
  reflection: string;
  parentName: string;
  emotion: 'Conectados' | 'Inspirados' | 'Tranquilos' | 'Agradecidos' | 'Divertidos';
  photoUrl?: string;
  createdAt: string;
  unlockedEvolution: boolean;
}
