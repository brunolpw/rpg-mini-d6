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
  AlertTriangle,
  Dices,
} from 'lucide-react';
import {
  ARMORS,
  CLASSES,
  CONSUMABLES,
  RACES,
  SHIELDS_AND_FOCI,
  WEAPONS,
} from '../data/gameData';
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
  condition: string;
  deathSuccesses: number;
  deathFailures: number;
  weaponMain: string;
  weaponSec: string;
  armorDesc: string;
  shieldDesc: string;
  backpack: string;
  backpackItems?: { name: string; qty: number }[];
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
    condition: 'Normal / Acordado',
    deathSuccesses: 0,
    deathFailures: 0,
    weaponMain: '',
    weaponSec: '',
    armorDesc: '',
    shieldDesc: '',
    backpack: '',
    backpackItems: [],
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
      prev.map((s) => {
        if (s.id !== active.id) return s;
        const next = { ...s, ...patch };

        const prevRace = RACES.find((r) => r.id === s.raceId) ?? RACES[0];
        const nextRace = RACES.find((r) => r.id === next.raceId) ?? RACES[0];
        const prevTotalCorpo = s.corpo + prevRace.bonus.corpo;
        const nextTotalCorpo = next.corpo + nextRace.bonus.corpo;
        const deltaCorpo = nextTotalCorpo - prevTotalCorpo;

        const prevTotalEsp = s.espirito + prevRace.bonus.espirito;
        const nextTotalEsp = next.espirito + nextRace.bonus.espirito;
        const deltaEsp = nextTotalEsp - prevTotalEsp;

        if (deltaCorpo !== 0 && patch.pvMax === undefined) {
          next.pvMax = Math.max(1, s.pvMax + deltaCorpo);
          if (patch.pvCurrent === undefined) {
            next.pvCurrent = Math.max(0, s.pvCurrent + deltaCorpo);
          }
        }
        if (deltaEsp !== 0 && patch.ppMax === undefined) {
          next.ppMax = Math.max(1, s.ppMax + deltaEsp);
          if (patch.ppCurrent === undefined) {
            next.ppCurrent = Math.max(0, s.ppCurrent + deltaEsp);
          }
        }

        if (patch.pvCurrent !== undefined) {
          if (patch.pvCurrent <= 0) {
            next.pvCurrent = 0;
            next.condition = 'Caído (0 PV)';
          } else if (s.pvCurrent === 0 && s.condition === 'Caído (0 PV)') {
            next.condition = 'Normal / Acordado';
            next.deathSuccesses = 0;
            next.deathFailures = 0;
          }
        }
        return next;
      })
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

  const [itemToAdd, setItemToAdd] = useState<string>(CONSUMABLES[0]);

  const [rollModal, setRollModal] = useState<{
    title: string;
    subtitle: string;
    isRolling: boolean;
    dice: number[];
    extraDice?: number[];
    summary: string;
  } | null>(null);

  const handleRollAttribute = (label: string, attrTotal: number) => {
    const d6 = () => Math.floor(Math.random() * 6) + 1;
    let ticks = 0;
    const interval = setInterval(() => {
      ticks += 1;
      const preview = [d6(), d6(), d6()];
      setRollModal({
        title: `Teste de ${label}`,
        subtitle: `3d6 + ${label} (${attrTotal})`,
        isRolling: true,
        dice: preview,
        summary: 'Rolando 3d6...',
      });

      if (ticks >= 6) {
        clearInterval(interval);
        const finalDice = [d6(), d6(), d6()];
        const sum = finalDice.reduce((a, b) => a + b, 0);
        const total = sum + attrTotal;
        setRollModal({
          title: `Teste de ${label}`,
          subtitle: `3d6 + ${label} (${attrTotal})`,
          isRolling: false,
          dice: finalDice,
          summary: `[${finalDice.join(' + ')}] + ${attrTotal} = ${total}`,
        });
      }
    }, 60);
  };

  const handleRollBaseAttributes = () => {
    const d3 = () => Math.floor(Math.random() * 3) + 1;
    let ticks = 0;
    const interval = setInterval(() => {
      ticks += 1;
      const preview = [d3() + 3, d3() + 3, d3() + 3];
      setRollModal({
        title: 'Gerando Ficha Inicial',
        subtitle: `${selectedRace.name} • ${selectedClass.name}`,
        isRolling: true,
        dice: preview,
        summary: 'Rolando atributos, PV e PP...',
      });
      if (ticks >= 6) {
        clearInterval(interval);
        const c = Math.max(1, d3() + 3 + selectedClass.baseMod.corpo);
        const m = Math.max(1, d3() + 3 + selectedClass.baseMod.mente);
        const e = Math.max(1, d3() + 3 + selectedClass.baseMod.espirito);

        const nextTotalCorpo = c + selectedRace.bonus.corpo;
        const nextTotalEspirito = e + selectedRace.bonus.espirito;
        const pvRoll = d3() + d3();
        const ppRoll = selectedClass.ppDice === 2 ? d3() + d3() : d3();
        const nextPv = Math.max(1, nextTotalCorpo + pvRoll);
        const nextPp = Math.max(1, nextTotalEspirito + ppRoll);

        updateActive({
          corpo: c,
          mente: m,
          espirito: e,
          pvMax: nextPv,
          pvCurrent: nextPv,
          ppMax: nextPp,
          ppCurrent: nextPp,
        });
        setRollModal({
          title: 'Ficha Inicial Gerada!',
          subtitle: `${selectedRace.name} • ${selectedClass.name}`,
          isRolling: false,
          dice: [c, m, e],
          extraDice: [nextPv, nextPp],
          summary: `Corpo: ${c} | Mente: ${m} | Espírito: ${e}  •  PV: ${nextPv} | PP: ${nextPp}`,
        });
      }
    }, 60);
  };

  const handleDeathSave = () => {
    const d6 = () => Math.floor(Math.random() * 6) + 1;
    let ticks = 0;
    const interval = setInterval(() => {
      ticks += 1;
      const preview = [d6(), d6(), d6()];
      setRollModal({
        title: 'Teste de Morte (Melhor de 5)',
        subtitle: `3d6 + Corpo (${totalCorpo}) ≥ 12`,
        isRolling: true,
        dice: preview,
        summary: 'Testando resistência...',
      });
      if (ticks >= 6) {
        clearInterval(interval);
        const finalDice = [d6(), d6(), d6()];
        const total = finalDice.reduce((a, b) => a + b, 0) + totalCorpo;
        const success = total >= 12;
        const nextSucc = (active.deathSuccesses ?? 0) + (success ? 1 : 0);
        const nextFail = (active.deathFailures ?? 0) + (success ? 0 : 1);

        if (nextSucc >= 3) {
          updateActive({
            pvCurrent: 1,
            condition: 'Estabilizado (1 PV)',
            deathSuccesses: 0,
            deathFailures: 0,
          });
        } else {
          updateActive({
            deathSuccesses: nextSucc,
            deathFailures: nextFail,
          });
        }

        setRollModal({
          title: success ? 'Sucesso no Teste de Morte!' : 'Falha no Teste de Morte',
          subtitle: `3d6 + Corpo (${totalCorpo}) ≥ 12`,
          isRolling: false,
          dice: finalDice,
          summary: `[${finalDice.join(' + ')}] + ${totalCorpo} = ${total} • ${
            nextSucc >= 3
              ? '3 Sucessos! Personagem retornou com 1 PV!'
              : success
              ? `Sucessos: ${nextSucc}/3 | Falhas: ${nextFail}/3`
              : `Sucessos: ${nextSucc}/3 | Falhas: ${nextFail}/3`
          }`,
        });
      }
    }, 60);
  };

  const [incomingDamage, setIncomingDamage] = useState<number>(0);
  const [damageType, setDamageType] = useState<'fisico' | 'elemental' | 'mistico'>('fisico');
  const [selectedPowerIdx, setSelectedPowerIdx] = useState<number>(0);
  const [combatLog, setCombatLog] = useState<string>('');

  const isTwoHandedMain =
    WEAPONS.some(
      (w) =>
        w.twoHanded &&
        w.label.toLowerCase() === active.weaponMain.trim().toLowerCase()
    ) || active.weaponMain.includes('[2 Mãos]');

  const hasOffHandConflict =
    isTwoHandedMain &&
    ((active.weaponSec.trim() !== '' &&
      active.weaponSec.trim() !== 'Ocupada (Arma de 2 Mãos)') ||
      active.shieldDesc.trim() !== '');

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

      {/* Resolução Rápida de Combate (Magia/PP & Dano Recebido) */}
      <div className="no-print mb-6 grid gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
            Usar Poder / Magia / Ataque (Consome PP & Rola)
          </span>
          <div className="flex items-center gap-2">
            <select
              value={selectedPowerIdx}
              onChange={(e) => setSelectedPowerIdx(Number(e.target.value))}
              className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-100"
            >
              <option value={-1}>
                Arma Principal: {active.weaponMain || 'Desarmado (Corpo)'}
              </option>
              {active.weaponSec &&
                active.weaponSec !== 'Ocupada (Arma de 2 Mãos)' && (
                  <option value={-2}>
                    Arma Secundária: {active.weaponSec}
                  </option>
                )}
              {active.powers.map((p, idx) => (
                <option key={idx} value={idx}>
                  {p.name ? `${p.name} (${p.pp || 0} PP)` : `Slot ${idx + 1} (vazio)`}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                if (selectedPowerIdx === -1) {
                  const weaponLabel = active.weaponMain || 'Ataque Desarmado';
                  handleRollAttribute(`Ataque (${weaponLabel})`, totalCorpo);
                  setCombatLog(`Atacou com ${weaponLabel} (3d6 + Corpo ${totalCorpo}).`);
                  return;
                }
                if (selectedPowerIdx === -2) {
                  handleRollAttribute(`Ataque (${active.weaponSec})`, totalCorpo);
                  setCombatLog(`Atacou com ${active.weaponSec} (3d6 + Corpo ${totalCorpo}).`);
                  return;
                }
                const p = active.powers[selectedPowerIdx];
                if (!p || !p.name) return;
                const cost = Math.max(0, Number(p.pp) || 0);
                if (active.ppCurrent < cost) {
                  setCombatLog(`PP insuficiente para ${p.name} (custa ${cost} PP).`);
                  return;
                }
                updateActive({ ppCurrent: active.ppCurrent - cost });
                handleRollAttribute(p.name, totalEspirito);
                setCombatLog(`Usou ${p.name} (-${cost} PP) • Rolagem 3d6 + Espírito.`);
              }}
              className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-500"
            >
              Atacar / Conjurar
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
            Dano Recebido (Calcula Res. Física / Elementos)
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="number"
              min={0}
              value={incomingDamage}
              onChange={(e) => setIncomingDamage(Math.max(0, Number(e.target.value)))}
              placeholder="Dano"
              className="w-20 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-center text-xs font-bold text-slate-100"
            />
            <select
              value={damageType}
              onChange={(e) =>
                setDamageType(e.target.value as 'fisico' | 'elemental' | 'mistico')
              }
              className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-100"
            >
              <option value="fisico">Físico (Armadura -{active.armorRes})</option>
              <option value="elemental">Elemental (Fogo/Gelo/Raio)</option>
              <option value="mistico">Místico / Psíquico</option>
            </select>
            <button
              type="button"
              onClick={() => {
                const reduced =
                  damageType === 'fisico'
                    ? Math.max(0, incomingDamage - active.armorRes)
                    : incomingDamage;
                const nextPv = Math.max(0, active.pvCurrent - reduced);
                updateActive({ pvCurrent: nextPv });
                setCombatLog(
                  `Recebeu ${reduced} de dano ${damageType} (${incomingDamage} bruto). PV: ${nextPv}/${active.pvMax}.`
                );
              }}
              className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500"
            >
              Aplicar Dano
            </button>
          </div>
        </div>

        {combatLog && (
          <div className="md:col-span-2 rounded-md border border-slate-800 bg-slate-950/70 px-3 py-1.5 text-xs text-slate-300">
            {combatLog}
          </div>
        )}
      </div>

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
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Atributos (Base + Racial = Total)
              </h3>
              <button
                type="button"
                onClick={handleRollBaseAttributes}
                className="no-print flex items-center gap-1 rounded-md border border-emerald-700/60 bg-emerald-950/60 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-900/60"
                title="Rola atributos (1d3+3+Classe), PV e PP iniciais automaticamente"
              >
                <Dices className="h-3.5 w-3.5" /> Rolar Ficha Inicial
              </button>
            </div>
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
                <button
                  type="button"
                  onClick={() => handleRollAttribute('Corpo', totalCorpo)}
                  className="no-print mt-1.5 inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-200 hover:bg-indigo-600 hover:text-white"
                >
                  <Dices className="h-3 w-3" /> 3d6
                </button>
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
                <button
                  type="button"
                  onClick={() => handleRollAttribute('Mente', totalMente)}
                  className="no-print mt-1.5 inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-200 hover:bg-indigo-600 hover:text-white"
                >
                  <Dices className="h-3 w-3" /> 3d6
                </button>
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
                <button
                  type="button"
                  onClick={() => handleRollAttribute('Espírito', totalEspirito)}
                  className="no-print mt-1.5 inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-200 hover:bg-indigo-600 hover:text-white"
                >
                  <Dices className="h-3 w-3" /> 3d6
                </button>
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

            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="shrink-0 font-semibold text-slate-400">
                Condição:
              </span>
              <input
                type="text"
                list="conditions-list"
                value={active.condition ?? 'Normal / Acordado'}
                onChange={(e) => updateActive({ condition: e.target.value })}
                placeholder="Normal / Acordado"
                className="print-input w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-1 text-slate-100"
              />
              <datalist id="conditions-list">
                <option value="Normal / Acordado" />
                <option value="Dormindo" />
                <option value="Queimando" />
                <option value="Envenenado" />
                <option value="Cego" />
                <option value="Atordoado" />
                <option value="Paralisado" />
                <option value="Impedido" />
                <option value="Invisível" />
                <option value="Caído (0 PV)" />
              </datalist>
            </div>

            {active.pvCurrent <= 0 && (
              <div className="no-print mt-3 rounded-lg border border-rose-700/60 bg-rose-950/40 p-2.5 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-rose-300">
                    Teste de Morte (Melhor de 5):
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400">
                      Sucessos: <strong>{active.deathSuccesses ?? 0}/3</strong>
                    </span>
                    <span className="text-rose-400">
                      Falhas: <strong>{active.deathFailures ?? 0}/3</strong>
                    </span>
                    <button
                      type="button"
                      onClick={handleDeathSave}
                      className="flex items-center gap-1 rounded bg-rose-600 px-2 py-1 font-semibold text-white hover:bg-rose-500"
                    >
                      <Dices className="h-3.5 w-3.5" /> Rolar (3d6+Corpo)
                    </button>
                  </div>
                </div>
              </div>
            )}
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
        <datalist id="weapons-list">
          {WEAPONS.map((w) => (
            <option key={w.label} value={w.label} />
          ))}
        </datalist>
        <datalist id="armors-list">
          {ARMORS.map((a) => (
            <option key={a.label} value={a.label} />
          ))}
        </datalist>
        <datalist id="shields-list">
          {SHIELDS_AND_FOCI.map((s) => (
            <option key={s.label} value={s.label} />
          ))}
        </datalist>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="print-card rounded-lg border border-slate-800 bg-slate-950/60 p-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Equipamentos Preparados (Em Uso)
            </h3>

            {hasOffHandConflict && (
              <div className="no-print mb-3 flex items-start gap-2 rounded-lg border border-amber-600/50 bg-amber-950/40 p-2.5 text-xs text-amber-200">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <span>
                  <strong>Arma de duas mãos equipada:</strong> normalmente ocupa
                  os dois espaços de mão (a menos que possua <em>Força Bruta</em>{' '}
                  ou regra especial).
                </span>
              </div>
            )}

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400">Arma Principal</span>
                <input
                  type="text"
                  list="weapons-list"
                  value={active.weaponMain}
                  onChange={(e) => {
                    const val = e.target.value;
                    const is2H =
                      WEAPONS.some(
                        (w) =>
                          w.twoHanded &&
                          w.label.toLowerCase() === val.trim().toLowerCase()
                      ) || val.includes('[2 Mãos]');
                    updateActive(
                      is2H && active.weaponSec.trim() === ''
                        ? {
                            weaponMain: val,
                            weaponSec: 'Ocupada (Arma de 2 Mãos)',
                          }
                        : { weaponMain: val }
                    );
                  }}
                  placeholder="Ex: Espada Longa (1d6)"
                  className="print-input mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-slate-100"
                />
              </div>
              <div>
                <span className="text-slate-400">Arma Secundária / Arco</span>
                <input
                  type="text"
                  list="weapons-list"
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
                    list="armors-list"
                    value={active.armorDesc}
                    onChange={(e) => {
                      const val = e.target.value;
                      const match = ARMORS.find(
                        (a) => a.label.toLowerCase() === val.trim().toLowerCase()
                      );
                      updateActive(
                        match
                          ? { armorDesc: match.label, armorRes: match.res }
                          : { armorDesc: val }
                      );
                    }}
                    placeholder="Ex: Couro (Res 1)"
                    className="print-input mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-slate-100"
                  />
                </div>
                <div>
                  <span className="text-slate-400">Escudo / Foco</span>
                  <input
                    type="text"
                    list="shields-list"
                    value={active.shieldDesc}
                    onChange={(e) => {
                      const val = e.target.value;
                      const match = SHIELDS_AND_FOCI.find(
                        (s) => s.label.toLowerCase() === val.trim().toLowerCase()
                      );
                      updateActive(
                        match
                          ? {
                              shieldDesc: match.label,
                              shieldBonus: match.defBonus,
                            }
                          : { shieldDesc: val }
                      );
                    }}
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

            <div className="no-print mb-2 flex gap-1.5">
              <select
                value={itemToAdd}
                onChange={(e) => setItemToAdd(e.target.value)}
                className="min-w-0 flex-1 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200"
              >
                {CONSUMABLES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  const items = active.backpackItems ?? [];
                  const existing = items.find((i) => i.name === itemToAdd);
                  const nextItems = existing
                    ? items.map((i) =>
                        i.name === itemToAdd ? { ...i, qty: i.qty + 1 } : i
                      )
                    : [...items, { name: itemToAdd, qty: 1 }];
                  updateActive({ backpackItems: nextItems });
                }}
                className="flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>

            {(active.backpackItems ?? []).length > 0 && (
              <div className="mb-2 space-y-1">
                {(active.backpackItems ?? []).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 rounded border border-slate-800 bg-slate-900/50 px-2 py-1 text-xs"
                  >
                    <span className="min-w-0 flex-1 truncate text-slate-200">
                      {item.name}
                    </span>
                    <div className="no-print flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          const items = active.backpackItems ?? [];
                          const nextItems = items
                            .map((it, i) =>
                              i === idx ? { ...it, qty: it.qty - 1 } : it
                            )
                            .filter((it) => it.qty > 0);
                          updateActive({ backpackItems: nextItems });
                        }}
                        className="rounded bg-slate-800 px-1.5 py-0.5 text-rose-300 hover:bg-rose-900/60"
                        title="Usar / Decrementar"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold text-slate-100">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const items = active.backpackItems ?? [];
                          const nextItems = items.map((it, i) =>
                            i === idx ? { ...it, qty: it.qty + 1 } : it
                          );
                          updateActive({ backpackItems: nextItems });
                        }}
                        className="rounded bg-slate-800 px-1.5 py-0.5 text-emerald-300 hover:bg-emerald-900/60"
                        title="Adicionar +1"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <textarea
              value={active.backpack}
              onChange={(e) => updateActive({ backpack: e.target.value })}
              placeholder="Anotações extras da mochila..."
              rows={3}
              className="print-input w-full flex-1 rounded border border-slate-700 bg-slate-950 p-2.5 text-xs text-slate-100"
            />
          </div>
        </div>
      </div>

      {/* Modal Animado de Rolagem de Atributos e Status */}
      {rollModal && (
        <div
          className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => !rollModal.isRolling && setRollModal(null)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-indigo-700/60 bg-slate-900 p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-lg font-bold text-slate-100">
                  {rollModal.title}
                </h4>
                <p className="text-xs text-slate-400">{rollModal.subtitle}</p>
              </div>
              {!rollModal.isRolling && (
                <button
                  onClick={() => setRollModal(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="mt-5 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                {rollModal.dice.map((d, i) => (
                  <span
                    key={i}
                    className={`flex h-11 w-11 items-center justify-center rounded-lg border text-lg font-extrabold ${
                      rollModal.isRolling
                        ? 'animate-bounce border-indigo-500 bg-indigo-950 text-indigo-200'
                        : 'border-emerald-600/60 bg-slate-800 text-white'
                    }`}
                  >
                    {d}
                  </span>
                ))}

                {rollModal.extraDice && (
                  <>
                    <span className="mx-1 text-slate-500">+</span>
                    {rollModal.extraDice.map((d, i) => (
                      <span
                        key={i}
                        className={`flex h-11 w-11 items-center justify-center rounded-lg border text-lg font-extrabold ${
                          rollModal.isRolling
                            ? 'animate-bounce border-sky-500 bg-sky-950 text-sky-200'
                            : 'border-sky-600/60 bg-slate-800 text-sky-300'
                        }`}
                      >
                        {d}
                      </span>
                    ))}
                  </>
                )}
              </div>

              <p className="text-center text-sm font-semibold text-slate-200">
                {rollModal.summary}
              </p>

              {!rollModal.isRolling && (
                <button
                  onClick={() => setRollModal(null)}
                  className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  Fechar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
