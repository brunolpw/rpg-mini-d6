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
  Store,
  Package,
  Lock,
  Unlock,
} from 'lucide-react';
import {
  ARMORS,
  CLASSES,
  RACES,
  SHIELDS_AND_FOCI,
  WEAPONS,
} from '../data/gameData';
import { GameItem } from '../data/itemsData';
import {
  getEffectivePowerPP,
  type ClassPowerInfo,
} from '../utils/markdownParser';
import { DiceRoller } from './DiceRoller';
import { ShopModal } from './ShopModal';

export interface PowerSlot {
  name: string;
  level: 1 | 2 | 3;
  pp: string;
  notes: string;
}

export interface CharacterBackpackItem {
  id: string;
  name: string;
  category: 'arma' | 'armadura' | 'escudo' | 'foco' | 'consumivel' | 'utilitario';
  qty: number;
  price?: number;
  effect?: string;
  isCustom?: boolean;
  isMagic?: boolean;
  twoHanded?: boolean;
  res?: number;
  defBonus?: number;
  equippedSlot?: 'weaponMain' | 'weaponSec' | 'armor' | 'shield';
}

export interface Character {
  id: string;
  name: string;
  raceId: string;
  humanBonusAttr?: 'corpo' | 'mente' | 'espirito';
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
  backpackItems?: CharacterBackpackItem[];
  notes: string;
  powers: PowerSlot[];
  isLocked?: boolean;
}

const STORAGE_KEY = 'mini-d6-sheets-v1';

function normalizeBackpackItems(rawItems: any[]): CharacterBackpackItem[] {
  if (!Array.isArray(rawItems)) return [];
  return rawItems.map((item) => {
    if (typeof item === 'string') {
      return {
        id: crypto.randomUUID(),
        name: item,
        category: 'utilitario',
        qty: 1,
      };
    }
    return {
      id: item.id || crypto.randomUUID(),
      name: item.name || 'Item',
      category: item.category || 'utilitario',
      qty: Math.max(1, Number(item.qty) || 1),
      price: item.price,
      effect: item.effect,
      isCustom: Boolean(item.isCustom),
      isMagic: Boolean(item.isMagic),
      twoHanded: Boolean(item.twoHanded),
      res: item.res,
      defBonus: item.defBonus,
      equippedSlot: item.equippedSlot,
    };
  });
}

function getInitialPowersCount(classId: string, raceId: string): number {
  const cls = CLASSES.find((c) => c.id === classId);
  const base = cls?.initialPowers ?? 2;
  const raceBonus = raceId === 'elfo' ? 1 : 0;
  return base + raceBonus;
}

function createEmptyCharacter(): Character {
  const initialClassId = 'guerreiro';
  const initialRaceId = 'humano';
  const slotCount = getInitialPowersCount(initialClassId, initialRaceId);

  return {
    id: crypto.randomUUID(),
    name: 'Novo Aventureiro',
    raceId: initialRaceId,
    humanBonusAttr: 'corpo',
    classId: initialClassId,
    level: 1,
    xp: 0,
    gold: 50,
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
    powers: Array.from({ length: slotCount }, () => ({
      name: '',
      level: 1,
      pp: '0',
      notes: '',
    })),
    isLocked: false,
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
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((char: any) => ({
            ...char,
            backpackItems: normalizeBackpackItems(char.backpackItems),
          }));
        }
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

  const humanAttr = active.humanBonusAttr ?? 'corpo';
  const raceBonus = {
    corpo:
      active.raceId === 'humano'
        ? humanAttr === 'corpo'
          ? 1
          : 0
        : selectedRace.bonus.corpo,
    mente:
      active.raceId === 'humano'
        ? humanAttr === 'mente'
          ? 1
          : 0
        : selectedRace.bonus.mente,
    espirito:
      active.raceId === 'humano'
        ? humanAttr === 'espirito'
          ? 1
          : 0
        : selectedRace.bonus.espirito,
  };

  const totalCorpo = active.corpo + raceBonus.corpo;
  const totalMente = active.mente + raceBonus.mente;
  const totalEspirito = active.espirito + raceBonus.espirito;

  const defFisica = 10 + totalCorpo + active.shieldBonus;
  const defMagica = 10 + totalEspirito;
  const totalIniciativa = totalMente + (active.initiativeBonus ?? 0);

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
    // Regra oficial do mini-d6:
    // Base 5 para cada atributo + Rolagem Mm (1, 2, 3 = +1 | 4, 5, 6 = +2) + modificador de classe
    const rollMm = () => (Math.floor(Math.random() * 6) + 1 >= 4 ? 2 : 1);
    const d3 = () => Math.floor(Math.random() * 3) + 1;

    let ticks = 0;
    const interval = setInterval(() => {
      ticks += 1;
      const preview = [rollMm(), rollMm(), rollMm()];
      setRollModal({
        title: 'Gerando Atributos Iniciais (Regra Mm)',
        subtitle: `${selectedRace.name} • ${selectedClass.name}`,
        isRolling: true,
        dice: preview,
        summary: 'Rolando Mm (+1 ou +2), PV e PP...',
      });
      if (ticks >= 6) {
        clearInterval(interval);
        // Base 5 + Mm + Modificador da Classe (mínimo 4, máximo 10)
        const mmCorpo = rollMm();
        const mmMente = rollMm();
        const mmEspirito = rollMm();

        const c = Math.max(4, Math.min(10, 5 + mmCorpo + selectedClass.baseMod.corpo));
        const m = Math.max(4, Math.min(10, 5 + mmMente + selectedClass.baseMod.mente));
        const e = Math.max(4, Math.min(10, 5 + mmEspirito + selectedClass.baseMod.espirito));

        const nextTotalCorpo = c + selectedRace.bonus.corpo;
        const nextTotalEspirito = e + selectedRace.bonus.espirito;

        // Fórmulas Oficiais da Classe
        const pvRoll =
          selectedClass.pvDice === 2
            ? d3() + d3() + selectedClass.pvBonus
            : d3() + selectedClass.pvBonus;

        const ppRoll =
          selectedClass.ppDice === 2
            ? d3() + d3() + selectedClass.ppBonus
            : d3() + selectedClass.ppBonus;

        const nextPv = Math.max(1, nextTotalCorpo + pvRoll);
        const nextPp = Math.max(1, nextTotalEspirito + ppRoll);

        const slotCount = getInitialPowersCount(selectedClass.id, selectedRace.id);
        const nextPowers = Array.from({ length: slotCount }, (_, i) => ({
          name: active.powers[i]?.name ?? '',
          level: active.powers[i]?.level ?? 1,
          pp: active.powers[i]?.pp ?? '0',
          notes: active.powers[i]?.notes ?? '',
        }));

        updateActive({
          corpo: c,
          mente: m,
          espirito: e,
          pvMax: nextPv,
          pvCurrent: nextPv,
          ppMax: nextPp,
          ppCurrent: nextPp,
          powers: nextPowers,
        });

        setRollModal({
          title: 'Ficha Inicial Gerada!',
          subtitle: `${selectedRace.name} • ${selectedClass.name}`,
          isRolling: false,
          dice: [c, m, e],
          extraDice: [nextPv, nextPp],
          summary: `Corpo: ${c} | Mente: ${m} | Espírito: ${e}  •  PV: ${nextPv} (${selectedClass.pvFormula}) | PP: ${nextPp} (${selectedClass.ppFormula})`,
        });
      }
    }, 60);
  };

  const handleRollPvPp = () => {
    const d3 = () => Math.floor(Math.random() * 3) + 1;
    const pvRoll =
      selectedClass.pvDice === 2
        ? d3() + d3() + selectedClass.pvBonus
        : d3() + selectedClass.pvBonus;

    const ppRoll =
      selectedClass.ppDice === 2
        ? d3() + d3() + selectedClass.ppBonus
        : d3() + selectedClass.ppBonus;

    const nextPv = Math.max(1, totalCorpo + pvRoll);
    const nextPp = Math.max(1, totalEspirito + ppRoll);

    updateActive({
      pvMax: nextPv,
      pvCurrent: nextPv,
      ppMax: nextPp,
      ppCurrent: nextPp,
    });

    setRollModal({
      title: 'PV e PP Recalculados!',
      subtitle: `${selectedClass.name} • Corpo ${totalCorpo} / Espírito ${totalEspirito}`,
      isRolling: false,
      dice: [pvRoll, ppRoll],
      summary: `PV: ${nextPv} (${totalCorpo} + ${selectedClass.pvFormula.replace('Corpo + ', '')}) | PP: ${nextPp} (${totalEspirito} + ${selectedClass.ppFormula.replace('Espírito + ', '')})`,
    });
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
  const [showShopModal, setShowShopModal] = useState<boolean>(false);

  const backpack = active.backpackItems ?? [];

  const handleBuyItem = (item: GameItem) => {
    if (active.gold < item.price) return;
    const nextGold = active.gold - item.price;
    const existingIdx = backpack.findIndex((b) => b.name.toLowerCase() === item.name.toLowerCase());
    let nextBackpack: CharacterBackpackItem[];

    if (existingIdx >= 0) {
      nextBackpack = backpack.map((b, i) =>
        i === existingIdx ? { ...b, qty: b.qty + 1 } : b
      );
    } else {
      nextBackpack = [
        ...backpack,
        {
          id: crypto.randomUUID(),
          name: item.name,
          category: item.category,
          qty: 1,
          price: item.price,
          effect: item.effect,
          isCustom: item.isCustom,
          isMagic: item.isMagic,
          twoHanded: item.isTwoHanded,
          res: item.res,
          defBonus: item.defBonus,
        },
      ];
    }

    updateActive({
      gold: nextGold,
      backpackItems: nextBackpack,
    });
  };

  const handleEquipItem = (
    item: CharacterBackpackItem,
    slot: 'weaponMain' | 'weaponSec' | 'armor' | 'shield'
  ) => {
    if (slot === 'weaponMain') {
      const is2H = item.twoHanded || item.name.includes('[2 Mãos]');
      updateActive({
        weaponMain: item.name,
        weaponSec: is2H ? 'Ocupada (Arma de 2 Mãos)' : active.weaponSec === 'Ocupada (Arma de 2 Mãos)' ? '' : active.weaponSec,
      });
    } else if (slot === 'weaponSec') {
      updateActive({ weaponSec: item.name });
    } else if (slot === 'armor') {
      updateActive({
        armorDesc: item.name,
        armorRes: item.res ?? 0,
      });
    } else if (slot === 'shield') {
      updateActive({
        shieldDesc: item.name,
        shieldBonus: item.defBonus ?? 0,
      });
    }
  };

  const handleUnequipSlot = (slot: 'weaponMain' | 'weaponSec' | 'armor' | 'shield') => {
    if (slot === 'weaponMain') {
      updateActive({
        weaponMain: '',
        weaponSec: active.weaponSec === 'Ocupada (Arma de 2 Mãos)' ? '' : active.weaponSec,
      });
    } else if (slot === 'weaponSec') {
      updateActive({ weaponSec: '' });
    } else if (slot === 'armor') {
      updateActive({ armorDesc: '', armorRes: 0 });
    } else if (slot === 'shield') {
      updateActive({ shieldDesc: '', shieldBonus: 0 });
    }
  };

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

          {/* Botão de Travar / Salvar Ficha */}
          <button
            type="button"
            onClick={() => {
              const nextState = !active.isLocked;
              updateActive({ isLocked: nextState });
            }}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-bold transition-colors ${
              active.isLocked
                ? 'border-emerald-500/60 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60 shadow'
                : 'border-amber-500/60 bg-amber-950/60 text-amber-300 hover:bg-amber-900/60'
            }`}
            title={
              active.isLocked
                ? 'Ficha Travada para Jogo (evita alterações acidentais). Clique para editar.'
                : 'Clique para Salvar e Travar a Ficha (protege raça, classe e atributos).'
            }
          >
            {active.isLocked ? (
              <>
                <Lock className="h-4 w-4 text-emerald-400" />
                <span>Ficha Travada</span>
              </>
            ) : (
              <>
                <Unlock className="h-4 w-4 text-amber-400" />
                <span>Modo Edição (Travar)</span>
              </>
            )}
          </button>
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
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase text-slate-400">
                Raça
              </label>
              {active.isLocked && (
                <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                  <Lock className="h-3 w-3 text-slate-500" /> Travado
                </span>
              )}
            </div>
            <select
              disabled={active.isLocked}
              value={active.raceId}
              onChange={(e) => {
                const nextRaceId = e.target.value;
                const hasSelectedPowers = active.powers.some((p) => p.name.trim() !== '');
                if (hasSelectedPowers) {
                  const confirmChange = window.confirm(
                    'Você já possui poderes selecionados. Mudar a raça pode alterar o bônus de poderes (ex: Elfo). Deseja continuar?'
                  );
                  if (!confirmChange) return;
                }
                const targetSlots = getInitialPowersCount(active.classId, nextRaceId);
                let nextPowers = [...active.powers];
                if (nextPowers.length < targetSlots) {
                  while (nextPowers.length < targetSlots) {
                    nextPowers.push({ name: '', level: 1, pp: '0', notes: '' });
                  }
                }
                updateActive({ raceId: nextRaceId, powers: nextPowers });
              }}
              className={`print-input mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-sm font-semibold text-slate-100 ${
                active.isLocked ? 'cursor-not-allowed opacity-80' : ''
              }`}
            >
              {RACES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-slate-300">
              {selectedRace.description}
            </p>
            <div className="mt-2 rounded bg-amber-950/40 border border-amber-800/40 p-2 text-xs">
              <span className="font-bold text-amber-300">
                Traço Racial ({selectedRace.traitName}):
              </span>{' '}
              <span className="text-slate-300">{selectedRace.trait}</span>
            </div>
          </div>

          <div className="print-card rounded-lg border border-slate-800 bg-slate-950/60 p-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase text-slate-400">
                Classe
              </label>
              {active.isLocked ? (
                <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                  <Lock className="h-3 w-3 text-slate-500" /> Travado
                </span>
              ) : active.powers.some((p) => p.name.trim() !== '') ? (
                <span className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold" title="Limpe os poderes para alterar a classe sem risco de conflito">
                  <AlertTriangle className="h-3 w-3 text-amber-400" /> Poder selecionado
                </span>
              ) : null}
            </div>
            <select
              disabled={active.isLocked}
              value={active.classId}
              onChange={(e) => {
                const nextClassId = e.target.value;
                const hasSelectedPowers = active.powers.some((p) => p.name.trim() !== '');
                if (hasSelectedPowers) {
                  const confirmChange = window.confirm(
                    'Você já possui poderes selecionados desta classe. Ao mudar a classe, os poderes anteriores serão redefinidos. Deseja continuar?'
                  );
                  if (!confirmChange) return;
                }
                const targetSlots = getInitialPowersCount(nextClassId, active.raceId);
                const nextPowers: PowerSlot[] = Array.from({ length: targetSlots }, () => ({
                  name: '',
                  level: 1,
                  pp: '0',
                  notes: '',
                }));
                updateActive({ classId: nextClassId, powers: nextPowers });
              }}
              className={`print-input mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-sm font-semibold text-slate-100 ${
                active.isLocked ? 'cursor-not-allowed opacity-80' : ''
              }`}
            >
              {CLASSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.style}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-slate-300">
              {selectedClass.description}
            </p>
            <div className="mt-2 rounded bg-indigo-950/50 border border-indigo-800/50 p-2 text-xs">
              <span className="font-bold text-indigo-300">
                Passiva Natural ({selectedClass.naturalTraitName}):
              </span>{' '}
              <span className="text-slate-300">{selectedClass.naturalTrait}</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              Modificadores: Corpo ({selectedClass.baseMod.corpo >= 0 ? '+' : ''}
              {selectedClass.baseMod.corpo}), Mente (
              {selectedClass.baseMod.mente >= 0 ? '+' : ''}
              {selectedClass.baseMod.mente}), Espírito (
              {selectedClass.baseMod.espirito >= 0 ? '+' : ''}
              {selectedClass.baseMod.espirito}) | PV: {selectedClass.pvFormula}{' '}
              | PP: {selectedClass.ppFormula} | Poderes Iniciais: {getInitialPowersCount(selectedClass.id, selectedRace.id)}
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
              {!active.isLocked && (
                <button
                  type="button"
                  onClick={handleRollBaseAttributes}
                  className="no-print flex items-center gap-1 rounded-md border border-emerald-700/60 bg-emerald-950/60 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-900/60"
                  title="Rola atributos com a regra oficial Mm (Base 5 + Mm + Classe), PV e PP"
                >
                  <Dices className="h-3.5 w-3.5" /> Rolar Ficha Inicial (Mm)
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
                <div className="text-xs font-semibold text-slate-400">Corpo</div>
                <input
                  type="number"
                  min={1}
                  max={10}
                  disabled={active.isLocked}
                  value={active.corpo}
                  onChange={(e) =>
                    updateActive({ corpo: Number(e.target.value) })
                  }
                  className={`print-input mt-1 w-full rounded border border-slate-700 bg-slate-950 py-1 text-center text-lg font-bold text-slate-100 ${
                    active.isLocked ? 'cursor-not-allowed opacity-90' : ''
                  }`}
                />
                <div className="mt-1 text-[10px] text-slate-400">
                  Classe: {selectedClass.baseMod.corpo >= 0 ? '+' : ''}
                  {selectedClass.baseMod.corpo} | Raça: +{raceBonus.corpo}
                </div>
                {active.raceId === 'humano' && !active.isLocked && (
                  <button
                    type="button"
                    onClick={() => updateActive({ humanBonusAttr: 'corpo' })}
                    className={`no-print mt-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                      humanAttr === 'corpo'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    +1 Humano
                  </button>
                )}
                <div className="mt-1 text-xs text-indigo-400">
                  Total: <strong>{totalCorpo}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => handleRollAttribute('Corpo', totalCorpo)}
                  className="no-print mt-1.5 inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-200 hover:bg-indigo-600 hover:text-white"
                  title="Testar Corpo (rolar 3d6 + Corpo)"
                >
                  <Dices className="h-3 w-3" /> Testar 3d6
                </button>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
                <div className="text-xs font-semibold text-slate-400">Mente</div>
                <input
                  type="number"
                  min={1}
                  max={10}
                  disabled={active.isLocked}
                  value={active.mente}
                  onChange={(e) =>
                    updateActive({ mente: Number(e.target.value) })
                  }
                  className={`print-input mt-1 w-full rounded border border-slate-700 bg-slate-950 py-1 text-center text-lg font-bold text-slate-100 ${
                    active.isLocked ? 'cursor-not-allowed opacity-90' : ''
                  }`}
                />
                <div className="mt-1 text-[10px] text-slate-400">
                  Classe: {selectedClass.baseMod.mente >= 0 ? '+' : ''}
                  {selectedClass.baseMod.mente} | Raça: +{raceBonus.mente}
                </div>
                {active.raceId === 'humano' && !active.isLocked && (
                  <button
                    type="button"
                    onClick={() => updateActive({ humanBonusAttr: 'mente' })}
                    className={`no-print mt-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                      humanAttr === 'mente'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    +1 Humano
                  </button>
                )}
                <div className="mt-1 text-xs text-indigo-400">
                  Total: <strong>{totalMente}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => handleRollAttribute('Mente', totalMente)}
                  className="no-print mt-1.5 inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-200 hover:bg-indigo-600 hover:text-white"
                  title="Testar Mente (rolar 3d6 + Mente)"
                >
                  <Dices className="h-3 w-3" /> Testar 3d6
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
                  disabled={active.isLocked}
                  value={active.espirito}
                  onChange={(e) =>
                    updateActive({ espirito: Number(e.target.value) })
                  }
                  className={`print-input mt-1 w-full rounded border border-slate-700 bg-slate-950 py-1 text-center text-lg font-bold text-slate-100 ${
                    active.isLocked ? 'cursor-not-allowed opacity-90' : ''
                  }`}
                />
                <div className="mt-1 text-[10px] text-slate-400">
                  Classe: {selectedClass.baseMod.espirito >= 0 ? '+' : ''}
                  {selectedClass.baseMod.espirito} | Raça: +{raceBonus.espirito}
                </div>
                {active.raceId === 'humano' && !active.isLocked && (
                  <button
                    type="button"
                    onClick={() => updateActive({ humanBonusAttr: 'espirito' })}
                    className={`no-print mt-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                      humanAttr === 'espirito'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    +1 Humano
                  </button>
                )}
                <div className="mt-1 text-xs text-indigo-400">
                  Total: <strong>{totalEspirito}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => handleRollAttribute('Espírito', totalEspirito)}
                  className="no-print mt-1.5 inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-200 hover:bg-indigo-600 hover:text-white"
                  title="Testar Espírito (rolar 3d6 + Espírito)"
                >
                  <Dices className="h-3 w-3" /> Testar 3d6
                </button>
              </div>
            </div>
          </div>

          {/* Combate, PV e PP */}
          <div className="print-card rounded-lg border border-slate-800 bg-slate-950/60 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Status de Combate
              </h3>
              <button
                type="button"
                onClick={handleRollPvPp}
                className="no-print flex items-center gap-1 rounded-md border border-sky-700/60 bg-sky-950/60 px-2 py-0.5 text-[11px] font-semibold text-sky-300 hover:bg-sky-900/60"
                title={`Recalcula e rola PV (${selectedClass.pvFormula}) e PP (${selectedClass.ppFormula}) com base no seu Corpo (${totalCorpo}) e Espírito (${totalEspirito})`}
              >
                <Dices className="h-3 w-3" /> Rolar PV/PP ({selectedClass.name})
              </button>
            </div>
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
                <div className="mt-1 text-[10px] text-slate-400" title="Fórmula oficial da classe">
                  {selectedClass.pvFormula}
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
                <div className="mt-1 text-[10px] text-slate-400" title="Fórmula oficial da classe">
                  {selectedClass.ppFormula}
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-center">
                <div className="flex items-center justify-center gap-1 text-xs text-emerald-400">
                  <Shield className="h-3.5 w-3.5" /> Def. Física
                </div>
                <div className="mt-1 text-lg font-extrabold text-slate-100">
                  {defFisica}
                </div>
                <div className="mt-1 text-[10px] text-slate-400">
                  10 + Corpo ({totalCorpo}) + Escudo ({active.shieldBonus})
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-center">
                <div className="flex items-center justify-center gap-1 text-xs text-violet-400">
                  <Shield className="h-3.5 w-3.5" /> Def. Mágica
                </div>
                <div className="mt-1 text-lg font-extrabold text-slate-100">
                  {defMagica}
                </div>
                <div className="mt-1 text-[10px] text-slate-400">
                  10 + Espírito ({totalEspirito})
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
                <div className="flex items-center justify-center gap-1">
                  <span className="text-slate-400">Iniciativa</span>
                  <button
                    type="button"
                    onClick={() => handleRollAttribute('Iniciativa', totalIniciativa)}
                    className="no-print rounded p-0.5 text-amber-400 hover:bg-slate-800"
                    title={`Rolar Iniciativa: 3d6 + Mente (${totalMente}) + Bônus (${active.initiativeBonus ?? 0}) = 3d6 + ${totalIniciativa}`}
                  >
                    <Dices className="h-3 w-3" />
                  </button>
                </div>
                <div className="mt-1 flex items-center gap-1">
                  <div
                    className="flex-1 rounded border border-slate-700 bg-slate-950 py-1 text-center font-bold text-amber-300"
                    title={`Total: Mente (${totalMente}) + Bônus (${active.initiativeBonus ?? 0}) = ${totalIniciativa}`}
                  >
                    +{totalIniciativa}
                  </div>
                  <input
                    type="number"
                    value={active.initiativeBonus}
                    onChange={(e) =>
                      updateActive({ initiativeBonus: Number(e.target.value) })
                    }
                    placeholder="Bônus"
                    title="Bônus adicional de iniciativa (itens, talentos)"
                    className="print-input w-10 rounded border border-slate-700 bg-slate-950 py-1 text-center text-xs text-slate-300"
                  />
                </div>
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
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Poderes e Habilidades ({active.powers.length})
              </h3>
              <span className="no-print text-xs text-slate-500">
                Selecione da classe ({selectedClass.name}) ou digite livremente
              </span>
            </div>
            {!active.isLocked && (
              <button
                type="button"
                onClick={() =>
                  updateActive({
                    powers: [
                      ...active.powers,
                      { name: '', level: 1, pp: '0', notes: '' },
                    ],
                  })
                }
                className="no-print flex items-center gap-1 rounded-md bg-indigo-600/80 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-indigo-500"
              >
                <Plus className="h-3.5 w-3.5" />
                Adicionar Poder
              </button>
            )}
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
                    disabled={active.isLocked}
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
                    className={`print-input min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100 ${
                      active.isLocked ? 'cursor-not-allowed opacity-90' : ''
                    }`}
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
                      disabled={active.isLocked}
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
                  {!active.isLocked && active.powers.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        updateActive({
                          powers: active.powers.filter((_, i) => i !== idx),
                        })
                      }
                      className="no-print rounded p-1 text-slate-500 hover:bg-rose-950/60 hover:text-rose-400"
                      title="Remover poder"
                    >
                      <X className="h-3.5 w-3.5" />
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
          {/* Equipamentos Preparados (Em Uso) */}
          <div className="print-card rounded-lg border border-slate-800 bg-slate-950/60 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Equipamentos Preparados (Em Uso)
              </h3>
              <span className="text-[11px] text-slate-500">
                Apenas itens da mochila
              </span>
            </div>

            {hasOffHandConflict && (
              <div className="no-print mb-3 flex items-start gap-2 rounded-lg border border-amber-600/50 bg-amber-950/40 p-2.5 text-xs text-amber-200">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <span>
                  <strong>Arma de duas mãos equipada:</strong> normalmente ocupa os dois espaços de mão (a menos que possua <em>Força Bruta</em> ou regra especial).
                </span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              {/* Arma Principal */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Arma Principal</span>
                  {active.weaponMain && (
                    <button
                      type="button"
                      onClick={() => handleUnequipSlot('weaponMain')}
                      className="text-[10px] text-rose-400 hover:underline"
                    >
                      Desequipar
                    </button>
                  )}
                </div>
                <select
                  value={active.weaponMain}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) {
                      handleUnequipSlot('weaponMain');
                      return;
                    }
                    const item = backpack.find((b) => b.name === val);
                    if (item) {
                      handleEquipItem(item, 'weaponMain');
                    } else {
                      updateActive({ weaponMain: val });
                    }
                  }}
                  className="print-input mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-slate-100"
                >
                  <option value="">Nenhuma / Ataque Desarmado</option>
                  {backpack
                    .filter((b) => b.category === 'arma')
                    .map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name} ({b.effect || 'Arma'}) {b.isCustom ? '★' : ''}
                      </option>
                    ))}
                  {/* Se tem item salvo anteriormente que não tá mais na lista, mantém para não quebrar */}
                  {active.weaponMain &&
                    !backpack.some((b) => b.name === active.weaponMain) && (
                      <option value={active.weaponMain}>
                        {active.weaponMain} (Fora da mochila)
                      </option>
                    )}
                </select>
              </div>

              {/* Arma Secundária */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Arma Secundária / Arco</span>
                  {active.weaponSec && active.weaponSec !== 'Ocupada (Arma de 2 Mãos)' && (
                    <button
                      type="button"
                      onClick={() => handleUnequipSlot('weaponSec')}
                      className="text-[10px] text-rose-400 hover:underline"
                    >
                      Desequipar
                    </button>
                  )}
                </div>
                {active.weaponSec === 'Ocupada (Arma de 2 Mãos)' ? (
                  <div className="mt-1 flex items-center justify-between rounded border border-slate-800 bg-slate-900/40 px-2.5 py-1.5 text-slate-400 italic text-xs">
                    <span>Ocupada (Arma de 2 Mãos)</span>
                    <button
                      type="button"
                      onClick={() => updateActive({ weaponSec: '' })}
                      className="text-[10px] text-amber-400 hover:underline not-italic"
                    >
                      Liberar
                    </button>
                  </div>
                ) : (
                  <select
                    value={active.weaponSec}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) {
                        handleUnequipSlot('weaponSec');
                        return;
                      }
                      const item = backpack.find((b) => b.name === val);
                      if (item) {
                        handleEquipItem(item, 'weaponSec');
                      } else {
                        updateActive({ weaponSec: val });
                      }
                    }}
                    className="print-input mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-slate-100"
                  >
                    <option value="">Nenhuma</option>
                    {backpack
                      .filter((b) => b.category === 'arma')
                      .map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name} ({b.effect || 'Arma'}) {b.isCustom ? '★' : ''}
                        </option>
                      ))}
                    {active.weaponSec &&
                      !backpack.some((b) => b.name === active.weaponSec) && (
                        <option value={active.weaponSec}>
                          {active.weaponSec} (Fora da mochila)
                        </option>
                      )}
                  </select>
                )}
              </div>

              {/* Armadura e Escudo em Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Armadura</span>
                    {active.armorDesc && (
                      <button
                        type="button"
                        onClick={() => handleUnequipSlot('armor')}
                        className="text-[10px] text-rose-400 hover:underline"
                      >
                        Tirar
                      </button>
                    )}
                  </div>
                  <select
                    value={active.armorDesc}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) {
                        handleUnequipSlot('armor');
                        return;
                      }
                      const item = backpack.find((b) => b.name === val);
                      if (item) {
                        handleEquipItem(item, 'armor');
                      } else {
                        const match = ARMORS.find((a) => a.label === val);
                        updateActive(
                          match
                            ? { armorDesc: match.label, armorRes: match.res }
                            : { armorDesc: val }
                        );
                      }
                    }}
                    className="print-input mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-100"
                  >
                    <option value="">Sem Armadura (Res 0)</option>
                    {backpack
                      .filter((b) => b.category === 'armadura')
                      .map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name} (Res {b.res ?? 0}
                          {b.defBonus ? `, +${b.defBonus} Def` : ''}) {b.isCustom ? '★' : ''}
                        </option>
                      ))}
                    {active.armorDesc &&
                      !backpack.some((b) => b.name === active.armorDesc) && (
                        <option value={active.armorDesc}>
                          {active.armorDesc} (Res {active.armorRes})
                        </option>
                      )}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Escudo / Foco</span>
                    {active.shieldDesc && (
                      <button
                        type="button"
                        onClick={() => handleUnequipSlot('shield')}
                        className="text-[10px] text-rose-400 hover:underline"
                      >
                        Tirar
                      </button>
                    )}
                  </div>
                  <select
                    value={active.shieldDesc}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) {
                        handleUnequipSlot('shield');
                        return;
                      }
                      const item = backpack.find((b) => b.name === val);
                      if (item) {
                        handleEquipItem(item, 'shield');
                      } else {
                        const match = SHIELDS_AND_FOCI.find((s) => s.label === val);
                        updateActive(
                          match
                            ? { shieldDesc: match.label, shieldBonus: match.defBonus }
                            : { shieldDesc: val }
                        );
                      }
                    }}
                    className="print-input mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-100"
                  >
                    <option value="">Nenhum</option>
                    {backpack
                      .filter((b) => b.category === 'escudo' || b.category === 'foco')
                      .map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name} ({b.defBonus ? `+${b.defBonus} Def` : b.category}) {b.isCustom ? '★' : ''}
                        </option>
                      ))}
                    {active.shieldDesc &&
                      !backpack.some((b) => b.name === active.shieldDesc) && (
                        <option value={active.shieldDesc}>
                          {active.shieldDesc} (+{active.shieldBonus} Def)
                        </option>
                      )}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Mochila e Inventário */}
          <div className="print-card flex flex-col rounded-lg border border-slate-800 bg-slate-950/60 p-4">
            <div className="mb-2.5 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Package className="h-4 w-4 text-amber-400" /> Mochila & Inventário ({backpack.length})
              </h3>

              <div className="no-print flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowShopModal(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-amber-500 transition-colors"
                >
                  <Store className="h-3.5 w-3.5" /> Abrir Loja ({active.gold} PO)
                </button>
              </div>
            </div>

            {/* Itens na Mochila */}
            {backpack.length === 0 ? (
              <div className="my-auto py-6 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-lg">
                <Package className="mx-auto h-6 w-6 text-slate-600 mb-1" />
                Sua mochila está vazia. Visite a Loja para comprar armas, armaduras e itens.
              </div>
            ) : (
              <div className="mb-2 max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {backpack.map((item, idx) => {
                  const isEquipped =
                    active.weaponMain === item.name ||
                    active.weaponSec === item.name ||
                    active.armorDesc === item.name ||
                    active.shieldDesc === item.name;

                  return (
                    <div
                      key={item.id || idx}
                      className={`flex flex-col gap-1 rounded border px-2.5 py-1.5 text-xs transition-colors ${
                        isEquipped
                          ? 'border-indigo-600/60 bg-indigo-950/30'
                          : item.isCustom
                          ? 'border-amber-900/40 bg-slate-900/60'
                          : 'border-slate-800 bg-slate-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 flex-1 items-center gap-1.5">
                          <span className="truncate font-semibold text-slate-100">
                            {item.name}
                          </span>
                          {item.isCustom && (
                            <span className="shrink-0 rounded bg-amber-500/20 border border-amber-500/30 px-1 py-0.2 text-[9px] font-bold text-amber-300">
                              Custom
                            </span>
                          )}
                          {isEquipped && (
                            <span className="shrink-0 rounded bg-indigo-500/20 border border-indigo-500/40 px-1.5 py-0.2 text-[9px] font-bold text-indigo-300">
                              Equipado
                            </span>
                          )}
                        </div>

                        <div className="no-print flex items-center gap-1">
                          {/* Botão rápido Equipar/Desequipar para armas, armaduras e escudos */}
                          {item.category === 'arma' && !isEquipped && (
                            <button
                              type="button"
                              onClick={() => handleEquipItem(item, 'weaponMain')}
                              className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-sky-300 hover:bg-slate-700"
                              title="Equipar como Arma Principal"
                            >
                              Equipar
                            </button>
                          )}
                          {item.category === 'armadura' && !isEquipped && (
                            <button
                              type="button"
                              onClick={() => handleEquipItem(item, 'armor')}
                              className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 hover:bg-slate-700"
                              title="Vestir Armadura"
                            >
                              Vestir
                            </button>
                          )}
                          {(item.category === 'escudo' || item.category === 'foco') && !isEquipped && (
                            <button
                              type="button"
                              onClick={() => handleEquipItem(item, 'shield')}
                              className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-amber-300 hover:bg-slate-700"
                              title="Equipar na mão secundária"
                            >
                              Equipar
                            </button>
                          )}

                          {/* Quantidade */}
                          <button
                            type="button"
                            onClick={() => {
                              const nextItems = backpack
                                .map((it, i) =>
                                  i === idx ? { ...it, qty: it.qty - 1 } : it
                                )
                                .filter((it) => it.qty > 0);
                              updateActive({ backpackItems: nextItems });
                            }}
                            className="rounded bg-slate-800 px-1.5 py-0.5 text-rose-300 hover:bg-rose-900/60"
                            title="Descartar ou usar 1 unidade"
                          >
                            -
                          </button>
                          <span className="w-5 text-center font-bold text-slate-100">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const nextItems = backpack.map((it, i) =>
                                i === idx ? { ...it, qty: it.qty + 1 } : it
                              );
                              updateActive({ backpackItems: nextItems });
                            }}
                            className="rounded bg-slate-800 px-1.5 py-0.5 text-emerald-300 hover:bg-emerald-900/60"
                            title="Adicionar mais 1"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {item.effect && (
                        <div className="text-[11px] text-slate-400">
                          {item.effect}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <textarea
              value={active.backpack}
              onChange={(e) => updateActive({ backpack: e.target.value })}
              placeholder="Anotações extras da mochila (cartas, pergaminhos, itens de missão)..."
              rows={2}
              className="print-input w-full rounded border border-slate-700 bg-slate-950 p-2 text-xs text-slate-100"
            />
          </div>
        </div>
      </div>

      {/* Modal da Loja */}
      {showShopModal && (
        <ShopModal
          gold={active.gold}
          onBuyItem={handleBuyItem}
          onClose={() => setShowShopModal(false)}
        />
      )}

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
