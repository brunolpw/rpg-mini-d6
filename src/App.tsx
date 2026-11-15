import { useEffect, useMemo, useState } from 'react';
import { BookOpen, FileText, Dices } from 'lucide-react';
import { DocsViewer } from './components/DocsViewer';
import { CharacterSheet } from './components/CharacterSheet';
import { parseClassPowers } from './utils/markdownParser';

type Tab = 'docs' | 'sheet';

export function App() {
  const [tab, setTab] = useState<Tab>('docs');
  const [markdown, setMarkdown] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('./mini-d6 v2.5.md')
      .then((res) => {
        if (!res.ok) throw new Error('Não foi possível carregar o manual.');
        return res.text();
      })
      .then((text) => {
        setMarkdown(text);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const classPowers = useMemo(() => parseClassPowers(markdown), [markdown]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="no-print sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow">
              <Dices className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight text-slate-100">
                Mini-d6 RPG
              </h1>
              <p className="text-xs text-slate-400">Versão 2.5 • PWA Offline</p>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <button
              onClick={() => setTab('docs')}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                tab === 'docs'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Manual de Regras</span>
              <span className="sm:hidden">Manual</span>
            </button>

            <button
              onClick={() => setTab('sheet')}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                tab === 'sheet'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Ficha de Personagem</span>
              <span className="sm:hidden">Ficha</span>
            </button>
          </nav>
        </div>
      </header>

      <main>
        {tab === 'docs' ? (
          <DocsViewer markdown={markdown} loading={loading} error={error} />
        ) : (
          <CharacterSheet classPowers={classPowers} />
        )}
      </main>
    </div>
  );
}

export default App;
