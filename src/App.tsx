import { useState, useMemo, useCallback } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { sinners } from './data/sinners';
import { deriveEdges } from './utils/deriveEdges';
import { LoreGraph } from './components/LoreGraph';
import { LorePanel } from './components/LorePanel';
import { EntityPanel } from './components/EntityPanel';
import About from './pages/About';
import type { Sinner } from './types';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Menu, ExternalLink, Info } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import logoSvg from '../public/favicon.svg';
import './index.css';

export default function App() {
  const [selectedSinner, setSelectedSinner] = useState<Sinner | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const edges = useMemo(() => deriveEdges(sinners), []);

  const handleNodeClick = useCallback((sinner: Sinner) => {
    setSelectedSinner((prev) => (prev?.id === sinner.id ? null : sinner));
    setPanelOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setPanelOpen(false);
  }, []);

  const handleEntityClick = useCallback((entityId: string) => {
    setSelectedEntity(entityId);
  }, []);

  return (
    <Routes>
      {/* Graph route — the main app */}
      <Route
        path="/"
        element={
          <div className="dark flex h-screen w-full flex-col overflow-hidden bg-background font-sans text-foreground">
            {/* Header */}
            <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-border/40 bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <Link to="/" className="flex items-center gap-3 no-underline">
                <img
                  src={logoSvg}
                  alt="Ruina Atlas"
                  className="h-8 w-8 object-contain"
                />
                <div className="flex flex-col">
                  <h1 className="text-lg font-bold tracking-tight text-foreground leading-none">
                    Ruina Atlas
                  </h1>
                  <p className="hidden text-[10px] font-medium text-muted-foreground sm:block leading-none mt-0.5">
                    Literary connections of Project Moon's universe
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-2">
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
                className={`relative h-full w-full transition-all duration-300 ease-in-out ${
                  panelOpen ? 'pr-[400px]' : ''
                } max-md:pr-0`}
              >
                <LoreGraph
                  sinners={sinners}
                  edges={edges}
                  selectedSinner={selectedSinner}
                  selectedEntity={selectedEntity}
                  onNodeClick={handleNodeClick}
                  onEntityClick={handleEntityClick}
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
                onSinnerClick={(id) => {
                  const found = sinners.find((s) => s.id === id);
                  if (found) {
                    setSelectedEntity(null);
                    setSelectedSinner(found);
                    setPanelOpen(true);
                  }
                }}
              />
            </main>

            {/* Footer */}
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
          </div>
        }
      />

      {/* About page */}
      <Route path="/about" element={<About />} />
    </Routes>
  );
}
