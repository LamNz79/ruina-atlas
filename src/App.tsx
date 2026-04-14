import { useState, useMemo, useCallback } from 'react';
import { sinners } from './data/sinners';
import { deriveEdges } from './utils/deriveEdges';
import { LoreGraph, EDGE_COLORS, EDGE_LABELS } from './components/LoreGraph';
import { LorePanel } from './components/LorePanel';
import type { Sinner, EdgeType } from './types';
import './App.css';

const ALL_EDGE_TYPES: EdgeType[] = [
  'literary-origin',
  'thematic-link',
  'cross-game-continuity',
];

export default function App() {
  const [selectedSinner, setSelectedSinner] = useState<Sinner | null>(null);
  const [activeEdgeTypes, setActiveEdgeTypes] = useState<Set<EdgeType>>(
    new Set(ALL_EDGE_TYPES)
  );

  const edges = useMemo(() => deriveEdges(sinners), []);

  const handleNodeClick = useCallback((sinner: Sinner) => {
    setSelectedSinner((prev) => (prev?.id === sinner.id ? null : sinner));
  }, []);

  const handleClose = useCallback(() => {
    setSelectedSinner(null);
  }, []);

  const toggleEdgeType = (type: EdgeType) => {
    setActiveEdgeTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

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

      <div className="app__legend">
        <span className="app__legend-label">Edges:</span>
        {ALL_EDGE_TYPES.map((type) => (
          <button
            key={type}
            className={`app__legend-btn ${activeEdgeTypes.has(type) ? 'app__legend-btn--active' : ''}`}
            onClick={() => toggleEdgeType(type)}
            aria-pressed={activeEdgeTypes.has(type)}
            style={{ '--edge-color': EDGE_COLORS[type] } as React.CSSProperties}
          >
            <span
              className="app__legend-swatch"
              style={{ backgroundColor: EDGE_COLORS[type] }}
            />
            {EDGE_LABELS[type]}
          </button>
        ))}
        <span className="app__legend-hint">Click a node to explore</span>
      </div>

      <div className="app__main">
        <div
          className={`app__graph-wrap ${selectedSinner ? 'app__graph-wrap--panel-open' : ''}`}
        >
          <LoreGraph
            sinners={sinners}
            edges={edges}
            selectedSinner={selectedSinner}
            onNodeClick={handleNodeClick}
            activeEdgeTypes={activeEdgeTypes}
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
