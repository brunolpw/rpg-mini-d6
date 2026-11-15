import { useState } from 'react';
import { Dices, RotateCcw } from 'lucide-react';

interface DiceRollerProps {
  corpo?: number;
  mente?: number;
  espirito?: number;
}

type RollMode = '3d6' | 'adv' | 'dis' | '1d6' | '1d3';

interface RollResult {
  mode: RollMode;
  dice: number[];
  kept: number[];
  dropped?: number;
  modifier: number;
  total: number;
  tag: string | null;
  tagColor: string;
}

function rollDie(sides = 6): number {
  return Math.floor(Math.random() * sides) + 1;
}

function analyze3d6(kept: number[]): { tag: string | null; tagColor: string } {
  if (kept.length !== 3) return { tag: null, tagColor: '' };
  const sixes = kept.filter((d) => d === 6).length;
  const ones = kept.filter((d) => d === 1).length;

  if (sixes === 3) {
    return {
      tag: 'CRÍTICO CAÓTICO [6,6,6]!',
      tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
    };
  }
  if (sixes >= 2) {
    return {
      tag: 'SUCESSO CRÍTICO (dois 6s)!',
      tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
    };
  }
  if (ones === 3) {
    return {
      tag: 'DESASTRE CAÓTICO [1,1,1]!',
      tagColor: 'bg-rose-600/25 text-rose-300 border-rose-500/50',
    };
  }
  if (ones >= 2) {
    return {
      tag: 'FALHA CRÍTICA (dois 1s)!',
      tagColor: 'bg-red-500/20 text-red-300 border-red-500/50',
    };
  }
  if (kept[0] === kept[1] && kept[1] === kept[2]) {
    return {
      tag: `PROEZA MENOR [${kept[0]},${kept[1]},${kept[2]}]!`,
      tagColor: 'bg-sky-500/20 text-sky-300 border-sky-500/50',
    };
  }
  return { tag: null, tagColor: '' };
}

export function DiceRoller({
  corpo = 0,
  mente = 0,
  espirito = 0,
}: DiceRollerProps) {
  const [modifier, setModifier] = useState<number>(0);
  const [result, setResult] = useState<RollResult | null>(null);

  const handleRoll = (mode: RollMode) => {
    let dice: number[] = [];
    let kept: number[] = [];
    let dropped: number | undefined;

    if (mode === '3d6') {
      dice = [rollDie(), rollDie(), rollDie()];
      kept = [...dice];
    } else if (mode === 'adv') {
      dice = [rollDie(), rollDie(), rollDie(), rollDie()];
      const sorted = [...dice].sort((a, b) => a - b);
      dropped = sorted[0];
      kept = sorted.slice(1);
    } else if (mode === 'dis') {
      dice = [rollDie(), rollDie(), rollDie(), rollDie()];
      const sorted = [...dice].sort((a, b) => a - b);
      dropped = sorted[3];
      kept = sorted.slice(0, 3);
    } else if (mode === '1d6') {
      dice = [rollDie(6)];
      kept = [...dice];
    } else {
      dice = [rollDie(3)];
      kept = [...dice];
    }

    const sum = kept.reduce((acc, v) => acc + v, 0);
    const { tag, tagColor } = analyze3d6(kept);

    setResult({
      mode,
      dice,
      kept,
      dropped,
      modifier,
      total: sum + modifier,
      tag,
      tagColor,
    });
  };

  return (
    <div className="no-print mb-6 rounded-xl border border-indigo-900/60 bg-slate-900/80 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Dices className="h-5 w-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-100">
            Rolador de Dados (Mini-d6)
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400">Somar:</span>
          <button
            type="button"
            onClick={() => setModifier(0)}
            className={`rounded px-2 py-1 font-medium ${
              modifier === 0
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            +0
          </button>
          <button
            type="button"
            onClick={() => setModifier(corpo)}
            className={`rounded px-2 py-1 font-medium ${
              modifier === corpo && corpo !== 0
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Corpo ({corpo >= 0 ? `+${corpo}` : corpo})
          </button>
          <button
            type="button"
            onClick={() => setModifier(mente)}
            className={`rounded px-2 py-1 font-medium ${
              modifier === mente && mente !== 0
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Mente ({mente >= 0 ? `+${mente}` : mente})
          </button>
          <button
            type="button"
            onClick={() => setModifier(espirito)}
            className={`rounded px-2 py-1 font-medium ${
              modifier === espirito && espirito !== 0
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Espírito ({espirito >= 0 ? `+${espirito}` : espirito})
          </button>
          <div className="flex items-center gap-1" title="Modificador manual (ex: +2 de bônus ou -1 de penalidade)">
            <span className="text-slate-400">Mod:</span>
            <input
              type="number"
              value={modifier}
              onChange={(e) => setModifier(Number(e.target.value))}
              className="w-14 rounded border border-slate-700 bg-slate-950 px-1.5 py-1 text-center text-slate-100"
            />
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => handleRoll('3d6')}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
        >
          Rolar 3d6
        </button>
        <button
          type="button"
          onClick={() => handleRoll('adv')}
          className="rounded-lg border border-emerald-700/60 bg-emerald-950/50 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/50"
        >
          4d6 Vantagem
        </button>
        <button
          type="button"
          onClick={() => handleRoll('dis')}
          className="rounded-lg border border-rose-700/60 bg-rose-950/50 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-900/50"
        >
          4d6 Desvantagem
        </button>
        <button
          type="button"
          onClick={() => handleRoll('1d6')}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
        >
          1d6
        </button>
        <button
          type="button"
          onClick={() => handleRoll('1d3')}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
        >
          1d3
        </button>

        {result && (
          <button
            type="button"
            onClick={() => setResult(null)}
            className="ml-auto flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Limpar
          </button>
        )}
      </div>

      {result && (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/80 p-3">
          <div className="flex items-center gap-1.5">
            {result.kept.map((d, i) => (
              <span
                key={i}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-700 bg-slate-800 text-sm font-bold text-slate-100"
              >
                {d}
              </span>
            ))}
            {result.dropped !== undefined && (
              <span
                className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-800 bg-slate-900 text-xs text-slate-500 line-through"
                title="Dado descartado"
              >
                {result.dropped}
              </span>
            )}
          </div>

          <div className="text-sm text-slate-300">
            {result.modifier !== 0 && (
              <span className="mr-1 text-slate-400">
                {result.modifier > 0 ? `+ ${result.modifier}` : `- ${Math.abs(result.modifier)}`} =
              </span>
            )}
            <span className="text-lg font-extrabold text-white">
              {result.total}
            </span>
          </div>

          {result.tag && (
            <span
              className={`rounded-md border px-2.5 py-1 text-xs font-bold ${result.tagColor}`}
            >
              {result.tag}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
