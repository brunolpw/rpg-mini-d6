import { useState, useMemo } from 'react';
import {
  Store,
  X,
  Search,
  Coins,
  Sparkles,
  Tag,
  Check,
  ShoppingBag,
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  SlidersHorizontal,
} from 'lucide-react';
import { GameItem, OFFICIAL_ITEMS } from '../data/itemsData';
import { CharacterBackpackItem } from './CharacterSheet';
import { getCustomItems } from './ItemCreator';

interface ShopModalProps {
  gold: number;
  backpackItems?: CharacterBackpackItem[];
  onBuyItem: (item: GameItem, customPrice?: number) => void;
  onSellItem?: (item: CharacterBackpackItem, sellPrice: number, qtyToSell?: number) => void;
  onClose: () => void;
}

export function ShopModal({
  gold,
  backpackItems = [],
  onBuyItem,
  onSellItem,
  onClose,
}: ShopModalProps) {
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [activeAttribute, setActiveAttribute] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [justBoughtId, setJustBoughtId] = useState<string | null>(null);
  const [justSoldId, setJustSoldId] = useState<string | null>(null);

  // Preços ajustados temporários pelo usuário (id do item -> preço customizado)
  const [customBuyPrices, setCustomBuyPrices] = useState<Record<string, number>>({});
  const [customSellPrices, setCustomSellPrices] = useState<Record<string, number>>({});

  const customItems = useMemo(() => getCustomItems(), []);

  const allItems: GameItem[] = useMemo(() => {
    return [...customItems, ...OFFICIAL_ITEMS];
  }, [customItems]);

  // Itens filtrados para a aba de Compra
  const filteredBuyItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchCat =
        activeCategory === 'todos'
          ? true
          : activeCategory === 'custom'
          ? item.isCustom
          : item.category === activeCategory;

      const matchAttr =
        activeAttribute === 'todos'
          ? true
          : activeAttribute === 'geral'
          ? item.attribute === 'geral' || !item.attribute
          : item.attribute?.includes(activeAttribute);

      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.effect.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description &&
          item.description.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchCat && matchAttr && matchSearch;
    });
  }, [allItems, activeCategory, activeAttribute, searchTerm]);

  // Itens filtrados para a aba de Venda (itens da mochila)
  const filteredSellItems = useMemo(() => {
    return backpackItems.filter((item) => {
      const matchCat =
        activeCategory === 'todos'
          ? true
          : activeCategory === 'custom'
          ? item.isCustom
          : item.category === activeCategory;

      const matchAttr =
        activeAttribute === 'todos'
          ? true
          : activeAttribute === 'geral'
          ? item.attribute === 'geral' || !item.attribute
          : item.attribute?.includes(activeAttribute);

      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.effect && item.effect.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchCat && matchAttr && matchSearch;
    });
  }, [backpackItems, activeCategory, activeAttribute, searchTerm]);

  const handleBuy = (item: GameItem) => {
    const finalPrice =
      customBuyPrices[item.id] !== undefined ? customBuyPrices[item.id] : item.price;
    if (gold < finalPrice) return;
    onBuyItem(item, finalPrice);
    setJustBoughtId(item.id);
    setTimeout(() => {
      setJustBoughtId((curr) => (curr === item.id ? null : curr));
    }, 1500);
  };

  const handleSell = (item: CharacterBackpackItem, qty: number = 1) => {
    if (!onSellItem) return;
    const defaultSellPrice = Math.max(1, Math.round((item.price ?? 20) * 0.5));
    const finalPrice =
      customSellPrices[item.id] !== undefined
        ? customSellPrices[item.id]
        : defaultSellPrice;

    onSellItem(item, finalPrice, qty);
    setJustSoldId(item.id);
    setTimeout(() => {
      setJustSoldId((curr) => (curr === item.id ? null : curr));
    }, 1500);
  };

  const getAttrBadgeColor = (attr?: string) => {
    if (!attr) return 'bg-slate-700/40 border-slate-600/40 text-slate-300';
    if (attr.includes('corpo'))
      return 'bg-rose-500/20 border-rose-500/40 text-rose-300';
    if (attr.includes('mente'))
      return 'bg-sky-500/20 border-sky-500/40 text-sky-300';
    if (attr.includes('espirito'))
      return 'bg-purple-500/20 border-purple-500/40 text-purple-300';
    return 'bg-slate-700/40 border-slate-600/40 text-slate-300';
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
                {mode === 'buy'
                  ? 'Compre armas, armaduras, focos e suprimentos para sua jornada'
                  : 'Venda itens da sua mochila por moedas de ouro (padrão 50% do valor)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
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

        {/* Abas Modo Compra / Modo Venda */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode('buy')}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                mode === 'buy'
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <ArrowDownLeft className="h-4 w-4" />
              Comprar Itens
            </button>

            <button
              type="button"
              onClick={() => setMode('sell')}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                mode === 'sell'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="h-4 w-4" />
              Vender da Mochila ({backpackItems.length})
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400">
            <SlidersHorizontal className="h-3 w-3 text-slate-500" />
            <span>Preços de compra e venda podem ser ajustados livremente</span>
          </div>
        </div>

        {/* Filtros de Categoria, Atributo e Busca */}
        <div className="flex flex-col gap-3 border-b border-slate-800 bg-slate-900/60 p-4">
          <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
            {/* Categorias */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'arma', label: 'Armas' },
                { id: 'armadura', label: 'Armaduras' },
                { id: 'escudo', label: 'Escudos / Secundários' },
                { id: 'foco', label: 'Focos' },
                { id: 'consumivel', label: 'Consumíveis' },
                { id: 'utilitario', label: 'Utilitários' },
                { id: 'custom', label: 'Custom', count: customItems.length },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
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

            {/* Campo de Busca */}
            <div className="relative min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome ou efeito..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-1.5 pl-8 pr-3 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Filtros por Atributo */}
          <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-800/80 pt-2 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Atributo:</span>
            {[
              { id: 'todos', label: 'Todos Atributos' },
              { id: 'corpo', label: 'Corpo', color: 'text-rose-300 border-rose-500/30' },
              { id: 'mente', label: 'Mente', color: 'text-sky-300 border-sky-500/30' },
              { id: 'espirito', label: 'Espírito', color: 'text-purple-300 border-purple-500/30' },
              { id: 'geral', label: 'Geral', color: 'text-slate-300 border-slate-600/30' },
            ].map((attr) => (
              <button
                key={attr.id}
                type="button"
                onClick={() => setActiveAttribute(attr.id)}
                className={`rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors ${
                  activeAttribute === attr.id
                    ? 'bg-slate-700 text-white border-indigo-500 ring-1 ring-indigo-500'
                    : 'bg-slate-950/70 hover:bg-slate-800 ' + (attr.color || 'border-slate-800 text-slate-300')
                }`}
              >
                {attr.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conteúdo Principal — Lista de Itens */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {mode === 'buy' ? (
            /* ================= MODO COMPRA ================= */
            filteredBuyItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Nenhum item encontrado com esses filtros.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {filteredBuyItems.map((item) => {
                  const currentBuyPrice =
                    customBuyPrices[item.id] !== undefined
                      ? customBuyPrices[item.id]
                      : item.price;
                  const canAfford = gold >= currentBuyPrice;
                  const isBought = justBoughtId === item.id;
                  const ownedInBackpack = backpackItems.find(
                    (b) => b.name.toLowerCase() === item.name.toLowerCase()
                  );
                  const ownedQty = ownedInBackpack ? ownedInBackpack.qty : 0;

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
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-bold text-xs text-slate-100">
                                {item.name}
                              </span>
                              {ownedQty > 0 && (
                                <span
                                  className="inline-flex items-center gap-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300"
                                  title={`Você possui ${ownedQty} unidade(s) deste item na mochila`}
                                >
                                  <Package className="h-2.5 w-2.5" /> Na Mochila: {ownedQty}
                                </span>
                              )}
                              {item.attribute && (
                                <span
                                  className={`inline-flex items-center rounded border px-1.5 py-0.2 text-[9px] font-bold uppercase ${getAttrBadgeColor(
                                    item.attribute
                                  )}`}
                                >
                                  {item.attribute}
                                </span>
                              )}
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
                            </div>
                          </div>

                          {/* Preço de Compra Ajustável */}
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1">
                              <Coins className="h-3.5 w-3.5 text-amber-400" />
                              <input
                                type="number"
                                min={0}
                                title="Preço de compra negociado"
                                value={currentBuyPrice}
                                onChange={(e) => {
                                  const val = Math.max(0, Number(e.target.value));
                                  setCustomBuyPrices((prev) => ({
                                    ...prev,
                                    [item.id]: val,
                                  }));
                                }}
                                className="w-16 rounded border border-slate-700 bg-slate-950 px-1.5 py-0.5 text-right text-xs font-bold text-amber-300 focus:border-amber-400 focus:outline-none"
                              />
                              <span className="text-[11px] font-bold text-amber-400">PO</span>
                            </div>
                            {currentBuyPrice !== item.price && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCustomBuyPrices((prev) => {
                                    const next = { ...prev };
                                    delete next[item.id];
                                    return next;
                                  });
                                }}
                                className="text-[9px] text-slate-500 hover:text-amber-300 underline"
                              >
                                Restaurar padrão ({item.price} PO)
                              </button>
                            )}
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
                              <Coins className="h-3.5 w-3.5" /> Comprar ({currentBuyPrice} PO)
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* ================= MODO VENDA ================= */
            filteredSellItems.length === 0 ? (
              <div className="my-auto py-12 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-xl">
                <ShoppingBag className="mx-auto h-8 w-8 text-slate-600 mb-2" />
                Nenhum item na sua mochila corresponde a estes filtros para venda.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {filteredSellItems.map((item) => {
                  const defaultSellPrice = Math.max(1, Math.round((item.price ?? 20) * 0.5));
                  const currentSellPrice =
                    customSellPrices[item.id] !== undefined
                      ? customSellPrices[item.id]
                      : defaultSellPrice;
                  const isSold = justSoldId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col justify-between rounded-xl border border-slate-800/90 bg-slate-900/40 p-3.5 hover:border-slate-700 transition-colors"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-bold text-xs text-slate-100">
                                {item.name}
                              </span>
                              {item.attribute && (
                                <span
                                  className={`inline-flex items-center rounded border px-1.5 py-0.2 text-[9px] font-bold uppercase ${getAttrBadgeColor(
                                    item.attribute
                                  )}`}
                                >
                                  {item.attribute}
                                </span>
                              )}
                              <span className="rounded bg-slate-800 border border-slate-700 px-1.5 py-0.2 text-[10px] font-bold text-slate-200">
                                Qtd: {item.qty}
                              </span>
                              {item.isCustom && (
                                <span className="inline-flex items-center gap-0.5 rounded bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.2 text-[9px] font-bold text-amber-300">
                                  <Tag className="h-2.5 w-2.5" /> Custom
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-400">
                              <span className="capitalize">{item.category}</span>
                              {item.price && (
                                <span>• Preço base original: {item.price} PO</span>
                              )}
                            </div>
                          </div>

                          {/* Preço de Venda Ajustável */}
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1">
                              <Coins className="h-3.5 w-3.5 text-emerald-400" />
                              <input
                                type="number"
                                min={0}
                                title="Preço unitário de venda acordado"
                                value={currentSellPrice}
                                onChange={(e) => {
                                  const val = Math.max(0, Number(e.target.value));
                                  setCustomSellPrices((prev) => ({
                                    ...prev,
                                    [item.id]: val,
                                  }));
                                }}
                                className="w-16 rounded border border-slate-700 bg-slate-950 px-1.5 py-0.5 text-right text-xs font-bold text-emerald-300 focus:border-emerald-400 focus:outline-none"
                              />
                              <span className="text-[11px] font-bold text-emerald-400">PO</span>
                            </div>
                            {currentSellPrice !== defaultSellPrice && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCustomSellPrices((prev) => {
                                    const next = { ...prev };
                                    delete next[item.id];
                                    return next;
                                  });
                                }}
                                className="text-[9px] text-slate-500 hover:text-emerald-300 underline"
                              >
                                Restaurar 50% ({defaultSellPrice} PO)
                              </button>
                            )}
                          </div>
                        </div>

                        {item.effect && (
                          <div className="mt-2 rounded bg-slate-950/80 p-2 text-xs border border-slate-800/70">
                            <span className="font-semibold text-sky-300">Efeito:</span>{' '}
                            <span className="text-slate-200">{item.effect}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-800/70 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          Total:{' '}
                          <strong className="text-emerald-300">
                            {currentSellPrice * item.qty} PO
                          </strong>{' '}
                          (todas unidades)
                        </span>

                        <div className="flex items-center gap-1.5">
                          {item.qty > 1 && (
                            <button
                              type="button"
                              onClick={() => handleSell(item, 1)}
                              className="rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-emerald-300 hover:bg-slate-700 transition-colors"
                              title="Vender apenas 1 unidade"
                            >
                              Vender 1
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleSell(item, item.qty)}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                              isSold
                                ? 'bg-emerald-600 text-white'
                                : 'bg-emerald-700 text-white hover:bg-emerald-600 shadow'
                            }`}
                          >
                            {isSold ? (
                              <>
                                <Check className="h-3.5 w-3.5" /> Vendido!
                              </>
                            ) : (
                              <>
                                <Coins className="h-3.5 w-3.5" /> Vender{' '}
                                {item.qty > 1 ? `Tudo (+${currentSellPrice * item.qty} PO)` : `(+${currentSellPrice} PO)`}
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
