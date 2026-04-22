import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as d3 from 'd3';
import type { Sinner, GraphEdge, Game, Theme, CrossGameEntity, EdgeType } from '../types';
import { THEMES, THEME_META } from '../types';
import { literarySources } from '../data/literarySources';
import crossGameEntities from '../data/crossGameEntities.json';
import { GraphSettings } from './GraphSettings';
import { FilterPanel } from './FilterPanel';
import { TooltipProvider } from '@/components/ui/tooltip';

import { getVisibleAncestorId, calculateSharedThemes } from './LoreGraphUtils';
import type { GraphNode, GraphLink, PhysicsSettings, FilterState } from './LoreGraphConstants';
import {
  DEFAULTS, INITIAL_FILTER_STATE, ALL_EDGE_TYPES, EDGE_COLORS, NODE_GAME_COLORS,
  ENTITY_COLORS, RISK_LEVEL_COLORS, EDGE_LABELS
} from './LoreGraphConstants';

interface LoreGraphProps {
  sinners: Sinner[];
  edges: GraphEdge[];
  selectedSinner: Sinner | null;
  selectedEntity: string | null;
  expandedNodeIds: Set<string>;
  onNodeClick: (sinner: Sinner) => void;
  onEntityClick: (entityId: string) => void;
  onSourceClick: (sourceId: string) => void;
  onToggleExpand: (id: string) => void;
}

export function LoreGraph({
  sinners,
  edges,
  selectedSinner,
  selectedEntity,
  expandedNodeIds,
  onNodeClick,
  onEntityClick,
  onSourceClick,
  onToggleExpand,
}: LoreGraphProps) {
  const navigate = useNavigate();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // --- UI State ---
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [physics, setPhysics] = useState<PhysicsSettings>(DEFAULTS);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER_STATE);
  const [activeEdgeTypes, setActiveEdgeTypes] = useState<Set<EdgeType>>(new Set(ALL_EDGE_TYPES.filter(t => t !== 'thematic-link')));
  const [tooltip, setTooltip] = useState<any>({ visible: false, type: 'node', name: '', x: 0, y: 0 });

  // --- Data Processing ---
  const graphData = useMemo(() => {
    const width = containerRef.current?.clientWidth ?? 1200;
    const height = containerRef.current?.clientHeight ?? 800;

    // 1. Filtered Entities & Derived Links
    const entityLinks: GraphLink[] = [];
    const rawEntities = crossGameEntities.entities as CrossGameEntity[];

    rawEntities.forEach(e => {
      if (e.relatedSinnerIds) {
        e.relatedSinnerIds.forEach(sid => {
          entityLinks.push({
            source: e.id, target: sid,
            type: e.type === 'abnormality' ? 'ego-synchronization' : 'wing-affiliation',
            label: 'Resonance'
          });
        });
      }
      if ((e as any).relatedEntityIds) {
        (e as any).relatedEntityIds.forEach((rid: string) => {
          entityLinks.push({
            source: e.id, target: rid,
            type: (e.type === 'character') ? 'bridge-continuity' : 'structural-hierarchy',
            label: 'Shift'
          });
        });
      }
    });

    const connectionCount: Record<string, number> = {};
    [...edges, ...entityLinks].forEach(l => {
      if (l.type === 'literary-origin') {
        const s = typeof l.source === 'string' ? l.source : (l.source as any).id;
        const t = typeof l.target === 'string' ? l.target : (l.target as any).id;
        connectionCount[s] = (connectionCount[s] ?? 0) + 1;
        connectionCount[t] = (connectionCount[t] ?? 0) + 1;
      }
    });

    // 2. Node Generation with Visibility Filtering
    const sinnerNodes: GraphNode[] = sinners.filter(s => {
      if (!s.themes.some(t => filters.themes.has(t as Theme))) return false;
      return true;
    }).map(s => ({
      ...s, id: s.id, literarySourceIds: s.literarySources.map(ls => ls.id), themes: [...s.themes],
      nodeType: 'sinner', connectionCount: connectionCount[s.id] ?? 0,
      // Do NOT fix Dante — fixing it pulls all connected sinners to the same point
    }));

    const visibleEntities = (() => {
      if (!filters.showArchiveNodes) return [];
      const visible = new Set<string>();
      
      // First pass: identify root-level visible nodes
      rawEntities.forEach(e => {
        if (!e.parentEntityId) {
          const isHub = ['entity-l-corp', 'entity-library', 'entity-limbus-company'].includes(e.id);
          const hasSinner = (e.relatedSinnerIds?.length ?? 0) > 0;
          if (isHub || hasSinner) {
            visible.add(e.id);
          }
        }
      });

      // Second pass: recursively add children if parent is visible AND expanded
      let changed = true;
      while (changed) {
        changed = false;
        rawEntities.forEach(e => {
          if (e.parentEntityId && !visible.has(e.id) && visible.has(e.parentEntityId) && expandedNodeIds.has(e.parentEntityId)) {
            visible.add(e.id);
            changed = true;
          }
        });
      }

      return rawEntities.filter(e => {
        if (!visible.has(e.id)) return false;
        if (e.themes && e.themes.length > 0 && !e.themes.some(t => filters.themes.has(t as Theme))) return false;
        return true;
      });
    })();

    const entityNodes: GraphNode[] = visibleEntities.map(e => ({
      ...e, nodeType: 'entity' as const, entityType: e.type as any, themes: e.themes ?? [],
      literarySourceIds: [],
      connectionCount: connectionCount[e.id] ?? 0,
      crossGameContinuity: e.appearances ? e.appearances.includes('lobotomy') && e.appearances.includes('ruina') : false,
    } as GraphNode));

    const usedLitIds = new Set(sinnerNodes.flatMap(s => s.literarySourceIds));
    const litNodes: GraphNode[] = literarySources.filter(ls => usedLitIds.has(ls.id)).map(ls => ({
      id: `lit-${ls.id}`, name: sinners.some(s => s.name === ls.title) ? `${ls.title} (Book)` : ls.title,
      canonicalGame: 'limbus' as any, literarySourceIds: [ls.id], themes: ls.themes ?? [],
      nodeType: 'literary-source', connectionCount: 0,
      crossGameContinuity: false,
    }));

    const allNodes = [...sinnerNodes, ...entityNodes, ...litNodes];
    const nodeMap = new Map<string, GraphNode>(allNodes.map(n => [n.id, n]));

    // 3. Link Redirection & Filtering
    const allLinks = [...edges, ...entityLinks].map(l => {
      const s = typeof l.source === 'string' ? l.source : (l.source as any).id;
      const t = typeof l.target === 'string' ? l.target : (l.target as any).id;
      const newS = nodeMap.has(s) ? s : getVisibleAncestorId(s, rawEntities, nodeMap);
      const newT = nodeMap.has(t) ? t : getVisibleAncestorId(t, rawEntities, nodeMap);
      return { ...l, source: newS, target: newT };
    }).filter(l => l.source !== l.target && nodeMap.has(l.source as string) && nodeMap.has(l.target as string) && activeEdgeTypes.has(l.type));

    return { nodes: allNodes, links: allLinks, sharedThemeCount: calculateSharedThemes(allLinks as any, nodeMap) };
  }, [sinners, edges, expandedNodeIds, filters, activeEdgeTypes]);

  // --- Highlighting Logic ---
  const applyHighlights = useCallback(() => {
    if (!svgRef.current) return;
    const activeId = hoverId || selectedSinner?.id || selectedEntity;
    const connectedIds = new Set<string>();

    if (activeId) {
      connectedIds.add(activeId);
      graphData.links.forEach(l => {
        const s = (l.source as any).id || l.source;
        const t = (l.target as any).id || l.target;
        if (s === activeId || t === activeId) { connectedIds.add(s); connectedIds.add(t); }
      });
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll<SVGGElement, GraphNode>('.node-group').transition().duration(200)
      .attr('opacity', d => !activeId || connectedIds.has(d.id) ? 1 : 0.15);

    svg.selectAll<SVGPathElement, GraphLink>('.link-path').transition().duration(200)
      .attr('stroke-opacity', d => {
        const s = (d.source as any).id || d.source;
        const t = (d.target as any).id || d.target;
        if (s === activeId || t === activeId) return 0.8;
        if (activeId) return 0.05;
        return d.type === 'wing-affiliation' ? 0.25 : 0.4;
      })
      .attr('filter', d => {
        const s = (d.source as any).id || d.source;
        const t = (d.target as any).id || d.target;
        return (s === activeId || t === activeId) ? 'url(#edge-glow)' : null;
      });
  }, [hoverId, selectedSinner, selectedEntity, graphData]);

  // --- D3 Simulation & Rendering ---
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // 0. Definitions (Glows, Gradients, Filters)
    const defs = svg.append('defs');

    // Glow Filter
    const glow = defs.append('filter').attr('id', 'glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    glow.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur');
    const merge = glow.append('feMerge');
    merge.append('feMergeNode').attr('in', 'coloredBlur');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Edge Glow Filter
    const edgeGlow = defs.append('filter').attr('id', 'edge-glow');
    edgeGlow.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'blur');
    edgeGlow.append('feComposite').attr('in', 'SourceGraphic').attr('in2', 'blur').attr('operator', 'over');

    // Hexagon ClipPath
    defs.append('clipPath').attr('id', 'hexagon-clip')
      .append('path').attr('d', 'M20,0 L37.32,10 L37.32,30 L20,40 L2.68,30 L2.68,10 Z');

    // 1. Container setup with Scanline Overlay
    const mainContainer = svg.append('g').attr('class', 'main-container');
    const g = mainContainer.append('g').attr('class', 'zoom-group');
    const linksG = g.append('g').attr('class', 'links');
    const nodesG = g.append('g').attr('class', 'nodes');

    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.1, 4]).on('zoom', (e) => g.attr('transform', e.transform));
    svg.call(zoom);
    zoomRef.current = zoom;

    // ─── Size tokens (must match rendering constants below) ───────────────────
    const S_R = 26;   // sinner circle circumradius
    const H_R = 28;   // abnormality hex circumradius
    const W_R = 42;   // wing hex circumradius (1.5x larger)
    const BK_W = 52;   // book card width
    const BK_H = 68;   // book card height

    // 2. Force Simulation — all three physics sliders are wired here
    // In your simulation setup, replace the force configuration:

    const simulation = d3.forceSimulation<GraphNode>(graphData.nodes)
      .velocityDecay(0.6)    // high friction — nodes stop quickly once near final position
      .alphaDecay(0.05)      // settles in ~60 ticks (fast cooling)
      .alphaMin(0.001)
      .force('link', d3.forceLink<GraphNode, GraphLink>(graphData.links)
        .id(d => d.id)
        .distance(d => {
          // Generous distances so nodes have room to breathe
          if (d.type === 'literary-origin')      return 110 + physics.nodeSpacing * 0.2;
          if (d.type === 'ego-synchronization')  return 75 + physics.nodeSpacing * 0.1; // Tight satellite orbit
          if (d.type === 'structural-hierarchy') return 140 + physics.nodeSpacing * 0.4;
          if (d.type === 'wing-affiliation')     return Math.max(width, height) * 0.44;
          if (d.type === 'bridge-continuity')    return 180 + physics.nodeSpacing * 0.4;
          return physics.nodeSpacing;
        })
        // Keep link strength LOW — repulsion must win so nodes spread out
        .strength(d => {
          if (d.type === 'wing-affiliation')     return 0.03;
          if (d.type === 'ego-synchronization')  return 0.45; // Stronger satellite pull
          if (d.type === 'literary-origin')      return 0.12;
          if (d.type === 'structural-hierarchy') return 0.2;
          return 0.1;
        })
      )
      .force('charge', d3.forceManyBody<GraphNode>().strength(d => {
        let str = physics.repulsion;            // default -3000
        if (d.nodeType === 'literary-source')   str *= 1.5;
        if (d.nodeType === 'sinner')            str *= 1.3; // sinners push each other hard
        if (d.entityType === 'wing')            str *= 2.5;
        return str;
      }).theta(0.85).distanceMax(900))

      // Soft gravity — keeps graph on screen without collapsing it
      .force('gravX', d3.forceX<GraphNode>(width  / 2).strength(physics.centering * 0.25))
      .force('gravY', d3.forceY<GraphNode>(height / 2).strength(physics.centering * 0.25))

      // Sinners orbit a mid-radius ring so they spread around the center
      .force('sinnerRing', d3.forceRadial<GraphNode>(
        d => d.nodeType === 'sinner' ? Math.min(width, height) * 0.30 : 0,
        width / 2, height / 2
      ).strength(d => d.nodeType === 'sinner' ? 0.12 : 0))

      // Wing entities pushed to canvas edge
      .force('periphery', d3.forceRadial<GraphNode>(
        d => d.entityType === 'wing' ? Math.max(width, height) * 0.46 : 0,
        width / 2, height / 2
      ).strength(0.45))

      // Collision — prevents visual overlap
      .force('collision', d3.forceCollide<GraphNode>().radius(d => {
        if (d.nodeType === 'literary-source') return BK_W / 2 + 20;
        if (d.entityType === 'wing')          return W_R + 24;
        if (d.entityType === 'abnormality')   return H_R + 18;
        return S_R + 16;
      }).strength(0.9).iterations(3));

    // ── Scatter nodes before starting so the animation is graceful ────────────
    // Without this, all nodes start at (0,0) and explode outward chaotically.
    // With scatter, they start spread out and animate INTO their final positions.
    const scatterR = Math.min(width, height) * 0.35;
    graphData.nodes.forEach((node, i) => {
      if (node.x === undefined || (node.x === 0 && node.y === 0)) {
        const angle = (2 * Math.PI * i) / graphData.nodes.length;
        node.x = width  / 2 + scatterR * Math.cos(angle) * (0.6 + Math.random() * 0.5);
        node.y = height / 2 + scatterR * Math.sin(angle) * (0.6 + Math.random() * 0.5);
      }
    });

    // Live tick — drives the animation you see
    simulation.on('tick', () => {
      linksG.selectAll('path').attr('d', (d: any) => `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`);
      nodesG.selectAll('.node-group').attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });
    // ──────────────────────────────────────────────────────────────────────────



    // 3. Render Links
    const links = linksG.selectAll('path').data(graphData.links).join('path').attr('class', 'link-path')
      .attr('stroke', d => EDGE_COLORS[d.type] || '#ccc')
      .attr('stroke-width', d => {
        const count = graphData.sharedThemeCount[`${(d.source as any).id}-${(d.target as any).id}`] || 0;
        return d.type === 'literary-origin' ? 1.5 + count * 0.4 : 1.2 + count * 0.4;
      })
      .attr('stroke-dasharray', d => d.type === 'wing-affiliation' || d.type === 'ego-synchronization' || d.type === 'structural-hierarchy' ? '6,4' : 'none')
      .style('pointer-events', 'stroke');

    // Add CSS Animation for dashed links
    svg.append('style').text(`
      @keyframes dash-flow { to { stroke-dashoffset: -20; } }
      .link-path[stroke-dasharray="6,4"] { animation: dash-flow 1.5s linear infinite; }
      .node-group { transition: opacity 0.2s ease; }
      .node-group[data-entity-type="wing"]:hover .node-hit { 
        filter: drop-shadow(0 0 8px var(--wing-neon)) brightness(1.2);
        stroke-width: 3;
      }
      .node-hit { transition: stroke 0.3s cubic-bezier(0.4, 0, 0.2, 1), stroke-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), filter 0.3s ease; }
      .scanline-overlay { pointer-events: none; opacity: 0.05; background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06)); background-size: 100% 4px, 3px 100%; }
    `);

    // 4. Render Nodes
    const nodeGroups = nodesG.selectAll('.node-group').data(graphData.nodes).join('g')
      .attr('class', 'node-group')
      .attr('data-node-type', d => d.nodeType)
      .attr('data-entity-type', d => d.entityType || 'none')
      .call(d3.drag<SVGGElement, GraphNode>()
        .on('start', (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on('end', (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }));

    // Node Shapes & Aesthetics  (S_R / H_R / BK_W / BK_H defined above with simulation)
    // Pointy-top hexagon path centered on (0,0)
    const makeHexPath = (r: number) => {
      const pts: [number, number][] = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        return [r * Math.cos(a), r * Math.sin(a)];
      });
      return `M${pts.map(p => p.join(',')).join('L')}Z`;
    };
    const hexPath = makeHexPath(H_R);
    const wingHexPath = makeHexPath(W_R);

    nodeGroups.each(function (d) {
      const el = d3.select(this);
      const color = d.nodeType === 'sinner'
        ? NODE_GAME_COLORS[d.canonicalGame]
        : ENTITY_COLORS[d.entityType || 'character'];

      if (d.nodeType === 'literary-source') {
        const sourceId = d.id.replace('lit-', '');
        const sourceData = literarySources.find(ls => ls.id === sourceId);

        // Book card — centered on origin
        el.append('rect').attr('class', 'node-hit')
          .attr('x', -BK_W / 2).attr('y', -BK_H / 2)
          .attr('width', BK_W).attr('height', BK_H)
          .attr('rx', 2)
          .attr('fill', '#0c0c0e')
          .attr('stroke', '#d4af37')
          .attr('stroke-width', 1.8)
          .style('filter', 'drop-shadow(0 0 10px rgba(0,0,0,0.5))');

        // Background Cover Preview (Monochrome/Darkened)
        if (sourceData?.coverImage) {
          el.append('image')
            .attr('href', sourceData.coverImage)
            .attr('x', -BK_W / 2 + 1).attr('y', -BK_H / 2 + 1)
            .attr('width', BK_W - 2).attr('height', BK_H - 2)
            .attr('preserveAspectRatio', 'xMidYMid slice')
            .attr('class', 'book-cover-preview')
            .style('filter', 'grayscale(100%) brightness(15%)')
            .style('opacity', 0.6);
        }

        // Binding Decorators (Gáy sách)
        const bX = -BK_W / 2 + 5;
        el.append('line')
          .attr('x1', bX).attr('y1', -BK_H / 2 + 2)
          .attr('x2', bX).attr('y2', BK_H / 2 - 2)
          .attr('stroke', '#d4af37').attr('stroke-width', 1).attr('opacity', 0.4);
        
        [ -12, 0, 12 ].forEach(offset => {
          el.append('line')
            .attr('x1', -BK_W / 2 + 1).attr('y1', offset)
            .attr('x2', bX).attr('y2', offset)
            .attr('stroke', '#d4af37').attr('stroke-width', 0.8).attr('opacity', 0.3);
        });

        // Vector Icon
        const iconPaths: Record<string, string> = {
          'divine-comedy': 'M12 2l-4 4 4 4 4-4-4-4z M12 22v-8', 
          'moby-dick': 'M12 5v14 M5 12h14 M12 19c-3.866 0-7-3.134-7-7',
          'the-wings': 'M3 10c0-1.657 1.343-3 3-3s3 1.343 3 3v4h4v-4c0-1.657 1.343-3 3-3s3 1.343 3 3',
          'faust-goethe': 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M4 4.5A2.5 2.5 0 0 1 6.5 7H20 M4 4.5v15',
          'don-quixote': 'M14.5 4l-10 10 M3 21l18-18',
          'the-metamorphosis': 'M12 3v18 M6 8h12 M6 12h12 M6 16h12',
          'the-stranger': 'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0 M12 9v4',
          'dream-of-the-red-chamber': 'M6 3h12l3 6-9 12-9-12z',
          'crime-and-punishment': 'M12 3l-8 12h16z M12 15v6',
          'wuthering-heights': 'M4 12c0 4 3 7 7 7s7-3 7-7 M12 2v10',
          'demian': 'M12 22c5 0 9-4 9-9s-4-9-9-9-9 4-9 9 4 9 9 9z',
          'odyssey': 'M3 11l18-1 1 2H2l1-1z M12 10V3L4 10z',
        };

        const path = iconPaths[sourceId] || 'M12 6.253v13c-2.5-1.7-6.5-1.7-9 0v-13c2.5-1.7 6.5-1.7 9 0z M12 6.253c2.5-1.7 6.5-1.7 9 0v13c-2.5-1.7-6.5-1.7-9 0';
        
        el.append('path')
          .attr('d', path)
          .attr('transform', `translate(${-12}, ${-12}) scale(1)`)
          .attr('fill', 'none').attr('stroke', '#d4af37').attr('stroke-width', 1.5)
          .attr('opacity', 0.8)
          .style('pointer-events', 'none');

      } else if (d.nodeType === 'entity') {
        if (d.entityType === 'wing') {
          // Sharp Metallic/Neon Hex for Wings
          const wingColor = d.id === 'wing-n-corp' ? '#e2e8f0' : // Steel for N Corp
                            d.id === 'wing-w-corp' ? '#60a5fa' : // Blue for W Corp
                            d.id === 'wing-k-corp' ? '#34d399' : // Green for K Corp
                            d.id === 'wing-t-corp' ? '#fbbf24' : // Gold for T Corp
                            color;
          
          el.style('--wing-neon', wingColor);

          el.append('path').attr('class', 'node-hit')
            .attr('d', wingHexPath)
            .attr('fill', '#080809').attr('stroke', wingColor).attr('stroke-width', 2.5)
            .attr('stroke-linejoin', 'miter');
          
          // Outer "Circuit" frame
          el.append('path')
            .attr('d', makeHexPath(W_R + 4))
            .attr('fill', 'none').attr('stroke', wingColor).attr('stroke-width', 0.5).attr('opacity', 0.3);
          
          // Typography/Logo placeholder
          const logoText = d.name.split(' ')[0].charAt(0); // "N", "W", etc.
          el.append('text').text(logoText)
            .attr('text-anchor', 'middle').attr('dy', '0.35em')
            .attr('fill', wingColor).attr('font-size', '20px').attr('font-weight', '900')
            .attr('font-family', 'monospace').attr('opacity', 0.8);
            
        } else {
          // Abnormality Hex
          const riskColor = d.riskLevel ? RISK_LEVEL_COLORS[d.riskLevel] : '#8a4a5a';
          
          // 1. Ghostly Outer Glow (Risk-specific blurred aura)
          el.append('path').attr('class', 'abnormality-glow')
            .attr('d', hexPath)
            .attr('fill', 'none').attr('stroke', riskColor).attr('stroke-width', 10)
            .attr('opacity', 0.25).style('filter', 'blur(6px)');

          // 2. Main Hex Frame
          el.append('path').attr('class', 'node-hit')
            .attr('d', hexPath)
            .attr('fill', '#0a0a0c').attr('stroke', riskColor).attr('stroke-width', 1.8);
          
          // 3. Subject Number (Revealed on hover)
          el.append('text').attr('class', 'subject-number')
            .text(d.subjectNumber || '?-??-??')
            .attr('text-anchor', 'middle').attr('dy', '0.35em')
            .attr('fill', riskColor).attr('font-size', '9px').attr('font-weight', '900')
            .attr('font-family', 'monospace')
            .style('opacity', 0).style('pointer-events', 'none');

          // 4. "Cognitohazard Suppressed" Censored Label
          const censG = el.append('g').attr('class', 'censored-overlay');
          censG.append('rect')
            .attr('x', -24).attr('y', -7)
            .attr('width', 48).attr('height', 14)
            .attr('fill', '#000').attr('stroke', '#e11d48').attr('stroke-width', 1);
          
          censG.append('text').attr('dy', '0.35em').attr('text-anchor', 'middle')
            .attr('fill', '#e11d48').attr('font-size', '4.5px').attr('font-weight', '900')
            .attr('letter-spacing', '0.5px')
            .text('COGNITOHAZARD SUPPRESSED');
        }

      } else if (d.nodeType === 'sinner') {
        const s = d as any;
        const sigColor = s.signatureColor || '#b8202f';
        const sNum = s.sinnerNumber || '??';

        // 1. Signature Inner Glow
        el.append('circle').attr('class', 'node-glow')
          .attr('r', S_R + 8).attr('fill', sigColor).attr('opacity', 0.12).style('filter', 'blur(6px)');
        
        // 2. Dash-array Radar Ring (Red Limbus core)
        el.append('circle').attr('class', 'radar-ring')
          .attr('r', S_R + 4).attr('fill', 'none').attr('stroke', '#b8202f')
          .attr('stroke-width', 1).attr('stroke-dasharray', '3,4')
          .style('opacity', 0.5);

        // 3. Main Circular Frame
        el.append('circle').attr('class', 'node-hit')
          .attr('r', S_R).attr('fill', '#0c0c0e').attr('stroke', sigColor).attr('stroke-width', 2);

        // 4. Sinner Number (Visible by default)
        el.append('text').attr('class', 'sinner-number')
          .text(sNum)
          .attr('text-anchor', 'middle').attr('dy', '0.35em')
          .attr('fill', sigColor).attr('font-size', '14px').attr('font-weight', '900')
          .attr('font-family', 'monospace')
          .style('text-shadow', `0 0 5px ${sigColor}44`)
          .style('pointer-events', 'none');

        // 5. Personal Emblem (Visible on hover)
        if (s.emblemPath) {
          el.append('path').attr('class', 'sinner-emblem')
            .attr('d', s.emblemPath)
            .attr('transform', `translate(-12, -12) scale(1)`)
            .attr('fill', 'none').attr('stroke', sigColor).attr('stroke-width', 1.5)
            .attr('stroke-linecap', 'round').attr('stroke-linejoin', 'round')
            .style('opacity', 0).style('pointer-events', 'none');
        }
      }

      if (d.icon) {
        const iSize = d.nodeType === 'sinner' ? (S_R - 5) * 2 : (H_R - 6) * 2;
        el.append('image').attr('href', d.icon)
          .attr('x', -iSize / 2).attr('y', -iSize / 2)
          .attr('width', iSize).attr('height', iSize);
      }
    });

    // Labels — anchored to shape's actual bottom edge
    nodeGroups.append('text').text(d => d.name)
      .attr('dy', d => {
        if (d.nodeType === 'literary-source') return BK_H / 2 + 13;
        if (d.entityType === 'wing') return W_R + 15;
        if (d.nodeType === 'entity') return H_R + 13;
        return S_R + 13;
      })
      .attr('text-anchor', 'middle').attr('fill', '#e8e0d5')
      .attr('font-size', '11px').attr('font-weight', '600').attr('letter-spacing', '0.5px')
      .style('text-shadow', '0 2px 4px rgba(0,0,0,0.8)');

    // 5. Interactions
    nodeGroups.on('click', (e, d) => {
      e.stopPropagation();
      if (d.nodeType === 'sinner') {
        // Sinners have no children — don't toggle expand (it rebuilds the simulation)
        onNodeClick(sinners.find(s => s.id === d.id)!);
      } else if (d.nodeType === 'literary-source') {
        onSourceClick(d.id.replace('lit-', ''));
      } else {
        // Entity node — toggle expanded state
        onEntityClick(d.id);
      }
    }).on('mouseenter', (event, d) => {
      setHoverId(d.id);
      const rect = containerRef.current!.getBoundingClientRect();
      setTooltip({ visible: true, type: 'node', name: d.name, game: d.canonicalGame, themes: d.themes, x: event.clientX - rect.left, y: event.clientY - rect.top });
    }).on('mouseleave', () => {
      setHoverId(null);
      setTooltip(t => ({ ...t, visible: false }));
    });

    simulationRef.current = simulation;
    applyHighlights();
  }, [graphData, physics]);

  useEffect(() => { applyHighlights(); }, [applyHighlights]);

  // Zoom to selection
  useEffect(() => {
    const targetId = selectedSinner?.id || selectedEntity;
    if (!targetId || !simulationRef.current || !zoomRef.current || !svgRef.current || !containerRef.current) return;

    // Defer long enough to outlast any graphData-triggered simulation rebuild
    const timer = setTimeout(() => {
      if (!simulationRef.current || !zoomRef.current || !svgRef.current || !containerRef.current) return;
      const node = simulationRef.current.nodes().find(n => n.id === targetId);
      if (!node || typeof node.x !== 'number' || typeof node.y !== 'number') return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      const scale = 1.6; // zoom level when focused

      // Correct order: translate the node to the viewport center, THEN scale around that center.
      // d3.zoomIdentity builds left-to-right:  translate(cx, cy) · scale(k) · translate(-nx, -ny)
      const transform = d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(scale)
        .translate(-node.x, -node.y);

      d3.select(svgRef.current)
        .transition()
        .duration(750)
        .ease(d3.easeCubicInOut)
        .call(zoomRef.current.transform, transform);
    }, 250); // 250ms: outlasts a D3 rebuild (~16ms) + React re-render cycle

    return () => clearTimeout(timer);
  }, [selectedSinner, selectedEntity]);

  return (
    <TooltipProvider>
      <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-[#050506] font-sans selection:bg-bronze/30">
        {/* Scanline Overlay */}
        <div className="scanline-overlay absolute inset-0 z-10" />

        <svg ref={svgRef} className="h-full w-full" />

        {/* Tooltip */}
        {tooltip.visible && (
          <div className="absolute z-50 pointer-events-none p-0 bg-transparent border-none"
            style={{ left: tooltip.x + 20, top: tooltip.y }}>
            <div className="relative group p-3 bg-black/90 border border-bronze/50 rounded-sm backdrop-blur-xl shadow-[0_0_20px_rgba(0,0,0,0.8)] overflow-hidden">
              {/* Status Bar */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-bronze/50 overflow-hidden">
                <div className="w-1/3 h-full bg-bronze animate-[scan_2s_linear_infinite]" />
              </div>
              <div className="text-[10px] font-mono text-bronze/60 tracking-tighter mb-1">DATA_STREAM::CONNECTED</div>
              <div className="text-sm font-bold text-[#e8e0d5] uppercase tracking-wider mb-0.5">{tooltip.name}</div>
              <div className="text-[9px] text-muted-foreground uppercase tracking-widest border-b border-white/10 pb-1 mb-2">{tooltip.game}</div>

              {tooltip.themes?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tooltip.themes.slice(0, 4).map((t: string) => (
                    <span key={t} className="px-1.5 py-0.5 bg-bronze/10 border border-bronze/20 text-[8px] text-bronze uppercase font-mono">{t}</span>
                  ))}
                </div>
              )}

              {/* Subtle corner decor */}
              <div className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-bronze/30" />
            </div>
          </div>
        )}

        <FilterPanel filters={filters} onFiltersChange={setFilters} />
        <GraphSettings
          {...physics}
          activeEdgeTypes={activeEdgeTypes}
          onToggleEdgeType={t => setActiveEdgeTypes(prev => {
            const next = new Set(prev);
            if (next.has(t)) next.delete(t); else next.add(t);
            return next;
          })}
          onNodeSpacingChange={v => setPhysics(p => ({ ...p, nodeSpacing: v }))}
          onRepulsionChange={v => setPhysics(p => ({ ...p, repulsion: v }))}
          onCenteringChange={v => setPhysics(p => ({ ...p, centering: v }))}
          onResetLayout={() => setPhysics(DEFAULTS)}
          onResetZoom={() => svgRef.current && zoomRef.current && d3.select(svgRef.current).transition().duration(500).call(zoomRef.current.transform, d3.zoomIdentity)}
        />

        {/* Global Styles for Animations */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes scan { from { transform: translateX(-100%); } to { transform: translateX(300%); } }
        ` }} />
      </div>
    </TooltipProvider>
  );
}
