import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Search,
  BookOpen,
  Menu,
  X,
  Book,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { parseDocSections, slugify } from '../utils/markdownParser';

interface DocsViewerProps {
  markdown: string;
  loading: boolean;
  error: string | null;
}

export function DocsViewer({ markdown, loading, error }: DocsViewerProps) {
  const [search, setSearch] = useState<string>('');
  const [tocOpen, setTocOpen] = useState<boolean>(false);
  const [bookMode, setBookMode] = useState<boolean>(false);
  const [activeSectionId, setActiveSectionId] = useState<string>('');

  const sections = useMemo(() => parseDocSections(markdown), [markdown]);

  const currentSectionIndex = useMemo(() => {
    if (sections.length === 0) return 0;
    const idx = sections.findIndex((s) => s.id === activeSectionId);
    return idx >= 0 ? idx : 0;
  }, [sections, activeSectionId]);

  const currentSection = sections[currentSectionIndex];

  const filteredSections = useMemo(() => {
    if (!search.trim()) return sections;
    const q = search.toLowerCase();
    return sections.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.content.toLowerCase().includes(q)
    );
  }, [sections, search]);

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

  const contentToRender = bookMode
    ? markdown.replace(/\s*\{#[^}]+\}/g, '')
    : currentSection?.content ?? '';

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row">
      {/* Barra mobile */}
      <div className="flex items-center justify-between gap-2 lg:hidden">
        <button
          onClick={() => setTocOpen(!tocOpen)}
          className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
        >
          {tocOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          {bookMode ? 'Capítulos' : currentSection?.title ?? 'Capítulos'}
        </button>

        <button
          onClick={() => setBookMode(!bookMode)}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium ${
            bookMode
              ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300'
              : 'border-slate-700 bg-slate-900 text-slate-300'
          }`}
        >
          {bookMode ? (
            <>
              <Layers className="h-3.5 w-3.5" /> Por Seção
            </>
          ) : (
            <>
              <Book className="h-3.5 w-3.5" /> Modo Livro
            </>
          )}
        </button>
      </div>

      {/* Menu Lateral */}
      <aside
        className={`${
          tocOpen ? 'block' : 'hidden'
        } w-full shrink-0 lg:sticky lg:top-20 lg:block lg:h-[calc(100vh-6rem)] lg:w-72`}
      >
        <div className="flex h-full flex-col rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Navegação
            </span>
            <button
              onClick={() => setBookMode(!bookMode)}
              className={`hidden items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors lg:flex ${
                bookMode
                  ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300'
                  : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title="Alternar entre leitura por capítulo ou livro completo"
            >
              {bookMode ? (
                <>
                  <Layers className="h-3.5 w-3.5" /> Por Seção
                </>
              ) : (
                <>
                  <Book className="h-3.5 w-3.5" /> Modo Livro
                </>
              )}
            </button>
          </div>

          <div className="relative mb-3">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar assunto..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pr-3 pl-9 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto pr-1 text-sm">
            {filteredSections.map((sec) => {
              const isActive = !bookMode && sec.id === currentSection?.id;
              return (
                <div key={sec.id} className="space-y-0.5">
                  <button
                    onClick={() => {
                      if (bookMode) {
                        document
                          .getElementById(sec.id)
                          ?.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        setActiveSectionId(sec.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                      setTocOpen(false);
                    }}
                    className={`block w-full rounded-md px-3 py-2 text-left font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-200 hover:bg-slate-800 hover:text-indigo-300'
                    }`}
                  >
                    {sec.title}
                  </button>

                  {sec.subsections.length > 0 && (
                    <div className="ml-3 space-y-0.5 border-l border-slate-800 pl-2">
                      {sec.subsections.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => {
                            if (!bookMode && sec.id !== currentSection?.id) {
                              setActiveSectionId(sec.id);
                              setTimeout(() => {
                                document
                                  .getElementById(sub.id)
                                  ?.scrollIntoView({ behavior: 'smooth' });
                              }, 60);
                            } else {
                              document
                                .getElementById(sub.id)
                                ?.scrollIntoView({ behavior: 'smooth' });
                            }
                            setTocOpen(false);
                          }}
                          className="block w-full rounded px-2 py-1 text-left text-xs text-slate-400 transition-colors hover:bg-slate-800/70 hover:text-indigo-300"
                        >
                          {sub.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
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
          {contentToRender}
        </ReactMarkdown>

        {/* Navegação Anterior / Próximo no modo por seção */}
        {!bookMode && sections.length > 1 && (
          <div className="mt-10 flex items-center justify-between border-t border-slate-800 pt-6">
            <button
              disabled={currentSectionIndex === 0}
              onClick={() => {
                setActiveSectionId(sections[currentSectionIndex - 1].id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              {currentSectionIndex > 0
                ? sections[currentSectionIndex - 1].title
                : 'Anterior'}
            </button>

            <button
              disabled={currentSectionIndex === sections.length - 1}
              onClick={() => {
                setActiveSectionId(sections[currentSectionIndex + 1].id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 disabled:opacity-40"
            >
              {currentSectionIndex < sections.length - 1
                ? sections[currentSectionIndex + 1].title
                : 'Próximo'}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </article>
    </div>
  );
}
