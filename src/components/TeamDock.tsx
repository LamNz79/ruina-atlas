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
        <div className="flex items-center gap-4 px-6 py-3 bg-black/80 backdrop-blur-xl brutalist-border opacity-70 hover:opacity-100 transition-opacity cursor-default digital-noise">
          <Terminal className="h-4 w-4 text-gold animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-gold/80">Command Center Standby</span>
          <div className="h-4 w-[1px] bg-bronze/20 mx-2" />
          <span className="text-[9px] font-mono text-bronze/60 uppercase tracking-widest">Select nodes to assemble tactical set</span>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-0 group/dock animate-in slide-in-from-bottom-8 duration-500">
      {/* Top Bar: System Info */}
      <div className="flex items-center justify-between w-full px-4 py-1.5 bg-black/90 border border-bronze/20 border-b-0 digital-noise">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Terminal className="h-3 w-3 text-gold animate-pulse" />
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-gold/80">Neural_Dock v1.0</span>
          </div>
          <div className="h-3 w-[1px] bg-bronze/20" />
          <div className="flex items-center gap-2">
            <Activity className="h-2.5 w-2.5 text-crimson" />
            <span className="text-[8px] font-mono text-bronze/60 uppercase">Link_Stable</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <Badge variant="outline" className="h-4 px-1.5 text-[8px] font-mono border-gold/30 text-gold bg-gold/5 rounded-none">
             RESONANCE: {resonance.activeSynergies.length}
           </Badge>
           <button
            onClick={onClear}
            className="text-[9px] uppercase font-bold text-muted-foreground hover:text-crimson transition-colors flex items-center gap-1 font-mono"
          >
            <X className="h-2.5 w-2.5" />
            PURGE
          </button>
        </div>
      </div>

      {/* Main Dock Content */}
      <div className="flex items-center gap-4 p-4 bg-black/60 backdrop-blur-xl brutalist-border border-t-0 border-b-0 steel-texture hardware-container">
        {/* Visual Anchor */}
        <div className="flex flex-col items-center justify-center mr-2 border border-gold/20 p-1.5 bg-gold/5">
           <Zap className="h-3 w-3 text-gold animate-pulse" />
        </div>

        {/* Pinned Nodes List */}
        <div className="flex gap-3 pr-4 border-r border-bronze/10">
          {pinnedNodes.map((node) => (
            <div
              key={node.id}
              className="group relative flex flex-col items-center justify-center w-12 h-14 bg-black/40 brutalist-border hover:bg-gold/10 transition-all cursor-default overflow-hidden"
            >
              <button
                onClick={() => onRemove(node.id)}
                className="absolute -top-1 -right-1 p-0.5 bg-crimson text-white rounded-none opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <X className="h-2 w-2" />
              </button>

              <div className="w-6 h-6 flex items-center justify-center mb-1">
                {node.type === 'sinner' && (
                  <div className="w-4 h-4 border flex items-center justify-center" style={{ borderColor: node.color || 'var(--gold)' }}>
                     <div className="w-1.5 h-1.5" style={{ backgroundColor: node.color || 'var(--gold)' }} />
                  </div>
                )}
                {node.type === 'entity' && <Shield className="h-4 w-4 text-bronze" />}
                {node.type === 'literary' && <BookOpen className="h-4 w-4 text-gold" />}
              </div>

              <span className="text-[7px] font-black text-center px-1 truncate w-full uppercase text-ivory/60 group-hover:text-gold transition-colors font-mono">
                {node.name.slice(0, 6)}
              </span>
              
              {/* Vital Line Overlay */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10 group-hover:opacity-30">
                <div className="vital-line w-full bg-gold" />
              </div>
            </div>
          ))}
          
          {/* Empty Slot Indicators */}
          {Array.from({ length: Math.max(0, 5 - pinnedNodes.length) }).map((_, i) => (
            <div key={i} className="w-12 h-14 border border-dashed border-bronze/10 flex items-center justify-center opacity-20">
               <span className="text-bronze text-xs">·</span>
            </div>
          ))}
        </div>

        {/* Action Section */}
        <div className="flex flex-col gap-2 pl-2">
          <Link to="/team-builder">
            <button className="flex flex-col items-center justify-center w-24 h-14 bg-gold/10 brutalist-border hover:bg-gold/20 hover:border-gold transition-all group/analyze digital-noise">
               <Activity className="h-4 w-4 text-gold group-hover/analyze:scale-110 transition-transform mb-1" />
               <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gold font-mono">Run_Resonance</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Bottom Trim */}
      <div className="w-[90%] h-px bg-gold/40 shadow-[0_0_10px_#f5c518]" />
    </div>
  );
}
