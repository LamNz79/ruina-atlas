import { useState, useRef, useEffect } from 'react';
import type { EdgeType } from '../types';
import './GraphSettings.css';

interface GraphSettingsProps {
  nodeSpacing: number;
  repulsion: number;
  centering: number;
  onNodeSpacingChange: (v: number) => void;
  onRepulsionChange: (v: number) => void;
  onCenteringChange: (v: number) => void;
  activeEdgeTypes: Set<EdgeType>;
  onToggleEdgeType: (type: EdgeType) => void;
  onResetLayout: () => void;
  onResetZoom: () => void;
}

const EDGE_COLORS: Record<EdgeType, string> = {
  'literary-origin': '#f5c2e7',
  'thematic-link': '#89b4fa',
  'cross-game-continuity': '#f9e2af',
  'shared-literary-group': '#a6e3a1',
};

const EDGE_LABELS: Record<EdgeType, string> = {
  'literary-origin': 'Literary origin',
  'thematic-link': 'Shared theme',
  'cross-game-continuity': 'Cross-game',
  'shared-literary-group': 'Shared group',
};

const EDGE_TYPES: EdgeType[] = [
  'literary-origin',
  'thematic-link',
  'cross-game-continuity',
  'shared-literary-group',
];

export function GraphSettings({
  nodeSpacing,
  repulsion,
  centering,
  onNodeSpacingChange,
  onRepulsionChange,
  onCenteringChange,
  activeEdgeTypes,
  onToggleEdgeType,
  onResetLayout,
  onResetZoom,
}: GraphSettingsProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const sliderStyle = (fill: number) =>
    ({
      '--fill': `${fill}%`,
    }) as React.CSSProperties;

  return (
    <div className="graph-settings" ref={panelRef}>
      {/* Collapse / expand toggle */}
      <button
        className={`graph-settings__toggle ${open ? 'graph-settings__toggle--open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle graph settings"
      >
        <svg
          className="graph-settings__toggle-icon"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
          <path d="M22 12a10 10 0 0 1-20 0" />
          <path d="M2 12a10 10 0 0 0 20 0" />
        </svg>
        <span>Graph</span>
        <svg
          className="graph-settings__chevron"
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {open ? (
            <polyline points="18 15 12 9 6 15" />
          ) : (
            <polyline points="6 9 12 15 18 9" />
          )}
        </svg>
      </button>

      {/* Panel body */}
      <div className={`graph-settings__panel ${open ? 'graph-settings__panel--open' : ''}`}>
        <div className="graph-settings__section">
          <div className="graph-settings__section-label">Physics</div>

          <div className="graph-settings__slider-row">
            <div className="graph-settings__slider-header">
              <span className="graph-settings__slider-label">Spacing</span>
              <span className="graph-settings__slider-value">{nodeSpacing}</span>
            </div>
            <input
              type="range"
              min="80"
              max="350"
              step="10"
              value={nodeSpacing}
              onChange={(e) => onNodeSpacingChange(Number(e.target.value))}
              className="graph-settings__slider"
              style={sliderStyle(((nodeSpacing - 80) / 270) * 100)}
            />
          </div>

          <div className="graph-settings__slider-row">
            <div className="graph-settings__slider-header">
              <span className="graph-settings__slider-label">Repulsion</span>
              <span className="graph-settings__slider-value">{Math.abs(repulsion)}</span>
            </div>
            <input
              type="range"
              min="100"
              max="1000"
              step="50"
              value={Math.abs(repulsion)}
              onChange={(e) => onRepulsionChange(-Number(e.target.value))}
              className="graph-settings__slider"
              style={sliderStyle(((Math.abs(repulsion) - 100) / 900) * 100)}
            />
          </div>

          <div className="graph-settings__slider-row">
            <div className="graph-settings__slider-header">
              <span className="graph-settings__slider-label">Centering</span>
              <span className="graph-settings__slider-value">{centering.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.15"
              step="0.01"
              value={centering}
              onChange={(e) => onCenteringChange(Number(e.target.value))}
              className="graph-settings__slider"
              style={sliderStyle(((centering - 0.01) / 0.14) * 100)}
            />
          </div>
        </div>

        <div className="graph-settings__divider" />

        <div className="graph-settings__section">
          <div className="graph-settings__section-label">Edges</div>

          {EDGE_TYPES.map((type) => (
            <label key={type} className="graph-settings__toggle-row">
              <span
                className="graph-settings__edge-dot"
                style={{ backgroundColor: EDGE_COLORS[type] }}
              />
              <span className="graph-settings__edge-label">{EDGE_LABELS[type]}</span>
              <div
                className={`graph-settings__switch ${activeEdgeTypes.has(type) ? 'graph-settings__switch--on' : ''}`}
                onClick={() => onToggleEdgeType(type)}
                role="switch"
                aria-checked={activeEdgeTypes.has(type)}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onToggleEdgeType(type)}
              >
                <div className="graph-settings__switch-thumb" />
              </div>
            </label>
          ))}
        </div>

        <div className="graph-settings__divider" />

        <div className="graph-settings__section">
          <div className="graph-settings__section-label">Reset</div>
          <div className="graph-settings__btn-row">
            <button className="graph-settings__btn" onClick={onResetLayout}>
              Reset layout
            </button>
            <button className="graph-settings__btn" onClick={onResetZoom}>
              Reset zoom
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
