import { Link } from 'react-router-dom';
import type { CrossGameEntity, Sinner } from '../../types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  Hexagon, 
  Star, 
  Info, 
  ScrollText,
  MapPin,
  Trophy
} from 'lucide-react';

interface EntityModuleProps {
  entity: CrossGameEntity;
  connectedSinners: Sinner[];
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  wing: <Hexagon className="h-4 w-4" />,
  abnormality: <Star className="h-4 w-4" />,
  character: <Users className="h-4 w-4" />,
};

const TYPE_LABELS: Record<string, string> = {
  wing: 'Wing of the City',
  abnormality: 'Abnormality',
  character: 'Key Personnel',
};

const GAME_COLORS: Record<string, string> = {
  limbus:    '#b8202f',
  ruina:     '#a08a70',
  lobotomy:  '#7a5c3a',
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

export default function EntityModule({ entity, connectedSinners }: EntityModuleProps) {
  return (
    <div className="space-y-16">
      {/* 1. Entity Overview & Type Specifics */}
      <section className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
           {/* Detailed Lore Block */}
           <div className="p-8 rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <ScrollText className="h-3.5 w-3.5" />
                Extended Dossier
              </h3>
              <p className="text-lg leading-relaxed text-foreground/90">
                {entity.loreSummary}
              </p>
           </div>

           {/* Literary Origin (if any) */}
           {entity.literaryOrigin && (
              <div className="p-6 rounded-xl border border-dashed border-primary/20 bg-primary/5 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/80">Literary Roots</h3>
                <p className="text-sm italic text-foreground/80 leading-relaxed">{entity.literaryOrigin}</p>
              </div>
           )}
        </div>

        <div className="space-y-6">
           <div className="p-6 rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Classification</h3>
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                   <span className="text-[10px] text-muted-foreground uppercase font-bold">Category</span>
                   <div className="flex items-center gap-2 text-sm font-semibold">
                      {TYPE_ICONS[entity.type]}
                      {TYPE_LABELS[entity.type]}
                   </div>
                </div>
                <div className="flex flex-col gap-1">
                   <span className="text-[10px] text-muted-foreground uppercase font-bold">Origin Game</span>
                   <Badge variant="outline" className="w-fit text-[11px]" style={{ borderColor: GAME_COLORS[entity.canonicalGame], color: GAME_COLORS[entity.canonicalGame] }}>
                     {entity.canonicalGame.toUpperCase()}
                   </Badge>
                </div>
                <div className="flex flex-col gap-1">
                   <span className="text-[10px] text-muted-foreground uppercase font-bold">Appearances</span>
                   <div className="flex flex-wrap gap-1.5 mt-1">
                      {entity.appearances.map(g => (
                        <div key={g} className="h-2 w-2 rounded-full" style={{ backgroundColor: GAME_COLORS[g] }} title={g} />
                      ))}
                   </div>
                </div>
              </div>
           </div>

           <div className="p-6 rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Associated Themes</h3>
              <div className="flex flex-wrap gap-2 text-foreground">
                {entity.themes.map((t) => (
                  <Badge key={t} variant="secondary" className="px-2 py-0.5 text-[11px] font-medium transition-transform active:scale-95">
                    {THEME_LABELS[t] ?? t}
                  </Badge>
                ))}
              </div>
           </div>
        </div>
      </section>

      {/* 2. Affiliated Sinners */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Trophy className="h-6 w-6 text-[#f5c518]" />
            Affiliated Sinners
          </h2>
          <Badge variant="outline" className="font-mono">{connectedSinners.length} Known Links</Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {connectedSinners.map(sinner => (
            <Link 
              key={sinner.id} 
              to={`/profile/sinner/${sinner.id}`}
              className="group flex flex-col items-center gap-4 p-6 rounded-xl border border-border/40 bg-card/40 transition-all hover:border-primary/40 hover:bg-muted/10 text-center"
            >
               <div 
                 className="h-12 w-12 rounded-full border-2 flex items-center justify-center bg-background group-hover:scale-110 transition-transform"
                 style={{ borderColor: GAME_COLORS[sinner.canonicalGame] }}
               >
                 <span className="text-xs font-bold font-mono">{sinner.name.slice(0, 2).toUpperCase()}</span>
               </div>
               <div className="space-y-1">
                 <h4 className="font-bold text-sm">{sinner.name}</h4>
                 <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{sinner.canonicalGame}</p>
               </div>
            </Link>
          ))}
          {connectedSinners.length === 0 && (
            <div className="col-span-full py-12 text-center rounded-xl border border-dashed border-border/60 text-muted-foreground italic">
              No specific Sinner affiliations are recorded for this entity.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
