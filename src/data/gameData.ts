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
  description: string;
  naturalTraitName: string;
  naturalTrait: string;
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
    description:
      'Combatente feroz alimentado pela adrenalina e vigor instintivo. Esmaga oponentes na linha de frente e intimida através de força pura.',
    naturalTraitName: 'Vigor Primitivo',
    naturalTrait:
      '+1m no deslocamento base e Vantagem em testes de Corpo para proezas de força bruta pura (arrombar portas, entortar grades, erguer peso maciço) e intimidação física.',
    baseMod: { corpo: 2, mente: 0, espirito: -2 },
    pvFormula: 'Corpo + 2d3',
    ppFormula: 'Espírito + 1d3',
    ppDice: 1,
  },
  {
    id: 'guerreiro',
    name: 'Guerreiro',
    style: 'Físico (Baluarte Defensivo)',
    description:
      'Mestre tático em armas e armaduras pesadas, atuando como o pilar defensivo que mantém a guarda alta e controla o ritmo do combate.',
    naturalTraitName: 'Baluarte de Combate',
    naturalTrait:
      'Não pode ser empurrado, derrubado ou movido contra a sua vontade por inimigos do seu tamanho ou menor. Se estiver empunhando escudo ou arma com as duas mãos, recebe +1 de Resistência Física natural adicional contra todo golpe físico sofrido.',
    baseMod: { corpo: 1, mente: 1, espirito: -2 },
    pvFormula: 'Corpo + 2d3',
    ppFormula: 'Espírito + 1d3',
    ppDice: 1,
  },
  {
    id: 'paladino',
    name: 'Paladino',
    style: 'Físico / Mágico (Bastião Sagrado)',
    description:
      'Guerreiro sagrado blindado por fé inabalável. Une força marcial a virtudes místicas para proteger aliados e castigar o mal.',
    naturalTraitName: 'Aura de Convicção',
    naturalTrait:
      'Imunidade a medo mundano e concede +1 em testes de resistência mental contra influências sombrias para aliados a até 3m. Detecta a presença de mortos-vivos ou profanações no ambiente imediato ao se concentrar.',
    baseMod: { corpo: 1, mente: -2, espirito: 1 },
    pvFormula: 'Corpo + 2d3',
    ppFormula: 'Espírito + 1d3',
    ppDice: 1,
  },
  {
    id: 'mago',
    name: 'Mago',
    style: 'Mágico (Manipulador Arcano)',
    description:
      'Estudioso supremo das energias elementais e mistérios arcanos. Sacrifica sua robustez corporal em favor de tremendo poderio mágico.',
    naturalTraitName: 'Sentido Arcano',
    naturalTrait:
      'Detecta fluxos, runas e resíduos mágicos sem gastar PP. Ganha Vantagem em testes de Arcanismo, decifração de escrituras antigas e avaliação de propriedades de itens encantados.',
    baseMod: { corpo: -2, mente: 0, espirito: 2 },
    pvFormula: 'Corpo + 2d3',
    ppFormula: 'Espírito + 2d3',
    ppDice: 2,
  },
  {
    id: 'druida',
    name: 'Druida',
    style: 'Mágico / Suporte (Guardião da Terra)',
    description:
      'Voz dos ermos e das forças primordiais. Conecta-se intimamente com as estações, fauna e flora para guiar e curar seu grupo.',
    naturalTraitName: 'Harmonia Elemental',
    naturalTrait:
      'Pressente com precisão mudanças climáticas e catástrofes naturais com horas de antecedência. Não sofre dano de espinhos e plantas comuns, e discerne intuitivamente se qualquer planta, fruto ou água é tóxica ou potável.',
    baseMod: { corpo: -1, mente: -1, espirito: 2 },
    pvFormula: 'Corpo + 2d3',
    ppFormula: 'Espírito + 2d3',
    ppDice: 2,
  },
  {
    id: 'clerigo',
    name: 'Clérigo',
    style: 'Mágico / Físico (Voz Divina)',
    description:
      'Arauto e canalizador direto da bênção de sua divindade. Mantém seus companheiros de pé nas batalhas mais duras através de amparo e restauração.',
    naturalTraitName: 'Bênção do Amparo',
    naturalTrait:
      'Durante descansos curtos, sua presença acolhedora e preces restauram +1 PV adicional a todos os aliados sem gasto de recursos. Clérigos e seus companheiros encontram refúgio e hospitalidade garantida em qualquer templo de sua fé.',
    baseMod: { corpo: 0, mente: -1, espirito: 1 },
    pvFormula: 'Corpo + 2d3',
    ppFormula: 'Espírito + 2d3',
    ppDice: 2,
  },
  {
    id: 'ladino',
    name: 'Ladino',
    style: 'Físico / Distância (Astúcia & Furtividade)',
    description:
      'Especialista em oportunidade, sobrevivência urbana e infiltração. Resolve com inteligência, velocidade e destreza o que a força bruta não alcança.',
    naturalTraitName: 'Oportunista Urbano',
    naturalTrait:
      'Vantagem em testes de furtividade para passar despercebido em meio a multidões ou sombras leves. Localiza com facilidade rotas de fuga em becos e contatos no submundo ao entrar em povoados.',
    baseMod: { corpo: -1, mente: 2, espirito: -1 },
    pvFormula: 'Corpo + 2d3',
    ppFormula: 'Espírito + 1d3',
    ppDice: 1,
  },
  {
    id: 'ranger',
    name: 'Ranger',
    style: 'Distância / Físico (Atirador dos Ermos)',
    description:
      'Patrulheiro vigilante das fronteiras selvagens e atirador experiente. Domina a leitura do terreno, emboscadas e o abate preciso à distância.',
    naturalTraitName: 'Olhos de Falcão',
    naturalTrait:
      'Ignora a penalidade de cobertura leve em disparos à distância. Se não se mover no seu turno, ganha +1 no Ataque ou dobra o alcance do disparo. Enxerga com clareza o dobro da distância e nunca é surpreendido em vigília.',
    baseMod: { corpo: 1, mente: 1, espirito: -2 },
    pvFormula: 'Corpo + 2d3',
    ppFormula: 'Espírito + 1d3',
    ppDice: 1,
  },
  {
    id: 'bardo',
    name: 'Bardo',
    style: 'Suporte / Mágico (Diplomata & Artista)',
    description:
      'Erudito eloquente e estrategista performático. Usa o ritmo, carisma e astúcia mental para encantar cortes, desarmar conflitos e apoiar o grupo.',
    naturalTraitName: 'Magnetismo Social',
    naturalTrait:
      'Rola testes de carisma e influência social com Vantagem (4d6). Em comércios e feiras, tem Vantagem nas rolagens para negociar descontos em compras ou preços mais altos na venda de itens.',
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
