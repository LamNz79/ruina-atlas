import { useState, useMemo, useCallback } from 'react';
import { sinners } from './data/sinners';
import { deriveEdges } from './utils/deriveEdges';
import { LoreGraph } from './components/LoreGraph';
import { LorePanel } from './components/LorePanel';
import type { Sinner } from './types';
import './App.css';

export default function App() {
  const [selectedSinner, setSelectedSinner] = useState<Sinner | null>(null);

  const edges = useMemo(() => deriveEdges(sinners), []);

  const handleNodeClick = useCallback((sinner: Sinner) => {
    setSelectedSinner((prev) => (prev?.id === sinner.id ? null : sinner));
  }, []);

  const handleClose = useCallback(() => {
    setSelectedSinner(null);
  }, []);

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-inner">
          <h1 className="app__title">Runia Atlas</h1>
          <p className="app__subtitle">
            Literary connections of Project Moon's universe
          </p>
        </div>
      </header>

      <div className="app__main">
        <div
          className={`app__graph-wrap ${selectedSinner ? 'app__graph-wrap--panel-open' : ''}`}
        >
          <LoreGraph
            sinners={sinners}
            edges={edges}
            selectedSinner={selectedSinner}
            onNodeClick={handleNodeClick}
          />
        </div>
        <LorePanel sinner={selectedSinner} onClose={handleClose} />
      </div>

      <footer className="app__footer">
        <span>
          {sinners.length} Sinners · {edges.length} connections
        </span>
        <a
          href="https://github.com/eldritchtools/limbus-shared-library"
          target="_blank"
          rel="noopener noreferrer"
        >
          Data: eldritchtools/limbus-shared-library
        </a>
      </footer>
    </div>
  );
}
