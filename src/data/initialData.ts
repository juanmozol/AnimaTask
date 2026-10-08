import { CreatureState, Task, CameraMission, FamilyMoment, EnergyBalance, EvolutionBranch, EvolutionTier, CreatureAlignment, SpeciesEntry } from '../types';
import imgP1 from '../assets/images/numbik_p1_base.jpg';
import imgP2 from '../assets/images/numbik_p2_good.jpg';
import imgP3 from '../assets/images/numbik_p3_good.jpg';
import imgP4 from '../assets/images/numbik_p4_good.jpg';
import imgB2 from '../assets/images/numbik_b2_bad.jpg';
import imgB3 from '../assets/images/numbik_b3_bad.jpg';
import imgB4 from '../assets/images/numbik_b4_bad.jpg';

/** Last evolution stage. Numbik: egg (0) → Principal (1) → P2/P3/P4 or B2/B3/B4. */
export const MAX_TIER: EvolutionTier = 4;

export interface CreatureEvolutionInfo {
  tier: EvolutionTier;
  branch: EvolutionBranch;
  alignment?: CreatureAlignment;
  name: string;
  title: string;
  elementLabel: string;
  description: string;
  specialAbility: string;
  lore: string;
  imageUrl?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
  };
}

export const AVAILABLE_SPECIES: SpeciesEntry[] = [
  {
    id: 'numbik',
    name: 'Numbik',
    subtitle: 'Marsupial Etéreo (Senda Dual)',
    category: 'Especie Adaptable',
    description: 'Criatura con dos senderos evolutivos marcados: la Senda de la Armonía y la Senda del Abismo Sombrío.',
    hasBipolarPaths: true,
    defaultAlignment: 'harmony',
    previewImage: imgP1,
  },
  {
    id: 'chronowl',
    name: 'Chronowl',
    subtitle: 'Búho Astral de Cronos',
    category: 'Enfoque & Sabiduría',
    description: 'Guardián del tiempo académico y la disciplina profunda. Canaliza horas de estudio en halos cósmicos.',
    hasBipolarPaths: false,
    defaultAlignment: 'harmony',
  },
  {
    id: 'kindor',
    name: 'Kindor',
    subtitle: 'Titán del Hogar Cálido',
    category: 'Vínculo Familiar',
    description: 'Criatura de roca suave y llama de afecto que prospera con momentos compartidos en familia.',
    hasBipolarPaths: false,
    defaultAlignment: 'harmony',
  },
  {
    id: 'voltkin',
    name: 'Voltkin',
    subtitle: 'Guepardo del Trueno',
    category: 'Actividad & Movimiento',
    description: 'Felino aerodinámico que absorbe el movimiento deportivo convirtiéndolo en arcos voltaicos.',
    hasBipolarPaths: false,
    defaultAlignment: 'harmony',
  },
];

export const CREATURE_CATALOG: Record<string, CreatureEvolutionInfo> = {
  // NUMBIK / USER'S CREATURE - DUAL PATHS (GOOD & BAD)
  'numbik_0': {
    tier: 0,
    branch: 'neutral',
    alignment: 'harmony',
    name: 'Ovo Numbik',
    title: 'Huevo Primordial Terrestre',
    elementLabel: 'Génesis Dual',
    description: 'Un huevo de tonalidad arcillosa y runas suaves. En su interior late el potencial tanto de la luz como de la sombra.',
    specialAbility: 'Equilibrio Cero: Sensible a los primeros hábitos completados.',
    lore: 'Antiguos manuscritos cuentan que su cascarón vibra con la determinación humana.',
    colors: {
      primary: '#d97706',
      secondary: '#a16207',
      accent: '#2dd4bf',
      glow: 'rgba(217, 119, 6, 0.35)',
    },
  },

  'numbik_1': {
    tier: 1,
    branch: 'neutral',
    alignment: 'harmony',
    name: 'Numbik Inicial',
    title: 'Cría Marsupial Curiosa',
    elementLabel: 'Forma Principal',
    description: 'Pequeña criatura de suave pelaje canela y rayas dorsales blancas. Sus grandes ojos turquesa observan atentos tus acciones del día.',
    specialAbility: 'Ojo de Espejo: Refleja tu constancia en su semblante.',
    lore: 'Nacido en los claros de bosque, le encanta descansar mientras avanzas en tus proyectos.',
    imageUrl: imgP1,
    colors: {
      primary: '#d97706',
      secondary: '#b45309',
      accent: '#0d9488',
      glow: 'rgba(13, 148, 136, 0.35)',
    },
  },

  // NUMBIK GOOD PATH (Senda de la Armonía): P2 → P3 → P4
  'numbik_2_harmony': {
    tier: 2,
    branch: 'creativo',
    alignment: 'harmony',
    name: 'Thylaguard',
    title: 'Cazador Armónico de Garras',
    elementLabel: 'Senda de Armonía',
    description: 'Criatura bípeda de noble postura, pelaje dorado con rayas marcadas y garras protectoras. Canaliza hábitos de dedicación en un aura serena.',
    specialAbility: 'Garras de Templanza: Despeja la fatiga mental y protege el descanso.',
    lore: 'Se alza sobre dos patas al percibir que cumples tus metas con orgullo.',
    imageUrl: imgP2,
    colors: {
      primary: '#0ea5e9',
      secondary: '#38bdf8',
      accent: '#f59e0b',
      glow: 'rgba(14, 165, 233, 0.4)',
    },
  },

  'numbik_3_harmony': {
    tier: 3,
    branch: 'creativo',
    alignment: 'harmony',
    name: 'Myrmora',
    title: 'Rastreadora de Horizontes',
    elementLabel: 'Armonía Avanzada',
    description: 'Cuadrúpeda de pelaje chocolate con bandas crema y una poderosa zarpa delantera dorada. Su lengua rosada, larguísima, rastrea cada tarea pendiente y la vuelve fácil de empezar.',
    specialAbility: 'Lengua Rastreadora: señala la tarea pequeña que destraba todas las demás.',
    lore: 'Camina despacio y sin miedo: sabe que la constancia pesa más que la prisa.',
    imageUrl: imgP3,
    colors: {
      primary: '#a16207',
      secondary: '#78350f',
      accent: '#fda4af',
      glow: 'rgba(161, 98, 7, 0.4)',
    },
  },

  'numbik_4_harmony': {
    tier: 4,
    branch: 'creativo',
    alignment: 'harmony',
    name: 'Astra-Kip Sabio',
    title: 'Guardián Celestial del Loto Turquesa (Alfa)',
    elementLabel: 'Forma Alfa Armónica',
    description: 'Majestuoso ser sagrado sentado en calma absoluta. De su espalda brotan llamas espirituales de color turquesa, con un tercer ojo místico y una cola espiral luminosa.',
    specialAbility: 'Espíritu Iluminado Alfa: Estado de flujo mental continuo y bendición de armonía.',
    lore: 'El pináculo del balance interior. Quien alcanza esta forma mantiene sus hábitos con ligereza y paz.',
    imageUrl: imgP4,
    colors: {
      primary: '#06b6d4',
      secondary: '#0891b2',
      accent: '#67e8f9',
      glow: 'rgba(6, 182, 212, 0.55)',
    },
  },

  // NUMBIK BAD PATH (Senda del Abismo / Corrupción Espectral): B2 → B3 → B4
  'numbik_2_shadow': {
    tier: 2,
    branch: 'activo',
    alignment: 'shadow',
    name: 'Noctifax',
    title: 'Acechador de la Gema Turquesa',
    elementLabel: 'Despertar del Abismo',
    description: 'Cánido ágil que se agazapa a ras del suelo. Conserva el pelaje canela de su forma base, pero una gema turquesa late en su ojo y las costillas se le marcan como espinas oscuras.',
    specialAbility: 'Acecho Pendiente: percibe cada tarea que postergas y la hace pesar más.',
    lore: 'Despierta cuando las tareas se acumulan y los momentos en familia se dejan pasar: empieza a cazar lo que evitas.',
    imageUrl: imgB2,
    colors: {
      primary: '#14b8a6',
      secondary: '#0f766e',
      accent: '#5eead4',
      glow: 'rgba(20, 184, 166, 0.4)',
    },
  },

  'numbik_3_shadow': {
    tier: 3,
    branch: 'activo',
    alignment: 'shadow',
    name: 'Skullican',
    title: 'Espectro de la Máscara Calavera',
    elementLabel: 'Abismo Profundo',
    description: 'Thylacine espectral que levita sobre el suelo con una máscara de cráneo óseo y cuencas esmeralda. Flota rodeado de fuegos fatuos fantasmales.',
    specialAbility: 'Velo Sepulcral: Absorbe el estrés y lo transforma en ímpetu nocturno.',
    lore: 'Emerge cuando el cansancio y los desafíos difíciles empujan a la criatura hacia el misterio de la noche.',
    imageUrl: imgB3,
    colors: {
      primary: '#10b981',
      secondary: '#047857',
      accent: '#a7f3d0',
      glow: 'rgba(16, 185, 129, 0.45)',
    },
  },

  'numbik_4_shadow': {
    tier: 4,
    branch: 'activo',
    alignment: 'shadow',
    name: 'Umbra-Vorax',
    title: 'Devorador del Vacío Sombrío (Alfa)',
    elementLabel: 'Forma Alfa Abisal',
    description: 'Depredador cuadrúpedo de pelaje negro carbón como la noche pura. Sus ojos y su fauce abierta brillan con un abismo cian resplandeciente.',
    specialAbility: 'Fauce del Vacío Alfa: Devora la procrastinación con agresividad voraz.',
    lore: 'Temido por su aspecto salvaje, representa la fuerza bruta nacida de superar las etapas más oscuras y exigentes del camino.',
    imageUrl: imgB4,
    colors: {
      primary: '#0284c7',
      secondary: '#0f172a',
      accent: '#38bdf8',
      glow: 'rgba(2, 132, 199, 0.55)',
    },
  },

  // GENERAL ARCHETYPES (Chronowl, Kindor, Voltkin)
  '0_neutral': {
    tier: 0,
    branch: 'neutral',
    alignment: 'harmony',
    name: 'Ovo Astra',
    title: 'Huevo Primordial',
    elementLabel: 'Génesis Astral',
    description: 'Un huevo místico con runas doradas que palpita suavemente. Absorbe los primeros hábitos para romper su cascarón.',
    specialAbility: 'Resonancia Inicial: Acumula las 4 energías esenciales.',
    lore: 'Nacido del cruce entre disciplina y cariño familiar.',
    colors: {
      primary: '#6366f1',
      secondary: '#a855f7',
      accent: '#fbbf24',
      glow: 'rgba(99, 102, 241, 0.3)',
    },
  },

  '1_neutral': {
    tier: 1,
    branch: 'neutral',
    alignment: 'harmony',
    name: 'Lumikid',
    title: 'Brote Místico',
    elementLabel: 'Esencia Adaptable',
    description: 'Una criatura infante curiosa con ojos brillantes y una gema en el pecho que responde a tus acciones diarias.',
    specialAbility: 'Metamorfosis Receptiva: Modela su anatomía hacia tu energía dominante.',
    lore: 'Muy apegado a su compañero humano.',
    colors: {
      primary: '#10b981',
      secondary: '#06b6d4',
      accent: '#f59e0b',
      glow: 'rgba(16, 185, 129, 0.3)',
    },
  },

  '2_enfoque': {
    tier: 2,
    branch: 'enfoque',
    alignment: 'harmony',
    name: 'Chronowl',
    title: 'Búho de Cronos',
    elementLabel: 'Rama Enfoque Profundo',
    description: 'Búho etéreo con plumas de zafiro cristalino y astrolabio estelar. Se nutre de tus horas de estudio.',
    specialAbility: 'Hiper-Concentración: Dilata la percepción del esfuerzo intelectual.',
    lore: 'Ordena pensamientos complejos con precisión milimétrica.',
    colors: {
      primary: '#0ea5e9',
      secondary: '#3b82f6',
      accent: '#38bdf8',
      glow: 'rgba(14, 165, 233, 0.35)',
    },
  },

  '2_familia': {
    tier: 2,
    branch: 'familia',
    alignment: 'harmony',
    name: 'Kindor',
    title: 'Guardián del Hogar',
    elementLabel: 'Rama Vínculo Cálido',
    description: 'Noble criatura de piedra volcánica suave y brasa protectora. Su calor premia el tiempo de calidad juntos.',
    specialAbility: 'Escudo de Empatía: Convierte las tensiones diarias en serenidad familiar.',
    lore: 'Resplandece durante charlas sinceras entre padres e hijos.',
    colors: {
      primary: '#f43f5e',
      secondary: '#fb7185',
      accent: '#fde047',
      glow: 'rgba(244, 63, 94, 0.35)',
    },
  },

  '2_creativo': {
    tier: 2,
    branch: 'creativo',
    alignment: 'harmony',
    name: 'Prismaris',
    title: 'Zorro Prisma',
    elementLabel: 'Rama Ilusión Creadora',
    description: 'Elegante cánido místico de pelaje iridiscente y colas fluidas que desprenden destellos de acuarela.',
    specialAbility: 'Pincelada Ilusoria: Estimula la imaginación y la curiosidad visual.',
    lore: 'Habita en los bocetos, notas musicales y detalles coloridos.',
    colors: {
      primary: '#a855f7',
      secondary: '#c084fc',
      accent: '#ec4899',
      glow: 'rgba(168, 85, 247, 0.35)',
    },
  },

  '2_activo': {
    tier: 2,
    branch: 'activo',
    alignment: 'harmony',
    name: 'Voltkin',
    title: 'Guepardo Voltio',
    elementLabel: 'Rama Cinética Pura',
    description: 'Depredador aerodinámico con rayas fosforescentes y garras chispeantes. Canaliza tu actividad física.',
    specialAbility: 'Sobrecarga Motora: Transforma el movimiento en vitalidad pura.',
    lore: 'Vibra de entusiasmo cada vez que te mueves activamente.',
    colors: {
      primary: '#10b981',
      secondary: '#22c55e',
      accent: '#eab308',
      glow: 'rgba(16, 185, 129, 0.35)',
    },
  },

  '3_enfoque': {
    tier: 3,
    branch: 'enfoque',
    alignment: 'harmony',
    name: 'Chronos-Apex',
    title: 'Soberano del Tiempo Alfa',
    elementLabel: 'Forma Alfa Absoluta',
    description: 'Majestuoso ser arcano con astrolabio celestial completo y alas de luz cuántica.',
    specialAbility: 'Dominio Cronológico Alfa: Multiplicador permanente de productividad.',
    lore: 'El pináculo del enfoque mental humano.',
    colors: {
      primary: '#0284c7',
      secondary: '#6366f1',
      accent: '#38bdf8',
      glow: 'rgba(2, 132, 199, 0.45)',
    },
  },

  '3_familia': {
    tier: 3,
    branch: 'familia',
    alignment: 'harmony',
    name: 'Harmonia-Apex',
    title: 'Titán del Lazo Ancestral Alfa',
    elementLabel: 'Forma Alfa Absoluta',
    description: 'Coloso radiante con corona de fuego cálido y un aura que une a toda la familia.',
    specialAbility: 'Égida del Amor Verdadero: Consolida recuerdos familiares duraderos.',
    lore: 'Alcanzado al valorar la presencia real sobre las distracciones.',
    colors: {
      primary: '#e11d48',
      secondary: '#f43f5e',
      accent: '#fbbf24',
      glow: 'rgba(225, 29, 72, 0.45)',
    },
  },

  '3_creativo': {
    tier: 3,
    branch: 'creativo',
    alignment: 'harmony',
    name: 'Prisma-Apex',
    title: 'Deidad de la Creación Alfa',
    elementLabel: 'Forma Alfa Absoluta',
    description: 'Entidad de nueve colas prismáticas y mandala flotante que proyecta auroras boreales.',
    specialAbility: 'Génesis de Realidades: Transforma cualquier idea en arte.',
    lore: 'La personificación de la curiosidad ilimitada.',
    colors: {
      primary: '#9333ea',
      secondary: '#d946ef',
      accent: '#f43f5e',
      glow: 'rgba(147, 51, 234, 0.45)',
    },
  },

  '3_activo': {
    tier: 3,
    branch: 'activo',
    alignment: 'harmony',
    name: 'Tempestas-Apex',
    title: 'Señor de Tempestad Alfa',
    elementLabel: 'Forma Alfa Absoluta',
    description: 'Titán velocista con relámpagos esmeralda y cuernos de trueno.',
    specialAbility: 'Impulso Taquiónico: Rompe cualquier barrera de inercia o desgana.',
    lore: 'Un símbolo de constancia atlética y vitalidad indomable.',
    colors: {
      primary: '#059669',
      secondary: '#10b981',
      accent: '#facc15',
      glow: 'rgba(5, 150, 105, 0.45)',
    },
  },
};

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Deberes de la Universidad: Proyecto Final',
    category: 'enfoque',
    description: 'Avanzar 45 minutos de investigación para la entrega del semestre.',
    energyReward: 40,
    isHighPriority: true,
    isCompleted: false,
    isDaily: true,
  },
  {
    id: 'task-2',
    title: 'Cena sin teléfonos y conversación familiar',
    category: 'familia',
    description: 'Compartir la cena con padres y relatar la mejor anécdota de la jornada.',
    energyReward: 35,
    isHighPriority: false,
    isCompleted: false,
    isDaily: true,
  },
  {
    id: 'task-3',
    title: 'Boceto o modelado de criaturas 3D',
    category: 'creativo',
    description: 'Practicar 20 minutos de ideación o render de personajes.',
    energyReward: 35,
    isHighPriority: false,
    isCompleted: false,
    isDaily: true,
  },
  {
    id: 'task-4',
    title: 'Rutina activa: 30 minutos de ejercicio',
    category: 'activo',
    description: 'Calistenia, trote o 4,000 pasos activos para recargar vitalidad.',
    energyReward: 35,
    isHighPriority: false,
    isCompleted: false,
    isDaily: true,
  },
  {
    id: 'task-5',
    title: 'Repaso de Cálculo / Lectura Académica',
    category: 'enfoque',
    description: 'Lectura comprensiva de 15 páginas sin revisar redes sociales.',
    energyReward: 35,
    isHighPriority: true,
    isCompleted: false,
    isDaily: false,
  },
  {
    id: 'task-6',
    title: 'Ayudar en tarea del hogar en equipo familiar',
    category: 'familia',
    description: 'Ordenar la sala o preparar la comida con un familiar cercano.',
    energyReward: 30,
    isHighPriority: false,
    isCompleted: false,
    isDaily: false,
  },
  {
    id: 'task-7',
    title: 'Paseo al aire libre y respiración consciente',
    category: 'activo',
    description: 'Movimiento en contacto con la luz natural de la tarde.',
    energyReward: 40,
    isHighPriority: true,
    isCompleted: false,
    isDaily: false,
  },
];

export const CAMERA_MISSIONS: CameraMission[] = [
  {
    id: 'cam-1',
    title: 'Desafío Cromático Creativo',
    prompt: 'Encuentra y fotografía algo morado o violeta a tu alrededor en el mundo real.',
    targetObjectDescription: 'Objeto de tonalidad morada (prenda, flor, libro o accesorio)',
    targetColor: '#a855f7',
    rewardCategory: 'creativo',
    energyReward: 50,
    iconName: 'Palette',
  },
  {
    id: 'cam-2',
    title: 'Rastreo de Sabiduría',
    prompt: 'Fotografía tu cuaderno de apuntes, libro de estudio o calculadora.',
    targetObjectDescription: 'Material de estudio académico activo',
    targetColor: '#0ea5e9',
    rewardCategory: 'enfoque',
    energyReward: 50,
    iconName: 'BookOpen',
  },
  {
    id: 'cam-3',
    title: 'Resonancia Natural',
    prompt: 'Fotografía una planta viva, flor o fruto natural cerca de ti.',
    targetObjectDescription: 'Elemento biológico u orgánico vegetal',
    targetColor: '#10b981',
    rewardCategory: 'activo',
    energyReward: 45,
    iconName: 'Leaf',
  },
  {
    id: 'cam-4',
    title: 'Mística del Espacio Creativo',
    prompt: 'Fotografía tu rincón de trabajo o escritorio organizado y despejado.',
    targetObjectDescription: 'Espacio de trabajo o creación limpio',
    targetColor: '#6366f1',
    rewardCategory: 'creativo',
    energyReward: 55,
    iconName: 'Sparkles',
  },
];

export const SAMPLE_FAMILY_MOMENTS: FamilyMoment[] = [
  {
    id: 'moment-1',
    title: 'Paseo al atardecer sin pantallas',
    reflection: 'Caminamos por el parque durante 30 minutos hablando sobre las materias escolares favoritas. Nos reímos mucho con las ocurrencias de la semana.',
    parentName: 'Mamá & Papá',
    emotion: 'Conectados',
    createdAt: 'Ayer, 18:45',
    unlockedEvolution: true,
  },
];

/**
 * Catalog lookup key for a creature. Numbik uses its own dual-path entries
 * (`numbik_<tier>` and `numbik_<tier>_<alignment>`); every other species
 * uses the generic `<tier>_<branch>` archetypes.
 */
export const getCatalogKey = (
  speciesId: string | undefined,
  tier: EvolutionTier,
  branch: EvolutionBranch,
  alignment: CreatureAlignment | undefined,
): string => {
  if (speciesId === 'numbik') {
    return tier <= 1 ? `numbik_${tier}` : `numbik_${tier}_${alignment ?? 'harmony'}`;
  }
  return `${tier}_${branch}`;
};
