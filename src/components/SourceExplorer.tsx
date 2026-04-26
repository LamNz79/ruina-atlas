import { useNavigate } from 'react-router-dom';
import { literarySources } from '../data/literarySources';
import { sinners } from '../data/sinners';
import { X, ExternalLink, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SourceExplorerProps {
  sourceId: string;
  open: boolean;
  onClose: () => void;
  onSinnerClick: (sinnerId: string) => void;
}

// const GAME_COLORS: Record<string, string> = {
//   limbus: '#b8202f',  // Deep Crimson
//   ruina: '#a08a70',  // Warm Bronze
//   lobotomy: '#7a5c3a',  // Dark Bronze
// };

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

export function SourceExplorer({ sourceId, open, onClose, onSinnerClick }: SourceExplorerProps) {
  const source = literarySources.find(s => s.id === sourceId);
  const navigate = useNavigate();
  if (!open) return null;
  if (!source) {
    return (
      <Dialog open={open} onOpenChange={val => !val && onClose()}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Literary source unavailable</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This source id does not resolve to an entry in <code>literarySources.json</code>.
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  // Find all Sinners connected to this source
  const connected = sinners.filter(s =>
    s.literarySources.some(ref => ref.id === sourceId)
  ).map(s => ({
    sinner: s,
    ref: s.literarySources.find(ref => ref.id === sourceId)!,
  }));

  return (
    <Dialog open={open} onOpenChange={val => !val && onClose()}>
      <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden gap-0 glass-v3 border-bronze/30 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        <div className="flex h-full min-h-[550px] flex-col md:flex-row">
          {/* Left Stage: Cinematic Cover Art */}
          <div className="relative w-full md:w-[42%] bg-muted/40 flex flex-col items-center justify-center p-8 overflow-hidden border-b md:border-b-0 md:border-r border-bronze/20">
            {source.coverImage ? (
              <>
                <img
                  src={source.coverImage}
                  className="absolute inset-0 h-full w-full object-cover blur-3xl opacity-30 scale-125"
                  aria-hidden="true"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-black/20 opacity-60" />
                <div className="relative z-10 w-full aspect-[2/3] max-w-[280px] group">
                  {/* Frame Decorator */}
                  <div className="absolute -inset-1 border border-gold/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <img
                    src={source.coverImage}
                    alt={source.title}
                    className="h-full w-full object-cover shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-bronze/30 transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.6)]" />
                </div>

                {/* Book Metadata Overlay */}
                <div className="absolute bottom-6 left-6 right-6 z-20">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-gold/10 text-gold border-gold/20 text-[8px] uppercase tracking-[0.2em] px-2 rounded-none">Authentic Source</Badge>
                    <div className="h-px flex-1 bg-gold/10" />
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight leading-tight">{source.title}</h3>
                  <p className="text-[10px] text-gold/60 font-bold uppercase tracking-widest mt-1">First Published: {source.year || 'Unknown'}</p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 text-bronze/40">
                <BookOpen className="h-16 w-16 opacity-20" />
                <p className="text-[10px] uppercase tracking-widest font-bold">Visual Asset Redacted</p>
              </div>
            )}
          </div>

          {/* Right Stage: Data & Research */}
          <div className="flex-1 flex flex-col max-h-[85vh] md:max-h-[600px]">
            <div className="px-6 py-4 border-b border-bronze/10 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-bronze/10 border border-bronze/20">
                  <BookOpen className="h-4 w-4 text-bronze" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-bronze/60">Dossier Access</h4>
                  <p className="text-xs font-bold text-ivory/80">{source.author}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-bronze hover:bg-bronze/10"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scroll-bronze p-6 space-y-8">
              {/* Research Context (Research Notes) */}
              {source.historicalContext && (
                <div className="space-y-3">
                  <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/60 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-gold rounded-full animate-pulse" />
                    Research Continuity
                  </h5>
                  <div className="relative p-5 border border-bronze/20 bg-bronze/5">
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-gold" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-gold" />
                    <p className="text-sm font-medium italic leading-relaxed text-ivory/90 font-display">
                      "{source.historicalContext}"
                    </p>
                  </div>
                </div>
              )}

              {/* Passage Section */}
              {source.passage && (
                <div className="space-y-3">
                  <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-bronze/50">Core Excerpt</h5>
                  <blockquote className="text-lg leading-relaxed text-white font-display border-l-2 border-bronze/40 pl-6 py-1 italic">
                    "{source.passage}"
                  </blockquote>
                  {source.passageContext && (
                    <p className="text-xs text-muted-foreground ml-6">— {source.passageContext}</p>
                  )}
                </div>
              )}

              {/* Themes */}
              {source.themes.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-bronze/50">Thematic Resonance</h5>
                  <div className="flex flex-wrap gap-2">
                    {source.themes.map(t => (
                      <Badge
                        key={t}
                        className="bg-muted/50 text-ivory border-bronze/20 rounded-none px-3 py-1 text-[10px] font-bold uppercase tracking-widest hover:bg-bronze/20 transition-colors"
                      >
                        {THEME_LABELS[t] ?? t}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Connections */}
              <div className="space-y-3">
                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-bronze/50">Sinner Intersections</h5>
                {connected.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                    {connected.map(({ sinner, ref }) => (
                      <div
                        key={sinner.id}
                        className="group flex items-center gap-4 p-3 border border-border/40 bg-black/20 hover:border-gold/30 hover:bg-gold/5 transition-all cursor-pointer"
                        onClick={() => { onSinnerClick(sinner.id); onClose(); }}
                      >
                        <div className="h-8 w-8 flex items-center justify-center border border-bronze/20 font-bold text-xs text-bronze group-hover:text-gold group-hover:border-gold/40 transition-colors">
                          {sinner.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black uppercase tracking-widest text-ivory group-hover:text-gold transition-colors">{sinner.name}</p>
                          <p className="text-[10px] text-muted-foreground line-clamp-1">{ref.specificConnection}</p>
                        </div>
                        <div className="text-[8px] font-bold uppercase px-2 py-0.5 border border-bronze/30 text-bronze/60">
                          {ref.role}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs italic text-muted-foreground">No intersections detected.</p>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-bronze/10 flex items-center justify-between bg-black/40">
              {source.wikiUrl && (
                <a
                  href={source.wikiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-bronze hover:text-gold transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  External Archives
                </a>
              )}
              <Button
                variant="outline"
                className="rounded-none border-bronze/30 text-bronze hover:text-gold hover:border-gold/50 h-8 px-4 text-[10px] font-bold uppercase tracking-widest"
                onClick={() => {
                  onClose();
                  navigate(`/profile/source/${source.id}`);
                }}
              >
                Access Full Profile
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
