import type { Sinner, Game } from '../types';
import { literarySources } from '../data/literarySources';
import { identityImages } from '../data/identityImages';

interface LorePanelProps {
  sinner: Sinner | null;
  onClose: () => void;
}

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

const RANK_LABELS: Record<string, string> = {
  ZAYIN: 'ZAYIN',
  TETH:  'TETH',
  HE:    'HE',
  WAW:   'WAW',
  ALEPH: 'ALEPH',
};

export function LorePanel({ sinner, onClose }: LorePanelProps) {
  const isOpen = sinner !== null;

  return (
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
              <span className="lore-panel__count">
                {sinner.identities.length}
              </span>
            </h3>
            {sinner.identities.length > 0 ? (
              <div className="lore-panel__identity-grid">
                {sinner.identities.map((id) => {
                  const img = identityImages[id.id];
                  return (
                    <div
                      key={id.id}
                      className={`lore-panel__identity-card lore-panel__identity-card--${id.sourceGame}`}
                      title={id.displayName}
                    >
                      {img ? (
                        <img
                          src={img}
                          alt={id.displayName}
                          className="lore-panel__identity-img"
                        />
                      ) : (
                        <div className="lore-panel__identity-placeholder">
                          {id.displayName.slice(0, 2)}
                        </div>
                      )}
                      <span className="lore-panel__identity-name">
                        {id.displayName}
                      </span>
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
                    <span className="lore-panel__ego-rank">
                      {RANK_LABELS[ego.rank] ?? ego.rank}
                    </span>
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
  );
}
