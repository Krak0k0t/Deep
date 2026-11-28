import React, { useEffect, useState } from 'react';
import { getLocale, t } from '../game/i18n';
import {
  CODEX_ENTRIES,
  CodexEntryConfig,
  getCodexEntryText,
  getLoreRelicText,
  isCodexEntryUnlocked,
  LORE_RELIC_LIST,
} from '../game/lore';
import { useCompactViewport } from '../hooks/useCompactViewport';

interface LoreJournalModalProps {
  open: boolean;
  language: string;
  highestChapter: number;
  collectedRelicIds: string[];
  npcsMet: string[];
  onClose: () => void;
}

const CodexIcon: React.FC<{ kind: CodexEntryConfig['iconKind']; unlocked: boolean }> = ({
  kind,
  unlocked,
}) => {
  const stroke = unlocked ? '#5ef7e6' : '#3a6273';
  const fill = unlocked ? '#0c3b4d' : '#061b28';
  return (
    <svg viewBox="0 0 36 36" className="w-7 h-7 shrink-0" aria-hidden="true">
      <rect x="2" y="2" width="32" height="32" rx="4" fill={fill} stroke={stroke} strokeWidth="1.5" />
      {kind === 'jelly' && (
        <>
          <path d="M9 17c0-5 18-5 18 0H9z" fill={stroke} opacity="0.85" />
          <path d="M13 18v8M18 18v9M23 18v8" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
        </>
      )}
      {kind === 'squid' && (
        <path d="M18 7l6 11-3 2 2 8-5-3-5 3 2-8-3-2 6-11z" fill={unlocked ? '#ff7c7c' : stroke} opacity="0.9" />
      )}
      {kind === 'octopus' && (
        <>
          <circle cx="18" cy="14" r="6" fill={stroke} opacity="0.85" />
          <path d="M11 20c-1 5 2 7 3 7M16 20v8M20 20v8M25 20c1 5-2 7-3 7" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}
      {kind === 'puffer' && (
        <>
          <circle cx="18" cy="18" r="7" fill={unlocked ? '#f5cf6e' : stroke} opacity="0.9" />
          <path d="M18 8v3M18 25v3M8 18h3M25 18h3" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}
      {kind === 'crab' && (
        <>
          <ellipse cx="18" cy="20" rx="7" ry="5" fill={stroke} opacity="0.85" />
          <path d="M10 15l3 3M26 15l-3 3M9 22l4-1M27 22l-4-1" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}
      {kind === 'turtle' && (
        <>
          <ellipse cx="18" cy="18" rx="6" ry="8" fill={stroke} opacity="0.85" />
          <path d="M11 14l-3-2M25 14l3-2M12 24l-3 3M24 24l3 3" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}
      {kind === 'angler' && (
        <>
          <ellipse cx="18" cy="20" rx="7" ry="6" fill={stroke} opacity="0.82" />
          <path d="M18 14c0-5 5-6 8-4" fill="none" stroke="#ffb86c" strokeWidth="1.6" />
          <circle cx="27" cy="11" r="2" fill="#ffd98a" />
        </>
      )}
      {kind === 'whale' && (
        <path d="M7 20c3-7 13-8 19-3l3-3v8l-3-2c-5 4-14 4-19 0z" fill={stroke} opacity="0.88" />
      )}
      {kind === 'parrot' && (
        <>
          <ellipse cx="17" cy="19" rx="7" ry="5" fill={unlocked ? '#ffd27d' : stroke} opacity="0.9" />
          <path d="M24 18l4 1-3 3" fill="#ff8f59" />
        </>
      )}
      {kind === 'egg' && (
        <circle cx="18" cy="18" r="7" fill={stroke} opacity="0.9" />
      )}
    </svg>
  );
};

export const LoreJournalModal: React.FC<LoreJournalModalProps> = ({
  open,
  language,
  highestChapter,
  collectedRelicIds,
  npcsMet,
  onClose,
}) => {
  const [tab, setTab] = useState<'relics' | 'codex'>('relics');
  const [page, setPage] = useState(0);
  const { isCompact, isNarrow } = useCompactViewport();
  const dict = getLocale(language);

  useEffect(() => {
    if (!open) {
      setPage(0);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, onClose]);

  if (!open) return null;

  const unlockedCodexCount = CODEX_ENTRIES.filter((entry) =>
    isCodexEntryUnlocked(entry, highestChapter, npcsMet),
  ).length;

  const pageSize = isNarrow ? 3 : isCompact ? 4 : 6;
  const itemsCount = tab === 'relics' ? LORE_RELIC_LIST.length : CODEX_ENTRIES.length;
  const totalPages = Math.max(1, Math.ceil(itemsCount / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const startIdx = safePage * pageSize;

  const visibleRelics = LORE_RELIC_LIST.slice(startIdx, startIdx + pageSize);
  const visibleCodex = CODEX_ENTRIES.slice(startIdx, startIdx + pageSize);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4"
      style={{ backgroundColor: 'rgba(2, 12, 20, 0.82)' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lore-journal-title"
        data-testid="lore-journal-dialog"
        className="w-full max-w-2xl overflow-hidden flex flex-col rounded border border-[#26e8d4]/30 p-3 sm:p-3.5 shadow-[0_18px_48px_rgba(0,0,0,0.78)]"
        style={{ backgroundColor: 'rgba(5, 24, 37, 0.97)' }}
      >
        <div className="flex items-center justify-between gap-2 shrink-0">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.16em] text-[#26e8d4] leading-none">
              {dict.journalEyebrow}
            </div>
            <h2
              id="lore-journal-title"
              className="mt-0.5 text-base sm:text-lg font-bold text-[#f0fffd] truncate leading-tight"
            >
              {dict.journalTitle}
            </h2>
          </div>

          <button
            type="button"
            aria-label={dict.btnDone}
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded border border-[#183d52]/80 text-xs text-[#bdebf2] hover:border-[#26e8d4] cursor-pointer shrink-0"
            style={{ backgroundColor: 'rgba(8, 36, 54, 0.9)' }}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-1.5 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              data-testid="journal-tab-relics"
              onClick={() => {
                setTab('relics');
                setPage(0);
              }}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                tab === 'relics'
                  ? 'bg-[#26e8d4] text-[#031d29]'
                  : 'text-[#a5d9e3] border border-[#183d52]/80 hover:border-[#26e8d4]'
              }`}
              style={tab === 'relics' ? undefined : { backgroundColor: 'rgba(4, 18, 29, 0.88)' }}
            >
              {dict.journalTabRelics} ({collectedRelicIds.length}/{LORE_RELIC_LIST.length})
            </button>

            <button
              type="button"
              data-testid="journal-tab-codex"
              onClick={() => {
                setTab('codex');
                setPage(0);
              }}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                tab === 'codex'
                  ? 'bg-[#26e8d4] text-[#031d29]'
                  : 'text-[#a5d9e3] border border-[#183d52]/80 hover:border-[#26e8d4]'
              }`}
              style={tab === 'codex' ? undefined : { backgroundColor: 'rgba(4, 18, 29, 0.88)' }}
            >
              {dict.journalTabCodex} ({unlockedCodexCount}/{CODEX_ENTRIES.length})
            </button>
          </div>

          <div className="text-[11px] font-medium text-[#fff5d9] tabular-nums">
            {t(language, 'journalCollectedCount', {
              count: tab === 'relics' ? collectedRelicIds.length : unlockedCodexCount,
              total: tab === 'relics' ? LORE_RELIC_LIST.length : CODEX_ENTRIES.length,
            })}
          </div>
        </div>

        {/* Paginated Dense 2-Column Grid */}
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {tab === 'relics'
            ? visibleRelics.map((relic) => {
                const found = collectedRelicIds.includes(relic.id);
                const chShort = dict[`chapter${relic.chapter}Short` as keyof typeof dict];
                const chTitle = dict[`chapter${relic.chapter}Title` as keyof typeof dict];
                const loc = getLoreRelicText(relic, language);
                return (
                  <div
                    key={relic.id}
                    className={`p-2 rounded border ${
                      found ? 'border-[#e8cf8e]/45' : 'border-[#183d52]/80'
                    }`}
                    style={{ backgroundColor: 'rgba(4, 18, 29, 0.88)' }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-[#7ed6ce] truncate">
                        {chShort} · {chTitle}
                      </span>
                      <span
                        className="w-2 h-2 rounded-sm shrink-0"
                        style={{
                          backgroundColor: found ? relic.tintHex : '#1b3e4f',
                        }}
                      />
                    </div>
                    <div className="mt-0.5 text-xs font-semibold text-[#ebfffe] truncate leading-tight">
                      {found ? loc.title : '???'}
                    </div>
                    <div className="mt-0.5 text-[11px] text-[#89bcc9] leading-tight line-clamp-2">
                      {found ? loc.body : dict.journalLockedRelic}
                    </div>
                  </div>
                );
              })
            : visibleCodex.map((entry) => {
                const unlocked = isCodexEntryUnlocked(entry, highestChapter, npcsMet);
                const loc = getCodexEntryText(entry, language);
                return (
                  <div
                    key={entry.id}
                    className={`flex items-start gap-2 p-2 rounded border ${
                      unlocked ? 'border-[#26e8d4]/40' : 'border-[#183d52]/80'
                    }`}
                    style={{ backgroundColor: 'rgba(4, 18, 29, 0.88)' }}
                  >
                    <CodexIcon kind={entry.iconKind} unlocked={unlocked} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] uppercase tracking-wider text-[#7ed6ce] truncate leading-none">
                        {unlocked ? loc.subtitle : '—'}
                      </div>
                      <div className="mt-0.5 text-xs font-semibold text-[#ebfffe] truncate leading-tight">
                        {unlocked ? loc.title : '???'}
                      </div>
                      <div className="mt-0.5 text-[11px] text-[#89bcc9] leading-tight line-clamp-2">
                        {unlocked ? loc.body : dict.journalLockedCodex}
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              data-testid="journal-back-btn"
              disabled={safePage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="px-2.5 py-1 rounded text-xs font-semibold text-[#bdebf2] border border-[#183d52]/80 hover:border-[#26e8d4] disabled:opacity-40 cursor-pointer disabled:cursor-default"
              style={{ backgroundColor: 'rgba(8, 36, 54, 0.9)' }}
            >
              ← {dict.btnBack}
            </button>
            <span className="text-xs font-semibold tabular-nums text-[#8ec1cf]">
              {safePage + 1} / {totalPages}
            </span>
            <button
              type="button"
              data-testid="journal-next-btn"
              disabled={safePage >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="px-3 py-1 rounded text-xs font-semibold text-[#031d29] bg-[#5ef7e6] hover:bg-[#99fff4] disabled:opacity-40 cursor-pointer disabled:cursor-default"
            >
              {dict.btnNext} →
            </button>
          </div>

          <button
            type="button"
            data-testid="journal-close-btn"
            onClick={onClose}
            className="px-4 py-1 rounded text-xs font-semibold text-[#031d29] bg-[#26e8d4] hover:bg-[#5ef7e6] cursor-pointer"
          >
            {dict.btnDone}
          </button>
        </div>
      </div>
    </div>
  );
};
