import { useEffect, useRef, useCallback, useState } from 'react';
import * as d3 from 'd3';
import type { Sinner, GraphEdge, EdgeType, Game, Theme } from '../types';
import { THEMES } from '../types';
import { literarySources } from '../data/literarySources';
import crossGameEntities from '../data/crossGameEntities.json';
import { GraphSettings } from './GraphSettings';
import { FilterPanel } from './FilterPanel';

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  canonicalGame: string;
  literarySourceIds: string[];
  themes: string[];
  crossGameContinuity: boolean;
  nodeType: 'sinner' | 'entity';
  entityType?: 'wing' | 'abnormality' | 'character';
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  type: EdgeType;
}

const NODE_GAME_COLORS: Record<string, string> = {
  limbus:    '#cba6f7',  // Mauve — Limbus Company (default primary)
  ruina:     '#89b4fa',  // Blue — Library of Ruina
  lobotomy:  '#fab387',  // Peach — Lobotomy Corporation
};

const ENTITY_COLORS: Record<string, string> = {
  wing:        '#94e2d5', // Teal — Wings (City infrastructure)
  abnormality:  '#f5c2e7', // Pink — Abnormalities (eldritch entities)
  character:   '#f9e2af', // Yellow — Recurring characters
};

const EDGE_COLORS: Record<EdgeType, string> = {
  'literary-origin': 'var(--edge-literary)',
  'thematic-link': 'var(--edge-theme)',
  'cross-game-continuity': 'var(--edge-crossgame)',
  'shared-literary-group': 'var(--edge-group)',
};

const EDGE_LABELS: Record<EdgeType, string> = {
  'literary-origin': 'Literary Origin',
  'thematic-link': 'Shared Theme',
  'cross-game-continuity': 'Cross-Game',
  'shared-literary-group': 'Shared Group',
};

const ALL_EDGE_TYPES: EdgeType[] = [
  'literary-origin',
  'thematic-link',
  'cross-game-continuity',
  'shared-literary-group',
];

export interface PhysicsSettings {
  nodeSpacing: number;
  repulsion: number;
  centering: number;
}

const DEFAULTS: PhysicsSettings = {
  nodeSpacing: 160,
  repulsion: -400,
  centering: 0.07,
};

interface LoreGraphProps {
  sinners: Sinner[];
  edges: GraphEdge[];
  selectedSinner: Sinner | null;
  selectedEntity: string | null;
  onNodeClick: (sinner: Sinner) => void;
  onEntityClick?: (entityId: string) => void;
}

interface FilterState {
  games: Set<Game>;
  themes: Set<Theme>;
  literarySources: Set<string>;
}

export function LoreGraph({
  sinners,
  edges,
  selectedSinner,
  selectedEntity,
  onNodeClick,
  onEntityClick,
}: LoreGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // ── Stable mutable refs — updated without triggering re-renders ─────────────
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
  const linkElsRef = useRef<d3.Selection<SVGLineElement, GraphLink, SVGGElement, unknown> | null>(null);
  const nodeElsRef = useRef<d3.Selection<SVGGElement, GraphNode, SVGGElement, unknown> | null>(null);
  const zoomGroupRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const selectedIdRef = useRef<string | null>(null);
  const selectedEntityRef = useRef<string | null>(null);
  const onNodeClickRef = useRef(onNodeClick);
  const onEntityClickRef = useRef(onEntityClick);
  const sinnersRef = useRef(sinners);
  const activeEdgeTypesRef = useRef<Set<EdgeType>>(new Set(ALL_EDGE_TYPES));
  const filtersRef = useRef<FilterState>({
    games: new Set(['limbus', 'ruina', 'lobotomy'] as Game[]),
    themes: new Set(THEMES as unknown as Theme[]),
    literarySources: new Set(literarySources.map(s => s.id)),
  });
  const entityElsRef = useRef<d3.Selection<SVGGElement, GraphNode, SVGGElement, unknown> | null>(null);

  // Keep onNodeClick ref fresh without re-render dependency
  useEffect(() => { onNodeClickRef.current = onNodeClick; }, [onNodeClick]);
  useEffect(() => { onEntityClickRef.current = onEntityClick; }, [onEntityClick]);
  useEffect(() => { sinnersRef.current = sinners; }, [sinners]);

  // Sync selected ID ref on prop change
  useEffect(() => {
    selectedIdRef.current = selectedSinner?.id ?? null;
    selectedEntityRef.current = selectedEntity;
    highlightSelected();
  }, [selectedSinner, selectedEntity]);

  const [physics, setPhysics] = useState<PhysicsSettings>(DEFAULTS);
  const [activeEdgeTypes, setActiveEdgeTypes] = useState<Set<EdgeType>>(
    new Set(ALL_EDGE_TYPES),
  );
  const [filters, setFilters] = useState<FilterState>({
    games: new Set(['limbus', 'ruina', 'lobotomy'] as Game[]),
    themes: new Set(THEMES as unknown as Theme[]),
    literarySources: new Set(literarySources.map(s => s.id)),
  });

  // ── Sync filter refs ────────────────────────────────────────────────────────
  useEffect(() => { filtersRef.current = filters; }, [filters]);

  // ── Style selected node in-place ──────────────────────────────────────────────
  const highlightSelected = useCallback(() => {
    if (!nodeElsRef.current) return;
    const selId = selectedIdRef.current;
    const selEntity = selectedEntityRef.current;
    nodeElsRef.current.each(function (d) {
      if (d.nodeType === 'sinner') {
        const isSel = d.id === selId;
        const hitSel = d3.select(this).select('.node-hit');
        hitSel
          .attr('fill', isSel ? '#f5e3d0' : NODE_GAME_COLORS[d.canonicalGame] ?? NODE_GAME_COLORS.limbus)
          .attr('stroke', isSel ? '#fab387' : 'var(--ring)')
          .attr('stroke-width', isSel ? 3 : 1.5);
        d3.select(this)
          .select('.node-ring')
          .attr('visibility', d.crossGameContinuity || isSel ? 'visible' : 'hidden')
          .attr('stroke', isSel ? '#fab387' : 'var(--edge-crossgame)');
      } else {
        // Entity diamond
        const isSel = d.id === selEntity;
        const defaultColor = ENTITY_COLORS[d.entityType ?? 'wing'] ?? ENTITY_COLORS.wing;
        d3.select(this).select('.node-hit')
          .attr('stroke', isSel ? '#f5e3d0' : defaultColor)
          .attr('stroke-width', isSel ? 3 : 2);
      }
    });
  }, []);

  // ── Apply physics changes in-place ───────────────────────────────────────────
  const applyPhysics = useCallback((p: PhysicsSettings) => {
    if (!simulationRef.current) return;
    const sim = simulationRef.current;
    const linkForce = sim.force('link') as d3.ForceLink<GraphNode, GraphLink>;
    if (linkForce) linkForce.distance(p.nodeSpacing);
    sim.force('charge', d3.forceManyBody().strength(p.repulsion));
    sim.force('center', d3.forceCenter(
      (containerRef.current?.clientWidth ?? 800) / 2,
      (containerRef.current?.clientHeight ?? 600) / 2,
    ).strength(p.centering));
    sim.alpha(0.5).restart();
  }, []);

  // ── Apply edge visibility in-place ─────────────────────────────────────────
  const applyEdgeTypes = useCallback((active: Set<EdgeType>) => {
    if (!linkElsRef.current) return;
    activeEdgeTypesRef.current = active;
    linkElsRef.current
      .attr('visibility', (d) => active.has(d.type) ? 'visible' : 'hidden');
  }, []);

  // ── Apply filter dimming in-place (sinners only — entities have no literary sources) ─
  const applyFilters = useCallback((f: FilterState) => {
    if (!nodeElsRef.current) return;
    nodeElsRef.current
      .filter((d) => d.nodeType === 'sinner')
      .each(function (d) {
        const matchGame = f.games.has(d.canonicalGame as Game);
        const matchTheme = d.themes.some(t => f.themes.has(t as Theme));
        const matchSource = d.literarySourceIds.some(id => f.literarySources.has(id));
        const visible = matchGame && matchTheme && matchSource;
        d3.select(this)
          .select('.node-hit')
          .transition().duration(200)
          .attr('opacity', visible ? 1 : 0.15);
      });
  }, []);

  // Sync edge types ref
  useEffect(() => {
    activeEdgeTypesRef.current = activeEdgeTypes;
  }, [activeEdgeTypes]);

  const toggleEdgeType = useCallback((type: EdgeType) => {
    setActiveEdgeTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  useEffect(() => { applyPhysics(physics); }, [physics, applyPhysics]);
  useEffect(() => { applyEdgeTypes(activeEdgeTypes); }, [activeEdgeTypes, applyEdgeTypes]);
  useEffect(() => { applyFilters(filters); }, [filters, applyFilters]);

  // ── Build graph once (only when sinners or edges data change) ───────────────
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    simulationRef.current?.stop();
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'edge-glow');
    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const zoomGroup = svg.append('g').attr('class', 'zoom-group');
    zoomGroupRef.current = zoomGroup;

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        zoomGroup.attr('transform', event.transform);
      });
    zoomRef.current = zoom;
    svg.call(zoom);

    // Use the mutable refs — no stale closure issues
    const active = activeEdgeTypesRef.current;
    const links: GraphLink[] = edges
      .filter((e) => active.has(e.type))
      .map((e) => ({ source: e.source, target: e.target, type: e.type }));

    const nodes: GraphNode[] = sinners.map((s) => ({
      id: s.id,
      name: s.name,
      canonicalGame: s.canonicalGame,
      literarySourceIds: s.literarySources.map((ls) => ls.id),
      themes: [...s.themes],
      crossGameContinuity: s.crossGameContinuity,
      nodeType: 'sinner' as const,
    }));

    // ── Entity nodes + entity-to-sinner edges ──────────────────────────────────
    const entityNodes: GraphNode[] = crossGameEntities.entities.map((e) => ({
      id: e.id,
      name: e.name,
      canonicalGame: e.canonicalGame,
      literarySourceIds: [],
      themes: [...e.themes],
      crossGameContinuity: false,
      nodeType: 'entity' as const,
      entityType: e.type,
    }));

    const entityLinks: GraphLink[] = crossGameEntities.entities.flatMap((e) =>
      (e.relatedSinnerIds ?? []).map((sid) => ({
        source: e.id,
        target: sid,
        type: 'cross-game-continuity' as EdgeType,
      })),
    );

    const allNodes = [...nodes, ...entityNodes];
    const allLinks = [...links, ...entityLinks];

    const simulation = d3
      .forceSimulation<GraphNode>(allNodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphLink>(allLinks)
          .id((d) => d.id)
          .distance(DEFAULTS.nodeSpacing)
          .strength(0.4),
      )
      .force('charge', d3.forceManyBody().strength(DEFAULTS.repulsion))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(DEFAULTS.centering))
      .force('collision', d3.forceCollide().radius(55));

    simulationRef.current = simulation;

    const linkGroup = zoomGroup.append('g').attr('class', 'links');
    const linkEls = linkGroup
      .selectAll<SVGLineElement, GraphLink>('line')
      .data(allLinks)
      .join('line')
      .attr('stroke', (d) => EDGE_COLORS[d.type] ?? '#f9e2af')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 1.2)
      .attr('stroke-dasharray', (d) =>
        d.type === 'cross-game-continuity' ? '6,4' : 'none',
      );
    linkElsRef.current = linkEls;

    const nodeGroup = zoomGroup.append('g').attr('class', 'nodes');
    const nodeEls = nodeGroup
      .selectAll<SVGGElement, GraphNode>('g')
      .data(allNodes)
      .join('g')
      .style('cursor', 'pointer')
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }),
      );

    // Click — use refs so it's always current (no stale closure)
    nodeEls.on('click', (_, d) => {
      if (d.nodeType === 'entity') {
        if (onEntityClickRef.current) onEntityClickRef.current(d.id);
      } else {
        const found = sinnersRef.current.find((s) => s.id === d.id);
        if (found) onNodeClickRef.current(found);
      }
    });

    nodeElsRef.current = nodeEls;

    // ── Sinner nodes: circle ─────────────────────────────────────────────────
    nodeEls
      .filter((d) => d.nodeType === 'sinner')
      .each(function (d) {
        const g = d3.select(this);
        // Hit circle
        g.append('circle')
          .attr('class', 'node-hit')
          .attr('r', d.crossGameContinuity ? 26 : 22)
          .attr('fill', NODE_GAME_COLORS[d.canonicalGame] ?? NODE_GAME_COLORS.limbus)
          .attr('stroke', 'var(--ring)')
          .attr('stroke-width', 1.5)
          .attr('stroke-opacity', 0.8);
        // Ring (cross-game only)
        if (d.crossGameContinuity) {
          g.append('circle')
            .attr('class', 'node-ring')
            .attr('r', 30)
            .attr('fill', 'none')
            .attr('stroke', 'var(--edge-crossgame)')
            .attr('stroke-width', 1)
            .attr('stroke-opacity', 0.4);
        }
        // Label
        g.append('text')
          .text(d.name)
          .attr('text-anchor', 'middle')
          .attr('dy', d.crossGameContinuity ? 42 : 38)
          .attr('font-size', '10px')
          .attr('font-weight', '500')
          .attr('fill', 'var(--text-bright)')
          .attr('font-family', 'var(--sans)')
          .attr('pointer-events', 'none');
        // Transparent hit area
        g.append('circle').attr('r', 34).attr('fill', 'transparent');
      });

    // ── Entity nodes: diamond ────────────────────────────────────────────────
    nodeEls
      .filter((d) => d.nodeType === 'entity')
      .each(function (d) {
        const g = d3.select(this);
        const size = 20;
        const color = ENTITY_COLORS[d.entityType ?? 'wing'] ?? ENTITY_COLORS.wing;
        // Diamond shape (rotated square)
        g.append('rect')
          .attr('class', 'node-hit')
          .attr('width', size)
          .attr('height', size)
          .attr('x', -size / 2)
          .attr('y', -size / 2)
          .attr('fill', 'none')
          .attr('stroke', color)
          .attr('stroke-width', 2)
          .attr('transform', 'rotate(45)');
        // Inner fill
        g.append('rect')
          .attr('width', size - 4)
          .attr('height', size - 4)
          .attr('x', -size / 2 + 2)
          .attr('y', -size / 2 + 2)
          .attr('fill', 'var(--bg-surface)')
          .attr('transform', 'rotate(45)');
        // Label
        g.append('text')
          .text(d.name)
          .attr('text-anchor', 'middle')
          .attr('dy', 34)
          .attr('font-size', '10px')
          .attr('font-weight', '500')
          .attr('fill', color)
          .attr('font-family', 'var(--sans)')
          .attr('pointer-events', 'none');
        // Transparent hit area
        g.append('rect')
          .attr('width', size + 12)
          .attr('height', size + 12)
          .attr('x', -(size + 12) / 2)
          .attr('y', -(size + 12) / 2)
          .attr('fill', 'transparent');
      });

    // ── Hover ────────────────────────────────────────────────────────────────
    nodeEls
      .on('mouseenter', function (_, hovered) {
        const connectedIds = new Set<string>();
        connectedIds.add(hovered.id);

        linkEls.each(function (d) {
          const src = (d.source as GraphNode).id;
          const tgt = (d.target as GraphNode).id;
          if (src === hovered.id || tgt === hovered.id) {
            connectedIds.add(src);
            connectedIds.add(tgt);
          }
        });

        nodeEls.each(function (d) {
          const isConn = connectedIds.has(d.id);
          // Use opacity on the group so it works for both circles (sinners) and rects (entities)
          d3.select(this)
            .transition()
            .duration(150)
            .attr('opacity', isConn ? 1 : 0.15);
        });

        linkEls
          .transition()
          .duration(150)
          .attr('stroke-opacity', 0.08)
          .attr('stroke-width', 1);

        linkEls.each(function (d) {
          const src = (d.source as GraphNode).id;
          const tgt = (d.target as GraphNode).id;
          if (src === hovered.id || tgt === hovered.id) {
            d3.select(this)
              .raise()
              .transition()
              .duration(150)
              .attr('stroke-opacity', 0.9)
              .attr('stroke-width', 2)
              .attr('filter', 'url(#edge-glow)');
          }
        });
      })
      .on('mouseleave', function () {
        nodeEls.each(function (d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 1);
        });

        linkEls
          .transition()
          .duration(200)
          .attr('stroke-opacity', 0.4)
          .attr('stroke-width', 1.2)
          .attr('filter', null);
      });

    // Initial selected state
    highlightSelected();

    simulation.on('tick', () => {
      linkEls
        .attr('x1', (d) => (d.source as GraphNode).x!)
        .attr('y1', (d) => (d.source as GraphNode).y!)
        .attr('x2', (d) => (d.target as GraphNode).x!)
        .attr('y2', (d) => (d.target as GraphNode).y!);
      nodeEls.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });
  }, [sinners, edges, highlightSelected]);

  const handleResetLayout = useCallback(() => {
    setPhysics(DEFAULTS);
  }, []);

  const handleResetZoom = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(500)
      .call(zoomRef.current.transform, d3.zoomIdentity);
  }, []);

  return (
    <div ref={containerRef} className="h-full w-full relative">
      <svg ref={svgRef} className="block w-full h-full bg-background/50" />
      <FilterPanel
        filters={filters}
        onFiltersChange={(f) => setFilters(f)}
      />
      <GraphSettings
        nodeSpacing={physics.nodeSpacing}
        repulsion={physics.repulsion}
        centering={physics.centering}
        onNodeSpacingChange={(v) => setPhysics((p) => ({ ...p, nodeSpacing: v }))}
        onRepulsionChange={(v) => setPhysics((p) => ({ ...p, repulsion: v }))}
        onCenteringChange={(v) => setPhysics((p) => ({ ...p, centering: v }))}
        activeEdgeTypes={activeEdgeTypes}
        onToggleEdgeType={toggleEdgeType}
        onResetLayout={handleResetLayout}
        onResetZoom={handleResetZoom}
      />
    </div>
  );
}

export { EDGE_COLORS, EDGE_LABELS };
export type { GraphNode, GraphLink };
