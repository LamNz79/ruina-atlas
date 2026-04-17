import { useState, useRef, useEffect } from 'react';
import type { Game, Theme } from '../types';
import { THEMES } from '../types';
import { literarySources } from '../data/literarySources';
import { Filter, ChevronDown, ChevronUp, X, HelpCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeGuide } from './ThemeGuide';

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
  limbus: '#b8202f',    // Deep Crimson
  ruina:  '#a08a70',    // Warm Bronze
  lobotomy: '#7a5c3a',  // Dark Bronze
};

export function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const [open, setOpen] = useState(false);
  const [themeGuideOpen, setThemeGuideOpen] = useState(false);
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
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70">
                By Theme
              </h4>
              <button
                onClick={() => setThemeGuideOpen(true)}
                className="flex items-center gap-1 text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                title="Theme Guide"
              >
                <HelpCircle className="h-3 w-3" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {THEMES.map(theme => {
                const isActive = filters.themes.has(theme);
                return (
                  <button
                    key={theme}
                    onClick={() => toggleTheme(theme)}
                    className="px-2 py-0.5 text-[10px] font-semibold border transition-all active:scale-95"
                    style={{
                      borderColor: isActive ? '#f5c518' : 'rgba(200,193,180,0.18)',
                      backgroundColor: isActive ? 'rgba(245,197,24,0.12)' : 'transparent',
                      color: isActive ? '#f5c518' : '#8a847a',
                    }}
                  >
                    {theme.replace('-', ' ')}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-[1px] bg-border/50" />

          {/* By Literary Source */}
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70">
              By Literary Source
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {literarySources.map(source => {
                const isActive = filters.literarySources.has(source.id);
                return (
                  <button
                    key={source.id}
                    onClick={() => toggleSource(source.id)}
                    className="px-2 py-0.5 text-[10px] font-semibold border transition-all active:scale-95"
                    style={{
                      borderColor: isActive ? '#a08a70' : 'rgba(200,193,180,0.18)',
                      backgroundColor: isActive ? 'rgba(160,138,112,0.12)' : 'transparent',
                      color: isActive ? '#e8e0d5' : '#8a847a',
                    }}
                  >
                    {source.title}
                  </button>
                );
              })}
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

      <ThemeGuide open={themeGuideOpen} onClose={() => setThemeGuideOpen(false)} />
    </div>
  );
}
