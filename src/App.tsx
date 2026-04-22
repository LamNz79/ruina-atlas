import { useState, useMemo, useCallback, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { sinners } from './data/sinners';
import { deriveEdges } from './utils/deriveEdges';
import { LoreGraph } from './components/LoreGraph';
import { LorePanel } from './components/LorePanel';
import { EntityPanel } from './components/EntityPanel';
import About from './pages/About';
import Roadmap from './pages/Roadmap';
import ProfilePage from './pages/ProfilePage';
import type { Sinner } from './types';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Menu, ExternalLink, Info, Search, Map, Sparkles, Biohazard } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import logoSvg from '/favicon.svg';
import { GlobalSearch } from './components/GlobalSearch';
import { SourceExplorer } from './components/SourceExplorer';
import TeamBuilder from './pages/TeamBuilder';
import EntityCodex from './pages/EntityCodex';
import './index.css';

export default function App() {
  const [selectedSinner, setSelectedSinner] = useState<Sinner | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeSourceId, setActiveSourceId] = useState<string | null>(null);
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set());

  const edges = useMemo(() => deriveEdges(sinners), []);

  // Keyboard shortcut for search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleNodeClick = useCallback((sinner: Sinner) => {
    setSelectedEntity(null);
    if (selectedSinner?.id === sinner.id) {
      // Clicking already-selected node — just toggle panel, keep selection
      setPanelOpen((o) => !o);
    } else {
      setSelectedSinner(sinner);
      setPanelOpen(true);
    }
  }, [selectedSinner]);

  const handleClose = useCallback(() => {
    setPanelOpen(false);
    setSelectedSinner(null);
  }, []);

  const handleEntityClick = useCallback((entityId: string) => {
    setSelectedSinner(null);
    setPanelOpen(false);
    setSelectedEntity(entityId);
    
    // Automatically expand the node when clicked to reveal its children
    setExpandedNodeIds(prev => {
      const next = new Set(prev);
      next.add(entityId);
      return next;
    });
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpandedNodeIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSearchSelect = useCallback((type: 'sinner' | 'entity' | 'source', id: string) => {
    if (type === 'sinner') {
      const found = sinners.find(s => s.id === id);
      if (found) {
        setSelectedSinner(found);
        setPanelOpen(true);
        setSelectedEntity(null);
      }
    } else if (type === 'entity') {
      setSelectedEntity(id);
      setSelectedSinner(null);
      setPanelOpen(false);
    } else if (type === 'source') {
      setActiveSourceId(id);
    }
  }, []);

  return (
    <Routes>
      {/* Graph route — the main app */}
      <Route
        path="/"
        element={
          <div className="dark flex h-screen w-full flex-col overflow-hidden bg-background font-sans text-foreground">
            <div className="starfield-bg" />
            {/* Header */}
            <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-border/40 bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <Link to="/" className="flex items-center gap-3 no-underline">
                <img
                  src={logoSvg}
                  alt="Ruina Atlas"
                  className="h-8 w-8 object-contain"
                />
                <div className="flex flex-col">
                  <h1 className="text-lg font-bold tracking-tight text-foreground leading-none chromatic-text">
                    Ruina Atlas
                  </h1>
                  <p className="hidden text-[10px] font-medium text-muted-foreground sm:block leading-none mt-0.5">
                    Literary connections of Project Moon's universe
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchOpen(true)}
                  className="h-8 gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Search</span>
                  <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </Button>

                {selectedSinner ? (
                  <>
                    <span className="text-xs font-medium text-muted-foreground hidden sm:block">
                      / {selectedSinner.name}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPanelOpen((o) => !o)}
                      className="h-8 gap-1.5 text-xs font-medium"
                    >
                      {panelOpen ? (
                        <ChevronRight className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronLeft className="h-3.5 w-3.5" />
                      )}
                      {panelOpen ? 'Hide' : 'Details'}
                    </Button>
                  </>
                ) : null}

                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs font-bold border-[#a08a70]/40 bg-[#a08a70]/5 hover:bg-[#a08a70]/10 text-[#a08a70] hidden md:flex uppercase tracking-tighter"
                >
                  <Link to="/builder">
                    <Sparkles className="h-3 w-3" />
                    Management
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs font-bold border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 hidden lg:flex uppercase tracking-tighter"
                >
                  <Link to="/codex">
                    <Biohazard className="h-3 w-3" />
                    The Codex
                  </Link>
                </Button>

                {/* Dropdown menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/about" className="flex items-center gap-2 cursor-pointer">
                        <Info className="h-4 w-4" />
                        About
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/roadmap" className="flex items-center gap-2 cursor-pointer">
                        <Map className="h-4 w-4" />
                        Roadmap
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/codex" className="flex items-center gap-2 cursor-pointer">
                        <Biohazard className="h-4 w-4 text-red-400" />
                        Entity Codex
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a
                        href="https://github.com/LamNz79/ruina-atlas"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <ExternalLink className="h-4 w-4" />
                        GitHub
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>

            {/* Main Content */}
            <main className="relative flex flex-1 overflow-hidden">
              <div
                className={`relative h-full w-full transition-all duration-300 ease-in-out ${panelOpen ? 'pr-[400px]' : ''
                  } max-md:pr-0`}
              >
                <LoreGraph
                  sinners={sinners}
                  edges={edges}
                  selectedSinner={selectedSinner}
                  selectedEntity={selectedEntity}
                  expandedNodeIds={expandedNodeIds}
                  onNodeClick={handleNodeClick}
                  onEntityClick={handleEntityClick}
                  onToggleExpand={toggleExpand}
                />
              </div>

              {/* Detail Panel */}
              <LorePanel
                sinner={selectedSinner}
                onClose={handleClose}
                isOpen={panelOpen}
              />

              {/* Entity Detail Panel */}
              <EntityPanel
                entityId={selectedEntity}
                onClose={() => {
                  setSelectedEntity(null);
                }}
                onEntityClick={(id) => {
                  setSelectedEntity(id);
                }}
                onSinnerClick={(id) => {
                  const found = sinners.find((s) => s.id === id);
                  if (found) {
                    setSelectedEntity(null);
                    setSelectedSinner(found);
                    setPanelOpen(true);
                  }
                }}
              />

              {/* Global Fuzzy Search */}
              <GlobalSearch
                open={searchOpen}
                onOpenChange={setSearchOpen}
                onSelect={handleSearchSelect}
              />

              {/* Source Explorer */}
              <SourceExplorer
                sourceId={activeSourceId ?? ''}
                open={!!activeSourceId}
                onClose={() => setActiveSourceId(null)}
                onSinnerClick={(id) => {
                  const found = sinners.find(s => s.id === id);
                  if (found) {
                    setSelectedEntity(null);
                    setSelectedSinner(found);
                    setPanelOpen(true);
                  }
                }}
              />
            </main>

            <footer className="flex h-8 w-full items-center justify-between border-t border-border/40 bg-background/95 px-6 text-[11px] font-medium text-muted-foreground backdrop-blur">
              <div className="flex items-center gap-4">
                <span>{sinners.length} Sinners</span>
                <span className="h-3 w-[1px] bg-border/50" />
                <span>{edges.length} Connections</span>
              </div>
              <a
                href="https://github.com/eldritchtools/limbus-shared-library"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors hover:underline"
              >
                Data: eldritchtools/limbus-shared-library
              </a>
            </footer>

            {/* M4.7 Hardware Layers */}
            <div className="terminal-overlay" />
            <div className="scanner-line" />
            <div className="noise-texture">
              <svg className="h-full w-full opacity-30 pointer-events-none">
                <filter id="noiseFilter">
                  <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch" />
                </filter>
                <rect width="100%" height="100%" filter="url(#noiseFilter)" />
              </svg>
            </div>
          </div>
        }
      />

      <Route path="/about" element={<About />} />
      <Route path="/roadmap" element={<Roadmap />} />
      <Route path="/profile/:category/:id" element={<ProfilePage />} />
      <Route path="/builder" element={<TeamBuilder />} />
      <Route path="/codex" element={<EntityCodex />} />
    </Routes>
  );
}
