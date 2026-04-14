import { useState } from 'react';
import type { Sinner, Game, Identity } from '../types';
import { literarySources } from '../data/literarySources';
import { identityImages } from '../data/identityImages';
import { identityDetailData } from '../data/identityDetailData';

interface LorePanelProps {
  sinner: Sinner | null;
  onClose: () => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const GAME_LABELS: Record<Game, string> = {
  lobotomy: 'Lobotomy Corporation',
  ruina: 'Library of Ruina',
  limbus: 'Limbus Company',
};

const THEME_LABELS: Record<string, string> = {
  guilt: 'Guilt',
  vengeance: 'Vengeance',
  decay: 'Decay',
  metamorphosis: 'Metamorphosis',
  absurdity: 'Absurdism',
  redemption: 'Redemption',
  futility: 'Futility',
  'identity-fragmentation': 'Identity Fragmentation',
  machinery: 'Machinery',
  nihilism: 'Nihilism',
  faith: 'Faith',
  family: 'Family',
};

const RANK_COLORS: Record<string, string> = {
  ZAYIN: '#3CB371',
  TETH:  '#1E90FF',
  HE:    '#FF6347',
  WAW:   '#8B0000',
  ALEPH: '#800080',
};

const RESISTANCE_COLORS: Record<string, string> = {
  Normal:  '#3CB371',
  Fatal:   '#e63946',
  'Ineff.': '#888',
  Resist:  '#f9c74f',
};

const TIER_COLORS: Record<string, string> = {
  dps:     '#f5c2e7',
  support: '#89b4fa',
  tank:    '#a6e3a1',
  status:  '#f9e2af',
};

const TIER_LABELS: Record<string, string> = {
  dps: 'DPS',
  support: 'SUPPORT',
  tank: 'TANK',
  status: 'STATUS',
};

// ── Identity Modal ────────────────────────────────────────────────────────────

function IdentityModal({ id, onClose }: { id: Identity; onClose: () => void }) {
  const detail = identityDetailData[id.id];
  const img = identityImages[id.id];

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="id-modal-overlay" onClick={handleOverlayClick}>
      <div className="id-modal" role="dialog" aria-modal="true">
        {/* Header */}
        <div className="id-modal__header">
          {img ? (
            <img src={img} alt={id.displayName} className="id-modal__portrait" />
          ) : (
            <div
              className="id-modal__portrait"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--text-d)',
              }}
            >
              {id.displayName.slice(0, 2)}
            </div>
          )}
          <div className="id-modal__title-group">
            <div className="id-modal__name">{id.displayName}</div>
            <div className="id-modal__game-tag">{GAME_LABELS[id.sourceGame]}</div>
          </div>
          <button className="id-modal__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="id-modal__body">
          {detail ? (
            <>
              {/* Tier + Attack Types */}
              <div className="id-modal__badges">
                <span
                  className="id-modal__badge id-modal__badge--tier"
                  style={{ color: TIER_COLORS[detail.tierCategory] ?? '#888', borderColor: TIER_COLORS[detail.tierCategory] ?? '#888' }}
                >
                  {TIER_LABELS[detail.tierCategory] ?? detail.tierCategory.toUpperCase()}
                </span>
                {detail.attackType.map((t) => (
                  <span key={t} className="id-modal__badge id-modal__badge--type">{t}</span>
                ))}
              </div>

              {/* Stats */}
              <div>
                <div className="id-modal__section-title">Stats</div>
                <div className="id-modal__stat-grid">
                  {(['HP', 'DEF', 'SPD'] as const).map((label) => {
                    const s30 = detail.stats[`${label.toLowerCase()}_30` as keyof typeof detail.stats];
                    const s1 = detail.stats[`${label.toLowerCase()}_1` as keyof typeof detail.stats];
                    return (
                      <div key={label} className="id-modal__stat-box">
                        <div className="id-modal__stat-label">{label}</div>
                        <div className="id-modal__stat-lv1">Lv1 {s1}</div>
                        <div className="id-modal__stat-lv30">Lv30 {s30}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resistances */}
              <div>
                <div className="id-modal__section-title">Resistances</div>
                <div className="id-modal__resistances">
                  {(['blunt', 'slash', 'pierce'] as const).map((type) => {
                    const val = detail.resistances[type];
                    return (
                      <div key={type} className="id-modal__resist">
                        <div className="id-modal__resist-type">{type}</div>
                        <div
                          className="id-modal__resist-val"
                          style={{ color: RESISTANCE_COLORS[val] ?? '#888' }}
                        >
                          {val}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Speciality */}
              {detail.speciality.length > 0 && (
                <div>
                  <div className="id-modal__section-title">Speciality</div>
                  <div className="id-modal__badges">
                    {detail.speciality.map((s) => (
                      <span key={s} className="id-modal__badge id-modal__badge--spec">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Affinity */}
              {detail.affinity.length > 0 && (
                <div>
                  <div className="id-modal__section-title">Affinities</div>
                  <div className="id-modal__badges">
                    {detail.affinity.map((a) => (
                      <span key={a} className="id-modal__badge id-modal__badge--aff">{a}</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="id-modal__no-data">No game data available for this identity.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Panel ────────────────────────────────────────────────────────────────

export function LorePanel({ sinner, onClose }: LorePanelProps) {
  const [activeIdentity, setActiveIdentity] = useState<Identity | null>(null);
  const isOpen = sinner !== null;

  return (
    <>
      <div
        className={`lore-panel ${isOpen ? 'lore-panel--open' : ''}`}
        aria-hidden={!isOpen}
      >
        {sinner && (
          <>
            {/* Header */}
            <div className="lore-panel__header">
              <div>
                <h2 className="lore-panel__name">{sinner.name}</h2>
                <p className="lore-panel__games">
                  {sinner.appearances.map((g) => GAME_LABELS[g]).join(' · ')}
                </p>
              </div>
              <button className="lore-panel__close" onClick={onClose} aria-label="Close">
                ✕
              </button>
            </div>

            {/* Lore Summary */}
            <div className="lore-panel__section">
              <p className="lore-panel__summary">{sinner.loreSummary}</p>
            </div>

            {/* Literary Connections */}
            <div className="lore-panel__section">
              <h3 className="lore-panel__section-title">Literary Sources</h3>
              {sinner.literarySources.map((ref) => {
                const source = literarySources.find((s) => s.id === ref.id);
                return (
                  <div key={ref.id} className="lore-panel__source">
                    <div className="lore-panel__source-header">
                      <span className="lore-panel__source-title">
                        {source?.title ?? ref.id}
                      </span>
                      <span className={`lore-panel__role-badge lore-panel__role-badge--${ref.role}`}>
                        {ref.role}
                      </span>
                    </div>
                    {source?.passage && (
                      <blockquote className="lore-panel__passage">
                        {source.passage}
                      </blockquote>
                    )}
                    {source?.author && (
                      <p className="lore-panel__passage-meta">
                        — {source.author}
                        {source.year ? `, ${source.year}` : ''}
                        {source.language ? ` [${source.language}]` : ''}
                      </p>
                    )}
                    <p className="lore-panel__connection">{ref.specificConnection}</p>
                    {source?.wikiUrl && (
                      <a
                        href={source.wikiUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="lore-panel__wiki-link"
                      >
                        Wikipedia ↗
                      </a>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Literary Notes */}
            <div className="lore-panel__section">
              <h3 className="lore-panel__section-title">Literary Analysis</h3>
              <p className="lore-panel__notes">{sinner.literaryConnectionNotes}</p>
            </div>

            {/* Themes */}
            <div className="lore-panel__section">
              <h3 className="lore-panel__section-title">Themes</h3>
              <div className="lore-panel__themes">
                {sinner.themes.map((t) => (
                  <span key={t} className="lore-panel__theme-tag">
                    {THEME_LABELS[t] ?? t}
                  </span>
                ))}
              </div>
            </div>

            {/* Identities grid */}
            <div className="lore-panel__section">
              <h3 className="lore-panel__section-title">
                Identities
                <span className="lore-panel__count">{sinner.identities.length}</span>
              </h3>
              {sinner.identities.length > 0 ? (
                <div className="lore-panel__identity-grid">
                  {sinner.identities.map((id) => {
                    const img = identityImages[id.id];
                    return (
                      <div
                        key={id.id}
                        className={`lore-panel__identity-card lore-panel__identity-card--${id.sourceGame}`}
                        onClick={() => setActiveIdentity(id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && setActiveIdentity(id)}
                      >
                        {img ? (
                          <img src={img} alt={id.displayName} className="lore-panel__identity-img" />
                        ) : (
                          <div className="lore-panel__identity-placeholder">
                            {id.displayName.slice(0, 2)}
                          </div>
                        )}
                        <span className="lore-panel__identity-name">{id.displayName}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="lore-panel__empty">No identities (manager role)</p>
              )}
            </div>

            {/* EGOs */}
            <div className="lore-panel__section">
              <h3 className="lore-panel__section-title">
                EGOs
                <span className="lore-panel__count">{sinner.egos.length}</span>
              </h3>
              {sinner.egos.length > 0 ? (
                <div className="lore-panel__ego-list">
                  {sinner.egos.map((ego) => (
                    <div key={ego.id} className="lore-panel__ego-item">
                      <span
                        className="lore-panel__ego-dot"
                        style={{ backgroundColor: RANK_COLORS[ego.rank] ?? '#888' }}
                      />
                      <span className="lore-panel__ego-name">{ego.displayName}</span>
                      <span className="lore-panel__ego-rank">{ego.rank}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="lore-panel__empty">No EGOs</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Identity Detail Modal */}
      {activeIdentity && (
        <IdentityModal
          id={activeIdentity}
          onClose={() => setActiveIdentity(null)}
        />
      )}
    </>
  );
}
