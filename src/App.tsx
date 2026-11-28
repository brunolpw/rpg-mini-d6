import { useEffect, useMemo, useState } from 'react';
import { BookOpen, FileText, Dices, Download, X, Sparkles } from 'lucide-react';
import { DocsViewer } from './components/DocsViewer';
import { CharacterSheet } from './components/CharacterSheet';
import { ItemCreator } from './components/ItemCreator';
import { AiPromptButton } from './components/AiPromptButton';
import { parseClassPowers } from './utils/markdownParser';

type Tab = 'docs' | 'sheet' | 'items';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function App() {
  const [tab, setTab] = useState<Tab>('docs');
  const [markdown, setMarkdown] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    const dismissed = localStorage.getItem('pwa-install-dismissed') === '1';

    if (isStandalone || dismissed) return;

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Fallback para navegadores mobile (ex: iOS Safari) que não disparam beforeinstallprompt
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      setShowInstallBanner(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setShowInstallBanner(false);
      }
      setInstallPrompt(null);
    }
  };

  const dismissInstallBanner = () => {
    setShowInstallBanner(false);
    localStorage.setItem('pwa-install-dismissed', '1');
  };

  useEffect(() => {
    fetch('./mini-d6.md')
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
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow">
              <Dices className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight text-slate-100">
                Mini-d6 RPG
              </h1>
              <p className="text-xs text-slate-400">Versão 3.0 • PWA Offline</p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setTab('docs')}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors sm:px-3.5 ${
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
              className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors sm:px-3.5 ${
                tab === 'sheet'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Ficha de Personagem</span>
              <span className="sm:hidden">Ficha</span>
            </button>

            <button
              onClick={() => setTab('items')}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors sm:px-3.5 ${
                tab === 'items'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span className="hidden sm:inline">Criador de Itens</span>
              <span className="sm:hidden">Itens</span>
            </button>

            <AiPromptButton />
          </nav>
        </div>
      </header>

      {showInstallBanner && (
        <div className="no-print border-b border-indigo-500/30 bg-indigo-950/70 px-4 py-2.5 text-xs text-indigo-100">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 shrink-0 text-indigo-400" />
              <span>
                <strong>Instale o Mini-d6 RPG</strong> na tela inicial do seu celular ou computador para acessar o manual e suas fichas offline!
                {!installPrompt && (
                  <span className="ml-1 text-indigo-300">
                    (No menu do navegador, toque em &ldquo;Adicionar à tela inicial&rdquo;)
                  </span>
                )}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {installPrompt && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="rounded-md bg-indigo-600 px-3 py-1 font-semibold text-white transition-colors hover:bg-indigo-500"
                >
                  Instalar
                </button>
              )}
              <button
                type="button"
                onClick={dismissInstallBanner}
                className="rounded p-1 text-indigo-300 hover:bg-indigo-900/60 hover:text-white"
                aria-label="Fechar aviso de instalação"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <main>
        {tab === 'docs' && (
          <DocsViewer markdown={markdown} loading={loading} error={error} />
        )}
        {tab === 'sheet' && <CharacterSheet classPowers={classPowers} />}
        {tab === 'items' && <ItemCreator />}
      </main>
    </div>
  );
}

export default App;
