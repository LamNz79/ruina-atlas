import { useNavigate } from 'react-router-dom';
import crossGameEntities from '../data/crossGameEntities.json';
import { sinners } from '../data/sinners';
import type { CrossGameEntity } from '../types';
import { X, Hexagon, Users, Star, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect } from 'react';
import { useSound } from '../hooks/useSound';

interface EntityPanelProps {
  entityId: string | null;
  onClose: () => void;
  onSinnerClick: (sinnerId: string) => void;
  onEntityClick?: (entityId: string) => void;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  wing: <Hexagon className="h-3.5 w-3.5" />,
  abnormality: <Star className="h-3.5 w-3.5" />,
  character: <Users className="h-3.5 w-3.5" />,
};

const TYPE_LABELS: Record<string, string> = {
  wing: 'Organization',
  abnormality: 'Abnormality',
  character: 'Character',
};

const RISK_LEVEL_COLORS: Record<string, string> = {
  'ZAYIN': '#2ECC71', // Green
  'TETH':  '#3498DB', // Blue
  'HE':    '#F1C40F', // Yellow
  'WAW':   '#9B59B6', // Purple
  'ALEPH': '#E74C3C', // Blood Red
};

const TYPE_BADGE_COLORS: Record<string, string> = {
  wing: 'border-[#a08a70]/40 bg-[#a08a70]/10 text-[#a08a70]',
  abnormality: 'border-[#8a4a5a]/40 bg-[#8a4a5a]/10 text-[#e06070]',
  character: 'border-[#f5c518]/40 bg-[#f5c518]/10 text-[#f5c518]',
};

const ENTITY_COLORS: Record<string, string> = {
  wing: '#a08a70',   // Warm Bronze
  abnormality: '#8a4a5a',  // Muted Crimson
  character: '#f5c518',   // Electric Gold
};

const GAME_LABELS: Record<string, string> = {
  lobotomy: 'Lobotomy Corporation',
  ruina: 'Library of Ruina',
  limbus: 'Limbus Company',
};

const GAME_COLORS: Record<string, string> = {
  limbus: '#b8202f',  // Deep Crimson
  ruina: '#a08a70',  // Warm Bronze
  lobotomy: '#7a5c3a',  // Dark Bronze
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

export function EntityPanel({ entityId, onClose, onSinnerClick, onEntityClick }: EntityPanelProps) {
  const entity: CrossGameEntity | undefined = (
    crossGameEntities.entities as CrossGameEntity[]
  ).find((e) => e.id === entityId);
  const { playTick, playClink } = useSound();
  const navigate = useNavigate();

  // Play sound when panel opens
  useEffect(() => {
    if (entityId) {
      playClink();
    }
  }, [entityId, playClink]);

  const handleClose = () => {
    playTick({ pitch: 800 });
    onClose();
  };

  const connectedSinners = entity?.relatedSinnerIds
    ? sinners.filter((s) => entity.relatedSinnerIds!.includes(s.id))
    : [];

  const associatedEntities = entity?.relatedEntityIds
    ? (crossGameEntities.entities as CrossGameEntity[]).filter(e => entity.relatedEntityIds!.includes(e.id))
    : [];

  // Special logic: Find Managing Sephirah for a Department
  const managingSephirah = entity?.type === 'wing' && entity.id.startsWith('entity-l-') 
    ? (crossGameEntities.entities as CrossGameEntity[]).find(e => 
        e.type === 'character' && e.relatedEntityIds?.includes(entity.id)
      )
    : null;

  // Special logic: Find Patron Librarian for a Floor
  const patronLibrarian = entity?.type === 'wing' && entity.id.startsWith('entity-floor-')
    ? (crossGameEntities.entities as CrossGameEntity[]).find(e =>
        e.type === 'character' && e.relatedEntityIds?.includes(entity.id)
      )
    : null;

  return (
    <div
      className={`absolute right-0 top-0 z-[45] h-full w-[400px] shadow-2xl transition-transform duration-350 ease-[cubic-bezier(0.4,0,0.2,1)] glass-v2 ${entityId ? 'translate-x-0' : 'translate-x-full'
        }`}
      aria-hidden={!entityId}
    >
      {entity ? (
        <div className="flex h-full flex-col">
          {/* Header */}
          <header className="sticky top-0 z-10 flex items-start justify-between gap-2 border-b border-border bg-muted/40 p-5 backdrop-blur-md">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              {/* Diamond icon matching the graph node */}
              <div
                className="mt-1 shrink-0 rotate-45 border-2 p-1.5"
                style={{
                  borderColor: ENTITY_COLORS[entity.type] ?? '#888',
                  backgroundColor: `${ENTITY_COLORS[entity.type] ?? '#888'}14`,
                }}
              >
                <div className="rotate-[-45deg]">
                  {TYPE_ICONS[entity.type]}
                </div>
              </div>
              <div className="min-w-0 space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-foreground leading-tight break-words">{entity.name}</h2>
                <div className="flex flex-wrap items-center gap-2">
                  {entity.subjectNumber && (
                    <span className="shrink-0 text-[10px] font-black font-mono px-1.5 py-0.5 rounded bg-muted-foreground/10 text-muted-foreground/80 border border-muted-foreground/20 whitespace-nowrap">
                      {entity.subjectNumber}
                    </span>
                  )}
                  <Badge
                    variant="outline"
                    className={`text-[9px] font-bold uppercase tracking-wider ${TYPE_BADGE_COLORS[entity.type] ?? 'border-muted/40 text-muted'}`}
                    style={{
                      borderColor: (entity.type === 'abnormality' && entity.riskLevel) 
                        ? RISK_LEVEL_COLORS[entity.riskLevel] 
                        : (ENTITY_COLORS[entity.type] ?? '#888'),
                      color: (entity.type === 'abnormality' && entity.riskLevel)
                        ? RISK_LEVEL_COLORS[entity.riskLevel]
                        : (ENTITY_COLORS[entity.type] ?? '#888'),
                    }}
                  >
                    {TYPE_ICONS[entity.type]}
                    <span className="ml-1">
                      {entity.type === 'abnormality' && entity.riskLevel 
                        ? `${entity.riskLevel} Case` 
                        : (TYPE_LABELS[entity.type] ?? entity.type)}
                    </span>
                  </Badge>
                  <span className="text-[10px] font-medium text-muted-foreground/60">
                    {GAME_LABELS[entity.canonicalGame]}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-[10px] font-bold uppercase tracking-wider hidden sm:flex"
                onClick={() => navigate(`/profile/entity/${entity.id}`)}
              >
                <ExternalLink className="h-3 w-3" />
                Full Dossier
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full border border-border/40 text-muted-foreground transition-all hover:bg-muted shrink-0"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </header>

          {/* Scrollable Body */}
          <ScrollArea className="flex-1 px-5 py-6">
            <div className="space-y-8 pb-10">

              {/* Cross-Game Appearances */}
              <section className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Appears In
                </h3>
                <div className="flex flex-wrap gap-2">
                  {entity.appearances.map((g) => (
                    <Badge
                      key={g}
                      variant="outline"
                      className="px-2 py-0.5 text-[10px] font-medium"
                      style={{ borderColor: GAME_COLORS[g] ?? '#888', color: GAME_COLORS[g] ?? '#888' }}
                    >
                      {GAME_LABELS[g]}
                    </Badge>
                  ))}
                </div>
              </section>

              {/* Lore Summary */}
              <section>
                <p className="text-sm leading-relaxed text-muted-foreground">{entity.loreSummary}</p>
              </section>

              {/* Literary Origin */}
              {entity.literaryOrigin && (
                <section className="space-y-3 rounded-lg border border-border/40 bg-muted/20 p-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
                    Literary Origin
                  </h3>
                  <p className="text-[13px] italic leading-relaxed text-muted-foreground/90">
                    {entity.literaryOrigin}
                  </p>
                </section>
              )}

              {/* Themes */}
              <section className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Themes
                </h3>
                <div className="flex flex-wrap gap-2">
                  {entity.themes.map((t) => (
                    <Badge key={t} variant="secondary" className="px-2 py-0.5 text-[11px] font-medium">
                      {THEME_LABELS[t] ?? t}
                    </Badge>
                  ))}
                </div>
              </section>

              {/* Managing Sephirah / Patron Librarian (Logical Header) */}
              {(managingSephirah || patronLibrarian) && (
                <section className="space-y-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {managingSephirah ? 'Managing Sephirah' : 'Patron Librarian'}
                  </h3>
                  <button
                    className="flex w-full items-center gap-3 rounded-md border border-[#f5c518]/30 bg-[#f5c518]/5 p-3 text-left transition-all hover:bg-[#f5c518]/10"
                    onClick={() => onEntityClick?.((managingSephirah || patronLibrarian)!.id)}
                  >
                    <Users className="h-4 w-4 text-[#f5c518]" />
                    <span className="flex-1 text-sm font-bold text-[#f5c518]">{(managingSephirah || patronLibrarian)!.name}</span>
                    <ExternalLink className="h-3 w-3 text-[#f5c518]/60" />
                  </button>
                </section>
              )}

              {/* Associated Units (Bridge) */}
              {associatedEntities.length > 0 && (
                <section className="space-y-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Structural Continuity
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {associatedEntities.map((ae) => (
                      <button
                        key={ae.id}
                        className="flex items-center gap-3 rounded-md border border-border/40 bg-muted/20 p-2.5 text-left transition-all hover:bg-muted/30"
                        onClick={() => onEntityClick?.(ae.id)}
                      >
                        <Hexagon className="h-3.5 w-3.5 text-muted-foreground/60" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-foreground">{ae.name}</p>
                          <p className="text-[9px] uppercase tracking-tighter text-muted-foreground/60">{GAME_LABELS[ae.canonicalGame]}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Connected Sinners */}
              <section className="space-y-3">
                <h3 className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <span>Intelligence Analysis</span>
                  <Badge variant="outline" className="h-5 rounded-full bg-muted/50 px-2 font-mono text-[9px]">
                    {connectedSinners.length} Nodes
                  </Badge>
                </h3>
                {connectedSinners.length > 0 ? (
                  <div className="space-y-4">
                    {connectedSinners.map((s) => (
                      <div key={s.id} className="space-y-2">
                        <button
                          className="flex w-full items-center gap-3 rounded-md border border-border/40 bg-muted/20 p-2.5 text-left transition-all hover:border-primary/30 hover:bg-muted/30"
                          onClick={() => {
                            playTick();
                            onSinnerClick(s.id);
                          }}
                        >
                          <div
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: GAME_COLORS[s.canonicalGame] ?? '#888' }}
                          />
                          <span className="flex-1 text-sm font-semibold text-foreground truncate">{s.name}</span>
                          <span className="text-[10px] font-medium text-muted-foreground/60 shrink-0">
                            {GAME_LABELS[s.canonicalGame]}
                          </span>
                        </button>
                        
                        {entity.connectionInsights?.[s.id] && (
                          <div className="ml-5 rounded-sm border-l-2 border-border/60 bg-muted/5 p-2.5">
                            <h4 className="mb-1 text-[9px] font-bold uppercase tracking-tighter text-muted-foreground/70">
                              Resonance Insight
                            </h4>
                            <p className="text-[12px] font-mono leading-relaxed text-muted-foreground/90">
                              {entity.connectionInsights[s.id]}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs italic text-muted-foreground">
                    No direct Sinner links have been authored for this entity yet.
                  </p>
                )}
              </section>
            </div>
          </ScrollArea>
        </div>
      ) : entityId ? (
        <div className="flex h-full items-center justify-center px-6 text-center">
          <p className="text-sm text-muted-foreground">
            This entity id does not resolve to an entry in <code>crossGameEntities.json</code>.
          </p>
        </div>
      ) : null}
    </div>
  );
}
