import { useMemo } from 'react';
import { X, Shield, Zap, BookOpen, Activity, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { calculateResonance } from '../utils/resonanceEngine';

interface PinnedNode {
  id: string;
  name: string;
  type: 'sinner' | 'entity' | 'literary';
  color?: string;
}

interface TeamDockProps {
  pinnedNodes: PinnedNode[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export function TeamDock({ pinnedNodes, onRemove, onClear }: TeamDockProps) {
  const resonance = useMemo(() => calculateResonance(pinnedNodes), [pinnedNodes]);
  
  if (pinnedNodes.length === 0) {
    return (
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-0 animate-in fade-in duration-1000">
        <div className="flex items-center gap-4 px-6 py-3 command-center-panel rounded-lg backdrop-blur-xl shadow-inner-gold opacity-70 hover:opacity-100 transition-opacity cursor-default border border-gold/20">
          <Terminal className="h-4 w-4 text-gold animate-pulse" />
          <span className="text-[10px] font-display uppercase tracking-[0.1em] text-gold/80">Command Center Standby</span>
          <div className="h-4 w-[1px] bg-bronze/20 mx-2" />
          <span className="text-[10px] font-mono text-bronze/60 uppercase tracking-widest">Select nodes and click PIN to assemble team</span>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-0 group/dock animate-in slide-in-from-bottom-8 duration-500">
      {/* Top Bar: System Info */}
      <div className="flex items-center justify-between w-full px-4 py-1.5 command-center-panel rounded-t-lg border-b-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Terminal className="h-3 w-3 text-gold animate-pulse" />
            <span className="text-[9px] font-display uppercase tracking-[0.2em] text-gold/80">Command Center</span>
          </div>
          <div className="h-3 w-[1px] bg-bronze/20" />
          <div className="flex items-center gap-2">
            <Activity className="h-2.5 w-2.5 text-crimson" />
            <span className="text-[8px] font-mono text-bronze/60 uppercase">Link Stable</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <Badge variant="outline" className="h-4 px-1.5 text-[8px] font-mono border-gold/30 text-gold bg-gold/5">
             SYNC: {Math.min(resonance.activeSynergies.length * 20, 100)}%
           </Badge>
           <button
            onClick={onClear}
            className="text-[9px] uppercase font-bold text-muted-foreground hover:text-crimson transition-colors flex items-center gap-1"
          >
            <X className="h-2.5 w-2.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Main Dock Content */}
      <div className="flex items-center gap-4 p-4 command-center-panel backdrop-blur-xl border-t-0 border-b-0 shadow-inner-gold">
        {/* Resonance Orb (Visual Anchor) */}
        <div className="resonance-orb-container mr-2">
           <div className="resonance-orb" />
           <div className="resonance-orb-core" />
        </div>

        {/* Pinned Nodes List */}
        <div className="flex gap-3 pr-4 border-r border-bronze/10">
          {pinnedNodes.map((node) => (
            <div
              key={node.id}
              className="group relative flex flex-col items-center justify-center w-12 h-14 glass-v2 border border-bronze/10 hover:border-gold/40 transition-all cursor-default"
            >
              <button
                onClick={() => onRemove(node.id)}
                className="absolute -top-1 -right-1 p-0.5 bg-crimson text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <X className="h-2 w-2" />
              </button>

              <div className="w-6 h-6 flex items-center justify-center mb-1">
                {node.type === 'sinner' && (
                  <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: node.color || 'var(--gold)' }} />
                )}
                {node.type === 'entity' && <Shield className="h-4 w-4 text-bronze" />}
                {node.type === 'literary' && <BookOpen className="h-4 w-4 text-gold" />}
              </div>

              <span className="text-[7px] font-bold text-center px-1 truncate w-full uppercase text-ivory/60 group-hover:text-gold transition-colors">
                {node.name.split(' ')[0]}
              </span>
              
              {/* Subtle Scanline for Active Nodes */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100">
                <div className="vital-line w-full" />
              </div>
            </div>
          ))}
          
          {/* Empty Slot Indicators */}
          {Array.from({ length: Math.max(0, 4 - pinnedNodes.length) }).map((_, i) => (
            <div key={i} className="w-12 h-14 border border-dashed border-bronze/10 flex items-center justify-center opacity-30">
               <span className="text-bronze text-xs">+</span>
            </div>
          ))}
        </div>

        {/* Action Section */}
        <div className="flex flex-col gap-2 pl-2">
          <Link to="/team-builder">
            <button className="flex flex-col items-center justify-center w-24 h-14 bg-gold/10 border border-gold/30 hover:bg-gold/20 hover:border-gold transition-all group/analyze">
               <Zap className="h-4 w-4 text-gold group-hover/analyze:scale-110 transition-transform mb-1" />
               <span className="text-[9px] font-black uppercase tracking-[0.1em] text-gold">Analyze</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Bottom Trim */}
      <div className="w-[85%] h-1 bg-gradient-to-r from-transparent via-gold/40 to-transparent blur-[1px]" />
    </div>
  );
}
