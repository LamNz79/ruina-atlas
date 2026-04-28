import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { ExternalLink, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cantos } from '../data/cantos';
import { getEgoImage } from '../data/ego';
import { identityDetailData } from '../data/identityDetailData';
import { identityImages } from '../data/identityImages';
import { literarySources } from '../data/literarySources';
import { useSound } from '../hooks/useSound';
import type { DantePower, Game, Identity, Sinner } from '../types';
import { SourceExplorer } from './SourceExplorer';

interface LorePanelProps {
  sinner: Sinner | null;
  onClose: () => void;
  isOpen: boolean;
  spoilerLevel: number;
  setSpoilerLevel: (level: number) => void;
  onLocateNode?: (nodeId: string) => void;
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
  TETH: '#1E90FF',
  HE: '#FF6347',
  WAW: '#8B0000',
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
  Normal: '#3CB371',
  Fatal: '#e63946',
  'Ineff.': '#888',
  Resist: '#f9c74f',
};

const TIER_COLORS: Record<string, string> = {
  dps: '#8a4a5a',    // Muted Crimson
  support: '#a08a70',    // Warm Bronze
  tank: '#7a5c3a',    // Dark Bronze
  status: '#f5c518',    // Electric Gold
};

const TIER_LABELS: Record<string, string> = {
  dps: 'DPS',
  support: 'SUPPORT',
  tank: 'TANK',
  status: 'STATUS',
};

// ── Identity Modal ────────────────────────────────────────────────────────────

function IdentityModal({ id, open, onClose, onLocateNode }: { id: Identity; open: boolean; onClose: () => void; onLocateNode?: (nodeId: string) => void }) {
  const detail = identityDetailData[id.id];
  const img = identityImages[id.id];

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[425px] overflow-hidden p-0 gap-0">
        <div className="relative h-48 w-full bg-muted/20 border-b border-border/40 overflow-hidden flex items-center justify-center">
          {img ? (
            <>
              {/* Cinematic Backdrop */}
              <img
                src={img}
                className="absolute inset-0 h-full w-full object-cover blur-2xl opacity-30 scale-110"
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

              {/* Main Art */}
              <img
                src={img}
                alt={id.displayName}
                className="relative h-full w-full object-contain p-4 z-10 drop-shadow-2xl"
              />
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 opacity-20">
              <Sparkles className="h-12 w-12" />
              <span className="text-[10px] font-black uppercase tracking-widest">No Physical Record</span>
            </div>
          )}

          <div className="absolute bottom-4 left-6 right-6 z-20">
            <h3 className="text-2xl font-black tracking-tighter text-white drop-shadow-md">{id.displayName}</h3>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/70 drop-shadow-md">{GAME_LABELS[id.sourceGame]}</span>
          </div>
        </div>

        <div className="p-6 flex flex-col gap-6">
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
                {id.wingOrGroup && (
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] font-bold uppercase tracking-wider border-[#f5c518]/40 bg-[#f5c518]/10 text-[#f5c518] ${onLocateNode ? 'cursor-pointer hover:bg-[#f5c518]/20 transition-colors' : ''}`}
                    onClick={() => {
                      if (onLocateNode && id.wingOrGroup) {
                        const formattedId = `wing-${id.wingOrGroup.toLowerCase().replace(/ /g, '-')}`;
                        onLocateNode(formattedId);
                        onClose(); // close the modal
                      }
                    }}
                  >
                    {id.wingOrGroup}
                  </Badge>
                )}
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

export function LorePanel({ sinner, onClose, isOpen, spoilerLevel, setSpoilerLevel, onLocateNode }: LorePanelProps) {
  const [activeIdentity, setActiveIdentity] = useState<Identity | null>(null);
  const [sourceExplorerId, setSourceExplorerId] = useState<string | null>(null);
  const { playTick, playClink } = useSound();
  const navigate = useNavigate();

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
        className={`absolute right-0 top-0 z-[45] h-full w-[400px] shadow-2xl transition-transform duration-350 ease-[cubic-bezier(0.4,0,0.2,1)] glass-v2 ${isOpen ? 'translate-x-0' : 'translate-x-full'
          } max-md:w-full`}
        aria-hidden={!isOpen}
      >
        {sinner && (
          <div className="flex h-full flex-col">
            {/* Header */}
            <header className="sticky top-0 z-10 flex items-start gap-3 border-b border-border bg-muted/40 p-5 backdrop-blur-md">
              <div className="min-w-0 flex-1 space-y-1">
                <h2 className="text-xl font-bold leading-tight tracking-tight text-foreground break-words">{sinner.name}</h2>
                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  {sinner.appearances.map((g) => GAME_LABELS[g]).join(' \u00B7 ')}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {/* Canto Slider UI replaces old Switch */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
                    onClick={() => navigate(`/profile/sinner/${sinner.id}`)}
                  >
                    <ExternalLink className="h-3 w-3" />
                    Full Dossier
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full border border-border/40 text-muted-foreground transition-all hover:bg-muted"
                    onClick={handleClose}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </header>

            {/* Scrollable Body */}
            <ScrollArea className="flex-1 px-5 py-6">
              <div className="space-y-8 pb-10">
                {/* Canto Intelligence Filter (Slider) */}
                {sinner.cantos && sinner.cantos.length > 0 && (
                  <section className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-4 shadow-inner">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                        <Sparkles className="h-3 w-3" />
                        Cognitohazard Filter
                      </h3>
                      <Badge variant="outline" className="h-5 font-mono text-[10px] border-primary/40 text-primary bg-background/50">
                        Canto {spoilerLevel}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">0</span>
                      <Slider
                        value={[spoilerLevel]}
                        max={10}
                        step={1}
                        onValueChange={(vals) => setSpoilerLevel(vals[0])}
                        className="flex-1"
                      />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">10</span>
                    </div>
                    <p className="text-[9px] italic text-muted-foreground/80 leading-tight">
                      Adjust the slider to reveal information only up to your current progression.
                    </p>
                  </section>
                )}

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
                              className={`text-[9px] font-bold uppercase tracking-wider ${ref.role === 'primary' ? 'border-edge-literary/40 bg-edge-literary/10 text-edge-literary' :
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
                      {spoilerLevel < 10 && (
                        <Badge variant="outline" className="h-4 px-1.5 text-[9px] font-mono text-muted-foreground border-muted-foreground/30">
                          Filtered
                        </Badge>
                      )}
                    </h3>
                    <div className="space-y-2">
                      {sinner.cantos
                        .filter(c => {
                          const meta = cantos.find((m: { id: string }) => m.id === c.id);
                          return (meta && meta.spoilerLevel <= spoilerLevel);
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
                      {sinner.cantos.some(c => {
                        const meta = cantos.find((m: { id: string }) => m.id === c.id);
                        return meta && meta.spoilerLevel > spoilerLevel;
                      }) && (
                          <p className="text-[10px] text-center italic text-muted-foreground/50 py-1">
                            Some appearances are hidden by the current spoiler filter.
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
                            className={`group cursor-pointer overflow-hidden border transition-all active:scale-[0.98] relative ${id.sourceGame === 'limbus' ? 'hover:border-edge-theme/50' :
                                id.sourceGame === 'lobotomy' ? 'hover:border-edge-literary/50' :
                                  'hover:border-edge-crossgame/50'
                              }`}
                            onClick={() => setActiveIdentity(id)}
                          >
                            <CardHeader className="p-0">
                              <div className="aspect-[4/3] bg-muted/20 flex items-center justify-center overflow-hidden relative">
                                {img ? (
                                  <>
                                    <img
                                      src={img}
                                      className="absolute inset-0 h-full w-full object-cover blur-xl opacity-20 scale-110"
                                      aria-hidden="true"
                                    />
                                    <img
                                      src={img}
                                      alt={id.displayName}
                                      className="relative h-full w-full object-contain p-1.5 transition-transform duration-500 group-hover:scale-110 z-10"
                                    />
                                  </>
                                ) : (
                                  <span className="text-xs font-bold text-muted-foreground/50">{id.displayName.slice(0, 2)}</span>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                              </div>
                            </CardHeader>
                            <CardContent className="p-1.5 text-center bg-card/40 relative z-20">
                              <p className="truncate text-[9px] font-black uppercase tracking-tight text-muted-foreground group-hover:text-foreground transition-colors">
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
                                className="group relative flex flex-col items-center gap-1.5 rounded-lg border border-border/40 bg-muted/10 p-2 transition-all hover:border-primary/40 hover:bg-muted/20 hover:shadow-lg overflow-hidden"
                                style={{
                                  '--ego-color': ego.colorTheme || '#888',
                                  boxShadow: `0 0 15px -10px ${ego.colorTheme}30`
                                } as any}
                              >
                                {/* Themed Glow */}
                                <div
                                  className="absolute -right-4 -top-4 h-12 w-12 rounded-full blur-2xl opacity-10 transition-opacity group-hover:opacity-30"
                                  style={{ backgroundColor: ego.colorTheme }}
                                />

                                {/* Image Container */}
                                {ego.egoId ? (
                                  <div
                                    className="relative mt-1 h-12 w-12 overflow-hidden rounded border border-border/20 bg-muted/20"
                                  >
                                    <img
                                      src={getEgoImage(ego.egoId)}
                                      className="absolute inset-0 h-full w-full object-cover blur-lg opacity-30 scale-125"
                                      aria-hidden="true"
                                    />
                                    <img
                                      src={getEgoImage(ego.egoId)}
                                      alt={ego.displayName}
                                      className="relative h-full w-full object-contain p-0.5 z-10 transition-transform group-hover:scale-110"
                                      loading="lazy"
                                      onError={(e) => {
                                        e.currentTarget.style.visibility = 'hidden';
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div
                                    className="mt-1 flex h-12 w-12 items-center justify-center rounded border border-border/50 bg-muted/20"
                                  >
                                    <div className="h-3 w-3 rounded-full animate-pulse" style={{ backgroundColor: ego.colorTheme ?? '#888' }} />
                                  </div>
                                )}
                                <span className="w-full truncate text-center text-[9px] font-black uppercase tracking-tight text-muted-foreground group-hover:text-foreground transition-colors relative z-10">
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

      {/* Modals */}
      {activeIdentity && (
        <IdentityModal
          id={activeIdentity}
          open={!!activeIdentity}
          onClose={() => setActiveIdentity(null)}
          onLocateNode={onLocateNode}
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
