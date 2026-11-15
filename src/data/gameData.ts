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
  },
  {
    id: 'guerreiro',
    name: 'Guerreiro',
    style: 'Físico (Versátil)',
    baseMod: { corpo: 1, mente: 1, espirito: -2 },
    pvFormula: 'Corpo + 2d3',
    ppFormula: 'Espírito + 1d3',
  },
  {
    id: 'paladino',
    name: 'Paladino',
    style: 'Físico / Mágico',
    baseMod: { corpo: 1, mente: -2, espirito: 1 },
    pvFormula: 'Corpo + 2d3',
    ppFormula: 'Espírito + 1d3',
  },
  {
    id: 'mago',
    name: 'Mago',
    style: 'Mágico',
    baseMod: { corpo: -2, mente: 0, espirito: 2 },
    pvFormula: 'Corpo + 2d3',
    ppFormula: 'Espírito + 2d3',
  },
  {
    id: 'druida',
    name: 'Druida',
    style: 'Mágico / Suporte',
    baseMod: { corpo: -1, mente: -1, espirito: 2 },
    pvFormula: 'Corpo + 2d3',
    ppFormula: 'Espírito + 2d3',
  },
  {
    id: 'clerigo',
    name: 'Clérigo',
    style: 'Mágico / Físico',
    baseMod: { corpo: 0, mente: -1, espirito: 1 },
    pvFormula: 'Corpo + 2d3',
    ppFormula: 'Espírito + 2d3',
  },
  {
    id: 'ladino',
    name: 'Ladino',
    style: 'Físico / Distância',
    baseMod: { corpo: -1, mente: 2, espirito: -1 },
    pvFormula: 'Corpo + 2d3',
    ppFormula: 'Espírito + 1d3',
  },
  {
    id: 'ranger',
    name: 'Ranger',
    style: 'Distância / Físico',
    baseMod: { corpo: 1, mente: 1, espirito: -2 },
    pvFormula: 'Corpo + 2d3',
    ppFormula: 'Espírito + 1d3',
  },
  {
    id: 'bardo',
    name: 'Bardo',
    style: 'Suporte / Mágico',
    baseMod: { corpo: -2, mente: 1, espirito: 1 },
    pvFormula: 'Corpo + 2d3',
    ppFormula: 'Espírito + 2d3',
  },
];
