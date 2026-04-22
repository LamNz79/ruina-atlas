import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sinners } from '../data/sinners';
import { identityImages } from '../data/identityImages';
import { identityDetailData } from '../data/identityDetailData';
import { useTeamBuilder } from '../hooks/useTeamBuilder';
import { Container, Section, Grid, Stack, Flex, Box } from '../components/layout/index';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Info, Trash2, LayoutGrid, Sparkles } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { IdentityDossier } from '../components/builder/IdentityDossier';
import { EgoPicker } from '../components/builder/EgoPicker';
import { egoById } from '../data/ego';

export default function TeamBuilder() {
  const navigate = useNavigate();
  const { squad, setMember, toggleEgo, clearSquad } = useTeamBuilder();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dossierOpen, setDossierOpen] = useState(false);
  const [egoPickerOpen, setEgoPickerOpen] = useState(false);
  const [activeSinnerId, setActiveSinnerId] = useState<string | null>(null);
  const [selectedIdentity, setSelectedIdentity] = useState<any>(null);

  // Derive all available identities from sinners data
  const buildableSinners = useMemo(() => sinners.filter(s => s.id !== 'dante'), []);
  
  const allIdentities = useMemo(() => {
    return buildableSinners.flatMap(s => 
      s.identities.map(id => ({
        ...id,
        sinnerId: s.id,
        image: identityImages[id.id] || '/assets/identities/default.jpg',
        details: identityDetailData[id.id]
      }))
    );
  }, [buildableSinners]);

  const handleOpenPicker = (sinnerId: string) => {
    setActiveSinnerId(sinnerId);
    setPickerOpen(true);
  };

  const handleSelectIdentity = (identityId: string) => {
    if (activeSinnerId) {
      setMember(activeSinnerId, identityId);
    }
    setPickerOpen(false);
  };

  const activeSinner = activeSinnerId ? sinners.find(s => s.id === activeSinnerId) : null;
  const filteredIdentities = useMemo(() => {
    return allIdentities.filter(id => id.sinnerId === activeSinnerId);
  }, [allIdentities, activeSinnerId]);

  // Squad Affinity Calculation (Generation vs Costs)
  const squadAnalysis = useMemo(() => {
    const generation: Record<string, number> = {};
    const costs: Record<string, number> = {};
    
    Object.values(squad).forEach(member => {
      // Add Identity Generation
      if (member.identityId) {
        const details = identityDetailData[member.identityId];
        details?.affinity?.forEach(aff => {
          generation[aff] = (generation[aff] || 0) + 1;
        });
      }

      // Add E.G.O Costs
      Object.values(member.egoLoadout).forEach(egoId => {
        if (egoId) {
          const ego = egoById[egoId];
          if (ego) {
            Object.entries(ego.cost).forEach(([aff, val]) => {
              costs[aff] = (costs[aff] || 0) + val;
            });
          }
        }
      });
    });

    return { generation, costs };
  }, [squad]);

  const handleIdentityClick = (sinnerId: string, identity: any) => {
    if (!identity) {
      handleOpenPicker(sinnerId);
    } else {
      setSelectedIdentity(identity);
      setDossierOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      {/* Background Polish */}
      <div className="starfield-bg" />
      <div className="terminal-overlay" />
      <div className="scanner-line" />

      {/* Header */}
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-border/40 bg-background/95 px-8 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Flex gap={6} align="center">
          <Link to="/" className="flex items-center gap-3 group">
            <LayoutGrid className="h-5 w-5 text-primary transition-transform group-hover:scale-110" />
            <div className="flex flex-col leading-none">
              <span className="text-sm font-black uppercase tracking-tighter chromatic-text">Ruina Atlas</span>
              <span className="text-[9px] font-mono text-muted-foreground/60 uppercase">Management Terminal</span>
            </div>
          </Link>
          <span className="h-6 w-px bg-border/40" />
          <h2 className="text-sm font-bold tracking-widest text-[#e8e0d5] uppercase flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#f5c518] animate-pulse" />
            Squad Initialization
          </h2>
        </Flex>

        <Flex gap={3}>
           <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="mr-1 h-3.5 w-3.5" />
            Return to Atlas
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={clearSquad}
            className="h-8 gap-2 text-[10px] font-bold uppercase tracking-widest"
          >
            <Trash2 className="h-3 w-3" />
            Clear Squad
          </Button>
        </Flex>
      </header>

      <main className="py-12 relative z-10 px-8">
        <Container>
          <Section spacing="lg">
            <Stack gap={6}>
              {/* Header Title & Actions */}
              <Flex justify="between" align="end" className="px-6 py-2 border-b border-border/20">
                <Stack gap={1}>
                  <h3 className="text-2xl font-black tracking-tighter text-[#e8e0d5] uppercase italic">Personnel Enrollment</h3>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest opacity-60">System Ready // Select Identities & E.G.O Arsenal</p>
                </Stack>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={clearSquad}
                  className="h-8 gap-2 text-[10px] font-bold uppercase tracking-widest border-[#b8202f]/40 bg-[#b8202f]/5 hover:bg-[#b8202f]/10"
                >
                  <Trash2 className="h-3 w-3" />
                  Reset Roster
                </Button>
              </Flex>

              {/* Tactical Analysis Dashboard */}
              <Box className="glass-v2 border-[#a08a70]/20 p-6 rounded-xl">
                <Stack gap={4}>
                  <Flex justify="between" align="center">
                    <Flex gap={2} align="center">
                      <div className="h-2 w-2 rounded-full bg-[#f5c518] animate-pulse" />
                      <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#a08a70]">Tactical Resource Monitor</h4>
                    </Flex>
                    <Badge variant="outline" className="bg-[#b8202f]/5 border-[#b8202f]/20 text-[#b8202f] text-[9px] font-bold">
                      LIVE RESONANCE FEED
                    </Badge>
                  </Flex>

                  <Grid gap={3} className="grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
                    {['Wrath', 'Lust', 'Sloth', 'Gluttony', 'Gloom', 'Pride', 'Envy'].map(aff => {
                      const gen = squadAnalysis.generation[aff] || 0;
                      const cost = squadAnalysis.costs[aff] || 0;
                      const hasDeficit = cost > gen * 4 && cost > 0; // Heuristic for critical
                      const isZero = gen === 0 && cost === 0;

                      return (
                        <Box 
                          key={aff} 
                          className={`
                            p-3 rounded-lg border transition-all duration-500
                            ${isZero ? 'opacity-20 grayscale border-border/10' : 'opacity-100 border-[#a08a70]/20 bg-white/5 shadow-inner'}
                            ${hasDeficit ? 'border-red-500/50 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''}
                          `}
                        >
                          <Stack gap={2}>
                            <Flex justify="between" align="center">
                              <span className={`text-[10px] font-black uppercase tracking-tighter ${hasDeficit ? 'text-red-400' : 'text-[#e8e0d5]/80'}`}>
                                {aff}
                              </span>
                              <div className={`h-2 w-2 rounded-full bg-affinity-${aff.toLowerCase()} shadow-[0_0_8px_currentColor]`} />
                            </Flex>
                            
                            <Flex align="baseline" gap={1.5}>
                               <span className="text-lg font-black leading-none text-[#e8e0d5]">{gen}</span>
                               <span className="text-[10px] font-bold text-muted-foreground uppercase">Supply</span>
                            </Flex>

                            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                               <div 
                                 className={`h-full transition-all duration-700 bg-affinity-${aff.toLowerCase()}`} 
                                 style={{ width: `${Math.min((gen / 6) * 100, 100)}%` }}
                               />
                            </div>

                            {cost > 0 && (
                              <Flex justify="between" align="center" className="mt-1 pt-1 border-t border-white/5">
                                <span className="text-[9px] font-bold text-muted-foreground uppercase">Activation Cost</span>
                                <span className={`text-[10px] font-black ${hasDeficit ? 'text-red-400 animate-pulse' : 'text-[#f5c518]'}`}>{cost}</span>
                              </Flex>
                            )}
                            
                            {hasDeficit && (
                              <div className="text-[8px] font-black text-red-500 uppercase tracking-widest text-center mt-1 animate-pulse">
                                FUEL DEFICIT
                              </div>
                            )}
                          </Stack>
                        </Box>
                      );
                    })}
                  </Grid>
                </Stack>
              </Box>

              <Grid gap={4} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {buildableSinners.map((sinner) => {
                  const selection = squad[sinner.id];
                  const identityId = selection?.identityId;
                  const identity = identityId ? allIdentities.find(id => id.id === identityId) : null;

                  return (
                    <Box 
                      key={sinner.id}
                      className={`
                        glass-v2 group relative h-56 transition-all border-border/20 overflow-hidden
                        ${identity ? 'border-[#a08a70]/40' : 'border-dashed opacity-50'}
                      `}
                    >
                      {/* Background Art */}
                      <div 
                        className="absolute inset-0 z-0 cursor-pointer"
                        onClick={() => handleIdentityClick(sinner.id, identity)}
                      >
                         {identity ? (
                           <img 
                            src={identity.image} 
                            alt="" 
                            style={{ objectPosition: 'center 35%' }}
                            className="h-full w-full object-cover grayscale opacity-30 transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-50 group-hover:scale-105"
                           />
                         ) : (
                           <div className="h-full w-full bg-muted/5 flex items-center justify-center">
                              <LayoutGrid className="h-8 w-8 text-muted-foreground/10" />
                           </div>
                         )}
                         <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
                      </div>

                      {/* Content */}
                      <div className="relative z-10 flex h-full flex-col justify-between p-4 pointer-events-none">
                        <Flex justify="between" align="start">
                          <Stack gap={0.5}>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#a08a70]/60 leading-none">
                              {sinner.id.toUpperCase()}
                            </span>
                            <h4 className="text-lg font-bold text-[#e8e0d5] leading-none tracking-tight">{sinner.name}</h4>
                          </Stack>
                          {identity && (
                            <div className="h-7 w-7 rounded-full border border-[#f5c518]/20 bg-black/40 flex items-center justify-center p-1.5 shadow-lg overflow-hidden">
                               <div className="text-[8px] font-bold text-[#f5c518] uppercase">{sinner.id.slice(0, 2)}</div>
                            </div>
                          )}
                        </Flex>

                        <Stack gap={4}>
                          {identity ? (
                            <Box className="space-y-2 pointer-events-auto">
                              <Flex justify="between" align="end">
                                <Stack gap={1} onClick={() => setDossierOpen(true)} className="cursor-pointer">
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary leading-none flex items-center gap-1.5">
                                    <span className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                                    Initialized
                                  </p>
                                  <p className="text-xs font-bold text-[#e8e0d5] truncate pr-4">{identity.displayName}</p>
                                </Stack>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 rounded-full bg-white/5 border border-white/10 hover:bg-white/10"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenPicker(sinner.id);
                                  }}
                                >
                                  <LayoutGrid className="h-3 w-3" />
                                </Button>
                              </Flex>
                              
                              {/* E.G.O Slots */}
                              <Flex gap={1.5} align="center" className="pt-2 border-t border-white/5">
                                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mr-1">E.G.O</span>
                                {['ZAYIN', 'TETH', 'HE', 'WAW', 'ALEPH'].map(rarity => {
                                  const egoId = selection?.egoLoadout[rarity];
                                  const ego = egoId ? egoById[egoId] : null;
                                  return (
                                    <Box 
                                      key={rarity} 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveSinnerId(sinner.id);
                                        setEgoPickerOpen(true);
                                      }}
                                      className={`
                                        h-6 w-6 rounded-md border border-white/10 flex items-center justify-center cursor-pointer transition-all
                                        ${ego ? 'bg-primary/20 border-primary/40' : 'bg-black/40 hover:bg-white/10'}
                                      `}
                                    >
                                      {ego ? (
                                        <img src={ego.image} alt="" className="h-full w-full object-cover rounded-[3px]" />
                                      ) : (
                                        <div className="text-[9px] font-black text-muted-foreground/40">{rarity.charAt(0)}</div>
                                      )}
                                    </Box>
                                  );
                                })}
                              </Flex>
                            </Box>
                          ) : (
                            <Box 
                              className="flex items-center gap-2 text-muted-foreground/30 group-hover:text-primary transition-colors cursor-pointer pointer-events-auto"
                              onClick={() => handleOpenPicker(sinner.id)}
                            >
                              <Info className="h-3 w-3" />
                              <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Awaiting Identity</span>
                            </Box>
                          )}
                        </Stack>
                      </div>
                    </Box>
                  );
                })}
              </Grid>
            </Stack>
          </Section>
        </Container>
      </main>

      {/* Identity Picker Modal */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="glass-v2 border-[#a08a70]/30 sm:max-w-[600px] max-h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl font-bold text-[#e8e0d5] uppercase tracking-widest chromatic-text">
              {activeSinner?.name} - Select Identity
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs font-medium">
              Choose the identity to dispatch for this sinner.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 px-6 pb-6">
            <Grid cols={1} gap={3} className="py-2 sm:grid-cols-2">
               {filteredIdentities.map((id) => (
                 <Box 
                  key={id.id}
                  onClick={() => handleSelectIdentity(id.id)}
                  className="glass-v2 group h-24 p-0 cursor-pointer overflow-hidden border-border/20 transition-all hover:border-[#f5c518]/40 hover:bg-[#f5c518]/5"
                 >
                   <div className="flex h-full">
                     <div className="w-24 relative shrink-0">
                       <img 
                        src={id.image} 
                        alt="" 
                        style={{ objectPosition: 'center 30%' }}
                        className="h-full w-full object-cover grayscale opacity-60 transition-all group-hover:grayscale-0 group-hover:opacity-100" 
                       />
                       <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                     </div>
                     <div className="flex-1 p-3 flex flex-col justify-center">
                       <h5 className="text-sm font-bold text-[#e8e0d5] leading-tight group-hover:text-[#f5c518] transition-colors">{id.displayName}</h5>
                       <Flex gap={1} className="mt-2">
                          {id.details?.affinity.map(aff => (
                            <div key={aff} className={`h-1 w-3 rounded-full bg-affinity-${aff.toLowerCase()}`} title={aff} />
                          ))}
                       </Flex>
                       <p className="text-[9px] text-muted-foreground mt-2 uppercase tracking-tight font-mono">ID: {id.id}</p>
                     </div>
                   </div>
                 </Box>
               ))}
            </Grid>
          </ScrollArea>

          <div className="p-4 bg-muted/10 border-t border-border/20 flex justify-end">
            <Button variant="ghost" onClick={() => setPickerOpen(false)} className="text-xs uppercase font-bold tracking-widest">Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>

      <IdentityDossier 
        isOpen={dossierOpen} 
        onOpenChange={setDossierOpen} 
        identity={selectedIdentity} 
      />

      <EgoPicker 
        isOpen={egoPickerOpen} 
        onOpenChange={setEgoPickerOpen} 
        sinnerName={activeSinner?.name}
        activeEgoIds={squad[activeSinnerId || '']?.egoLoadout || {}}
        onToggleEgo={(egoId, rarity) => toggleEgo(activeSinnerId!, egoId, rarity)}
      />
    </div>
  );
}
