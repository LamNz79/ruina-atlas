import { useState, useMemo, useCallback } from 'react';
import { sinners } from './data/sinners';
import { deriveEdges } from './utils/deriveEdges';
import { LoreGraph } from './components/LoreGraph';
import { LorePanel } from './components/LorePanel';
import { EntityPanel } from './components/EntityPanel';
import type { Sinner } from './types';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
    setSelectedSinner(null);
  }, []);

  const handleEntityClick = useCallback((entityId: string) => {
    setSelectedEntity(entityId);
  }, []);

  return (
    <div className="dark flex h-screen w-full flex-col overflow-hidden bg-background font-sans text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-border/40 bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-baseline gap-4">
          <h1 className="text-lg font-bold tracking-tight text-foreground">Runia Atlas</h1>
          <p className="hidden text-xs font-medium text-muted-foreground sm:block">
            Literary connections of Project Moon's universe
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedSinner && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPanelOpen((o) => !o)}
              className="h-8 gap-1.5 text-xs font-medium"
            >
              {panelOpen ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
              {panelOpen ? 'Hide' : 'Details'}
            </Button>
          )}
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
            setSelectedSinner(null);
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
  );
}
