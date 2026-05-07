import { useState, useEffect, useRef, useMemo } from 'react';
import { Shield, Zap, ChevronLeft, Activity, Brain, HelpCircle, Network, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sinners } from '../data/sinners';
import { SINS, calculateResonance } from '../utils/resonanceEngine';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TeamBuilderProps {
  pinnedNodes: any[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onAdd: (node: any) => void;
}

export default function TeamBuilder({ pinnedNodes, onRemove, onClear, onAdd }: TeamBuilderProps) {
  const [showGuide, setShowGuide] = useState(false);
  const resonance = useMemo(() => calculateResonance(pinnedNodes), [pinnedNodes]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const radarRef = useRef<HTMLCanvasElement>(null);

  // Synergy Map Canvas Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      // Sync resolution to display size
      if (canvas.width !== Math.floor(rect.width * dpr) || canvas.height !== Math.floor(rect.height * dpr)) {
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
      }

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const activeSinnerNodes = pinnedNodes.filter(n => n.type === 'sinner');
      if (activeSinnerNodes.length === 0 || W < 10 || H < 10) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      if (activeSinnerNodes.length < 2) {
        ctx.fillStyle = 'rgba(160, 138, 112, 0.2)';
        ctx.font = `${14 * dpr}px var(--font-space)`;
        ctx.textAlign = 'center';
        ctx.fillText('SELECT MULTIPLE SINNERS TO MAP RESONANCE', W / 2, H / 2);
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const positions = activeSinnerNodes.map((_, i) => {
        const angle = (i / activeSinnerNodes.length) * Math.PI * 2 - Math.PI / 2;
        const radius = Math.min(W, H) * 0.35;
        return { x: W / 2 + Math.cos(angle) * radius, y: H / 2 + Math.sin(angle) * radius };
      });

      // Draw connections
      activeSinnerNodes.forEach((nodeA, i) => {
        const sinnerA = sinners.find(s => s.id === nodeA.id);
        if (!sinnerA) return;

        activeSinnerNodes.forEach((nodeB, j) => {
          if (j <= i) return;
          const sinnerB = sinners.find(s => s.id === nodeB.id);
          if (!sinnerB) return;

          const sharedThemes = sinnerA.themes.filter(t => sinnerB.themes.includes(t));
          if (sharedThemes.length > 0) {
            const alpha = 0.1 + sharedThemes.length * 0.15;
            ctx.beginPath();
            ctx.moveTo(positions[i].x, positions[i].y);
            ctx.lineTo(positions[j].x, positions[j].y);
            ctx.strokeStyle = `rgba(160, 138, 112, ${alpha})`;
            ctx.lineWidth = sharedThemes.length * 2 * dpr;
            ctx.stroke();

            // Synergy point
            const mx = (positions[i].x + positions[j].x) / 2;
            const my = (positions[i].y + positions[j].y) / 2;
            ctx.fillStyle = `rgba(245, 197, 24, ${alpha + 0.2})`;
            ctx.beginPath();
            ctx.arc(mx, my, 3 * dpr, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      });

      // Draw nodes
      activeSinnerNodes.forEach((node, i) => {
        const { x, y } = positions[i];
        ctx.beginPath();
        ctx.arc(x, y, 20 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = '#0a0806';
        ctx.fill();
        ctx.strokeStyle = node.color || '#a08a70';
        ctx.lineWidth = 2 * dpr;
        ctx.stroke();

        ctx.fillStyle = '#e8e0d5';
        ctx.font = `bold ${10 * dpr}px var(--font-space)`;
        ctx.textAlign = 'center';
        ctx.fillText(node.name.slice(0, 3).toUpperCase(), x, y + 4 * dpr);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [pinnedNodes]);

  // Radar Chart Rendering
  useEffect(() => {
    const canvas = radarRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;
      const cy = H / 2 + 5;
      const r = Math.min(W, H) * 0.35;
      ctx.clearRect(0, 0, W, H);

      const n = SINS.length;
      const angles = SINS.map((_, i) => (i * 2 * Math.PI / n) - Math.PI / 2);

      // Web grid
      [0.25, 0.5, 0.75, 1].forEach(scale => {
        ctx.beginPath();
        angles.forEach((a, i) => {
          const x = cx + Math.cos(a) * r * scale;
          const y = cy + Math.sin(a) * r * scale;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.strokeStyle = 'rgba(160, 138, 112, 0.15)';
        ctx.stroke();
      });

      // Axes
      angles.forEach(a => {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        ctx.strokeStyle = 'rgba(160, 138, 112, 0.1)';
        ctx.stroke();
      });

      // Data area
      if (pinnedNodes.filter(n => n.type === 'sinner').length > 0) {
        ctx.beginPath();
        SINS.forEach((sin, i) => {
          const val = (resonance.sinAffinities[sin] || 0) / Math.max(...Object.values(resonance.sinAffinities), 1);
          const x = cx + Math.cos(angles[i]) * r * val;
          const y = cy + Math.sin(angles[i]) * r * val;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fillStyle = 'rgba(245, 197, 24, 0.15)';
        ctx.fill();
        ctx.strokeStyle = '#f5c518';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Labels
      ctx.fillStyle = 'rgba(160, 138, 112, 0.6)';
      ctx.font = '9px var(--font-space)';
      ctx.textAlign = 'center';
      SINS.forEach((sin, i) => {
        const x = cx + Math.cos(angles[i]) * (r + 15);
        const y = cy + Math.sin(angles[i]) * (r + 15) + 3;
        ctx.fillText(sin.toUpperCase(), x, y);
      });
    };

    render();
  }, [resonance.sinAffinities]);

  return (
    <div className="flex flex-col h-screen bg-[#0a0806] text-[#e8e0d5] font-mono overflow-hidden animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-bronze/20 bg-black/60 backdrop-blur-md z-50">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-white/5 transition-colors group brutalist-border">
            <ChevronLeft className="h-5 w-5 text-bronze group-hover:text-gold" />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-sm font-display tracking-[0.3em] uppercase text-gold glitch-text" data-text="Archive · Team Builder">
              Archive · Team Builder
            </h1>
            <span className="text-[10px] text-bronze/50 tracking-widest uppercase font-mono">
              Lore Resonance Engine v1.0 // [SYNERGY_OVERRIDE_ENABLED]
            </span>
          </div>
        </div>
        <div className="flex gap-4">
          <Badge variant="outline" className="border-gold/30 text-gold uppercase text-[9px] tracking-tighter bg-gold/5 animate-pulse">
            System Synchronized
          </Badge>
          <Dialog open={showGuide} onOpenChange={setShowGuide}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 gap-1 text-[10px] border-gold/30 text-gold hover:bg-gold/10 brutalist-border">
                <HelpCircle className="h-3 w-3" />
                Guide
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-gold/20 glass-v2 text-[#e8e0d5] rounded-none">
              <DialogHeader>
                <DialogTitle className="text-gold font-display tracking-widest uppercase flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  Resonance Engine Field Guide
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh] pr-4">
                <div className="space-y-6 text-sm text-bronze/90 py-2 font-mono">
                  <section className="space-y-2">
                    <h3 className="text-ivory font-bold uppercase tracking-wider flex items-center gap-2 text-xs">
                      <Network className="h-4 w-4 text-gold" />
                      Neural Synergy Map
                    </h3>
                    <p className="leading-relaxed text-[12px]">
                      The Neural Map visualizes <strong>Thematic Density</strong>. It connects Sinners who share core literary themes. 
                      Thicker lines indicate multi-layered resonance (Themes + Origins).
                    </p>
                  </section>
                  <section className="space-y-2">
                    <h3 className="text-ivory font-bold uppercase tracking-wider flex items-center gap-2 text-xs">
                      <Brain className="h-4 w-4 text-gold" />
                      Sin Affinity Radar
                    </h3>
                    <p className="leading-relaxed text-[12px]">
                      Maps team base EGO Sin Affinities. High concentration in specific axes unlocks specialized tactical advantages.
                    </p>
                  </section>
                  <section className="space-y-2">
                    <h3 className="text-ivory font-bold uppercase tracking-wider flex items-center gap-2 text-xs">
                      <Zap className="h-4 w-4 text-gold" />
                      Active Resonances
                    </h3>
                    <p className="leading-relaxed text-[12px]">
                      Engine automatically activates synergies based on:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-[11px] opacity-80">
                      <li><strong>Theme:</strong> Shared literary motifs.</li>
                      <li><strong>Origin:</strong> Shared geographic/linguistic roots.</li>
                      <li><strong>Era:</strong> Overlapping literary movements.</li>
                      <li><strong>Faction:</strong> Shared Identity groups.</li>
                    </ul>
                  </section>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" onClick={onClear} className="h-7 text-[10px] border-crimson/30 text-crimson hover:bg-crimson/10 brutalist-border">
            Clear Active Set
          </Button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden digital-noise">
        {/* Left: Main Area */}
        <div className="flex flex-col flex-1 border-r border-bronze/10 hardware-container steel-texture">
          {/* Sinner Selection Grid */}
          <div className="p-6 border-b border-bronze/10 bg-black/20">
            <div className="grid grid-cols-7 gap-3">
              {sinners.map(sinner => {
                const isPinned = pinnedNodes.some(n => n.id === sinner.id);
                return (
                  <button
                    key={sinner.id}
                    onClick={() => isPinned ? onRemove(sinner.id) : onAdd({
                      id: sinner.id,
                      name: sinner.name,
                      type: 'sinner',
                      color: sinner.signatureColor
                    })}
                    className={`flex flex-col items-center gap-2 group transition-all brutalist-border p-2 ${isPinned ? 'opacity-100 bg-gold/5' : 'opacity-40 hover:opacity-70 bg-black/40'}`}
                  >
                    <div className={`w-10 h-10 border flex items-center justify-center transition-all ${isPinned ? 'border-gold shadow-[0_0_10px_rgba(245,197,24,0.2)]' : 'border-bronze/20'}`}>
                      <span className="text-[10px] font-black">{sinner.name.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <span className={`text-[7px] tracking-[0.2em] uppercase transition-colors ${isPinned ? 'text-gold' : 'text-bronze/60'}`}>{sinner.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Neural Synergy Map */}
          <div className="relative flex-1 bg-[radial-gradient(circle_at_50%_50%,rgba(160,138,112,0.05),transparent)]">
            <div className="absolute top-4 left-6 flex items-center gap-2 text-gold/60 font-mono">
              <Activity className="h-3 w-3 animate-pulse" />
              <span className="text-[9px] tracking-[0.3em] uppercase">Visualizing Neural Threads...</span>
            </div>
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            
            {/* Dock Preview Overlay */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-8 py-4 glass-v3 brutalist-border flex items-center gap-8">
               <div className="flex flex-col gap-2 mr-4">
                  <span className="text-[8px] text-bronze/60 uppercase tracking-[0.3em] font-bold">Active Formation</span>
                  <div className="flex gap-2">
                    {pinnedNodes.filter(n => n.type === 'sinner').map(n => (
                       <div key={n.id} className="w-8 h-8 border border-gold/40 bg-gold/10 flex items-center justify-center text-[9px] font-black text-gold">
                         {n.name.slice(0,2).toUpperCase()}
                       </div>
                    ))}
                    {Array.from({ length: 6 - pinnedNodes.filter(n => n.type === 'sinner').length }).map((_, i) => (
                       <div key={i} className="w-8 h-8 border border-dashed border-bronze/20 flex items-center justify-center text-bronze/20 text-xs">
                         ·
                       </div>
                    ))}
                  </div>
               </div>
               <div className="h-12 w-[1px] bg-bronze/20" />
               <div className="flex flex-col gap-2">
                  <span className="text-[8px] text-bronze/60 uppercase tracking-[0.3em] font-bold">Resonance Integrity</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-black/40 brutalist-border overflow-hidden">
                      <div 
                        className="h-full bg-gold shadow-[0_0_10px_#f5c518] transition-all duration-1000" 
                        style={{ width: `${Math.min(resonance.activeSynergies.length * 15, 100)}%` }} 
                      />
                    </div>
                    <span className="text-[10px] text-gold font-black tracking-tighter">
                      {resonance.activeSynergies.length > 0 ? 'SYNC_LOCKED' : 'SCANNING...'}
                    </span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Right: Analysis Panel */}
        <div className="w-[340px] bg-black/40 flex flex-col overflow-hidden border-l border-bronze/20">
          <div className="flex-1 overflow-y-auto scroll-bronze p-6 space-y-8">
            {/* Radar Chart */}
            <div className="brutalist-border p-4 bg-black/20">
               <div className="flex items-center gap-2 mb-4">
                  <Brain className="h-3 w-3 text-gold" />
                  <span className="text-[10px] text-gold uppercase tracking-[0.2em] font-bold">Sin Affinity Profile</span>
               </div>
               <div className="flex justify-center py-2">
                  <canvas ref={radarRef} width={280} height={240} />
               </div>
            </div>

            {/* Active Resonances */}
            <div className="space-y-4">
               <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-3 w-3 text-gold" />
                  <span className="text-[10px] text-gold uppercase tracking-[0.2em] font-bold">Active Resonances</span>
               </div>
               <div className="flex flex-col gap-2">
                  {resonance.activeSynergies.length > 0 ? (
                    resonance.activeSynergies.map((syn, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white/[0.02] brutalist-border hover:bg-gold/5 transition-all group">
                        <div className="flex items-center gap-3">
                           <div className={`w-2 h-2 ${
                             syn.type === 'theme' ? 'bg-ivory' : 
                             syn.type === 'sin' ? 'bg-gold' : 
                             syn.type === 'faction' ? 'bg-crimson' :
                             syn.type === 'origin' ? 'bg-cyan-500' : 'bg-purple-500'
                           } shadow-[0_0_5px_currentColor]`} />
                           <span className="text-[10px] tracking-widest text-ivory/70 group-hover:text-ivory font-bold">{syn.label}</span>
                        </div>
                        <span className="text-xs font-black text-gold/60">x{syn.score}</span>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center brutalist-border border-dashed border-bronze/10 opacity-30">
                      <span className="text-[9px] text-bronze/60 uppercase italic tracking-[0.2em]">Awaiting Resonance...</span>
                    </div>
                  )}
               </div>
            </div>

            {/* Thematic Profile */}
            <div className="space-y-4">
               <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-3 w-3 text-gold" />
                  <span className="text-[10px] text-gold uppercase tracking-[0.2em] font-bold">Thematic Density</span>
               </div>
               <div className="flex flex-col gap-5 p-4 bg-black/20 brutalist-border">
                  {Object.entries(resonance.themeScores).filter(([_, s]) => s > 0).map(([label, score]) => (
                    <div key={label} className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] text-bronze/60 tracking-[0.2em] uppercase font-bold">{label}</span>
                        <span className="text-[10px] text-gold font-black">{score}</span>
                      </div>
                      <div className="w-full h-[3px] bg-black/40 overflow-hidden">
                        <div 
                          className="h-full bg-gold/60 shadow-[0_0_8px_rgba(245,197,24,0.4)] transition-all duration-1000 ease-out" 
                          style={{ width: `${Math.min((score / 4) * 100, 100)}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                  {Object.values(resonance.themeScores).every(s => s === 0) && (
                    <span className="text-[9px] text-bronze/30 uppercase italic text-center py-4">No dominant themes detected</span>
                  )}
               </div>
            </div>
          </div>

          {/* System Log */}
          <div className="h-32 border-t border-bronze/20 bg-black/60 p-4 font-mono text-[9px] text-bronze/40 overflow-hidden flex flex-col gap-1">
             <div className="flex justify-between border-b border-bronze/10 pb-1 mb-1">
               <span className="text-gold/60">SYSTEM_LOG // RUNIA_OS_v1.0.4</span>
               <span className="animate-pulse">● LIVE</span>
             </div>
             <div className="flex flex-col gap-0.5 opacity-60">
               <p>[INFO] INITIALIZING LORE_RESONANCE_ENGINE...</p>
               <p>[INFO] SCANNING SINNER DATA: {pinnedNodes.filter(n => n.type === 'sinner').length} DETECTED</p>
               <p>[INFO] CALIBRATING NEURAL MAP FOR {resonance.activeSynergies.length} SYNERGIES</p>
               <p className="text-gold/40 animate-pulse">{">>>"} {resonance.activeSynergies[0]?.label || 'AWAITING_INPUT'}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Scanline Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.05)_2px,rgba(0,0,0,0.05)_4px)] z-50 opacity-10" />
    </div>
  );
}
