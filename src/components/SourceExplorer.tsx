import { literarySources } from '../data/literarySources';
import { sinners } from '../data/sinners';
import type { LiterarySource } from '../types';
import { X, ExternalLink, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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

const GAME_COLORS: Record<string, string> = {
  limbus: '#cba6f7',
  ruina: '#89b4fa',
  lobotomy: '#fab387',
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

export function SourceExplorer({ sourceId, open, onClose, onSinnerClick }: SourceExplorerProps) {
  const source = literarySources.find(s => s.id === sourceId);
  if (!source) return null;

  // Find all Sinners connected to this source
  const connected = sinners.filter(s =>
    s.literarySources.some(ref => ref.id === sourceId)
  ).map(s => ({
    sinner: s,
    ref: s.literarySources.find(ref => ref.id === sourceId)!,
  }));

  return (
    <Dialog open={open} onOpenChange={val => !val && onClose()}>
      <DialogContent className="sm:max-w-[520px] max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex-row items-start gap-3 space-y-0">
          <div className="rounded-lg bg-primary/10 p-2.5 ring-1 ring-primary/20">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 space-y-1">
            <DialogTitle className="text-lg leading-tight">{source.title}</DialogTitle>
            <p className="text-xs text-muted-foreground">
              {source.author}
              {source.year && `, ${source.year}`}
              {' · '}
              {source.language}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full border border-border/40 text-muted-foreground"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="mt-4 space-y-5">
          {/* Passage */}
          {source.passage && (
            <blockquote className="border-l-2 border-primary/30 pl-4 text-sm italic leading-relaxed text-foreground/90">
              "{source.passage}"
              {source.passageContext && (
                <p className="mt-1 text-xs not-italic text-muted-foreground">— {source.passageContext}</p>
              )}
            </blockquote>
          )}

          {/* Themes */}
          {source.themes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                Themes
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {source.themes.map(t => (
                  <Badge
                    key={t}
                    variant="secondary"
                    className="px-2 py-0.5 text-[11px] font-medium"
                  >
                    {THEME_LABELS[t] ?? t}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Connected Sinners */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
              Connected Sinners
            </h4>
            {connected.length > 0 ? (
              <div className="space-y-2">
                {connected.map(({ sinner, ref }) => (
                  <Card
                    key={sinner.id}
                    className="cursor-pointer border-border/40 bg-muted/20 transition-all hover:border-primary/30 hover:bg-muted/30"
                    onClick={() => { onSinnerClick(sinner.id); onClose(); }}
                  >
                    <CardContent className="flex items-center gap-3 p-3">
                      {/* Color dot by canonical game */}
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: GAME_COLORS[sinner.canonicalGame] }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{sinner.name}</p>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{ref.specificConnection}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`shrink-0 text-[9px] font-bold uppercase ${
                          ref.role === 'primary' ? 'border-edge-literary/40 bg-edge-literary/10 text-edge-literary' :
                          ref.role === 'secondary' ? 'border-edge-theme/40 bg-edge-theme/10 text-edge-theme' :
                          'border-edge-crossgame/40 bg-edge-crossgame/10 text-edge-crossgame'
                        }`}
                      >
                        {ref.role}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-xs italic text-muted-foreground">No Sinners connected to this source.</p>
            )}
          </div>

          {/* Wiki Link */}
          {source.wikiUrl && (
            <a
              href={source.wikiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary hover:underline"
            >
              Read more on Wikipedia <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
