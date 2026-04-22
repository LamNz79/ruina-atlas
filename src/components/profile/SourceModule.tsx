import { Link } from 'react-router-dom';
import type { LiterarySource, Sinner } from '../../types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, ExternalLink, Users, Quote } from 'lucide-react';
import { Button } from '../ui/button';
import { identityImages } from '@/data/identityImages';
import { EntityCard } from './EntityCard';

interface SourceModuleProps {
  source: LiterarySource;
  connectedSinners: {
    sinner: Sinner;
    role: string;
    specificConnection: string;
  }[];
}

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

export default function SourceModule({ source, connectedSinners }: SourceModuleProps) {
  return (
    <div className="space-y-16">
      {/* 1. Literary Passage & Context */}
      <section className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col gap-4 p-8 rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm relative overflow-hidden">
            <Quote className="absolute -top-4 -left-4 h-24 w-24 text-primary/5 -rotate-12" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Signature Passage</h3>
            {source.passage ? (
              <blockquote className="text-2xl font-serif italic leading-relaxed text-foreground/90">
                "{source.passage}"
              </blockquote>
            ) : (
              <p className="text-muted-foreground italic">No iconic passage recorded for this work.</p>
            )}
            {source.passageContext && (
              <p className="text-sm font-medium text-muted-foreground border-l-2 border-primary/20 pl-4">— {source.passageContext}</p>
            )}
          </div>

          {/* Research Notes Section */}
          {source.historicalContext && (
            <div className="flex flex-col gap-4 p-8 rounded-2xl border border-bronze/30 bg-bronze/5 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-bronze/40 group-hover:border-gold transition-colors" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-bronze/40 group-hover:border-gold transition-colors" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-bronze/70 flex items-center gap-2">
                <div className="h-1.5 w-1.5 bg-bronze rounded-full animate-pulse" />
                Archive Continuity & Research Notes
              </h3>
              <p className="text-sm font-medium italic leading-relaxed text-muted-foreground/90 font-display">
                "{source.historicalContext}"
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Work Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Author</span>
                <span className="font-semibold">{source.author}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Published</span>
                <span className="font-semibold">{source.year ?? 'Unspecified'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Language</span>
                <span className="font-semibold">{source.language}</span>
              </div>
            </div>
            {source.wikiUrl && (
              <Button asChild variant="outline" size="sm" className="w-full h-9 gap-2 mt-2">
                <a href={source.wikiUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                  View on Wikipedia
                </a>
              </Button>
            )}
          </div>

          <div className="p-6 rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Themes</h3>
            <div className="flex flex-wrap gap-2 text-foreground">
              {source.themes.map((t) => (
                <Badge key={t} variant="secondary" className="px-2 py-0.5 text-[11px] font-medium transition-transform active:scale-95">
                  {THEME_LABELS[t] ?? t}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Bibliography of Connections */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-border/20 pb-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-black flex items-center gap-3 tracking-tight">
              <Users className="h-6 w-6 text-primary" />
              Manifestations & Bibliography
            </h2>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
              Sinners and entities influenced by this literary work
            </p>
          </div>
          <Badge variant="outline" className="font-mono px-3 py-1 bg-muted/20 border-primary/20">
            {connectedSinners.length} Records
          </Badge>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {connectedSinners.map(({ sinner, role, specificConnection }) => {
            // Get the primary identity image for the sinner to use as card art
            const primaryIdentityId = sinner.identities.find(id => id.id.endsWith('01'))?.id || '';
            const cardImg = identityImages[primaryIdentityId] || '';

            return (
              <EntityCard
                key={sinner.id}
                title={sinner.name}
                subtitle={`${role.toUpperCase()}`}
                imageUrl={cardImg}
                description={specificConnection}
                linkTo={`/profile/sinner/${sinner.id}`}
                aspectRatio="aspect-[3/2]"
                themeColor={GAME_COLORS[sinner.canonicalGame]}
                badges={[
                  { label: sinner.canonicalGame.toUpperCase(), variant: "outline", color: GAME_COLORS[sinner.canonicalGame] }
                ]}
              />
            );
          })}
          {connectedSinners.length === 0 && (
            <div className="col-span-full py-20 text-center rounded-2xl border-2 border-dashed border-border/20 bg-muted/5 flex flex-col items-center gap-4">
              <BookOpen className="h-12 w-12 text-muted-foreground/20" />
              <p className="text-sm italic text-muted-foreground/60 max-w-xs">
                The archives do not yet contain specific sinner connections for this work. Deep-dive synchronization pending.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
