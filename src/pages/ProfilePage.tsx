import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { sinners } from '../data/sinners';
import { literarySources } from '../data/literarySources';
import crossGameEntities from '../data/crossGameEntities.json';
import { identityImages } from '../data/identityImages';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  LayoutGrid
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import type { Sinner, LiterarySource, CrossGameEntity } from '../types';

// Profile Modules
import SinnerModule from '../components/profile/SinnerModule';
import SourceModule from '../components/profile/SourceModule';
import EntityModule from '../components/profile/EntityModule';
import { Badge } from '@/components/ui/badge';

export default function ProfilePage() {
  const { category, id } = useParams<{ category: string; id: string }>();
  const navigate = useNavigate();
  const [spoilerEnabled, setSpoilerEnabled] = useState(false);

  // 1. Data Fetching & Navigation Logic
  const { entity, prevId, nextId, currentIndex, totalCount } = useMemo(() => {
    let list: any[] = [];
    let currentIdx = -1;

    switch (category) {
      case 'sinner':
        list = sinners;
        break;
      case 'source':
        list = literarySources;
        break;
      case 'entity':
        list = crossGameEntities.entities;
        break;
    }

    currentIdx = list.findIndex((item) => item.id === id);
    const item = list[currentIdx];

    return {
      entity: item,
      prevId: list[currentIdx - 1]?.id,
      nextId: list[currentIdx + 1]?.id,
      currentIndex: currentIdx,
      totalCount: list.length
    };
  }, [category, id]);

  // 2. Connected Data Fetching
  const connectedSinners = useMemo(() => {
    if (!entity || category === 'sinner') return [];

    if (category === 'source') {
      return sinners
        .filter((s) => s.literarySources.some((ref) => ref.id === id))
        .map((s) => ({
          sinner: s,
          ref: s.literarySources.find((ref) => ref.id === id)!,
        }))
        .map(({ sinner, ref }) => ({
          sinner,
          role: ref.role,
          specificConnection: ref.specificConnection,
        }));
    }

    if (category === 'entity') {
      const ent = entity as CrossGameEntity;
      return ent.relatedSinnerIds
        ? sinners.filter((s) => ent.relatedSinnerIds!.includes(s.id))
        : [];
    }

    return [];
  }, [entity, category, id]);

  if (!entity) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground">
        <h1 className="text-2xl font-bold italic opacity-50">Dossier not found in archives</h1>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/">Return to Atlas</Link>
        </Button>
      </div>
    );
  }

  const name = (entity as any).name || (entity as any).title;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      {/* Dynamic starfield or background effect could go here */}
      <div className="fixed inset-0 pointer-events-none opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(184,32,47,0.05),transparent_50%)]" />
      </div>

      <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-border/40 bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="h-8 gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground group"
          >
            <LayoutGrid className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
            Atlas
          </Button>
          <span className="h-4 w-px bg-border/40" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">{category}</span>
            <span className="h-3 w-[1px] bg-border/50" />
            <h1 className="text-xs font-bold tracking-tight truncate max-w-[120px] sm:max-w-none">{name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Global Utils */}
          {category === 'sinner' && (
            <div className="flex items-center gap-2 px-3 py-1 bg-muted/30 rounded-full border border-border/40">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Spoilers</span>
              <Switch
                checked={spoilerEnabled}
                onCheckedChange={setSpoilerEnabled}
                className="h-4 w-8 scale-75"
              />
              {spoilerEnabled ? <Eye className="h-3.5 w-3.5 text-primary" /> : <EyeOff className="h-3.5 w-3.5 opacity-50" />}
            </div>
          )}

          {/* Navigation */}
          <div className="hidden sm:flex items-center gap-1">
            <span className="text-[10px] font-mono text-muted-foreground mr-2">
              {currentIndex + 1} / {totalCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={!prevId}
              onClick={() => navigate(`/profile/${category}/${prevId}`)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={!nextId}
              onClick={() => navigate(`/profile/${category}/${nextId}`)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl py-12 px-6 relative z-10">
        <div className="flex flex-col gap-20">

          {/* Universal Hero Section */}
          <section className="flex flex-col md:flex-row gap-12 items-start animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-full md:w-1/3 aspect-[4/5] relative group">
              <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-3xl group-hover:bg-primary/20 transition-colors" />
              <div className="relative h-full w-full bg-card/20 border border-border/40 rounded-2xl overflow-hidden flex items-center justify-center backdrop-blur-xl">
                {/* Hero Image Logic */}
                {category === 'sinner' ? (
                  <>
                    {/* Cinematic Backdrop */}
                    <img
                      src={id === 'dante' ? '/assets/identities/dante.jpg' : identityImages[(entity as Sinner).identities.find(id => id.id.endsWith('01'))?.id || ''] || '/favicon.svg'}
                      className="absolute inset-0 h-full w-full object-cover blur-3xl opacity-40 saturate-150 scale-110"
                      aria-hidden="true"
                      onError={(e) => { (e.currentTarget as any).style.display = 'none'; }}
                    />
                    
                    {/* Focused Identity Art */}
                    <img
                      src={id === 'dante' ? '/assets/identities/dante.jpg' : identityImages[(entity as Sinner).identities.find(id => id.id.endsWith('01'))?.id || ''] || '/favicon.svg'}
                      alt={name}
                      className="relative h-full w-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10 p-4 transition-transform duration-500 group-hover:scale-[1.02]"
                      onError={(e) => { e.currentTarget.src = '/favicon.svg'; }}
                    />
                  </>
                ) : category === 'source' ? (
                  <div className="flex flex-col items-center gap-4 text-primary">
                    <LayoutGrid className="h-20 w-20 opacity-20" />
                    <span className="text-4xl font-serif italic border-b border-primary/20 pb-2">" "</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4" style={{ color: (entity as any).type === 'wing' ? '#a08a70' : '#8a4a5a' }}>
                    {(entity as any).icon ? (
                      <img src={(entity as any).icon} className="h-24 w-24 object-contain brightness-125" alt={name} />
                    ) : (
                      <ArrowLeft className="h-20 w-20 opacity-20 rotate-45" />
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-6 pt-4">
              <div className="space-y-2">
                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-[0.2em] border-primary/30 text-primary px-3 py-1">
                  {category} Dossier
                </Badge>
                <h1 className="text-6xl font-black tracking-tighter leading-none">
                  {name}
                </h1>
                {category === 'sinner' && (
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                    {(entity as Sinner).appearances.join(' \u00B7 ')}
                  </p>
                )}
              </div>

              <p className="text-xl leading-relaxed text-muted-foreground/90 max-w-3xl font-medium">
                {(entity as any).loreSummary || (entity as any).passage || "Confidential profile data restricted to high-ranking administrators."}
              </p>

              {category === 'sinner' && (entity as Sinner).literaryConnectionNotes && (
                <div className="p-4 bg-muted/20 border-l-4 border-primary/40 rounded-r-xl italic text-sm text-muted-foreground">
                  {(entity as Sinner).literaryConnectionNotes}
                </div>
              )}
            </div>
          </section>

          {/* Module Rendering */}
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            {category === 'sinner' && (
              <SinnerModule sinner={entity as Sinner} spoilerEnabled={spoilerEnabled} />
            )}
            {category === 'source' && (
              <SourceModule source={entity as LiterarySource} connectedSinners={connectedSinners as any} />
            )}
            {category === 'entity' && (
              <EntityModule entity={entity as CrossGameEntity} connectedSinners={connectedSinners as Sinner[]} />
            )}
          </div>
        </div>
      </main>

      {/* Footer Navigation (Mobile) */}
      <footer className="sm:hidden sticky bottom-0 z-50 flex items-center justify-between border-t border-border/40 bg-background/95 px-6 py-3 backdrop-blur">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-10 gap-2 border-border/20"
          disabled={!prevId}
          onClick={() => navigate(`/profile/${category}/${prevId}`)}
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>
        <div className="w-8" />
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-10 gap-2 border-border/20"
          disabled={!nextId}
          onClick={() => navigate(`/profile/${category}/${nextId}`)}
        >
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </footer>
    </div>
  );
}
