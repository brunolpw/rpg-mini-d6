export interface RaceInfo {
  id: string;
  name: string;
  description: string;
  traitName: string;
  trait: string;
  bonus: { corpo: number; mente: number; espirito: number };
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
  pvDice: 1 | 2;
  pvBonus: number;
  ppFormula: string;
  ppDice: 1 | 2;
  ppBonus: number;
  initialPowers: number;
}

export const RACES: RaceInfo[] = [
  {
    id: 'humano',
    name: 'Humano',
    description:
      'Espécie mais populosa e ambiciosa, notável pela incrível adaptabilidade a qualquer ofício, clima ou estilo de magia, compensando limitações rapidamente.',
    traitName: 'Versatilidade',
    trait:
      '+1 em um Atributo à sua escolha (não podendo ser o mesmo bônus recebido pela classe).',
    bonus: { corpo: 0, mente: 0, espirito: 0 },
  },
  {
    id: 'anao',
    name: 'Anão',
    description:
      'Mestres da cantaria e metalurgia forjados nas montanhas. Possuem compleição física densa, passos firmes e tenacidade inabalável contra fadiga e pancadas.',
    traitName: 'Vigor da Pedra',
    trait:
      '+1 em Corpo (aumentando diretamente o PV inicial e a Defesa Física base).',
    bonus: { corpo: 1, mente: 0, espirito: 0 },
  },
  {
    id: 'elfo',
    name: 'Elfo',
    description:
      'Seres graciosos de longevidade milenar e sentidos aguçados, sintonizados com as florestas e correntes arcanas cósmicas.',
    traitName: 'Mente Arcana',
    trait:
      '+1 em Mente e começa o jogo com +1 Poder de Nível 1 adicional da sua classe à escolha (ativo ou passivo).',
    bonus: { corpo: 0, mente: 1, espirito: 0 },
  },
  {
    id: 'orc',
    name: 'Orc',
    description:
      'Guerreiros viscerais e sobreviventes de terras áridas, moldados por honra marcial, constituição vigorosa e fúria indomável.',
    traitName: 'Tenacidade Brutal',
    trait:
      '+1 em Corpo. Uma vez por combate, ao ter seus PVs reduzidos a 0, resiste por puro vigor e permanece consciente com 1 PV.',
    bonus: { corpo: 1, mente: 0, espirito: 0 },
  },
  {
    id: 'pequenino',
    name: 'Pequenino',
    description:
      'Povo de passos leves, coração valente e reflexos surpreendentes. Compensam o porte pequeno com audácia e uma sorte quase mágica.',
    traitName: 'Sorte Inata',
    trait:
      '+1 em Mente. Uma vez por combate, pode rolar novamente qualquer teste de ataque ou defesa que tenha falhado, assumindo o novo resultado.',
    bonus: { corpo: 0, mente: 1, espirito: 0 },
  },
  {
    id: 'gnomo',
    name: 'Gnomo',
    description:
      'Pesquisadores brilhantes de engenharia mística e alquimia. Sua estatura modesta esconde uma reserva espiritual e afinidade arcana superior.',
    traitName: 'Foco Interior',
    trait:
      '+1 em Espírito (aumentando diretamente o PP máximo inicial e o poder de conjurações).',
    bonus: { corpo: 0, mente: 0, espirito: 1 },
  },
  {
    id: 'draconato',
    name: 'Draconato',
    description:
      'Herdeiros orgulhosos das antigas linhagens dracônicas, protegidos por escamas espessas e munidos do poder destrutivo primordial de seus ancestrais.',
    traitName: 'Sopro Elemental',
    trait:
      '+1 em Corpo. Dispara um sopro em área pequena (2m) 1x por combate causando 1d3 + Corpo de dano (Fogo, Gelo, Raio ou Veneno). Fora de combate, possui resistência contra o elemento.',
    bonus: { corpo: 1, mente: 0, espirito: 0 },
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
    pvFormula: 'Corpo + 2d3 + 1',
    pvDice: 2,
    pvBonus: 1,
    ppFormula: 'Espírito + 1d3 + 1',
    ppDice: 1,
    ppBonus: 1,
    initialPowers: 1,
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
    pvFormula: 'Corpo + 2d3 + 1',
    pvDice: 2,
    pvBonus: 1,
    ppFormula: 'Espírito + 1d3 + 1',
    ppDice: 1,
    ppBonus: 1,
    initialPowers: 1,
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
    pvFormula: 'Corpo + 2d3 + 1',
    pvDice: 2,
    pvBonus: 1,
    ppFormula: 'Espírito + 1d3 + 1',
    ppDice: 1,
    ppBonus: 1,
    initialPowers: 2,
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
    pvFormula: 'Corpo + 1d3 + 1',
    pvDice: 1,
    pvBonus: 1,
    ppFormula: 'Espírito + 2d3 + 1',
    ppDice: 2,
    ppBonus: 1,
    initialPowers: 3,
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
    pvFormula: 'Corpo + 1d3 + 1',
    pvDice: 1,
    pvBonus: 1,
    ppFormula: 'Espírito + 2d3 + 1',
    ppDice: 2,
    ppBonus: 1,
    initialPowers: 2,
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
    pvFormula: 'Corpo + 1d3 + 1',
    pvDice: 1,
    pvBonus: 1,
    ppFormula: 'Espírito + 2d3 + 1',
    ppDice: 2,
    ppBonus: 1,
    initialPowers: 2,
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
    pvDice: 2,
    pvBonus: 0,
    ppFormula: 'Espírito + 2d3',
    ppDice: 2,
    ppBonus: 0,
    initialPowers: 1,
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
    pvDice: 2,
    pvBonus: 0,
    ppFormula: 'Espírito + 2d3',
    ppDice: 2,
    ppBonus: 0,
    initialPowers: 1,
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
    pvDice: 2,
    pvBonus: 0,
    ppFormula: 'Espírito + 2d3',
    ppDice: 2,
    ppBonus: 0,
    initialPowers: 2,
  },
];

export interface WeaponPreset {
  label: string;
  twoHanded: boolean;
}

export const WEAPONS: WeaponPreset[] = [
  { label: 'Adaga (1d3)', twoHanded: false },
  { label: 'Espada Curta (1d3+1)', twoHanded: false },
  { label: 'Rapieira (1d3+1)', twoHanded: false },
  { label: 'Cimitarra Ágil (1d3+1, +1 Inic)', twoHanded: false },
  { label: 'Chicote Tático (1d3, 3m)', twoHanded: false },
  { label: 'Lâminas Gêmeas (2d3, +1 Esq) [2 Mãos]', twoHanded: true },
  { label: 'Bordão de Peregrino (1d3+1) [2 Mãos]', twoHanded: true },
  { label: 'Foice Druídica (1d3+1)', twoHanded: false },
  { label: 'Maça Cerimonial (1d3+1)', twoHanded: false },
  { label: 'Lança da Fé (2d3 Radiante, 2m) [2 Mãos]', twoHanded: true },
  { label: 'Cetro Solar (1d3+2 Radiante)', twoHanded: false },
  { label: 'Cajado dos Antigos (2d3+2) [2 Mãos]', twoHanded: true },
  { label: 'Espada Longa (1d6)', twoHanded: false },
  { label: 'Machado de Batalha (1d6)', twoHanded: false },
  { label: 'Maça (1d6)', twoHanded: false },
  { label: 'Martelo de Guerra (1d6)', twoHanded: false },
  { label: 'Lança (1d6)', twoHanded: false },
  { label: 'Espadão / Montante (1d6+2) [2 Mãos]', twoHanded: true },
  { label: 'Machado de Duas Mãos (1d6+2) [2 Mãos]', twoHanded: true },
  { label: 'Martelo Pesado (1d6+2) [2 Mãos]', twoHanded: true },
  { label: 'Alabarda (1d6+2) [2 Mãos]', twoHanded: true },
  { label: 'Cajado (1d3+1) [2 Mãos]', twoHanded: true },
  { label: 'Funda (1d3) [2 Mãos]', twoHanded: true },
  { label: 'Bumerangue (1d3)', twoHanded: false },
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
  { label: 'Couro Simples (Res 1)', res: 1 },
  { label: 'Couro Trabalhado (Res 2)', res: 2 },
  { label: 'Brunea (Res 4)', res: 4 },
  { label: 'Cota de Malha (Res 6)', res: 6 },
  { label: 'Placas (Res 8)', res: 8 },
  { label: 'Colete de Couro Leve (+1 Def Física)', res: 0 },
  { label: 'Traje de Infiltração (+1 Def Física, +1 Inic)', res: 0 },
  { label: 'Gibão do Acrobata (+2 Def Física, +1m Mov)', res: 0 },
  { label: 'Manto dos Ventos (+2 Def Física, Vant Esquiva)', res: 0 },
  { label: 'Camisão de Seda Élfica (+3 Def Física, Res 1)', res: 1 },
  { label: 'Túnica do Acólito (+1 Def Mágica)', res: 0 },
  { label: 'Vestes de Linho Consagrado (+1 Def Mágica, +1 Cura)', res: 0 },
  { label: 'Manto da Floresta (+2 Def Mágica)', res: 0 },
  { label: 'Capa de Runas (+2 Def Mágica)', res: 0 },
  { label: 'Hábito do Penitente (+2 Def Mágica, Res 2)', res: 2 },
  { label: 'Vestimenta do Arquimago (+4 Def Mágica, +1 PP)', res: 0 },
];

export interface ShieldPreset {
  label: string;
  defBonus: number;
}

export const SHIELDS_AND_FOCI: ShieldPreset[] = [
  { label: 'Escudo Madeira (+1 Def)', defBonus: 1 },
  { label: 'Escudo Torre (+3 Def)', defBonus: 3 },
  { label: 'Escudo Leve (+1 Def)', defBonus: 1 },
  { label: 'Escudo Pesado (+2 Def)', defBonus: 2 },
  { label: 'Broquel Leve (+1 Def, +1 Inic)', defBonus: 1 },
  { label: 'Adaga de Parada (+1 Def, Contra-ataque)', defBonus: 1 },
  { label: 'Capa de Duelo (+1 Def)', defBonus: 1 },
  { label: 'Broquel Entalhado (+1 Def - Druida)', defBonus: 1 },
  { label: 'Símbolo Sagrado Fortificado (+1 Def, +1 Def Mág)', defBonus: 1 },
  { label: 'Tomo Guardião (+2 Def Mágica)', defBonus: 0 },
  { label: 'Cajado Arcano (Foco +1 Dano Mágico)', defBonus: 0 },
  { label: 'Orbe Elemental (Foco)', defBonus: 0 },
  { label: 'Símbolo Sagrado (Foco +1 Cura)', defBonus: 0 },
];

export const CONSUMABLES: string[] = [
  'Poção de Cura Menor (1d6 PV)',
  'Poção de Cura Maior (2d6 PV)',
  'Poção de Mana / PP (1d6 PP)',
  'Antídoto',
  'Elixir Corpo (Vantagem)',
  'Elixir Mente (Vantagem)',
  'Elixir Espírito (Vantagem)',
  'Ração de Viagem (1 dia)',
  'Tocha',
  'Corda (15m)',
  'Kit de Ladrão / Gazuas',
  'Kit de Primeiros Socorros',
];
