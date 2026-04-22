import { useState, useRef, useEffect } from 'react';
import type { EdgeType } from '../types';
import { Settings2, ChevronDown, ChevronUp, RotateCcw, ZoomIn } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
} from '@/components/ui/card';

interface GraphSettingsProps {
  nodeSpacing: number;
  repulsion: number;
  centering: number;
  onNodeSpacingChange: (v: number) => void;
  onRepulsionChange: (v: number) => void;
  onCenteringChange: (v: number) => void;
  activeEdgeTypes: Set<EdgeType>;
  onToggleEdgeType: (type: EdgeType) => void;
  onResetLayout: () => void;
  onResetZoom: () => void;
}

const EDGE_COLORS: Record<EdgeType, string> = {
  'literary-origin': 'var(--edge-literary)',
  'thematic-link': 'var(--edge-theme)',
  'cross-game-continuity': 'var(--edge-crossgame)',
  'shared-literary-group': 'var(--edge-group)',
  'wing-affiliation': '#a08a70',
  'ego-synchronization': '#b8202f',
  'structural-hierarchy': '#4a5568',
  'bridge-continuity': '#d4af37',
};

const EDGE_LABELS: Record<EdgeType, string> = {
  'literary-origin': 'Literary origin',
  'thematic-link': 'Shared theme',
  'cross-game-continuity': 'Cross-game',
  'shared-literary-group': 'Shared group',
  'wing-affiliation': 'Wing affiliation',
  'ego-synchronization': 'E.G.O Sync',
  'structural-hierarchy': 'Facility structural',
  'bridge-continuity': 'Continuity bridge',
};

const EDGE_TYPES: EdgeType[] = [
  'literary-origin',
  'thematic-link',
  'cross-game-continuity',
  'shared-literary-group',
  'wing-affiliation',
  'ego-synchronization',
  'structural-hierarchy',
  'bridge-continuity',
];

export function GraphSettings({
  nodeSpacing,
  repulsion,
  centering,
  onNodeSpacingChange,
  onRepulsionChange,
  onCenteringChange,
  activeEdgeTypes,
  onToggleEdgeType,
  onResetLayout,
  onResetZoom,
}: GraphSettingsProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
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

  return (
    <div className="absolute right-4 top-4 z-40 w-64 max-w-[calc(100vw-2rem)] select-none font-sans max-md:right-3 max-md:top-3 max-md:w-[min(18rem,calc(100vw-1.5rem))]" ref={panelRef}>
      {/* Collapse / expand toggle */}
      <Button
        variant="secondary"
        size="sm"
        className={`w-full justify-between shadow-lg ring-1 ring-border/50 backdrop-blur-md transition-all ${
          open ? 'rounded-b-none bg-accent text-accent-foreground' : 'rounded-md'
        }`}
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2">
          <Settings2 className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? 'rotate-90' : ''}`} />
          <span className="text-[11px] font-bold uppercase tracking-wider">Graph Matrix</span>
        </div>
        {open ? <ChevronUp className="h-3.5 w-3.5 opacity-50" /> : <ChevronDown className="h-3.5 w-3.5 opacity-50" />}
      </Button>

      {/* Panel body */}
      <Card className={`overflow-hidden border-t-0 shadow-xl transition-all duration-300 ease-in-out ${
        open ? 'max-h-[500px] opacity-100 max-md:max-h-[60dvh]' : 'max-h-0 opacity-0 border-none shadow-none'
      }`}>
        <CardContent className="space-y-6 pt-5 max-md:max-h-[calc(60dvh-3rem)] max-md:overflow-y-auto scroll-bronze">
          {/* Physics Section */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70">Engine Physics</h4>
            
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-medium">
                <span className="text-muted-foreground">Spacing</span>
                <Badge variant="outline" className="h-5 px-1.5 font-mono text-[10px] tabular-nums">{nodeSpacing}</Badge>
              </div>
              <Slider
                value={[nodeSpacing]}
                min={80}
                max={350}
                step={10}
                onValueChange={([v]) => onNodeSpacingChange(v)}
              />
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-medium">
                <span className="text-muted-foreground">Force</span>
                <Badge variant="outline" className="h-5 px-1.5 font-mono text-[10px] tabular-nums">{Math.abs(repulsion)}</Badge>
              </div>
              <Slider
                value={[Math.abs(repulsion)]}
                min={200}
                max={5000}
                step={100}
                onValueChange={([v]) => onRepulsionChange(-v)}
              />
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-medium">
                <span className="text-muted-foreground">Gravity</span>
                <Badge variant="outline" className="h-5 px-1.5 font-mono text-[10px] tabular-nums">{centering.toFixed(2)}</Badge>
              </div>
              <Slider
                value={[centering]}
                min={0.01}
                max={0.20}
                step={0.01}
                onValueChange={([v]) => onCenteringChange(v)}
              />
            </div>
          </div>

          <div className="h-[1px] bg-border/50" />

          {/* Visibility Section */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70">Connection Filter</h4>
            <div className="space-y-1.5">
              {EDGE_TYPES.map((type) => (
                <div key={type} className="flex items-center justify-between py-1 transition-colors hover:bg-muted/30 rounded px-1 -mx-1">
                  <div className="flex items-center gap-2.5">
                    <div className="h-2 w-2 rounded-full shadow-[0_0_8px_var(--tw-shadow-color)]" 
                         style={{ backgroundColor: EDGE_COLORS[type], '--tw-shadow-color': EDGE_COLORS[type] } as React.CSSProperties} />
                    <span className="text-[11px] font-medium text-foreground/90">{EDGE_LABELS[type]}</span>
                  </div>
                  <Switch
                    checked={activeEdgeTypes.has(type)}
                    onCheckedChange={() => onToggleEdgeType(type)}
                    className="scale-75"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="h-[1px] bg-border/50" />

          {/* Actions Section */}
          <div className="grid grid-cols-2 gap-2 pb-1">
            <Button variant="outline" size="sm" onClick={onResetLayout} className="h-8 gap-1.5 text-[10px] font-bold uppercase transition-all active:scale-95">
              <RotateCcw className="h-3 w-3" />
              Layout
            </Button>
            <Button variant="outline" size="sm" onClick={onResetZoom} className="h-8 gap-1.5 text-[10px] font-bold uppercase transition-all active:scale-95">
              <ZoomIn className="h-3 w-3" />
              Focus
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
