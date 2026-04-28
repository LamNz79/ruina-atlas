import type { Sinner } from '../../types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { identityImages } from '../../data/identityImages';
import { identityDetailData } from '../../data/identityDetailData';
import { getEgoImage } from '../../data/ego';
import { cantos } from '../../data/cantos';
import {
  Sword,
  Flame,
  Skull,
  Info,
  Clock
} from 'lucide-react';

interface SinnerModuleProps {
  sinner: Sinner;
  spoilerEnabled: boolean;
}

const RANK_COLORS: Record<string, string> = {
  ZAYIN: '#3CB371',
  TETH: '#1E90FF',
  HE: '#FF6347',
  WAW: '#8B0000',
  ALEPH: '#800080',
};

// const STAT_ICONS = {
//   hp: <Activity className="h-3 w-3" />,
//   def: <Shield className="h-3 w-3" />,
//   speed: <Zap className="h-3 w-3" />,
// };

const RARITY_ORDER = ['ZAYIN', 'TETH', 'HE', 'WAW', 'ALEPH'] as const;

export default function SinnerModule({ sinner, spoilerEnabled }: SinnerModuleProps) {

  // Helper to group EGOs
  const groupedEgos = RARITY_ORDER.map(rank => ({
    rank,
    items: sinner.egos.filter(e => e.rank === rank)
  })).filter(g => g.items.length > 0);

  return (
    <div className="space-y-16">
      {/* 1. Statistics & Overview */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-4 p-6 rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <Info className="h-3.5 w-3.5" />
            Character Stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Example base stats (could be averaged or LCB specific) */}
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Role</span>
              <p className="text-sm font-semibold">{sinner.id === 'dante' ? 'Manager' : 'Limbus Sinner'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Continuity</span>
              <p className="text-sm font-semibold">{sinner.crossGameContinuity ? 'High' : 'Local'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Identity Deck (Grid of Cards) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Sword className="h-6 w-6 text-primary" />
            Identity Arsenal
          </h2>
          <Badge variant="outline" className="font-mono">{sinner.identities.length} Versions</Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sinner.identities.map(id => {
            const detail = identityDetailData[id.id];
            const img = identityImages[id.id];

            return (
              <Card key={id.id} className="group overflow-hidden border-border/40 bg-card/60 transition-all hover:scale-[1.02] hover:shadow-2xl hover:border-primary/40 relative">
                {/* Image Container with Backdrop */}
                <div className="relative aspect-[16/9] overflow-hidden bg-muted/20 border-b border-border/40">
                  {img ? (
                    <>
                      {/* Blurred Backdrop */}
                      <img
                        src={img}
                        className="absolute inset-0 h-full w-full object-cover blur-2xl opacity-30 scale-110"
                        aria-hidden="true"
                      />
                      {/* Main Art */}
                      <img
                        src={img}
                        alt={id.displayName}
                        className="relative h-full w-full object-contain p-2 transition-all duration-500 group-hover:scale-105 group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                      />
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground italic text-xs">No Portrait</div>
                  )}

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                  {/* Identity Label */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between">
                    <p className="text-[10px] font-black uppercase tracking-tight text-white/90 truncate drop-shadow-md">
                      {id.displayName}
                    </p>
                    <Badge variant="outline" className="text-[8px] h-3.5 px-1 font-bold border-white/20 bg-black/20 text-white/70 backdrop-blur-sm shrink-0">
                      V.{id.id.slice(-2)}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-3 space-y-3 bg-gradient-to-b from-card/80 to-card/40">
                  <div className="flex flex-wrap gap-1">
                    {detail?.attackType.map(t => (
                      <Badge key={t} variant="secondary" className="text-[9px] font-bold h-4 px-1.5 bg-muted/50">{t}</Badge>
                    ))}
                    <Badge variant="outline" className="text-[9px] h-4 font-bold border-primary/20 text-primary/70">{id.wingOrGroup || 'Freelance'}</Badge>
                  </div>
                  {detail && (
                    <div className="grid grid-cols-3 gap-1 border-t border-border/20 pt-2.5">
                      {/* Stats mini grid */}
                      {[
                        { label: 'HP', key: 'hp_30', color: 'text-red-400/80' },
                        { label: 'DEF', key: 'def_30', color: 'text-blue-400/80' },
                        { label: 'SPD', key: 'speed_30', color: 'text-amber-400/80' }
                      ].map((s) => (
                        <div key={s.label} className="flex flex-col items-center">
                          <p className="text-[8px] text-muted-foreground font-black uppercase tracking-tighter opacity-60">{s.label}</p>
                          <p className={`text-[10px] font-mono font-bold ${s.color}`}>{(detail.stats as any)[s.key]}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 3. E.G.O manifestation */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Flame className="h-6 w-6 text-[#e63946]" />
            E.G.O Manifestations
          </h2>
        </div>

        <div className="space-y-8">
          {groupedEgos.map(({ rank, items }) => (
            <div key={rank} className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-black tracking-widest" style={{ color: RANK_COLORS[rank] }}>{rank}</span>
                <div className="h-px flex-1 bg-border/20" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {items.map(ego => (
                  <div
                    key={ego.id}
                    className="group relative flex flex-col gap-3 p-4 rounded-xl border border-border/40 bg-card/40 transition-all hover:bg-card/60 hover:border-primary/20 hover:shadow-[0_0_20px_-10px] overflow-hidden"
                    style={{
                      '--ego-color': ego.colorTheme || '#888',
                      boxShadow: `0 0 20px -12px ${ego.colorTheme}40`
                    } as any}
                  >
                    {/* Themed Glow Background */}
                    <div
                      className="absolute -right-8 -top-8 h-24 w-24 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40"
                      style={{ backgroundColor: ego.colorTheme }}
                    />

                    <div className="flex gap-4 items-center relative z-10">
                      <div className="h-16 w-16 shrink-0 rounded-lg overflow-hidden border border-border/20 bg-muted/10 relative">
                        {/* Cinematic Backdrop for Icon */}
                        <img
                          src={getEgoImage(ego.egoId ?? '')}
                          className="absolute inset-0 h-full w-full object-cover blur-xl opacity-40 scale-125"
                          aria-hidden="true"
                        />
                        {ego.egoId ? (
                          <img src={getEgoImage(ego.egoId)} alt={ego.displayName} className="relative h-full w-full object-contain p-1 z-10" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center relative z-10"><Skull className="h-6 w-6 text-muted-foreground/30" /></div>
                        )}
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{ego.displayName}</p>
                        <Badge variant="outline" className="text-[8px] w-fit h-4 font-black uppercase mt-1 border-border/40" style={{ color: ego.colorTheme, borderColor: `${ego.colorTheme}40` }}>
                          {rank}
                        </Badge>
                      </div>
                    </div>

                    <div className="relative z-10">
                      <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                        {ego.description}
                      </p>
                    </div>

                    {/* Progress Bar/Affinity Indicator */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-border/10">
                      <div className="h-full transition-all duration-700 group-hover:w-full" style={{ width: '15%', backgroundColor: ego.colorTheme }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Canto Narrative Timeline */}
      {sinner.cantos && sinner.cantos.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Clock className="h-6 w-6 text-muted-foreground" />
              Timeline of Appearances
            </h2>
          </div>

          <div className="relative space-y-4 border-l border-border/40 pl-6 ml-3">
            {sinner.cantos
              .filter(c => {
                const meta = cantos.find((m: any) => m.id === c.id);
                return spoilerEnabled || (meta && meta.spoilerLevel <= 8);
              })
              .map(c => {
                const meta = cantos.find((m: any) => m.id === c.id);
                return (
                  <div key={c.id} className="relative">
                    <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-background bg-primary" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono font-bold text-muted-foreground">
                          {typeof meta?.displayNumber === 'number' ? meta.displayNumber.toString().padStart(2, '0') : meta?.displayNumber ?? c.id}
                        </span>
                        <h4 className="text-sm font-bold">{meta?.title ?? c.id}</h4>
                        {c.isMajor && <Badge variant="secondary" className="text-[8px] h-3.5 px-1 uppercase font-black bg-primary/20 text-primary">Focus</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">{c.summary}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      )}
    </div>
  );
}
