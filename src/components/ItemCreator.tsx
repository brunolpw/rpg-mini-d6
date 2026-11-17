import { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, Sparkles, Package } from 'lucide-react';
import { GameItem, ItemCategory } from '../data/itemsData';

const CUSTOM_ITEMS_KEY = 'mini-d6-custom-items-v1';

export function getCustomItems(): GameItem[] {
  try {
    const saved = localStorage.getItem(CUSTOM_ITEMS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fallback
  }
  return [];
}

export function saveCustomItems(items: GameItem[]) {
  try {
    localStorage.setItem(CUSTOM_ITEMS_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('custom-items-updated'));
  } catch {
    // fallback
  }
}

export function ItemCreator() {
  const [items, setItems] = useState<GameItem[]>(() => getCustomItems());
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemCategory>('arma');
  const [attribute, setAttribute] = useState<'corpo' | 'mente' | 'espirito' | 'geral'>('corpo');
  const [hands, setHands] = useState<'1 Mão' | '2 Mãos' | 'N/A'>('1 Mão');
  const [isMagic, setIsMagic] = useState(false);
  const [effect, setEffect] = useState('');
  const [price, setPrice] = useState(25);
  const [res, setRes] = useState(0);
  const [defBonus, setDefBonus] = useState(0);
  const [description, setDescription] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    const handleUpdate = () => setItems(getCustomItems());
    window.addEventListener('custom-items-updated', handleUpdate);
    return () => window.removeEventListener('custom-items-updated', handleUpdate);
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem: GameItem = {
      id: `custom-${crypto.randomUUID()}`,
      name: name.trim(),
      category,
      attribute,
      hands: category === 'arma' ? hands : 'N/A',
      isTwoHanded: category === 'arma' && hands === '2 Mãos',
      isMagic,
      effect: effect.trim() || 'Sem efeito especial',
      price: Math.max(0, Number(price) || 0),
      res: category === 'armadura' ? Math.max(0, Number(res) || 0) : undefined,
      defBonus:
        category === 'escudo' || category === 'armadura'
          ? Math.max(0, Number(defBonus) || 0)
          : undefined,
      isCustom: true,
      description: description.trim() || 'Item customizado criado para a campanha.',
    };

    const nextList = [newItem, ...items];
    setItems(nextList);
    saveCustomItems(nextList);

    // Limpar formulário
    setName('');
    setEffect('');
    setDescription('');
    setPrice(25);
    setRes(0);
    setDefBonus(0);
    setFeedbackMsg(`Item "${newItem.name}" criado com sucesso! Ele já está disponível na Loja.`);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este item customizado?')) {
      const nextList = items.filter((it) => it.id !== id);
      setItems(nextList);
      saveCustomItems(nextList);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
      {/* Cabeçalho */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              Criador de Itens da Campanha
              <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
                Customizado
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Crie artefatos, armas exclusivas e relíquias para suas campanhas. Os itens criados aqui aparecem automaticamente na Loja com a tag <strong>[Customizado]</strong> para qualquer personagem comprar ou equipar.
            </p>
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs text-emerald-300">
          <Sparkles className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Formulário de Criação */}
        <form
          onSubmit={handleCreate}
          className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4"
        >
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Plus className="h-4 w-4 text-indigo-400" /> Novo Item
          </h3>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400">
              Nome do Item *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Lâmina de Obsidiana Ancestral"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                <option value="arma">Arma</option>
                <option value="armadura">Armadura</option>
                <option value="escudo">Escudo / Secundário</option>
                <option value="foco">Foco Mágico</option>
                <option value="consumivel">Consumível</option>
                <option value="utilitario">Utilitário</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400">
                Atributo Principal
              </label>
              <select
                value={attribute}
                onChange={(e) =>
                  setAttribute(e.target.value as 'corpo' | 'mente' | 'espirito' | 'geral')
                }
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                <option value="corpo">Corpo</option>
                <option value="mente">Mente</option>
                <option value="espirito">Espírito</option>
                <option value="geral">Geral / Nenhum</option>
              </select>
            </div>
          </div>

          {category === 'arma' && (
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400">
                Mãos
              </label>
              <select
                value={hands}
                onChange={(e) => setHands(e.target.value as '1 Mão' | '2 Mãos')}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                <option value="1 Mão">1 Mão (Empunhadura simples)</option>
                <option value="2 Mãos">2 Mãos (Ocupa ambas as mãos)</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400">
                Preço (PO)
              </label>
              <input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-amber-400 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-slate-200">
                <input
                  type="checkbox"
                  checked={isMagic}
                  onChange={(e) => setIsMagic(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                />
                <span className="font-semibold flex items-center gap-1 text-purple-300">
                  <Sparkles className="h-3.5 w-3.5" /> Item Mágico
                </span>
              </label>
            </div>
          </div>

          {category === 'armadura' && (
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400">
                  Resistência Física (Res)
                </label>
                <input
                  type="number"
                  min={0}
                  value={res}
                  onChange={(e) => setRes(Math.max(0, Number(e.target.value)))}
                  className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400">
                  Bônus Defesa Física
                </label>
                <input
                  type="number"
                  min={0}
                  value={defBonus}
                  onChange={(e) => setDefBonus(Math.max(0, Number(e.target.value)))}
                  className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100"
                />
              </div>
            </div>
          )}

          {category === 'escudo' && (
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5">
              <label className="block text-[11px] font-semibold text-slate-400">
                Bônus de Defesa (+Def)
              </label>
              <input
                type="number"
                min={0}
                value={defBonus}
                onChange={(e) => setDefBonus(Math.max(0, Number(e.target.value)))}
                className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400">
              Efeito / Dano *
            </label>
            <input
              type="text"
              required
              value={effect}
              onChange={(e) => setEffect(e.target.value)}
              placeholder="Ex: 2d3 + 1 Fogo (ignora 2 de armadura)"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400">
              Descrição / Lore / Notas
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="História do item, regras específicas ou origem..."
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500 transition-colors"
          >
            <Plus className="h-4 w-4" /> Criar e Publicar na Loja
          </button>
        </form>

        {/* Lista de Itens Criados */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Package className="h-4 w-4 text-amber-400" /> Itens Criados na Campanha ({items.length})
            </h3>
            <span className="text-xs text-slate-400">
              Salvo localmente no navegador
            </span>
          </div>

          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-8 text-center text-slate-400">
              <Package className="mx-auto h-8 w-8 text-slate-600 mb-2" />
              <p className="text-sm font-medium text-slate-300">
                Nenhum item customizado criado ainda.
              </p>
              <p className="text-xs mt-1 text-slate-500">
                Preencha o formulário ao lado para adicionar armas, armaduras e relíquias personalizadas à sua aventura.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-amber-900/30 bg-slate-900/60 p-4 transition-colors hover:border-amber-700/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-slate-100">{item.name}</span>
                        <span className="inline-flex items-center gap-1 rounded bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                          <Tag className="h-3 w-3" /> Customizado
                        </span>
                        {item.isMagic && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-purple-500/20 border border-purple-500/40 px-1.5 py-0.5 text-[10px] font-semibold text-purple-300">
                            <Sparkles className="h-3 w-3" /> Mágico
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                        <span className="capitalize text-slate-300 font-medium">
                          {item.category} {item.hands ? `(${item.hands})` : ''}
                        </span>
                        {item.attribute && (
                          <span className="capitalize">
                            Atributo: <strong className="text-slate-200">{item.attribute}</strong>
                          </span>
                        )}
                        <span className="font-bold text-amber-400">{item.price} PO</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="rounded p-1.5 text-slate-500 hover:bg-rose-950/50 hover:text-rose-400 transition-colors"
                      title="Excluir item customizado"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-2.5 rounded bg-slate-950/70 p-2 text-xs border border-slate-800/80">
                    <span className="font-semibold text-sky-300">Efeito / Dano:</span>{' '}
                    <span className="text-slate-200">{item.effect}</span>
                  </div>

                  {item.description && (
                    <p className="mt-2 text-xs text-slate-400 italic">
                      &ldquo;{item.description}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
