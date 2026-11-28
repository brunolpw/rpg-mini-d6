import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Bot,
  BookOpen,
  Check,
  ClipboardCopy,
  UserPlus,
  X,
} from 'lucide-react';
import {
  AI_PROMPTS,
  MANUAL_URL,
  getAiPrompt,
  type AiPromptKind,
} from '../utils/aiPrompts';
import { copyTextToClipboard } from '../utils/clipboard';

type CopyStatus = 'idle' | 'copied' | 'error';

export function AiPromptButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeKind, setActiveKind] = useState<AiPromptKind>('rules');
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');
  const copyTimer = useRef<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const activeMeta = AI_PROMPTS.find((meta) => meta.kind === activeKind);
  const prompt = getAiPrompt(activeKind);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setCopyStatus('idle');
        triggerRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (copyTimer.current !== null) {
        window.clearTimeout(copyTimer.current);
      }
    };
  }, []);

  const openModal = () => {
    setCopyStatus('idle');
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setCopyStatus('idle');
    triggerRef.current?.focus();
  };

  const handleCopy = async () => {
    const copied = await copyTextToClipboard(prompt);
    setCopyStatus(copied ? 'copied' : 'error');

    if (copyTimer.current !== null) {
      window.clearTimeout(copyTimer.current);
    }
    copyTimer.current = window.setTimeout(() => {
      setCopyStatus('idle');
    }, copied ? 2500 : 5000);
  };

  const handleKindChange = (kind: AiPromptKind) => {
    setActiveKind(kind);
    setCopyStatus('idle');
    if (copyTimer.current !== null) {
      window.clearTimeout(copyTimer.current);
      copyTimer.current = null;
    }
  };

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        onClick={openModal}
        className="flex shrink-0 items-center gap-1.5 rounded-lg border border-violet-500/40 bg-violet-600/15 px-2.5 py-2 text-sm font-medium text-violet-200 transition-colors hover:bg-violet-600/25 sm:px-3.5"
        title="Copiar um prompt para usar no ChatGPT, Gemini ou outra IA"
        aria-haspopup="dialog"
      >
        <Bot className="h-4 w-4 text-violet-300" />
        <span className="hidden md:inline">Prompt para IA</span>
        <span className="md:hidden">IA</span>
      </button>

      {isOpen &&
        createPortal(
          <div
            className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-4"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeModal();
              }
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="ai-prompt-title"
              className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 px-4 py-3 sm:px-5">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-600/20 text-violet-300">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h2
                      id="ai-prompt-title"
                      className="text-base font-bold leading-tight text-slate-100"
                    >
                      Prompt para IA
                    </h2>
                    <p className="text-xs text-slate-400">
                      Copie e cole no ChatGPT, Gemini ou outra IA de sua
                      preferência.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
                  aria-label="Fechar prompt para IA"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="overflow-y-auto p-4 sm:p-5">
                <div className="grid grid-cols-2 gap-2">
                  {AI_PROMPTS.map((meta) => {
                    const Icon = meta.kind === 'rules' ? BookOpen : UserPlus;
                    const isActive = meta.kind === activeKind;

                    return (
                      <button
                        key={meta.kind}
                        type="button"
                        onClick={() => handleKindChange(meta.kind)}
                        className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors ${
                          isActive
                            ? 'border-violet-500/70 bg-violet-600/20 text-violet-200'
                            : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                        }`}
                        aria-pressed={isActive}
                      >
                        <Icon className="h-4 w-4" />
                        {meta.title}
                      </button>
                    );
                  })}
                </div>

                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  {activeMeta?.description}
                </p>

                <textarea
                  readOnly
                  value={prompt}
                  aria-label={`Prompt para ${activeMeta?.title.toLowerCase() ?? 'IA'}`}
                  spellCheck={false}
                  onFocus={(event) => event.currentTarget.select()}
                  className="mt-3 h-56 w-full resize-none rounded-lg border border-slate-700 bg-slate-950 p-3 font-mono text-xs leading-relaxed text-slate-200 focus:border-violet-500 focus:outline-none sm:h-64"
                />

                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs leading-relaxed text-slate-500">
                    O prompt pede que a IA leia o manual em{' '}
                    <a
                      href={MANUAL_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="text-violet-300 underline underline-offset-2 hover:text-violet-200"
                    >
                      brunolpw.github.io/rpg-mini-d6/mini-d6.md
                    </a>
                    . Se ela não conseguir acessar links, deve pedir o conteúdo.
                  </p>

                  <button
                    type="button"
                    onClick={handleCopy}
                    autoFocus
                    className={`flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors ${
                      copyStatus === 'copied'
                        ? 'bg-emerald-600 hover:bg-emerald-500'
                        : 'bg-violet-600 hover:bg-violet-500'
                    }`}
                  >
                    {copyStatus === 'copied' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <ClipboardCopy className="h-4 w-4" />
                    )}
                    {copyStatus === 'copied' ? 'Copiado!' : 'Copiar prompt'}
                  </button>
                </div>

                {copyStatus === 'error' && (
                  <p className="mt-2 text-xs text-rose-300" role="alert">
                    Não foi possível copiar automaticamente. Selecione o texto
                    acima e use Ctrl+C / Cmd+C.
                  </p>
                )}

                <p className="sr-only" aria-live="polite">
                  {copyStatus === 'copied' ? 'Prompt copiado.' : ''}
                </p>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
