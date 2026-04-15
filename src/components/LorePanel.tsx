import { useState } from 'react';
import type { Sinner, Game, Identity } from '../types';
import { literarySources } from '../data/literarySources';
import { identityImages } from '../data/identityImages';
import { identityDetailData } from '../data/identityDetailData';
import { X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

  return (
    <>
      <div
        className={`absolute right-0 top-0 z-[45] h-full w-[400px] border-l border-border bg-card shadow-2xl transition-transform duration-350 ease-[cubic-bezier(0.4,0,0.2,1)] ${
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
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full border border-border/40 text-muted-foreground transition-all hover:bg-muted"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
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
                            <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                              {source?.title ?? ref.id}
                            </span>
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

                {/* EGOs */}
                <section className="space-y-4">
                  <h3 className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <span>EGO Arsenal</span>
                    <Badge variant="outline" className="h-5 rounded-full bg-muted/50 px-2 font-mono text-[9px]">
                      {sinner.egos.length}
                    </Badge>
                  </h3>
                  {sinner.egos.length > 0 ? (
                    <div className="space-y-2">
                      {sinner.egos.map((ego) => (
                        <div key={ego.id} className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/30 p-2.5 transition-colors hover:border-border/80">
                          <div
                            className="h-2.5 w-2.5 shrink-0 rounded-full shadow-sm"
                            style={{ backgroundColor: RANK_COLORS[ego.rank] ?? '#888' }}
                          />
                          <span className="flex-1 truncate text-xs font-semibold">{ego.displayName}</span>
                          <span className="text-[10px] font-bold text-muted-foreground/60">{ego.rank}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs italic text-muted-foreground/60">No EGO manifestations listed</p>
                  )}
                </section>
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
    </>
  );
}
