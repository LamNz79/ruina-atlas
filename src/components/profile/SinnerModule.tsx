import type { Sinner, Identity, EGO, CantoAnnotation } from '../../types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { identityImages } from '../../data/identityImages';
import { identityDetailData } from '../../data/identityDetailData';
import { getEgoImage } from '../../data/ego';
import { cantos } from '../../data/cantos';
import { 
  Sword, 
  Shield, 
  Activity, 
  Flame, 
  Skull, 
  Zap, 
  Info,
  Clock
} from 'lucide-react';

interface SinnerModuleProps {
  sinner: Sinner;
  spoilerEnabled: boolean;
}

const RANK_COLORS: Record<string, string> = {
  ZAYIN: '#3CB371',
  TETH:  '#1E90FF',
  HE:    '#FF6347',
  WAW:   '#8B0000',
  ALEPH: '#800080',
};

const STAT_ICONS = {
  hp: <Activity className="h-3 w-3" />,
  def: <Shield className="h-3 w-3" />,
  speed: <Zap className="h-3 w-3" />,
};

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
              <Card key={id.id} className="group overflow-hidden border-border/40 bg-card/60 transition-all hover:scale-[1.02] hover:shadow-xl hover:border-primary/40">
                <div className="relative aspect-video overflow-hidden bg-muted/20">
                  {img ? (
                    <img src={img} alt={id.displayName} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground italic text-xs">No Portrait</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-xs font-black uppercase tracking-wider text-white truncate drop-shadow-md">
                      {id.displayName}
                    </p>
                  </div>
                </div>
                <CardContent className="p-4 space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {detail?.attackType.map(t => (
                      <Badge key={t} variant="secondary" className="text-[9px] font-bold h-4 px-1.5">{t}</Badge>
                    ))}
                    <Badge variant="outline" className="text-[9px] h-4 font-bold border-primary/20 text-primary/80">{id.wingOrGroup || 'Freelance'}</Badge>
                  </div>
                  {detail && (
                    <div className="grid grid-cols-3 gap-2 border-t border-border/40 pt-3">
                       {/* Stats mini grid */}
                       {['HP', 'DEF', 'SPD'].map((s, i) => (
                         <div key={s} className="text-center">
                            <p className="text-[8px] text-muted-foreground font-bold uppercase">{s}</p>
                            <p className="text-[10px] font-mono">{(detail.stats as any)[`${s.toLowerCase()}_30`]}</p>
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
                    className="flex gap-4 p-4 rounded-xl border border-border/40 bg-card/40 transition-all hover:bg-muted/20"
                    style={{ borderLeftColor: ego.colorTheme, borderLeftWidth: '4px' }}
                  >
                    <div className="h-16 w-16 shrink-0 rounded-lg overflow-hidden border border-border/20 bg-muted/10">
                       {ego.egoId ? (
                         <img src={getEgoImage(ego.egoId)} alt={ego.displayName} className="h-full w-full object-contain" />
                       ) : (
                         <div className="h-full w-full flex items-center justify-center"><Skull className="h-6 w-6 text-muted-foreground/30" /></div>
                       )}
                    </div>
                    <div className="flex flex-col justify-center min-w-0">
                      <p className="text-sm font-bold truncate">{ego.displayName}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1 leading-tight">{ego.description}</p>
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
