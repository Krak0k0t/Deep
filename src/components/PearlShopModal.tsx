import React, { useEffect, useState } from 'react';
import {
  GLOW_SKINS,
  GlowSkinId,
  HIDEOUT_UPGRADES,
} from '../game/campaign';
import { getLocale, t } from '../game/i18n';
import { useCompactViewport } from '../hooks/useCompactViewport';

interface PearlShopModalProps {
  open: boolean;
  language: string;
  pearls: number;
  activeSkin: GlowSkinId;
  unlockedSkins: GlowSkinId[];
  upgrades: string[];
  onSelectOrBuySkin: (skinId: GlowSkinId) => void;
  onBuyUpgrade: (upgradeId: 'coral_veil' | 'silent_fins') => void;
  onClose: () => void;
}

const SKIN_ORDER: GlowSkinId[] = ['turquoise', 'pearl', 'charcoal'];

export const PearlShopModal: React.FC<PearlShopModalProps> = ({
  open,
  language,
  pearls,
  activeSkin,
  unlockedSkins,
  upgrades,
  onSelectOrBuySkin,
  onBuyUpgrade,
  onClose,
}) => {
  const [page, setPage] = useState(0);
  const { isCompact } = useCompactViewport();
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

  const getSkinLocale = (skinId: GlowSkinId) => {
    if (skinId === 'pearl') {
      return { name: dict.skinPearlName, desc: dict.skinPearlDesc };
    }
    if (skinId === 'charcoal') {
      return { name: dict.skinCharcoalName, desc: dict.skinCharcoalDesc };
    }
    return { name: dict.skinTurquoiseName, desc: dict.skinTurquoiseDesc };
  };

  const getUpgradeLocale = (id: 'coral_veil' | 'silent_fins') => {
    if (id === 'coral_veil') {
      return { name: dict.upgCoralName, desc: dict.upgCoralDesc };
    }
    return { name: dict.upgFinsName, desc: dict.upgFinsDesc };
  };

  const totalPages = isCompact ? 2 : 1;
  const safePage = Math.min(page, totalPages - 1);
  const showSkins = !isCompact || safePage === 0;
  const showUpgrades = !isCompact || safePage === 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      style={{ backgroundColor: 'rgba(2, 12, 20, 0.82)' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pearl-shop-title"
        data-testid="pearl-shop-dialog"
        className="w-full max-w-2xl overflow-hidden rounded border border-[#26e8d4]/30 p-3 sm:p-3.5 shadow-[0_18px_48px_rgba(0,0,0,0.78)]"
        style={{ backgroundColor: 'rgba(5, 24, 37, 0.97)' }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.16em] text-[#26e8d4] leading-none">
              {dict.shopEyebrow}
            </div>
            <h2
              id="pearl-shop-title"
              className="mt-0.5 text-base sm:text-lg font-bold text-[#f0fffd] truncate leading-tight"
            >
              {dict.shopTitle}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <div
              className="px-2 py-0.5 rounded border border-[#c9b78a]/35 text-xs font-bold tabular-nums text-[#fff5d9]"
              style={{ backgroundColor: 'rgba(20, 26, 32, 0.88)' }}
              data-testid="shop-pearls-balance"
            >
              {dict.hudPearls}: {pearls}
            </div>
            <button
              type="button"
              aria-label={dict.btnDone}
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded border border-[#183d52]/80 text-xs text-[#bdebf2] hover:border-[#26e8d4] cursor-pointer"
              style={{ backgroundColor: 'rgba(8, 36, 54, 0.9)' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Glow Skins */}
        {showSkins && (
          <div className="mt-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7ed6ce]">
              {dict.shopSkinsTitle}
            </div>
            <div className="mt-1 grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              {SKIN_ORDER.map((skinId) => {
                const skin = GLOW_SKINS[skinId];
                const loc = getSkinLocale(skinId);
                const isUnlocked = unlockedSkins.includes(skinId);
                const isActive = activeSkin === skinId;
                const canAfford = pearls >= skin.cost;

                return (
                  <div
                    key={skinId}
                    className={`flex flex-col justify-between gap-1.5 p-2 rounded border ${
                      isActive ? 'border-[#26e8d4]/70' : 'border-[#183d52]/80'
                    }`}
                    style={{ backgroundColor: 'rgba(4, 18, 29, 0.88)' }}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className="mt-0.5 w-4 h-4 rounded-sm border border-white/20 shrink-0"
                        style={{ backgroundColor: skin.color }}
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#ebfffe] truncate leading-tight">
                          {loc.name}
                        </div>
                        <div className="text-[11px] text-[#89bcc9] mt-0.5 leading-tight line-clamp-2">
                          {loc.desc}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      data-testid={`shop-skin-${skinId}`}
                      disabled={isActive || (!isUnlocked && !canAfford)}
                      onClick={() => onSelectOrBuySkin(skinId)}
                      className={`w-full px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                        isActive
                          ? 'bg-[#174d5e] text-[#99fff4] cursor-default'
                          : isUnlocked
                            ? 'bg-[#26e8d4] text-[#031d29] hover:bg-[#5ef7e6] cursor-pointer'
                            : canAfford
                              ? 'bg-[#e8cf8e] text-[#1c1607] hover:bg-[#f5df9f] cursor-pointer'
                              : 'bg-[#102b3b] text-[#5e8594] cursor-not-allowed'
                      }`}
                    >
                      {isActive
                        ? dict.shopActive
                        : isUnlocked
                          ? dict.shopEquip
                          : t(language, 'shopUnlock', { cost: skin.cost })}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Hideout Upgrades */}
        {showUpgrades && (
          <div className="mt-2">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7ed6ce]">
              {dict.shopUpgradesTitle}
            </div>
            <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {HIDEOUT_UPGRADES.map((upg) => {
                const loc = getUpgradeLocale(upg.id);
                const owned = upgrades.includes(upg.id);
                const canAfford = pearls >= upg.cost;

                return (
                  <div
                    key={upg.id}
                    className={`flex flex-col justify-between gap-1.5 p-2 rounded border ${
                      owned ? 'border-[#26e8d4]/60' : 'border-[#183d52]/80'
                    }`}
                    style={{ backgroundColor: 'rgba(4, 18, 29, 0.88)' }}
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#ebfffe] leading-tight">
                        {loc.name}
                      </div>
                      <div className="text-[11px] text-[#89bcc9] mt-0.5 leading-tight line-clamp-2">
                        {loc.desc}
                      </div>
                    </div>

                    <button
                      type="button"
                      data-testid={`shop-upgrade-${upg.id}`}
                      disabled={owned || !canAfford}
                      onClick={() => onBuyUpgrade(upg.id)}
                      className={`w-full px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                        owned
                          ? 'bg-[#174d5e] text-[#99fff4] cursor-default'
                          : canAfford
                            ? 'bg-[#e8cf8e] text-[#1c1607] hover:bg-[#f5df9f] cursor-pointer'
                            : 'bg-[#102b3b] text-[#5e8594] cursor-not-allowed'
                      }`}
                    >
                      {owned
                        ? dict.shopOwned
                        : t(language, 'shopBuy', { cost: upg.cost })}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-2.5 flex items-center justify-between gap-2">
          {totalPages > 1 ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                data-testid="shop-back-btn"
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
                data-testid="shop-next-btn"
                disabled={safePage >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                className="px-3 py-1 rounded text-xs font-semibold text-[#031d29] bg-[#5ef7e6] hover:bg-[#99fff4] disabled:opacity-40 cursor-pointer disabled:cursor-default"
              >
                {dict.btnNext} →
              </button>
            </div>
          ) : (
            <div />
          )}

          <button
            type="button"
            data-testid="shop-close-btn"
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
