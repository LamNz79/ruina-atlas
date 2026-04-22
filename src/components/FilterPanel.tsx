import { useState, useRef, useEffect } from 'react';
import type { Game, Theme } from '../types';
import { THEMES, THEME_META } from '../types';
import { literarySources } from '../data/literarySources';
import { Filter, ChevronDown, ChevronUp, X, HelpCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeGuide } from './ThemeGuide';
import type { FilterState } from './LoreGraphConstants';

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
  ruina: '#a08a70',    // Warm Bronze
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



  const toggleTheme = (theme: Theme) => {
    const next = new Set(filters.themes);
    if (next.has(theme)) {
      next.delete(theme);
    }
    else { next.add(theme) }
    onFiltersChange({ ...filters, themes: next });
  };



  const clearAll = () => {
    onFiltersChange({
      themes: new Set(THEMES),
      showArchiveNodes: true,
      cantoLevel: 0,
    });
  };

  const activeCount =
    (filters.themes.size < THEMES.length ? 1 : 0) +
    (!filters.showArchiveNodes ? 1 : 0);

  return (
    <>
      {open && (
        <div
          className="absolute inset-0 z-30 bg-black/25 backdrop-blur-[1px] md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    <div
      className="absolute left-4 top-4 z-40 w-60 max-w-[calc(100vw-2rem)] select-none font-sans max-md:inset-x-3 max-md:top-auto max-md:bottom-3 max-md:w-auto"
      ref={panelRef}
    >
      {/* Toggle */}
      <Button
        variant="secondary"
        size="sm"
        className={`w-full justify-between shadow-lg ring-1 ring-border/50 backdrop-blur-md transition-all ${
          open ? 'rounded-b-none bg-accent text-accent-foreground max-md:rounded-b-md max-md:rounded-t-none' : 'rounded-md'
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
        open ? 'max-h-[min(70vh,640px)] opacity-100 max-md:max-h-[70dvh]' : 'max-h-0 opacity-0 border-none shadow-none'
        }`}>
        <CardContent className="space-y-5 pt-5 max-md:max-h-[calc(70dvh-3rem)] max-md:overflow-y-auto scroll-bronze">
          {/* Archive Layer */}
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-red-500/80">
              Intelligence Layers
            </h4>
            <div className="flex items-center justify-between py-1 bg-red-500/5 rounded px-2 -mx-1 border border-red-500/10 transition-all hover:bg-red-500/10">
              <div className="flex items-center gap-2.5">
                <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                <span className="text-[11px] font-bold text-foreground/90 uppercase tracking-tight">Archive Entities</span>
              </div>
              <Switch
                checked={filters.showArchiveNodes}
                onCheckedChange={(checked) => onFiltersChange({ ...filters, showArchiveNodes: checked })}
                className="scale-75 data-[state=checked]:bg-red-500"
              />
            </div>
            <p className="text-[9px] text-muted-foreground/60 leading-tight px-1 italic">
              Toggle visibility of non-Sinner nodes (Wings, Abnormalities, Legacy Characters) on the tactical graph.
            </p>
          </div>

          <div className="h-[1px] bg-border/50" />

          {/* Spoiler Gate */}
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-primary/80">
              Spoiler Authorization
            </h4>
            <div className="px-1 space-y-3">
              <div className="flex justify-between items-center text-[11px] font-bold">
                <span className="text-foreground/90 uppercase tracking-tight">Access Level</span>
                <span className="text-primary font-mono bg-primary/10 px-1.5 py-0.5 rounded-sm">CANTO {(filters as any).cantoLevel || 0}</span>
              </div>
              <input 
                type="range" 
                min="0" max="9" step="1"
                value={(filters as any).cantoLevel || 0}
                onChange={(e) => onFiltersChange({ ...filters, cantoLevel: parseInt(e.target.value) } as any)}
                className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[8px] font-mono text-muted-foreground/50 uppercase">
                <span>Prologue</span>
                <span>Inferno</span>
              </div>
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
                    {THEME_META[theme]?.label ?? theme.replace('-', ' ')}
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
    </>
  );
}
