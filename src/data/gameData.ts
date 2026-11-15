export interface RaceInfo {
  id: string;
  name: string;
  bonus: { corpo: number; mente: number; espirito: number };
  description: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  style: string;
  baseMod: { corpo: number; mente: number; espirito: number };
  pvFormula: string;
  ppFormula: string;
  ppDice: 1 | 2;
}

export const RACES: RaceInfo[] = [
  {
    id: 'humano',
    name: 'Humano',
    bonus: { corpo: 0, mente: 0, espirito: 0 },
    description: 'Versátil: +1 em um atributo à escolha e 1 poder extra de nível 1.',
  },
  {
    id: 'anao',
    name: 'Anão',
    bonus: { corpo: 1, mente: 0, espirito: 0 },
    description: '+1 Corpo, Visão no Escuro e resistência a venenos.',
  },
  {
    id: 'elfo',
    name: 'Elfo',
    bonus: { corpo: 0, mente: 1, espirito: 0 },
    description: '+1 Mente, Sentidos Aguçados e imune a sono mágico.',
  },
  {
    id: 'orc',
    name: 'Orc',
    bonus: { corpo: 1, mente: 0, espirito: 0 },
    description: '+1 Corpo, Fúria implacável em combate corpo a corpo.',
  },
  {
    id: 'pequenino',
    name: 'Pequenino',
    bonus: { corpo: 0, mente: 1, espirito: 0 },
    description: '+1 Mente, Sortudo (pode rerrolar um 1 nos dados).',
  },
  {
    id: 'gnomo',
    name: 'Gnomo',
    bonus: { corpo: 0, mente: 0, espirito: 1 },
    description: '+1 Espírito, Engenhoso e afinidade arcana.',
  },
  {
    id: 'draconato',
    name: 'Draconato',
    bonus: { corpo: 1, mente: 0, espirito: 0 },
    description: '+1 Corpo, Baforada elemental e escamas resistentes.',
  },
];

export const CLASSES: ClassInfo[] = [
  {
    id: 'barbaro',
    name: 'Bárbaro',
    style: 'Físico (Corpo a Corpo)',
    baseMod: { corpo: 2, mente: 0, espirito: -2 },
    pvFormula: 'Corpo + 2d3',
    ppFormula: 'Espírito + 1d3',
    ppDice: 1,
  },
  {
    id: 'guerreiro',
    name: 'Guerreiro',
    style: 'Físico (Versátil)',
    baseMod: { corpo: 1, mente: 1, espirito: -2 },
    pvFormula: 'Corpo + 2d3',
    ppFormula: 'Espírito + 1d3',
    ppDice: 1,
  },
  {
    id: 'paladino',
    name: 'Paladino',
    style: 'Físico / Mágico',
    baseMod: { corpo: 1, mente: -2, espirito: 1 },
    pvFormula: 'Corpo + 2d3',
    ppFormula: 'Espírito + 1d3',
    ppDice: 1,
  },
  {
    id: 'mago',
    name: 'Mago',
    style: 'Mágico',
    baseMod: { corpo: -2, mente: 0, espirito: 2 },
    pvFormula: 'Corpo + 2d3',
    ppFormula: 'Espírito + 2d3',
    ppDice: 2,
  },
  {
    id: 'druida',
    name: 'Druida',
    style: 'Mágico / Suporte',
    baseMod: { corpo: -1, mente: -1, espirito: 2 },
    pvFormula: 'Corpo + 2d3',
    ppFormula: 'Espírito + 2d3',
    ppDice: 2,
  },
  {
    id: 'clerigo',
    name: 'Clérigo',
    style: 'Mágico / Físico',
    baseMod: { corpo: 0, mente: -1, espirito: 1 },
    pvFormula: 'Corpo + 2d3',
    ppFormula: 'Espírito + 2d3',
    ppDice: 2,
  },
  {
    id: 'ladino',
    name: 'Ladino',
    style: 'Físico / Distância',
    baseMod: { corpo: -1, mente: 2, espirito: -1 },
    pvFormula: 'Corpo + 2d3',
    ppFormula: 'Espírito + 1d3',
    ppDice: 1,
  },
  {
    id: 'ranger',
    name: 'Ranger',
    style: 'Distância / Físico',
    baseMod: { corpo: 1, mente: 1, espirito: -2 },
    pvFormula: 'Corpo + 2d3',
    ppFormula: 'Espírito + 1d3',
    ppDice: 1,
  },
  {
    id: 'bardo',
    name: 'Bardo',
    style: 'Suporte / Mágico',
    baseMod: { corpo: -2, mente: 1, espirito: 1 },
    pvFormula: 'Corpo + 2d3',
    ppFormula: 'Espírito + 2d3',
    ppDice: 2,
  },
];

export interface WeaponPreset {
  label: string;
  twoHanded: boolean;
}

export const WEAPONS: WeaponPreset[] = [
  { label: 'Adaga (1d3)', twoHanded: false },
  { label: 'Espada Curta (1d3+1)', twoHanded: false },
  { label: 'Espada Longa (1d6)', twoHanded: false },
  { label: 'Rapieira (1d6)', twoHanded: false },
  { label: 'Machado de Batalha (1d6)', twoHanded: false },
  { label: 'Maça (1d6)', twoHanded: false },
  { label: 'Martelo de Guerra (1d6)', twoHanded: false },
  { label: 'Lança (1d6)', twoHanded: false },
  { label: 'Espadão / Montante (1d6+2) [2 Mãos]', twoHanded: true },
  { label: 'Machado de Duas Mãos (1d6+2) [2 Mãos]', twoHanded: true },
  { label: 'Martelo Pesado (1d6+2) [2 Mãos]', twoHanded: true },
  { label: 'Alabarda (1d6+2) [2 Mãos]', twoHanded: true },
  { label: 'Cajado (1d3+1) [2 Mãos]', twoHanded: true },
  { label: 'Arco Curto (1d3+1) [2 Mãos]', twoHanded: true },
  { label: 'Arco Longo (1d6+1) [2 Mãos]', twoHanded: true },
  { label: 'Besta Leve (1d6) [2 Mãos]', twoHanded: true },
  { label: 'Besta Pesada (1d6+2) [2 Mãos]', twoHanded: true },
];

export interface ArmorPreset {
  label: string;
  res: number;
}

export const ARMORS: ArmorPreset[] = [
  { label: 'Sem Armadura (Res 0)', res: 0 },
  { label: 'Armadura de Couro (Res 1)', res: 1 },
  { label: 'Couro Batido (Res 2)', res: 2 },
  { label: 'Cota de Malha (Res 3)', res: 3 },
  { label: 'Armadura de Placas (Res 4)', res: 4 },
];

export interface ShieldPreset {
  label: string;
  defBonus: number;
}

export const SHIELDS_AND_FOCI: ShieldPreset[] = [
  { label: 'Escudo Leve (+1 Def)', defBonus: 1 },
  { label: 'Escudo Pesado (+2 Def)', defBonus: 2 },
  { label: 'Broquel (+1 Def)', defBonus: 1 },
  { label: 'Cajado Arcano (Foco)', defBonus: 0 },
  { label: 'Orbe Elemental (Foco)', defBonus: 0 },
  { label: 'Símbolo Sagrado (Foco)', defBonus: 0 },
];

export const CONSUMABLES: string[] = [
  'Poção de Cura Menor (1d6 PV)',
  'Poção de Cura Maior (2d6 PV)',
  'Poção de Mana / PP (1d6 PP)',
  'Antídoto',
  'Ração de Viagem (1 dia)',
  'Tocha',
  'Corda (15m)',
  'Kit de Ladrão / Gazuas',
  'Kit de Primeiros Socorros',
];
