import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { entities } from '../data/crossGameEntities';
import { Container, Stack, Flex, Box, Grid } from '../components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  Binary, 
  Biohazard, 
  Building2, 
  UserCircle2, 
  Eye, 
  EyeOff,
  Crosshair
} from 'lucide-react';

type EntityType = 'all' | 'wing' | 'abnormality' | 'character';

export default function EntityCodex() {
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<EntityType>('all');
  const [isCensored, setIsCensored] = useState(true);

  const filteredEntities = useMemo(() => {
    return entities.filter(e => {
      const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) || 
                          e.loreSummary.toLowerCase().includes(search.toLowerCase());
      const matchesType = activeType === 'all' || e.type === activeType;
      return matchesSearch && matchesType;
    });
  }, [search, activeType]);

  return (
    <div className="dark min-h-screen bg-[#0a0a0a] text-[#e8e0d5] font-sans selection:bg-[#f5c518]/30">
      <div className="starfield-bg opacity-40" />
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#a08a70]/20 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <Container>
          <Flex justify="between" align="center" className="h-16 px-4">
            <Link to="/" className="flex items-center gap-2 group transition-all">
              <ChevronLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#a08a70]/60 leading-none">Access Restricted</span>
                <span className="text-lg font-black uppercase tracking-tighter chromatic-text">The Entity Codex</span>
              </div>
            </Link>

            <Flex gap={3} align="center">
               <div className="relative w-64 hidden md:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input 
                    placeholder="Query Archive..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-9 pl-9 bg-white/5 border-[#a08a70]/20 text-xs focus-visible:ring-[#f5c518]/50"
                  />
               </div>
               <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsCensored(!isCensored)}
                className={`h-9 gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${isCensored ? 'border-red-500/40 text-red-400' : 'border-emerald-500/40 text-emerald-400'}`}
               >
                 {isCensored ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                 {isCensored ? 'Censored Mode' : 'Restored View'}
               </Button>
            </Flex>
          </Flex>
        </Container>
      </header>

      <main className="py-8 relative z-10">
        <Container>
          <Stack gap={8}>
            {/* Filter Bar */}
            <Flex gap={2} wrap className="bg-white/5 p-2 rounded-xl border border-white/5">
               <FilterButton active={activeType === 'all'} onClick={() => setActiveType('all')} label="All Intelligence" icon={<Binary className="h-3.5 w-3.5" />} />
               <FilterButton active={activeType === 'wing'} onClick={() => setActiveType('wing')} label="The Wings" icon={<Building2 className="h-3.5 w-3.5" />} />
               <FilterButton active={activeType === 'abnormality'} onClick={() => setActiveType('abnormality')} label="Abnormalities" icon={<Biohazard className="h-3.5 w-3.5" />} />
               <FilterButton active={activeType === 'character'} onClick={() => setActiveType('character')} label="Legacy Assets" icon={<UserCircle2 className="h-3.5 w-3.5" />} />
            </Flex>

            {/* Content Grid */}
            <Grid gap={4} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredEntities.map((entity) => (
                <EntityCard 
                  key={entity.id} 
                  entity={entity} 
                  isCensored={isCensored && entity.type === 'abnormality'} 
                />
              ))}
            </Grid>

            {filteredEntities.length === 0 && (
              <Box className="py-20 text-center">
                <Stack gap={2}>
                  <Crosshair className="h-12 w-12 text-[#a08a70]/20 mx-auto" />
                  <p className="text-muted-foreground uppercase tracking-[0.2em] font-black">No clearance for this query.</p>
                </Stack>
              </Box>
            )}
          </Stack>
        </Container>
      </main>
    </div>
  );
}

function FilterButton({ active, label, icon, onClick }: { active: boolean, label: string, icon: React.ReactNode, onClick: () => void }) {
  return (
    <Button 
      variant={active ? 'default' : 'ghost'} 
      onClick={onClick}
      className={`
        h-10 gap-2 text-[10px] font-black uppercase tracking-widest px-6 transition-all
        ${active ? 'bg-[#f5c518] text-black shadow-[0_0_15px_rgba(245,197,24,0.3)]' : 'text-muted-foreground hover:bg-white/5 hover:text-[#e8e0d5]'}
      `}
    >
      {icon}
      {label}
    </Button>
  );
}

function EntityCard({ entity, isCensored }: { entity: any, isCensored: boolean }) {
  const typeColors = {
    wing: 'border-blue-500/30 bg-blue-500/5 text-blue-400',
    abnormality: 'border-red-500/30 bg-red-500/5 text-red-400',
    character: 'border-amber-500/30 bg-amber-500/5 text-amber-400'
  };

  const riskLevel = (entity as any).riskLevel || null;

  return (
    <Box className={`glass-v2 group overflow-hidden border border-[#a08a70]/20 hover:border-[#f5c518]/40 transition-all p-0 rounded-2xl flex flex-col h-[320px]`}>
      {/* Visual Header */}
      <Box className="h-32 bg-muted/10 relative overflow-hidden shrink-0">
        <div className={`absolute inset-0 bg-gradient-to-br opacity-20 ${entity.type === 'wing' ? 'from-blue-500' : entity.type === 'abnormality' ? 'from-red-500' : 'from-amber-500'}`} />
        <div className="absolute inset-0 flex items-center justify-center">
           {entity.type === 'wing' && <Building2 className="h-12 w-12 text-blue-500/30 group-hover:scale-110 transition-transform" />}
           {entity.type === 'abnormality' && <Biohazard className="h-12 w-12 text-red-500/30 group-hover:scale-110 transition-transform" />}
           {entity.type === 'character' && <UserCircle2 className="h-12 w-12 text-amber-500/30 group-hover:scale-110 transition-transform" />}
        </div>
        
        {isCensored && (
          <div className="absolute inset-0 backdrop-blur-xl bg-black/60 flex items-center justify-center">
            <Badge variant="destructive" className="font-black tracking-[0.2em] text-[9px] uppercase border-[#b8202f]">Cognitohazard Suppressed</Badge>
          </div>
        )}

        <div className="absolute bottom-2 left-3 flex gap-2">
           <Badge className={`text-[8px] font-black uppercase py-0 h-4 border-none ${typeColors[entity.type as keyof typeof typeColors]}`}>
             {entity.type}
           </Badge>
           {riskLevel && (
             <Badge className="bg-black/40 text-[#f5c518] text-[8px] font-black uppercase py-0 h-4 border-[#f5c518]/20">
               {riskLevel}
             </Badge>
           )}
        </div>
      </Box>

      {/* Info Body */}
      <div className="p-4 flex-1 flex flex-col">
        <Stack gap={1} className="mb-2">
          <span className="text-[9px] font-black text-[#a08a70]/60 uppercase tracking-widest leading-none">Classified Index // {entity.id}</span>
          <h5 className="text-base font-black text-[#e8e0d5] uppercase tracking-tighter leading-tight group-hover:text-[#f5c518] transition-colors">{entity.name}</h5>
        </Stack>

        <ScrollArea className="flex-1 pr-2">
          <p className="text-[11px] text-[#e8e0d5]/60 leading-relaxed font-medium mb-3 italic">
            {entity.loreSummary}
          </p>
          
          <Stack gap={3}>
            {entity.literaryOrigin && (
              <div className="p-2 bg-white/5 border border-white/5 rounded-lg">
                <span className="text-[8px] font-black text-[#a08a70] uppercase block mb-1">Archetype Origin</span>
                <p className="text-[9px] text-[#e8e0d5]/80 font-semibold">{entity.literaryOrigin}</p>
              </div>
            )}
            
            {entity.relatedSinnerIds.length > 0 && (
              <Flex gap={1} wrap>
                {entity.relatedSinnerIds.map((id: string) => (
                  <Link key={id} to={`/profile/sinner/${id}`}>
                    <Badge variant="outline" className="text-[8px] font-bold uppercase py-0 h-4 opacity-50 hover:opacity-100 transition-opacity">
                      {id}
                    </Badge>
                  </Link>
                ))}
              </Flex>
            )}
          </Stack>
        </ScrollArea>
      </div>
    </Box>
  );
}
