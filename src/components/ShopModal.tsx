import { useState, useMemo } from 'react';
import {
  Store,
  X,
  Search,
  Coins,
  Sparkles,
  Tag,
  Check,
} from 'lucide-react';
import { GameItem, OFFICIAL_ITEMS } from '../data/itemsData';
import { getCustomItems } from './ItemCreator';

interface ShopModalProps {
  gold: number;
  onBuyItem: (item: GameItem) => void;
  onClose: () => void;
}

export function ShopModal({ gold, onBuyItem, onClose }: ShopModalProps) {
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [justBoughtId, setJustBoughtId] = useState<string | null>(null);

  const customItems = useMemo(() => getCustomItems(), []);

  const allItems: GameItem[] = useMemo(() => {
    return [...customItems, ...OFFICIAL_ITEMS];
  }, [customItems]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchCat =
        activeCategory === 'todos'
          ? true
          : activeCategory === 'custom'
          ? item.isCustom
          : item.category === activeCategory;

      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.effect.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description &&
          item.description.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchCat && matchSearch;
    });
  }, [allItems, activeCategory, searchTerm]);

  const handleBuy = (item: GameItem) => {
    if (gold < item.price) return;
    onBuyItem(item);
    setJustBoughtId(item.id);
    setTimeout(() => {
      setJustBoughtId((curr) => (curr === item.id ? null : curr));
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-sm">
      <div className="flex h-full max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-800 bg-slate-950 text-slate-100 shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Loja de Equipamentos & Bazar
              </h2>
              <p className="text-xs text-slate-400">
                Compre itens oficiais e relíquias customizadas para sua mochila
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-950/40 px-3 py-1 text-sm font-bold text-amber-300">
              <Coins className="h-4 w-4 text-amber-400" />
              <span>{gold} PO</span>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="flex flex-col gap-3 border-b border-slate-800 bg-slate-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'arma', label: 'Armas' },
              { id: 'armadura', label: 'Armaduras' },
              { id: 'escudo', label: 'Escudos / Secundários' },
              { id: 'foco', label: 'Focos Mágicos' },
              { id: 'consumivel', label: 'Consumíveis' },
              { id: 'utilitario', label: 'Utilitários' },
              { id: 'custom', label: 'Customizados', count: customItems.length },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded-lg px-2.5 py-1.5 font-medium transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {cat.label}
                {cat.count !== undefined && cat.count > 0 && (
                  <span className="ml-1 rounded-full bg-amber-500/30 px-1.5 py-0.2 text-[10px] text-amber-300 font-bold">
                    {cat.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="relative min-w-[220px]">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar item ou efeito..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-1.5 pl-8 pr-3 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Grid de Itens */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Nenhum item encontrado com esses filtros.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredItems.map((item) => {
                const canAfford = gold >= item.price;
                const isBought = justBoughtId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`flex flex-col justify-between rounded-xl border p-3.5 transition-colors ${
                      item.isCustom
                        ? 'border-amber-900/40 bg-slate-900/80 hover:border-amber-700/60'
                        : 'border-slate-800/90 bg-slate-900/40 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-100">
                              {item.name}
                            </span>
                            {item.isCustom && (
                              <span className="inline-flex items-center gap-0.5 rounded bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.2 text-[9px] font-bold text-amber-300">
                                <Tag className="h-2.5 w-2.5" /> Custom
                              </span>
                            )}
                            {item.isMagic && (
                              <span className="inline-flex items-center gap-0.5 rounded bg-purple-500/20 border border-purple-500/40 px-1.5 py-0.2 text-[9px] font-semibold text-purple-300">
                                <Sparkles className="h-2.5 w-2.5" /> Mágico
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-400">
                            <span className="capitalize">{item.category}</span>
                            {item.hands && item.hands !== 'N/A' && (
                              <span>• {item.hands}</span>
                            )}
                            {item.attribute && item.attribute !== 'geral' && (
                              <span className="capitalize">• {item.attribute}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 font-bold text-xs text-amber-400 whitespace-nowrap">
                          <Coins className="h-3.5 w-3.5" />
                          <span>{item.price} PO</span>
                        </div>
                      </div>

                      <div className="mt-2 rounded bg-slate-950/80 p-2 text-xs border border-slate-800/70">
                        <span className="font-semibold text-sky-300">Efeito:</span>{' '}
                        <span className="text-slate-200">{item.effect}</span>
                      </div>

                      {item.description && (
                        <p className="mt-1.5 text-[11px] text-slate-400 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/70 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">
                        {canAfford ? 'Saldo suficiente' : 'PO insuficiente'}
                      </span>

                      <button
                        type="button"
                        disabled={!canAfford}
                        onClick={() => handleBuy(item)}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                          isBought
                            ? 'bg-emerald-600 text-white'
                            : canAfford
                            ? 'bg-amber-600 text-white hover:bg-amber-500 shadow'
                            : 'cursor-not-allowed bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isBought ? (
                          <>
                            <Check className="h-3.5 w-3.5" /> Comprado!
                          </>
                        ) : (
                          <>
                            <Coins className="h-3.5 w-3.5" /> Comprar
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
