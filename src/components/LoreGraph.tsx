import { useEffect, useRef, useCallback, useState } from 'react';
import * as d3 from 'd3';
import type { Sinner, GraphEdge, EdgeType, Game, Theme } from '../types';
import { THEMES, THEME_META } from '../types';
import { literarySources } from '../data/literarySources';
import crossGameEntities from '../data/crossGameEntities.json';
import { GraphSettings } from './GraphSettings';
import { FilterPanel } from './FilterPanel';
import { TooltipProvider } from '@/components/ui/tooltip';

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  canonicalGame: string;
  literarySourceIds: string[];
  themes: string[];
  crossGameContinuity: boolean;
  nodeType: 'sinner' | 'entity';
  entityType?: 'wing' | 'abnormality' | 'character';
  icon?: string;
  connectionCount?: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  type: EdgeType;
  label?: string;
}

const NODE_GAME_COLORS: Record<string, string> = {
  limbus:    '#b8202f',  // Deep Crimson — Limbus Company (Sinners are the heart)
  ruina:     '#a08a70',  // Warm Bronze — Library of Ruina
  lobotomy:  '#7a5c3a',  // Dark Bronze — Lobotomy Corporation
};

const ENTITY_COLORS: Record<string, string> = {
  wing:        '#a08a70', // Warm Bronze — Wings (City infrastructure)
  abnormality:  '#8a4a5a', // Muted Crimson — Abnormalities (eldritch entities)
  character:   '#f5c518', // Electric Gold — Recurring characters (shine brightest)
};

const EDGE_COLORS: Record<EdgeType, string> = {
  'literary-origin': 'var(--edge-literary)',
  'thematic-link': 'var(--edge-theme)',
  'cross-game-continuity': 'var(--edge-crossgame)',
  'shared-literary-group': 'var(--edge-group)',
  'wing-affiliation': '#a08a70', // Warm Bronze — Wings (identity availability via Mirror Dungeon)
};

const EDGE_LABELS: Record<EdgeType, string> = {
  'literary-origin': 'Literary Origin',
  'thematic-link': 'Shared Theme',
  'cross-game-continuity': 'Cross-Game',
  'shared-literary-group': 'Shared Group',
  'wing-affiliation': 'Wing Affiliation',
};

const ALL_EDGE_TYPES: EdgeType[] = [
  'literary-origin',
  'thematic-link',
  'cross-game-continuity',
  'shared-literary-group',
  'wing-affiliation',
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
  const [tooltip, setTooltip] = useState<{ visible: boolean; type: 'node' | 'edge'; name: string; game?: string; themes?: string[]; literarySources?: string[]; x: number; y: number }>({ visible: false, type: 'node', name: '', x: 0, y: 0 });

  // True when user has narrowed at least one filter category from "all"
  const allGamesSelected = filters.games.size === (['limbus', 'ruina', 'lobotomy'] as Game[]).length;
  const allThemesSelected = filters.themes.size === (THEMES as unknown as Theme[]).length;
  const allSourcesSelected = filters.literarySources.size === literarySources.length;
  const isFiltering = !allGamesSelected || !allThemesSelected || !allSourcesSelected;

  // True when NO sinners would match the current filters
  const hasVisibleSinner = sinners.some((s) => {
    const matchGame = filters.games.has(s.canonicalGame as Game);
    const matchTheme = s.themes.some((t) => filters.themes.has(t as Theme));
    const matchSource = s.literarySources.some((ls) => filters.literarySources.has(ls.id));
    return matchGame && matchTheme && matchSource;
  });
  const showEmptyHint = isFiltering && !hasVisibleSinner;

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
          .attr('fill', isSel ? '#e8e0d5' : NODE_GAME_COLORS[d.canonicalGame] ?? NODE_GAME_COLORS.limbus)
          .attr('stroke', isSel ? '#f5c518' : 'var(--ring)')
          .attr('stroke-width', isSel ? 3 : 1.5);
        d3.select(this)
          .select('.node-ring')
          .attr('visibility', d.crossGameContinuity || isSel ? 'visible' : 'hidden')
          .attr('stroke', isSel ? '#f5c518' : 'var(--edge-crossgame)');
      } else {
        // Entity diamond
        const isSel = d.id === selEntity;
        const defaultColor = ENTITY_COLORS[d.entityType ?? 'wing'] ?? ENTITY_COLORS.wing;
        d3.select(this).select('.node-hit')
          .attr('stroke', isSel ? '#f5c518' : defaultColor)
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

  // ── Apply filter dimming in-place (sinners only — entities always visible) ─
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
        // Reveal entity labels when zoomed in enough
        const scale = event.transform.k;
        const labelOpacity = scale >= 0.6 ? 1 : 0;
        zoomGroup.selectAll('.node-label').attr('opacity', labelOpacity);
      });
    zoomRef.current = zoom;
    svg.call(zoom);

    // Use the mutable refs — no stale closure issues
    const active = activeEdgeTypesRef.current;
    const links: GraphLink[] = edges
      .filter((e) => active.has(e.type))
      .map((e) => ({ source: e.source, target: e.target, type: e.type }));

    // ── Entity-to-sinner edges ────────────────────────────────────────────────
    const entityLinks: GraphLink[] = crossGameEntities.entities.flatMap((e) =>
      (e.relatedSinnerIds ?? []).map((sid) => ({
        source: e.id,
        target: sid,
        type: (e.type === 'wing')
          ? ('wing-affiliation' as EdgeType)
          : ('cross-game-continuity' as EdgeType),
        label: e.name,
      })),
    );

    // ── Count connections per node ──────────────────────────────────────────
    const connectionCount: Record<string, number> = {};
    for (const link of edges) {
      connectionCount[link.source] = (connectionCount[link.source] ?? 0) + 1;
      connectionCount[link.target] = (connectionCount[link.target] ?? 0) + 1;
    }
    for (const link of entityLinks) {
      connectionCount[link.source as string] = (connectionCount[link.source as string] ?? 0) + 1;
      connectionCount[link.target as string] = (connectionCount[link.target as string] ?? 0) + 1;
    }

    // ── Build sinner nodes ──────────────────────────────────────────────────
    const nodes: GraphNode[] = sinners.map((s) => ({
      id: s.id,
      name: s.name,
      canonicalGame: s.canonicalGame,
      literarySourceIds: s.literarySources.map((ls) => ls.id),
      themes: [...s.themes],
      crossGameContinuity: s.crossGameContinuity,
      nodeType: 'sinner' as const,
      connectionCount: connectionCount[s.id] ?? 0,
      // Lock Dante at center
      x: s.id === 'dante' ? width / 2 : undefined,
      y: s.id === 'dante' ? height / 2 : undefined,
      fx: s.id === 'dante' ? width / 2 : undefined,
      fy: s.id === 'dante' ? height / 2 : undefined,
    }));

    // ── Entity nodes ──────────────────────────────────────────────────────────
    const entityNodes: GraphNode[] = crossGameEntities.entities.map((e) => ({
      id: e.id,
      name: e.name,
      canonicalGame: e.canonicalGame,
      literarySourceIds: [],
      themes: [...e.themes],
      crossGameContinuity: false,
      nodeType: 'entity' as const,
      entityType: e.type as 'character' | 'wing' | 'abnormality',
      icon: e.icon,
      connectionCount: connectionCount[e.id] ?? 0,
    }));

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
      .attr('stroke-opacity', (d) =>
        (d.type === 'cross-game-continuity' || d.type === 'wing-affiliation') ? 0.2 : 0.4,
      )
      .attr('stroke-width', 1.2)
      .attr('stroke-dasharray', (d) =>
        (d.type === 'cross-game-continuity' || d.type === 'wing-affiliation') ? '6,4' : 'none',
      )
      .style('cursor', (d) => d.label ? 'pointer' : 'default')
      .on('mouseenter', function (event, d) {
        if (d.label) {
          const rect = containerRef.current!.getBoundingClientRect();
          setTooltip({ visible: true, type: 'edge', name: d.label, x: event.clientX - rect.left, y: event.clientY - rect.top });
        }
      })
      .on('mousemove', function (event) {
        const rect = containerRef.current!.getBoundingClientRect();
        setTooltip((t) => ({ ...t, x: event.clientX - rect.left, y: event.clientY - rect.top }));
      })
      .on('mouseleave', function () {
        setTooltip((t) => ({ ...t, visible: false }));
      });
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
        // Label — always visible
        g.append('text')
          .attr('class', 'sinner-label')
          .text(d.name)
          .attr('text-anchor', 'middle')
          .attr('dy', d.crossGameContinuity ? 42 : 38)
          .attr('font-size', '10px')
          .attr('font-weight', '500')
          .attr('fill', 'var(--text-bright)')
          .attr('font-family', 'Space Grotesk, monospace')
          .attr('pointer-events', 'none')
          .attr('opacity', 1);
        // Connection count badge
        const count = d.connectionCount ?? 0;
        if (count > 0) {
          const r = d.crossGameContinuity ? 26 : 22;
          g.append('text')
            .attr('class', 'conn-badge')
            .text(count > 9 ? '9+' : String(count))
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('x', r * 0.65)
            .attr('y', -r * 0.65)
            .attr('font-size', '8px')
            .attr('font-weight', '700')
            .attr('font-family', 'Space Grotesk, monospace')
            .attr('fill', 'var(--gold)')
            .attr('stroke', 'var(--bg-surface)')
            .attr('stroke-width', '2px')
            .attr('paint-order', 'stroke')
            .attr('pointer-events', 'none');
        }
        // Transparent hit area
        g.append('circle').attr('r', 34).attr('fill', 'transparent');
      });

    // ── Entity nodes: shape by type ────────────────────────────────────────────
    nodeEls
      .filter((d) => d.nodeType === 'entity')
      .each(function (d) {
        const g = d3.select(this);
        const entityType = d.entityType ?? 'wing';
        const color = ENTITY_COLORS[entityType] ?? ENTITY_COLORS.wing;

        if (d.icon && entityType !== 'character') {
          // Icon image node — label hidden (icon is label)
          const size = 36;
          g.append('image')
            .attr('class', 'node-hit')
            .attr('href', d.icon)
            .attr('width', size)
            .attr('height', size)
            .attr('x', -size / 2)
            .attr('y', -size / 2)
            .attr('preserveAspectRatio', 'xMidYMid meet');
          g.append('rect')
            .attr('width', size + 12)
            .attr('height', size + 12)
            .attr('x', -(size + 12) / 2)
            .attr('y', -(size + 12) / 2)
            .attr('fill', 'transparent');
        } else {
          const shapeGroup = g.append('g').attr('class', 'node-shape');

          if (entityType === 'abnormality') {
            // Hexagon — 6-sided polygon
            const r = 18;
            const hexPoints = Array.from({ length: 6 }, (_, i) => {
              const angle = (Math.PI / 3) * i - Math.PI / 6;
              return `${r * Math.cos(angle)},${r * Math.sin(angle)}`;
            }).join(' ');
            shapeGroup
              .append('polygon')
              .attr('class', 'node-hit')
              .attr('points', hexPoints)
              .attr('fill', 'var(--bg-surface)')
              .attr('stroke', color)
              .attr('stroke-width', 2);
          } else if (entityType === 'character') {
            // Square — character entity (Angela, Ayin, Gebura)
            const size = 20;
            shapeGroup
              .append('rect')
              .attr('class', 'node-hit')
              .attr('width', size)
              .attr('height', size)
              .attr('x', -size / 2)
              .attr('y', -size / 2)
              .attr('fill', 'var(--bg-surface)')
              .attr('stroke', color)
              .attr('stroke-width', 2);
          } else {
            // Diamond — Wings (default for other/unknown)
            const size = 20;
            shapeGroup
              .append('rect')
              .attr('class', 'node-hit')
              .attr('width', size)
              .attr('height', size)
              .attr('x', -size / 2)
              .attr('y', -size / 2)
              .attr('fill', 'var(--bg-surface)')
              .attr('stroke', color)
              .attr('stroke-width', 2)
              .attr('transform', 'rotate(45)');
          }

          // Invisible hit area
          g.append('rect')
            .attr('width', 48)
            .attr('height', 48)
            .attr('x', -24)
            .attr('y', -24)
            .attr('fill', 'transparent');
        }

        // Label — zoom-threshold reveal (show when zoom >= 0.6)
        g.append('text')
          .attr('class', 'node-label')
          .text(d.name)
          .attr('text-anchor', 'middle')
          .attr('dy', d.icon ? 34 : 36)
          .attr('font-size', '10px')
          .attr('font-weight', '500')
          .attr('fill', color)
          .attr('font-family', 'Space Grotesk, monospace')
          .attr('pointer-events', 'none')
          .attr('opacity', 'var(--label-opacity, 0)');
      });

    // ── Hover ────────────────────────────────────────────────────────────────
    nodeEls
      .on('mouseenter', function (event, hovered) {
        const rect = containerRef.current!.getBoundingClientRect();
        if (hovered.nodeType === 'sinner') {
          // Find the actual sinner to get literary source names
          const sinner = sinners.find(s => s.id === hovered.id);
          const topSources = sinner?.literarySources.slice(0, 2).map(ls => ls.id) ?? [];
          setTooltip({
            visible: true,
            type: 'node',
            name: hovered.name,
            game: hovered.canonicalGame,
            themes: hovered.themes.slice(0, 2),
            literarySources: topSources,
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          });
        } else {
          setTooltip({
            visible: true,
            type: 'node',
            name: hovered.name,
            game: undefined,
            themes: hovered.themes.slice(0, 2),
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          });
        }

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
        setTooltip((t) => ({ ...t, visible: false }));
        nodeEls.each(function () {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 1);
        });

        linkEls
          .transition()
          .duration(200)
          .attr('stroke-opacity', (d) => (d.type === 'cross-game-continuity' || d.type === 'wing-affiliation') ? 0.2 : 0.4)
          .attr('stroke-width', 1.2)
          .attr('filter', null);

        // Restore selected node highlight (in case mouseleave reset it)
        highlightSelected();
      });

    // Initial selected state
    highlightSelected();

    // Unpin Dante after layout settles (only once — not on physics resets)
    let danteUnpinned = false;
    simulation.on('end', () => {
      if (!danteUnpinned) {
        danteUnpinned = true;
        allNodes.forEach((n) => { if (n.id === 'dante') { n.fx = null; n.fy = null; } });
      }
    });

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
    <TooltipProvider>
    <div ref={containerRef} className="h-full w-full relative">
      <svg ref={svgRef} className="block w-full h-full bg-background/50" />

      {/* Hover tooltip */}
      {tooltip.visible && (
        <div
          className="absolute pointer-events-none z-50"
          style={{ left: tooltip.x + 14, top: tooltip.y - 28 }}
        >
          {tooltip.type === 'edge' ? (
            <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-card/95 px-3 py-1.5 shadow-xl backdrop-blur-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-edge-crossgame" />
              <span className="text-xs font-semibold text-foreground">{tooltip.name}</span>
            </div>
          ) : (
            <div className="space-y-1.5 rounded-lg border border-border/80 bg-card/95 px-3 py-2 shadow-xl backdrop-blur-sm min-w-[140px]">
              <p className="text-sm font-bold text-foreground leading-tight">{tooltip.name}</p>
              {tooltip.game && (
                <div className="flex items-center gap-1.5">
                  <div
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: NODE_GAME_COLORS[tooltip.game] ?? '#888' }}
                  />
                  <span className="text-[10px] font-medium text-muted-foreground capitalize">{tooltip.game}</span>
                </div>
              )}
              {tooltip.literarySources && tooltip.literarySources.length > 0 && (
                <div className="space-y-0.5">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60">Sources</p>
                  <p className="text-[10px] text-muted-foreground/80 leading-tight">
                    {tooltip.literarySources.map(id => {
                      const src = literarySources.find(s => s.id === id);
                      return src?.title ?? id;
                    }).join(' · ')}
                  </p>
                </div>
              )}
              {tooltip.themes && tooltip.themes.length > 0 && (
                <p className="text-[10px] text-muted-foreground/70">
                  {tooltip.themes.map(t => THEME_META[t as Theme]?.label ?? t.replace('-', ' ')).join(' · ')}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty filter state hint */}
      {showEmptyHint && (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
          <div className="rounded-xl border border-border/50 bg-card/80 px-6 py-4 text-center shadow-xl backdrop-blur-sm">
            <p className="text-sm font-semibold text-foreground">No nodes match current filters</p>
            <p className="mt-1 text-xs text-muted-foreground">Try widening your selection in the filter panel</p>
          </div>
        </div>
      )}

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
    </TooltipProvider>
  );
}

export { EDGE_COLORS, EDGE_LABELS };
export type { GraphNode, GraphLink };
