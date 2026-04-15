import { useState, useRef, useEffect } from 'react';
import type { Game, Theme } from '../types';
import { THEMES } from '../types';
import { literarySources } from '../data/literarySources';
import { Filter, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface FilterState {
  games: Set<Game>;
  themes: Set<Theme>;
  literarySources: Set<string>;
}

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const GAME_LABELS: Record<Game, string> = {
  limbus: 'Limbus Company',
  ruina: 'Library of Ruina',
  lobotomy: 'Lobotomy Corporation',
};

const GAME_COLORS: Record<Game, string> = {
  limbus: '#cba6f7',
  ruina: '#89b4fa',
  lobotomy: '#fab387',
};

export function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const toggleGame = (game: Game) => {
    const next = new Set(filters.games);
    next.has(game) ? next.delete(game) : next.add(game);
    onFiltersChange({ ...filters, games: next });
  };

  const toggleTheme = (theme: Theme) => {
    const next = new Set(filters.themes);
    next.has(theme) ? next.delete(theme) : next.add(theme);
    onFiltersChange({ ...filters, themes: next });
  };

  const toggleSource = (id: string) => {
    const next = new Set(filters.literarySources);
    next.has(id) ? next.delete(id) : next.add(id);
    onFiltersChange({ ...filters, literarySources: next });
  };

  const clearAll = () => {
    onFiltersChange({
      games: new Set(['limbus', 'ruina', 'lobotomy']),
      themes: new Set(THEMES),
      literarySources: new Set(literarySources.map(s => s.id)),
    });
  };

  const activeCount =
    (filters.games.size < 3 ? 1 : 0) +
    (filters.themes.size < THEMES.length ? 1 : 0) +
    (filters.literarySources.size < literarySources.length ? 1 : 0);

  return (
    <div className="absolute left-4 top-4 z-40 w-60 select-none font-sans" ref={panelRef}>
      {/* Toggle */}
      <Button
        variant="secondary"
        size="sm"
        className={`w-full justify-between shadow-lg ring-1 ring-border/50 backdrop-blur-md transition-all ${
          open ? 'rounded-b-none bg-accent text-accent-foreground' : 'rounded-md'
        } ${activeCount > 0 ? 'border-primary/30' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2">
          <Filter className={`h-3.5 w-3.5 ${activeCount > 0 ? 'text-primary' : ''}`} />
          <span className="text-[11px] font-bold uppercase tracking-wider">Filters</span>
          {activeCount > 0 && (
            <Badge variant="outline" className="h-4 px-1 text-[9px] font-mono text-primary border-primary/40">
              {activeCount}
            </Badge>
          )}
        </div>
        {open
          ? <ChevronDown className="h-3.5 w-3.5 opacity-50" />
          : <ChevronUp className="h-3.5 w-3.5 opacity-50" />}
      </Button>

      {/* Panel */}
      <Card className={`overflow-hidden border-t-0 shadow-xl transition-all duration-300 ease-in-out ${
        open ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 border-none shadow-none'
      }`}>
        <CardContent className="space-y-5 pt-5">
          {/* By Game */}
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70">
              By Game
            </h4>
            <div className="space-y-1.5">
              {(Object.keys(GAME_LABELS) as Game[]).map(game => (
                <div key={game} className="flex items-center justify-between py-1 transition-colors hover:bg-muted/30 rounded px-1 -mx-1">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="h-2 w-2 rounded-full shadow-[0_0_8px_var(--tw-shadow-color)]"
                      style={{ backgroundColor: GAME_COLORS[game], '--tw-shadow-color': GAME_COLORS[game] } as React.CSSProperties}
                    />
                    <span className="text-[11px] font-medium text-foreground/90">{GAME_LABELS[game]}</span>
                  </div>
                  <Switch
                    checked={filters.games.has(game)}
                    onCheckedChange={() => toggleGame(game)}
                    className="scale-75"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="h-[1px] bg-border/50" />

          {/* By Theme */}
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70">
              By Theme
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {THEMES.map(theme => (
                <button
                  key={theme}
                  onClick={() => toggleTheme(theme)}
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-medium transition-all active:scale-95 ${
                    filters.themes.has(theme)
                      ? 'border-primary/40 bg-primary/10 text-primary'
                      : 'border-border/40 bg-muted/30 text-muted-foreground'
                  }`}
                >
                  {theme.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[1px] bg-border/50" />

          {/* By Literary Source */}
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70">
              By Literary Source
            </h4>
            <div className="max-h-36 space-y-1 overflow-y-auto pr-1">
              {literarySources.map(source => (
                <button
                  key={source.id}
                  onClick={() => toggleSource(source.id)}
                  className={`w-full text-left rounded px-2 py-1 text-[11px] transition-all active:scale-[0.98] ${
                    filters.literarySources.has(source.id)
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground'
                  }`}
                >
                  {source.title}
                </button>
              ))}
            </div>
          </div>

          {/* Clear */}
          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-7 w-full gap-1.5 text-[10px] text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
              Clear filters
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
