import { useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  Printer,
  Download,
  Upload,
  Shield,
  Heart,
  Sparkles,
  Copy,
  Info,
  X,
} from 'lucide-react';
import { CLASSES, RACES } from '../data/gameData';
import {
  getEffectivePowerPP,
  type ClassPowerInfo,
} from '../utils/markdownParser';
import { DiceRoller } from './DiceRoller';

export interface PowerSlot {
  name: string;
  level: 1 | 2 | 3;
  pp: string;
  notes: string;
}

export interface Character {
  id: string;
  name: string;
  raceId: string;
  classId: string;
  level: number;
  xp: number;
  gold: number;
  corpo: number;
  mente: number;
  espirito: number;
  pvCurrent: number;
  pvMax: number;
  ppCurrent: number;
  ppMax: number;
  shieldBonus: number;
  armorRes: number;
  movement: number;
  initiativeBonus: number;
  weaponMain: string;
  weaponSec: string;
  armorDesc: string;
  shieldDesc: string;
  backpack: string;
  notes: string;
  powers: PowerSlot[];
}

const STORAGE_KEY = 'mini-d6-sheets-v1';

function createEmptyCharacter(): Character {
  return {
    id: crypto.randomUUID(),
    name: 'Novo Aventureiro',
    raceId: 'humano',
    classId: 'guerreiro',
    level: 1,
    xp: 0,
    gold: 10,
    corpo: 5,
    mente: 5,
    espirito: 2,
    pvCurrent: 9,
    pvMax: 9,
    ppCurrent: 4,
    ppMax: 4,
    shieldBonus: 0,
    armorRes: 0,
    movement: 6,
    initiativeBonus: 0,
    weaponMain: '',
    weaponSec: '',
    armorDesc: '',
    shieldDesc: '',
    backpack: '',
    notes: '',
    powers: Array.from({ length: 8 }, () => ({
      name: '',
      level: 1,
      pp: '0',
      notes: '',
    })),
  };
}

interface CharacterSheetProps {
  classPowers: Record<string, ClassPowerInfo[]>;
}

export function CharacterSheet({ classPowers }: CharacterSheetProps) {
  const [inspectingPower, setInspectingPower] = useState<{
    info: ClassPowerInfo;
    currentLevel: 1 | 2 | 3;
  } | null>(null);
  const [sheets, setSheets] = useState<Character[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore parse errors
    }
    return [createEmptyCharacter()];
  });

  const [activeId, setActiveId] = useState<string>(() => sheets[0]?.id ?? '');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sheets));
    } catch {
      // ignore storage quota errors
    }
  }, [sheets]);

  const active = sheets.find((s) => s.id === activeId) ?? sheets[0];

  const updateActive = (patch: Partial<Character>) => {
    setSheets((prev) =>
      prev.map((s) => (s.id === active.id ? { ...s, ...patch } : s))
    );
  };

  const updatePower = (index: number, patch: Partial<PowerSlot>) => {
    const nextPowers = active.powers.map((p, i) =>
      i === index ? { ...p, ...patch } : p
    );
    updateActive({ powers: nextPowers });
  };

  const handleNew = () => {
    const created = createEmptyCharacter();
    setSheets((prev) => [...prev, created]);
    setActiveId(created.id);
  };

  const handleDuplicate = () => {
    const copy: Character = {
      ...active,
      id: crypto.randomUUID(),
      name: `${active.name} (Cópia)`,
      powers: active.powers.map((p) => ({ ...p })),
    };
    setSheets((prev) => [...prev, copy]);
    setActiveId(copy.id);
  };

  const handleDelete = () => {
    if (sheets.length <= 1) return;
    const remaining = sheets.filter((s) => s.id !== active.id);
    setSheets(remaining);
    setActiveId(remaining[0].id);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(active, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${active.name.toLowerCase().replace(/\s+/g, '-') || 'ficha'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(String(reader.result)) as Character;
        if (imported && imported.name) {
          const withId = { ...imported, id: crypto.randomUUID() };
          setSheets((prev) => [...prev, withId]);
          setActiveId(withId.id);
        }
      } catch {
        alert('Arquivo JSON inválido.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const selectedRace = RACES.find((r) => r.id === active.raceId) ?? RACES[0];
  const selectedClass =
    CLASSES.find((c) => c.id === active.classId) ?? CLASSES[0];

  const totalCorpo = active.corpo + selectedRace.bonus.corpo;
  const totalMente = active.mente + selectedRace.bonus.mente;
  const totalEspirito = active.espirito + selectedRace.bonus.espirito;

  const defFisica = 10 + totalCorpo + active.shieldBonus;
  const defMagica = 10 + totalEspirito;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Barra de Gerenciamento (Oculta na impressão) */}
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={active.id}
            onChange={(e) => setActiveId(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-medium text-slate-100 focus:border-indigo-500 focus:outline-none"
          >
            {sheets.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name || 'Sem Nome'} (Nv. {s.level})
              </option>
            ))}
          </select>

          <button
            onClick={handleNew}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            title="Nova Ficha"
          >
            <Plus className="h-4 w-4" /> Nova
          </button>

          <button
            onClick={handleDuplicate}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700"
            title="Duplicar Ficha"
          >
            <Copy className="h-4 w-4" />
          </button>

          {sheets.length > 1 && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-lg border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-300 hover:bg-red-900/50"
              title="Excluir Ficha"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700"
          >
            <Download className="h-4 w-4" /> Exportar
          </button>

          <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700">
            <Upload className="h-4 w-4" /> Importar
            <input
              type="file"
              accept="application/json"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            <Printer className="h-4 w-4" /> Imprimir / PDF
          </button>
        </div>
      </div>

      <DiceRoller
        corpo={totalCorpo}
        mente={totalMente}
        espirito={totalEspirito}
      />

      {/* Área da Ficha (Imprimível em A4) */}
      <div className="print-sheet space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        {/* Cabeçalho */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Nome do Personagem
            </label>
            <input
              type="text"
              value={active.name}
              onChange={(e) => updateActive({ name: e.target.value })}
              className="print-input mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-lg font-bold text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 sm:w-72">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400">
                Nível
              </label>
              <input
                type="number"
                min={1}
                max={15}
                value={active.level}
                onChange={(e) =>
                  updateActive({ level: Math.max(1, Number(e.target.value)) })
                }
                className="print-input mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-2 text-center font-bold text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400">
                XP
              </label>
              <input
                type="number"
                min={0}
                value={active.xp}
                onChange={(e) =>
                  updateActive({ xp: Math.max(0, Number(e.target.value)) })
                }
                className="print-input mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-2 text-center text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400">
                PO
              </label>
              <input
                type="number"
                min={0}
                value={active.gold}
                onChange={(e) =>
                  updateActive({ gold: Math.max(0, Number(e.target.value)) })
                }
                className="print-input mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-2 text-center text-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Raça e Classe */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="print-card rounded-lg border border-slate-800 bg-slate-950/60 p-3">
            <label className="block text-xs font-semibold uppercase text-slate-400">
              Raça
            </label>
            <select
              value={active.raceId}
              onChange={(e) => updateActive({ raceId: e.target.value })}
              className="print-input mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-sm font-semibold text-slate-100"
            >
              {RACES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-slate-400">
              {selectedRace.description}
            </p>
          </div>

          <div className="print-card rounded-lg border border-slate-800 bg-slate-950/60 p-3">
            <label className="block text-xs font-semibold uppercase text-slate-400">
              Classe
            </label>
            <select
              value={active.classId}
              onChange={(e) => updateActive({ classId: e.target.value })}
              className="print-input mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-sm font-semibold text-slate-100"
            >
              {CLASSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.style}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-slate-400">
              Base: Corpo ({selectedClass.baseMod.corpo >= 0 ? '+' : ''}
              {selectedClass.baseMod.corpo}), Mente (
              {selectedClass.baseMod.mente >= 0 ? '+' : ''}
              {selectedClass.baseMod.mente}), Espírito (
              {selectedClass.baseMod.espirito >= 0 ? '+' : ''}
              {selectedClass.baseMod.espirito}) | PV: {selectedClass.pvFormula}{' '}
              | PP: {selectedClass.ppFormula}
            </p>
          </div>
        </div>

        {/* Atributos e Status de Combate */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Atributos */}
          <div className="print-card rounded-lg border border-slate-800 bg-slate-950/60 p-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Atributos (Base + Bônus Racial = Total)
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
                <div className="text-xs font-semibold text-slate-400">Corpo</div>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={active.corpo}
                  onChange={(e) =>
                    updateActive({ corpo: Number(e.target.value) })
                  }
                  className="print-input mt-1 w-full rounded border border-slate-700 bg-slate-950 py-1 text-center text-lg font-bold text-slate-100"
                />
                <div className="mt-1 text-xs text-indigo-400">
                  Total: <strong>{totalCorpo}</strong>
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
                <div className="text-xs font-semibold text-slate-400">Mente</div>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={active.mente}
                  onChange={(e) =>
                    updateActive({ mente: Number(e.target.value) })
                  }
                  className="print-input mt-1 w-full rounded border border-slate-700 bg-slate-950 py-1 text-center text-lg font-bold text-slate-100"
                />
                <div className="mt-1 text-xs text-indigo-400">
                  Total: <strong>{totalMente}</strong>
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
                <div className="text-xs font-semibold text-slate-400">
                  Espírito
                </div>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={active.espirito}
                  onChange={(e) =>
                    updateActive({ espirito: Number(e.target.value) })
                  }
                  className="print-input mt-1 w-full rounded border border-slate-700 bg-slate-950 py-1 text-center text-lg font-bold text-slate-100"
                />
                <div className="mt-1 text-xs text-indigo-400">
                  Total: <strong>{totalEspirito}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Combate, PV e PP */}
          <div className="print-card rounded-lg border border-slate-800 bg-slate-950/60 p-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Status de Combate
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-center">
                <div className="flex items-center justify-center gap-1 text-xs text-rose-400">
                  <Heart className="h-3.5 w-3.5" /> PV
                </div>
                <div className="mt-1 flex items-center justify-center gap-1">
                  <input
                    type="number"
                    value={active.pvCurrent}
                    onChange={(e) =>
                      updateActive({ pvCurrent: Number(e.target.value) })
                    }
                    className="print-input w-12 rounded border border-slate-700 bg-slate-950 py-0.5 text-center text-sm font-bold"
                  />
                  <span className="text-slate-500">/</span>
                  <input
                    type="number"
                    value={active.pvMax}
                    onChange={(e) =>
                      updateActive({ pvMax: Number(e.target.value) })
                    }
                    className="print-input w-12 rounded border border-slate-700 bg-slate-950 py-0.5 text-center text-sm font-bold"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-center">
                <div className="flex items-center justify-center gap-1 text-xs text-sky-400">
                  <Sparkles className="h-3.5 w-3.5" /> PP
                </div>
                <div className="mt-1 flex items-center justify-center gap-1">
                  <input
                    type="number"
                    value={active.ppCurrent}
                    onChange={(e) =>
                      updateActive({ ppCurrent: Number(e.target.value) })
                    }
                    className="print-input w-12 rounded border border-slate-700 bg-slate-950 py-0.5 text-center text-sm font-bold"
                  />
                  <span className="text-slate-500">/</span>
                  <input
                    type="number"
                    value={active.ppMax}
                    onChange={(e) =>
                      updateActive({ ppMax: Number(e.target.value) })
                    }
                    className="print-input w-12 rounded border border-slate-700 bg-slate-950 py-0.5 text-center text-sm font-bold"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-center">
                <div className="flex items-center justify-center gap-1 text-xs text-emerald-400">
                  <Shield className="h-3.5 w-3.5" /> Def. Física
                </div>
                <div className="mt-1 text-lg font-extrabold text-slate-100">
                  {defFisica}
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-center">
                <div className="flex items-center justify-center gap-1 text-xs text-violet-400">
                  <Shield className="h-3.5 w-3.5" /> Def. Mágica
                </div>
                <div className="mt-1 text-lg font-extrabold text-slate-100">
                  {defMagica}
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
              <div>
                <span className="text-slate-400">Escudo (+Def)</span>
                <input
                  type="number"
                  min={0}
                  value={active.shieldBonus}
                  onChange={(e) =>
                    updateActive({ shieldBonus: Number(e.target.value) })
                  }
                  className="print-input mt-1 w-full rounded border border-slate-700 bg-slate-950 py-1 text-center font-semibold"
                />
              </div>
              <div>
                <span className="text-slate-400">Res. Física</span>
                <input
                  type="number"
                  min={0}
                  value={active.armorRes}
                  onChange={(e) =>
                    updateActive({ armorRes: Number(e.target.value) })
                  }
                  className="print-input mt-1 w-full rounded border border-slate-700 bg-slate-950 py-1 text-center font-semibold"
                />
              </div>
              <div>
                <span className="text-slate-400">Desloc. (m)</span>
                <input
                  type="number"
                  min={0}
                  value={active.movement}
                  onChange={(e) =>
                    updateActive({ movement: Number(e.target.value) })
                  }
                  className="print-input mt-1 w-full rounded border border-slate-700 bg-slate-950 py-1 text-center font-semibold"
                />
              </div>
              <div>
                <span className="text-slate-400">Iniciativa</span>
                <input
                  type="number"
                  value={active.initiativeBonus}
                  onChange={(e) =>
                    updateActive({ initiativeBonus: Number(e.target.value) })
                  }
                  className="print-input mt-1 w-full rounded border border-slate-700 bg-slate-950 py-1 text-center font-semibold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Poderes e Habilidades */}
        <div className="print-card rounded-lg border border-slate-800 bg-slate-950/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Poderes e Habilidades (8 Slots)
            </h3>
            <span className="no-print text-xs text-slate-500">
              Selecione da classe ({selectedClass.name}) ou digite livremente
            </span>
          </div>

          <datalist id={`powers-${active.classId}`}>
            {(classPowers[active.classId] ?? []).map((p) => (
              <option key={p.name} value={p.name} />
            ))}
          </datalist>

          <div className="grid gap-2 sm:grid-cols-2">
            {active.powers.map((power, idx) => {
              const allPowers = Object.values(classPowers).flat();
              const matchedPower =
                (classPowers[active.classId] ?? []).find(
                  (p) => p.name.toLowerCase() === power.name.trim().toLowerCase()
                ) ??
                allPowers.find(
                  (p) => p.name.toLowerCase() === power.name.trim().toLowerCase()
                );

              return (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900/40 p-2"
                >
                  <span className="w-4 text-xs font-bold text-slate-500">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    list={`powers-${active.classId}`}
                    placeholder="Nome do Poder"
                    value={power.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      const match = (classPowers[active.classId] ?? []).find(
                        (p) => p.name.toLowerCase() === val.trim().toLowerCase()
                      );
                      updatePower(
                        idx,
                        match
                          ? {
                              name: match.name,
                              pp: getEffectivePowerPP(match, power.level),
                            }
                          : { name: val }
                      );
                    }}
                    className="print-input min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100"
                  />
                  <select
                    value={power.level}
                    onChange={(e) => {
                      const nextLevel = Number(e.target.value) as 1 | 2 | 3;
                      updatePower(
                        idx,
                        matchedPower
                          ? {
                              level: nextLevel,
                              pp: getEffectivePowerPP(matchedPower, nextLevel),
                            }
                          : { level: nextLevel }
                      );
                    }}
                    className="print-input rounded border border-slate-700 bg-slate-950 px-1.5 py-1 text-xs text-slate-200"
                  >
                    <option value={1}>Nv 1</option>
                    <option value={2}>Nv 2</option>
                    <option value={3}>Nv 3</option>
                  </select>
                  <div className="flex items-center gap-1" title="Custo em Pontos de Poder (PP)">
                    <span className="text-[10px] font-semibold uppercase text-sky-400">
                      PP
                    </span>
                    <input
                      type="text"
                      value={power.pp}
                      onChange={(e) => updatePower(idx, { pp: e.target.value })}
                      className="print-input w-9 rounded border border-slate-700 bg-slate-950 px-1 py-1 text-center text-xs text-sky-300"
                    />
                  </div>
                  {matchedPower && (
                    <button
                      type="button"
                      onClick={() =>
                        setInspectingPower({
                          info: matchedPower,
                          currentLevel: power.level,
                        })
                      }
                      className="no-print rounded p-1 text-indigo-400 hover:bg-indigo-950/60 hover:text-indigo-300"
                      title="Ver descrição do poder"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal de Consulta Rápida de Poder */}
        {inspectingPower && (
          <div
            className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setInspectingPower(null)}
          >
            <div
              className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-lg font-bold text-slate-100">
                    {inspectingPower.info.name}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {inspectingPower.info.type} • Custo:{' '}
                    <span className="font-semibold text-sky-400">
                      {inspectingPower.info.pp} PP
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setInspectingPower(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <p className="text-slate-200">{inspectingPower.info.effect}</p>

                <div className="space-y-2">
                  {[
                    { lv: 1, text: inspectingPower.info.level1 },
                    { lv: 2, text: inspectingPower.info.level2 },
                    { lv: 3, text: inspectingPower.info.level3 },
                  ].map((item) => (
                    <div
                      key={item.lv}
                      className={`rounded-lg border p-2.5 text-xs ${
                        inspectingPower.currentLevel === item.lv
                          ? 'border-indigo-500 bg-indigo-950/40 text-indigo-100'
                          : 'border-slate-800 bg-slate-950/60 text-slate-300'
                      }`}
                    >
                      <span className="font-bold uppercase text-indigo-400">
                        Nível {item.lv}:{' '}
                      </span>
                      {item.text || '—'}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Equipamentos e Mochila */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="print-card rounded-lg border border-slate-800 bg-slate-950/60 p-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Equipamentos Preparados (Em Uso)
            </h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400">Arma Principal</span>
                <input
                  type="text"
                  value={active.weaponMain}
                  onChange={(e) => updateActive({ weaponMain: e.target.value })}
                  placeholder="Ex: Espada Longa (1d6)"
                  className="print-input mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-slate-100"
                />
              </div>
              <div>
                <span className="text-slate-400">Arma Secundária / Arco</span>
                <input
                  type="text"
                  value={active.weaponSec}
                  onChange={(e) => updateActive({ weaponSec: e.target.value })}
                  placeholder="Ex: Adaga (1d3)"
                  className="print-input mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-slate-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400">Armadura</span>
                  <input
                    type="text"
                    value={active.armorDesc}
                    onChange={(e) =>
                      updateActive({ armorDesc: e.target.value })
                    }
                    placeholder="Ex: Couro (Res 1)"
                    className="print-input mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-slate-100"
                  />
                </div>
                <div>
                  <span className="text-slate-400">Escudo / Foco</span>
                  <input
                    type="text"
                    value={active.shieldDesc}
                    onChange={(e) =>
                      updateActive({ shieldDesc: e.target.value })
                    }
                    placeholder="Ex: Escudo (+1 Def)"
                    className="print-input mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-slate-100"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="print-card flex flex-col rounded-lg border border-slate-800 bg-slate-950/60 p-4">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              Mochila, Inventário e Anotações
            </h3>
            <textarea
              value={active.backpack}
              onChange={(e) => updateActive({ backpack: e.target.value })}
              placeholder="Poções, corda, tochas, rações, itens mágicos..."
              rows={5}
              className="print-input w-full flex-1 rounded border border-slate-700 bg-slate-950 p-2.5 text-xs text-slate-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
