import { useState, useEffect } from 'react';
import type { Sinner, Game, Identity, DantePower } from '../types';
import { cantos } from '../data/cantos';
import { literarySources } from '../data/literarySources';
import { identityImages } from '../data/identityImages';
import { identityDetailData } from '../data/identityDetailData';
import { getEgoImage } from '../data/ego';
import { X, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SourceExplorer } from './SourceExplorer';
import { useSound } from '../hooks/useSound';

interface LorePanelProps {
  sinner: Sinner | null;
  onClose: () => void;
  isOpen: boolean;
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

// Rarity tier order (weakest → strongest)
const RARITY_ORDER = ['ZAYIN', 'HE', 'TETH', 'WAW', 'ALEPH'] as const;
type Rarity = typeof RARITY_ORDER[number];

// Group EGOs by rarity tier
const groupEgosByRarity = (egos: Sinner['egos']) => {
  const groups: Partial<Record<Rarity, typeof egos>> = {};
  for (const ego of egos) {
    const tier = (ego.rank ?? 'ZAYIN') as Rarity;
    if (!groups[tier]) groups[tier] = [];
    groups[tier].push(ego);
  }
  return RARITY_ORDER.filter(t => groups[t]?.length).map(t => ({ tier: t, egos: groups[t] ?? [] }));
};

const RESISTANCE_COLORS: Record<string, string> = {
  Normal:  '#3CB371',
  Fatal:   '#e63946',
  'Ineff.': '#888',
  Resist:  '#f9c74f',
};

const TIER_COLORS: Record<string, string> = {
  dps:     '#8a4a5a',    // Muted Crimson
  support: '#a08a70',    // Warm Bronze
  tank:    '#7a5c3a',    // Dark Bronze
  status:  '#f5c518',    // Electric Gold
};

const TIER_LABELS: Record<string, string> = {
  dps: 'DPS',
  support: 'SUPPORT',
  tank: 'TANK',
  status: 'STATUS',
};

// ── Identity Modal ────────────────────────────────────────────────────────────

function IdentityModal({ id, open, onClose }: { id: Identity; open: boolean; onClose: () => void }) {
  const detail = identityDetailData[id.id];
  const img = identityImages[id.id];

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex-row items-center gap-4 space-y-0">
          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-muted/50">
            {img ? (
              <img src={img} alt={id.displayName} className="h-full w-full object-contain" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-bold uppercase text-muted-foreground">
                {id.displayName.slice(0, 2)}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <DialogTitle className="text-lg leading-tight">{id.displayName}</DialogTitle>
            <span className="mt-1 text-xs font-medium text-muted-foreground">{GAME_LABELS[id.sourceGame]}</span>
          </div>
        </DialogHeader>

        <div className="mt-4 flex flex-col gap-6">
          {detail ? (
            <>
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="font-bold tracking-wider"
                  style={{ color: TIER_COLORS[detail.tierCategory] ?? '#888', borderColor: TIER_COLORS[detail.tierCategory] ?? '#888' }}
                >
                  {TIER_LABELS[detail.tierCategory] ?? detail.tierCategory.toUpperCase()}
                </Badge>
                {detail.attackType.map((t) => (
                  <Badge key={t} variant="secondary" className="px-2 py-0 text-[10px] font-bold uppercase transition-all">
                    {t}
                  </Badge>
                ))}
              </div>

              {/* Stats */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Stats</h4>
                <div className="grid grid-cols-3 gap-3">
                  {(['HP', 'DEF', 'SPD'] as const).map((label) => {
                    const s30 = detail.stats[`${label.toLowerCase()}_30` as keyof typeof detail.stats];
                    const s1 = detail.stats[`${label.toLowerCase()}_1` as keyof typeof detail.stats];
                    return (
                      <div key={label} className="rounded-md border border-border/60 bg-muted/30 p-2 text-center">
                        <div className="text-[9px] font-bold text-muted-foreground">{label}</div>
                        <div className="mt-1 text-[10px] text-muted-foreground">Lv1 <span className="font-mono text-foreground">{s1}</span></div>
                        <div className="text-sm font-bold tabular-nums tracking-tight">Lv30 {s30}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resistances */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Resistances</h4>
                <div className="flex divide-x divide-border overflow-hidden rounded-md border border-border/60">
                  {(['blunt', 'slash', 'pierce'] as const).map((type) => {
                    const val = detail.resistances[type];
                    return (
                      <div key={type} className="flex-1 bg-muted/30 p-2 text-center">
                        <div className="text-[9px] font-bold uppercase text-muted-foreground">{type}</div>
                        <div
                          className="mt-1 text-xs font-bold"
                          style={{ color: RESISTANCE_COLORS[val] ?? '#888' }}
                        >
                          {val}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <p className="py-8 text-center text-sm italic text-muted-foreground">No game data available for this identity.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Panel ────────────────────────────────────────────────────────────────

export function LorePanel({ sinner, onClose, isOpen }: LorePanelProps) {
  const [activeIdentity, setActiveIdentity] = useState<Identity | null>(null);
  const [spoilerEnabled, setSpoilerEnabled] = useState(false);
  const [sourceExplorerId, setSourceExplorerId] = useState<string | null>(null);
  const { playTick, playClink } = useSound();

  // Play sound when panel opens
  useEffect(() => {
    if (isOpen) {
      playClink();
    }
  }, [isOpen, playClink]);

  const handleClose = () => {
    playTick({ pitch: 800 });
    onClose();
  };

  return (
    <>
      <div
        className={`absolute right-0 top-0 z-[45] h-full w-[400px] shadow-2xl transition-transform duration-350 ease-[cubic-bezier(0.4,0,0.2,1)] glass-v2 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } max-md:w-full`}
        aria-hidden={!isOpen}
      >
        {sinner && (
          <div className="flex h-full flex-col">
            {/* Header */}
            <header className="sticky top-0 z-10 flex items-start justify-between border-b border-border bg-muted/40 p-5 backdrop-blur-md">
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-foreground">{sinner.name}</h2>
                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  {sinner.appearances.map((g) => GAME_LABELS[g]).join(' \u00B7 ')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Spoiler toggle */}
                {sinner.cantos && sinner.cantos.length > 0 && (
                  <div className="flex items-center gap-1.5" title={spoilerEnabled ? 'Hide future cantos' : 'Show all cantos'}>
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {spoilerEnabled ? <Eye className="h-3.5 w-3.5 text-primary" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </span>
                    <Switch
                      checked={spoilerEnabled}
                      onCheckedChange={setSpoilerEnabled}
                      className="h-4 w-8 scale-75"
                    />
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full border border-border/40 text-muted-foreground transition-all hover:bg-muted"
                  onClick={handleClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </header>

            {/* Scrollable Body */}
            <ScrollArea className="flex-1 px-5 py-6">
              <div className="space-y-8 pb-10">
                {/* Lore Summary */}
                <section>
                  <p className="text-sm leading-relaxed text-muted-foreground">{sinner.loreSummary}</p>
                </section>

                {/* Literary Connections */}
                <section className="space-y-4">
                  <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Literary Sources
                  </h3>
                  <div className="space-y-5">
                    {sinner.literarySources.map((ref) => {
                      const source = literarySources.find((s) => s.id === ref.id);
                      return (
                        <div key={ref.id} className="space-y-3 group">
                          <header className="flex flex-wrap items-center gap-3">
                            <button
                              className="text-sm font-semibold text-foreground hover:text-primary transition-colors text-left"
                              onClick={() => {
                                playTick();
                                setSourceExplorerId(ref.id);
                              }}
                            >
                              {source?.title ?? ref.id}
                            </button>
                            <Badge
                              variant="outline"
                              className={`text-[9px] font-bold uppercase tracking-wider ${
                                ref.role === 'primary' ? 'border-edge-literary/40 bg-edge-literary/10 text-edge-literary' :
                                ref.role === 'secondary' ? 'border-edge-theme/40 bg-edge-theme/10 text-edge-theme' :
                                'border-edge-crossgame/40 bg-edge-crossgame/10 text-edge-crossgame'
                              }`}
                            >
                              {ref.role}
                            </Badge>
                          </header>

                          {source?.passage && (
                            <blockquote className="relative border-l-2 border-primary/30 pl-4 text-[13px] italic leading-relaxed text-foreground/90">
                              "{source.passage}"
                            </blockquote>
                          )}

                          {source?.author && (
                            <p className="text-[11px] font-medium text-muted-foreground/70">
                              \u2014 {source.author}{source.year ? `, ${source.year}` : ''}
                            </p>
                          )}

                          <p className="text-[13px] leading-relaxed text-muted-foreground line-clamp-3 hover:line-clamp-none cursor-default transition-all">
                            {ref.specificConnection}
                          </p>

                          {source?.wikiUrl && (
                            <a
                              href={source.wikiUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary hover:underline transition-all"
                            >
                              Library of information <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Literary Analysis */}
                <section className="space-y-3 rounded-lg border border-border/40 bg-muted/20 p-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
                    Depth Analysis
                  </h3>
                  <p className="text-[13px] italic leading-relaxed text-muted-foreground/90">
                    {sinner.literaryConnectionNotes}
                  </p>
                </section>

                {/* Themes */}
                <section className="space-y-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Themes</h3>
                  <div className="flex flex-wrap gap-2 text-foreground">
                    {sinner.themes.map((t) => (
                      <Badge key={t} variant="secondary" className="px-2 py-0.5 text-[11px] font-medium transition-transform active:scale-95">
                        {THEME_LABELS[t] ?? t}
                      </Badge>
                    ))}
                  </div>
                </section>

                {/* Canto Annotations */}
                {sinner.cantos && sinner.cantos.length > 0 && (
                  <section className="space-y-3">
                    <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      <span>Story Appearances</span>
                      {!spoilerEnabled && (
                        <Badge variant="outline" className="h-4 px-1.5 text-[9px] font-mono text-muted-foreground border-muted-foreground/30">
                          Canto 9+
                        </Badge>
                      )}
                    </h3>
                    <div className="space-y-2">
                      {sinner.cantos
                        .filter(c => {
                          const meta = cantos.find((m: { id: string }) => m.id === c.id);
                          return spoilerEnabled || (meta && meta.spoilerLevel <= 8);
                        })
                        .sort((a, b) => {
                          const metaA = cantos.find((m: { id: string }) => m.id === a.id);
                          const metaB = cantos.find((m: { id: string }) => m.id === b.id);
                          return (metaA?.spoilerLevel ?? 0) - (metaB?.spoilerLevel ?? 0);
                        })
                        .map(c => {
                          const meta = cantos.find((m: { id: string }) => m.id === c.id);
                          return (
                            <div key={c.id} className="flex items-start gap-2.5 rounded-md border border-border/40 bg-muted/20 p-2.5 transition-colors hover:border-border/60">
                              <div className="flex flex-col items-center justify-start pt-0.5 w-10 shrink-0">
                                <span className="text-[10px] font-mono font-bold text-muted-foreground/60">
                                  {typeof meta?.displayNumber === 'number'
                                    ? meta.displayNumber.toString().padStart(2, '0')
                                    : meta?.displayNumber ?? c.id}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0 overflow-hidden">
                                <div className="flex items-center gap-2 mb-0.5 min-w-0">
                                  <span className="text-[11px] font-semibold text-foreground block w-full truncate">{meta?.title ?? c.id}</span>
                                  {c.isMajor && (
                                    <Badge variant="outline" className="h-4 px-1.5 text-[8px] font-bold uppercase border-edge-literary/40 bg-edge-literary/10 text-edge-literary shrink-0">
                                      Focus
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-[11px] leading-relaxed text-muted-foreground">{c.summary}</p>
                              </div>
                            </div>
                          );
                        })}
                      {!spoilerEnabled && sinner.cantos.some(c => {
                        const meta = cantos.find((m: { id: string }) => m.id === c.id);
                        return meta && meta.spoilerLevel > 8;
                      }) && (
                        <p className="text-[10px] text-center italic text-muted-foreground/50 py-1">
                          Enable spoiler mode to see Canto 9+ appearances
                        </p>
                      )}
                    </div>
                  </section>
                )}

                {/* Identities grid */}
                <section className="space-y-4">
                  <h3 className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <span>Identities</span>
                    <Badge variant="outline" className="h-5 rounded-full bg-muted/50 px-2 font-mono text-[9px]">
                      {sinner.identities.length}
                    </Badge>
                  </h3>

                  {sinner.identities.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {sinner.identities.map((id) => {
                        const img = identityImages[id.id];
                        return (
                          <Card
                            key={id.id}
                            className={`group cursor-pointer overflow-hidden border transition-all active:scale-[0.98] ${
                              id.sourceGame === 'limbus' ? 'hover:border-edge-theme/50' :
                              id.sourceGame === 'lobotomy' ? 'hover:border-edge-literary/50' :
                              'hover:border-edge-crossgame/50'
                            }`}
                            onClick={() => setActiveIdentity(id)}
                          >
                            <CardHeader className="p-0">
                              <div className="aspect-square bg-muted/40 flex items-center justify-center overflow-hidden">
                                {img ? (
                                  <img
                                    src={img}
                                    alt={id.displayName}
                                    className="h-full w-full object-contain p-1 transition-transform group-hover:scale-105"
                                  />
                                ) : (
                                  <span className="text-xs font-bold text-muted-foreground/50">{id.displayName.slice(0, 2)}</span>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="p-2 text-center">
                              <p className="truncate text-[9px] font-bold leading-none text-muted-foreground group-hover:text-foreground transition-colors">
                                {id.displayName}
                              </p>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs italic text-muted-foreground/60 p-4 border border-dashed rounded-lg text-center">No specialized identities recorded</p>
                  )}
                </section>

                {/* EGOs grouped by rarity */}
                <section className="space-y-4">
                  <h3 className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <span>EGO Arsenal</span>
                    <Badge variant="outline" className="h-5 rounded-full bg-muted/50 px-2 font-mono text-[9px]">
                      {sinner.egos.length}
                    </Badge>
                  </h3>
                  {sinner.egos.length > 0 ? (
                    <div className="space-y-4">
                      {groupEgosByRarity(sinner.egos).map(({ tier, egos }) => (
                        <div key={tier} className="space-y-2">
                          {/* Rarity group header */}
                          <div className="flex items-center gap-2">
                            <span
                              className="text-[9px] font-black uppercase tracking-widest"
                              style={{ color: RANK_COLORS[tier] ?? '#888' }}
                            >
                              {tier}
                            </span>
                            <div className="h-px flex-1 bg-border/30" />
                            <span className="text-[9px] font-mono text-muted-foreground/50">{egos.length}</span>
                          </div>
                          {/* EGO grid */}
                          <div className="grid grid-cols-3 gap-2">
                            {egos.map((ego) => (
                              <div
                                key={ego.id}
                                className="group relative flex flex-col items-center gap-1.5 rounded-lg border border-border/40 bg-muted/15 p-2.5 transition-all hover:border-border/80 hover:bg-muted/25"
                              >
                                {/* Rarity badge top-left */}
                                <span
                                  className="absolute left-1.5 top-1.5 text-[8px] font-black uppercase tracking-wider"
                                  style={{ color: RANK_COLORS[ego.rank] ?? '#888', opacity: 0.7 }}
                                >
                                  {ego.rank}
                                </span>
                                {/* Image */}
                                {ego.egoId ? (
                                  <div
                                    className="mt-2 h-14 w-14 overflow-hidden rounded border border-border/50"
                                    style={{ backgroundColor: (ego.colorTheme ?? '#888') + '25', borderColor: (ego.colorTheme ?? '#888') + '50' }}
                                  >
                                    <img
                                      src={getEgoImage(ego.egoId)}
                                      alt={ego.displayName}
                                      className="h-full w-full object-contain"
                                      loading="lazy"
                                      onError={(e) => {
                                        e.currentTarget.style.visibility = 'hidden';
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div
                                    className="mt-2 flex h-14 w-14 items-center justify-center rounded border border-border/50"
                                    style={{ backgroundColor: (ego.colorTheme ?? '#888') + '20', borderColor: (ego.colorTheme ?? '#888') + '40' }}
                                  >
                                    <div className="h-4 w-4 rounded-full" style={{ backgroundColor: ego.colorTheme ?? '#888' }} />
                                  </div>
                                )}
                                <span className="mt-0.5 w-full truncate text-center text-[10px] font-semibold leading-tight text-foreground">
                                  {ego.displayName}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs italic text-muted-foreground/60">No EGO manifestations listed</p>
                  )}
                </section>

                {/* Powers (Dante only) */}
                {sinner.powers && sinner.powers.length > 0 && (
                  <section className="space-y-3">
                    <h3 className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      <span>Abilities</span>
                      <Badge variant="outline" className="h-5 rounded-full bg-muted/50 px-2 font-mono text-[9px]">
                        {sinner.powers.length}
                      </Badge>
                    </h3>
                    <div className="space-y-2">
                      {sinner.powers.map((power: DantePower) => (
                        <div
                          key={power.name}
                          className="rounded-md border border-border/40 bg-muted/20 p-2.5"
                        >
                          <p className="text-[11px] font-semibold text-foreground leading-tight mb-1">{power.name}</p>
                          <p className="text-[10px] leading-relaxed text-muted-foreground">{power.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Identity Detail Modal */}
      {activeIdentity && (
        <IdentityModal
          id={activeIdentity}
          open={!!activeIdentity}
          onClose={() => setActiveIdentity(null)}
        />
      )}

      {/* Literary Source Explorer Modal */}
      <SourceExplorer
        sourceId={sourceExplorerId ?? ''}
        open={!!sourceExplorerId}
        onClose={() => setSourceExplorerId(null)}
        onSinnerClick={(_id) => {
          // handled by parent App — emit upward via callback if needed
        }}
      />
    </>
  );
}
