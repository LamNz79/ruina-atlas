import type { CrossGameEntity, Sinner } from '../../types';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Hexagon,
  Star,
  ScrollText,
  Trophy,
  History,
  Fingerprint,
  Library
} from 'lucide-react';
import { EntityCard } from './EntityCard';
import { identityImages } from '../../data/identityImages';

interface EntityModuleProps {
  entity: CrossGameEntity;
  connectedSinners: Sinner[];
  relatedIdentities: { sinner: Sinner; identity: any }[];
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
  limbus: '#b8202f',
  ruina: '#a08a70',
  lobotomy: '#7a5c3a',
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

export default function EntityModule({ entity, connectedSinners, relatedIdentities }: EntityModuleProps) {
  const games = ['lobotomy', 'ruina', 'limbus'] as const;

  return (
    <div className="space-y-20">
      {/* 1. Entity Overview & Type Specifics */}
      <section className="grid gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* Detailed Lore Block */}
          <div className="p-8 rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              {TYPE_ICONS[entity.type]}
            </div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <ScrollText className="h-3.5 w-3.5" />
              Extended Dossier
            </h3>
            <p className="text-xl leading-relaxed text-foreground/90 font-medium">
              {entity.loreSummary}
            </p>
          </div>

          {/* Literary Origin (if any) */}
          {entity.literaryOrigin && (
            <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5 space-y-3 relative">
              <div className="absolute top-4 right-6 text-primary/10">
                <Library className="h-12 w-12" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/80 flex items-center gap-2">
                <Fingerprint className="h-3.5 w-3.5" />
                Literary Resonance
              </h3>
              <p className="text-sm italic text-foreground/90 leading-relaxed pr-12">{entity.literaryOrigin}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Classification</h3>

            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Type</span>
                <div className="flex items-center gap-2 text-sm font-bold text-primary">
                  {TYPE_ICONS[entity.type]}
                  {TYPE_LABELS[entity.type]}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Presence Timeline</span>
                <div className="flex items-center justify-between px-2">
                  {games.map(g => {
                    const active = entity.appearances.includes(g);
                    return (
                      <div key={g} className="flex flex-col items-center gap-2 group/game">
                        <div
                          className={`h-3 w-3 rounded-full transition-all duration-500 ${active ? 'scale-125 shadow-[0_0_10px]' : 'opacity-20 grayscale'}`}
                          style={{ backgroundColor: GAME_COLORS[g], shadowColor: GAME_COLORS[g] } as any}
                        />
                        <span className={`text-[8px] font-bold uppercase tracking-tighter transition-opacity ${active ? 'opacity-100' : 'opacity-20'}`}>
                          {g.slice(0, 3)}
                        </span>
                      </div>
                    );
                  })}
                  <div className="absolute left-6 right-6 h-[1px] bg-border/20 -z-10 mt-1.5" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Origin Game</span>
                <Badge variant="outline" className="w-fit text-[11px] font-black border-primary/20 bg-primary/5" style={{ color: GAME_COLORS[entity.canonicalGame] }}>
                  {entity.canonicalGame.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Core Themes</h3>
            <div className="flex flex-wrap gap-2 text-foreground">
              {entity.themes.map((t) => (
                <Badge key={t} variant="secondary" className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-primary/20">
                  {THEME_LABELS[t] ?? t}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Manifested Identities (M4 Polish Feature) */}
      {relatedIdentities.length > 0 && (
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          <div className="flex items-center justify-between border-b border-border/20 pb-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-black flex items-center gap-3 tracking-tight">
                <History className="h-6 w-6 text-primary" />
                Manifested Identities
              </h2>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                Derived souls across time and space originating from this entity
              </p>
            </div>
            <Badge variant="outline" className="font-mono text-primary border-primary/20 bg-primary/5 uppercase px-3 py-1">
              {relatedIdentities.length} Identities
            </Badge>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedIdentities.map(({ sinner, identity }) => (
              <EntityCard
                key={`${sinner.id}-${identity.id}`}
                title={identity.displayName}
                subtitle={sinner.name}
                imageUrl={identityImages[identity.id]}
                linkTo={`/profile/sinner/${sinner.id}`}
                aspectRatio="aspect-[4/5]"
                themeColor={GAME_COLORS[identity.sourceGame]}
                badges={[
                  { label: identity.sourceGame.toUpperCase(), color: GAME_COLORS[identity.sourceGame], variant: "outline" }
                ]}
              />
            ))}
          </div>
        </section>
      )}

      {/* 3. Affiliated Sinners */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-border/20 pb-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-black flex items-center gap-3 tracking-tight">
              <Trophy className="h-6 w-6 text-[#f5c518]" />
              Affiliated Sinners
            </h2>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
              Primary agents and contractors linked to this entity
            </p>
          </div>
          <Badge variant="outline" className="font-mono px-3 py-1">
            {connectedSinners.length} Known Links
          </Badge>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {connectedSinners.map(sinner => {
            const primaryId = sinner.identities.find(id => id.id.endsWith('01'))?.id || '';
            return (
              <EntityCard
                key={sinner.id}
                title={sinner.name}
                subtitle={`${sinner.canonicalGame.toUpperCase()}`}
                imageUrl={identityImages[primaryId]}
                linkTo={`/profile/sinner/${sinner.id}`}
                themeColor={GAME_COLORS[sinner.canonicalGame]}
                aspectRatio="aspect-square"
                className="rounded-2xl overflow-hidden"
              />
            );
          })}
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
