import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Search, BookOpen, Menu, X } from 'lucide-react';

interface TocItem {
  id: string;
  title: string;
  level: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\{#.*?\}/g, '')
    .replace(/[*_`]/g, '')
    .trim()
    .replace(/[^\w\s-áàãâéêíóôõúç]/g, '')
    .replace(/\s+/g, '-');
}

export function DocsViewer() {
  const [markdown, setMarkdown] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [tocOpen, setTocOpen] = useState<boolean>(false);

  useEffect(() => {
    fetch('./mini-d6 v2.5.md')
      .then((res) => {
        if (!res.ok) throw new Error('Não foi possível carregar o manual.');
        return res.text();
      })
      .then((text) => {
        // Remove âncoras {#...} do texto visível mantendo o título limpo
        const cleaned = text.replace(/\s*\{#[^}]+\}/g, '');
        setMarkdown(cleaned);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const toc = useMemo<TocItem[]>(() => {
    if (!markdown) return [];
    const items: TocItem[] = [];
    const lines = markdown.split('\n');
    for (const line of lines) {
      const match = /^(#{1,2})\s+(.+)$/.exec(line);
      if (match) {
        const level = match[1].length;
        const rawTitle = match[2].replace(/\*\*/g, '').trim();
        if (rawTitle) {
          items.push({
            id: slugify(rawTitle),
            title: rawTitle,
            level,
          });
        }
      }
    }
    return items;
  }, [markdown]);

  const filteredToc = useMemo(() => {
    if (!search.trim()) return toc;
    const q = search.toLowerCase();
    return toc.filter((item) => item.title.toLowerCase().includes(q));
  }, [toc, search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <BookOpen className="mr-2 h-5 w-5 animate-pulse" />
        Carregando manual Mini-d6 v2.5...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-red-800 bg-red-950/40 p-6 text-center text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row">
      {/* Botão mobile para abrir sumário */}
      <div className="flex items-center justify-between lg:hidden">
        <button
          onClick={() => setTocOpen(!tocOpen)}
          className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
        >
          {tocOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          Sumário do Manual
        </button>
      </div>

      {/* Sumário Lateral */}
      <aside
        className={`${
          tocOpen ? 'block' : 'hidden'
        } w-full shrink-0 lg:sticky lg:top-20 lg:block lg:h-[calc(100vh-6rem)] lg:w-72`}
      >
        <div className="flex h-full flex-col rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="relative mb-3">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar capítulos..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pr-3 pl-9 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto pr-1 text-sm">
            {filteredToc.map((item, idx) => (
              <a
                key={`${item.id}-${idx}`}
                href={`#${item.id}`}
                onClick={() => setTocOpen(false)}
                className={`block rounded-md px-2.5 py-1.5 transition-colors hover:bg-slate-800 hover:text-indigo-300 ${
                  item.level === 1
                    ? 'font-semibold text-slate-100'
                    : 'pl-5 text-slate-400'
                }`}
              >
                {item.title}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <article className="markdown-body min-w-0 flex-1 rounded-xl border border-slate-800 bg-slate-900/50 p-6 sm:p-10">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => {
              const text = String(children);
              return <h1 id={slugify(text)}>{children}</h1>;
            },
            h2: ({ children }) => {
              const text = String(children);
              return <h2 id={slugify(text)}>{children}</h2>;
            },
            h3: ({ children }) => {
              const text = String(children);
              return <h3 id={slugify(text)}>{children}</h3>;
            },
          }}
        >
          {markdown}
        </ReactMarkdown>
      </article>
    </div>
  );
}
