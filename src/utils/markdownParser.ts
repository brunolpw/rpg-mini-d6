export interface DocSubsection {
  id: string;
  title: string;
}

export interface DocSection {
  id: string;
  title: string;
  content: string;
  subsections: DocSubsection[];
}

export interface ClassPowerInfo {
  name: string;
  type: string;
  pp: string;
  effect: string;
  level1: string;
  level2: string;
  level3: string;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\{#.*?\}/g, '')
    .replace(/[*_`]/g, '')
    .trim()
    .replace(/[^\w\s-áàãâéêíóôõúç]/g, '')
    .replace(/\s+/g, '-');
}

function extractSubsections(lines: string[]): DocSubsection[] {
  const subs: DocSubsection[] = [];
  for (const line of lines) {
    const h2Match = /^##\s+(.+)$/.exec(line);
    if (h2Match) {
      const title = h2Match[1].replace(/\*\*/g, '').trim();
      if (title) {
        subs.push({ id: slugify(title), title });
      }
    }
  }
  return subs;
}

export function parseDocSections(rawMarkdown: string): DocSection[] {
  const cleaned = rawMarkdown.replace(/\s*\{#[^}]+\}/g, '');
  const lines = cleaned.split('\n');
  const sections: DocSection[] = [];

  let currentTitle = 'Capa & Sumário';
  let currentLines: string[] = [];

  for (const line of lines) {
    const h1Match = /^#\s+(.+)$/.exec(line);
    if (h1Match) {
      const prevContent = currentLines.join('\n').trim();
      if (prevContent) {
        sections.push({
          id: slugify(currentTitle),
          title: currentTitle,
          content: prevContent,
          subsections: extractSubsections(currentLines),
        });
      }
      currentTitle = h1Match[1].replace(/\*\*/g, '').trim();
      currentLines = [line];
    } else {
      currentLines.push(line);
    }
  }

  const lastContent = currentLines.join('\n').trim();
  if (lastContent) {
    sections.push({
      id: slugify(currentTitle),
      title: currentTitle,
      content: lastContent,
      subsections: extractSubsections(currentLines),
    });
  }

  return sections;
}

export function getEffectivePowerPP(
  power: ClassPowerInfo,
  level: 1 | 2 | 3
): string {
  const levelText =
    level === 1 ? power.level1 : level === 2 ? power.level2 : power.level3;
  if (!levelText) return power.pp;

  // Detecta padrões como "Custo reduzido para 2 PP", "Custo 3 PP", "Custo: 1 PP", "para 0 PP"
  const match =
    /(?:custo(?:\s+reduzido)?(?:\s+para)?\s*:?\s*)(\d+)\s*pp/i.exec(
      levelText
    );
  if (match) {
    return match[1];
  }
  return power.pp;
}

const CLASS_HEADINGS: Record<string, string> = {
  barbaro: 'Bárbaro',
  guerreiro: 'Guerreiro',
  paladino: 'Paladino',
  mago: 'Mago',
  druida: 'Druida',
  clerigo: 'Clérigo',
  ladino: 'Ladino',
  ranger: 'Ranger',
  bardo: 'Bardo',
};

export function parseClassPowers(
  rawMarkdown: string
): Record<string, ClassPowerInfo[]> {
  const cleaned = rawMarkdown.replace(/\s*\{#[^}]+\}/g, '');
  const lines = cleaned.split('\n');
  const result: Record<string, ClassPowerInfo[]> = {};

  let currentClassId: string | null = null;
  let inPowerTable = false;

  for (const line of lines) {
    const h2Match = /^##\s+(.+)$/.exec(line);
    if (h2Match) {
      const heading = h2Match[1].replace(/\*\*/g, '').trim();
      const found = Object.entries(CLASS_HEADINGS).find(
        ([, name]) => name.toLowerCase() === heading.toLowerCase()
      );
      currentClassId = found ? found[0] : null;
      inPowerTable = false;
      if (currentClassId && !result[currentClassId]) {
        result[currentClassId] = [];
      }
      continue;
    }

    if (/^#\s+/.test(line)) {
      currentClassId = null;
      inPowerTable = false;
      continue;
    }

    if (!currentClassId) continue;

    if (line.startsWith('| Poder | Tipo | PP |')) {
      inPowerTable = true;
      continue;
    }

    if (inPowerTable) {
      if (line.startsWith('| :----')) continue;
      if (!line.startsWith('|')) {
        inPowerTable = false;
        continue;
      }

      const cells = line
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim().replace(/\\([+\-=])/g, '$1'));

      if (cells.length >= 4 && cells[0]) {
        result[currentClassId].push({
          name: cells[0],
          type: cells[1] || '',
          pp: cells[2] || '0',
          effect: cells[3] || '',
          level1: cells[4] || '',
          level2: cells[5] || '',
          level3: cells[6] || '',
        });
      }
    }
  }

  return result;
}
