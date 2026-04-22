import { Link } from 'react-router-dom';
import type { LiterarySource, Sinner } from '../../types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, ExternalLink, Users, Quote } from 'lucide-react';
import { Button } from '../ui/button';

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

      {/* 2. Connected Sinners Graph */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            Connected Sinners
          </h2>
          <Badge variant="outline" className="font-mono">{connectedSinners.length} Relationships</Badge>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {connectedSinners.map(({ sinner, role, specificConnection }) => (
            <Card key={sinner.id} className="group border-border/40 bg-card/60 transition-all hover:border-primary/40">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: GAME_COLORS[sinner.canonicalGame] }} />
                    <h4 className="font-bold">{sinner.name}</h4>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[9px] font-bold uppercase ${role === 'primary' ? 'border-edge-literary/40 bg-edge-literary/10 text-edge-literary' :
                      role === 'secondary' ? 'border-edge-theme/40 bg-edge-theme/10 text-edge-theme' :
                        'border-edge-crossgame/40 bg-edge-crossgame/10 text-edge-crossgame'
                      }`}
                  >
                    {role}
                  </Badge>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground min-h-[40px]">
                  {specificConnection}
                </p>
                <Button asChild variant="ghost" size="sm" className="w-full h-8 text-[10px] font-bold text-primary group-hover:bg-primary/5">
                  <Link to={`/profile/sinner/${sinner.id}`}>View Sinner Profile</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
          {connectedSinners.length === 0 && (
            <div className="col-span-full py-12 text-center rounded-xl border border-dashed border-border/60 text-muted-foreground italic">
              No Sinners have been connected to this literary work yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
