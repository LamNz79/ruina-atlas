import { TooltipProvider } from '@/components/ui/tooltip';
import * as d3 from 'd3';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import crossGameEntities from '../data/crossGameEntities.json';
import { literarySources } from '../data/literarySources';
import type { CrossGameEntity, EdgeType, GraphEdge, Sinner, Theme } from '../types';
import { FilterPanel } from './FilterPanel';
import { GraphSettings } from './GraphSettings';

import type { FilterState, GraphLink, GraphNode, PhysicsSettings } from './LoreGraphConstants';
import {
  ALL_EDGE_TYPES,
  DEFAULTS,
  EDGE_COLORS,
  ENTITY_COLORS,
  INITIAL_FILTER_STATE,
  NODE_GAME_COLORS,
  RISK_LEVEL_COLORS
} from './LoreGraphConstants';
import { calculateSharedThemes, getVisibleAncestorId } from './LoreGraphUtils';

interface LoreGraphProps {
  sinners: Sinner[];
  edges: GraphEdge[];
  selectedSinner: Sinner | null;
  selectedEntity: string | null;
  expandedNodeIds: Set<string>;
  focusNodeId?: string | null;
  onNodeClick: (sinner: Sinner) => void;
  onEntityClick: (entityId: string) => void;
  onSourceClick: (sourceId: string) => void;
  onToggleExpand: (id: string) => void;
  onPin: (node: any) => void;
  onClearFocus?: () => void;
}

export function LoreGraph({
  sinners,
  edges,
  selectedSinner,
  selectedEntity,
  expandedNodeIds,
  focusNodeId,
  onNodeClick,
  onEntityClick,
  onSourceClick,
  onToggleExpand,
  onPin,
  onClearFocus,
}: LoreGraphProps) {
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

    // 1. Filtered Entities & Derived Links
    const entityLinks: GraphLink[] = [];
    const rawEntities = crossGameEntities.entities as CrossGameEntity[];

    rawEntities.forEach(e => {
      // Parent → Child structural link
      if (e.parentEntityId) {
        entityLinks.push({
          source: e.parentEntityId, target: e.id,
          type: 'structural-hierarchy',
          label: 'Contains'
        });
      }
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
          const isMajorFaction = e.type === 'wing' || e.type === 'association' || e.type === 'finger';
          const isHub = ['entity-l-corp', 'entity-library', 'entity-limbus-company'].includes(e.id);
          const hasSinner = (e.relatedSinnerIds?.length ?? 0) > 0;
          if (isHub || hasSinner || isMajorFaction) {
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

        // Spoiler Gate: Hide entities from future Cantos
        if (e.spoilerLevel && e.spoilerLevel > filters.cantoLevel) return false;

        return true;
      });
    })();

    const entityNodes: GraphNode[] = visibleEntities.map(e => ({
      ...e, nodeType: 'entity' as const, entityType: e.type as any, themes: e.themes ?? [],
      literarySourceIds: [],
      tokenLabel: (e as any).tokenLabel,
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
    const activeId = hoverId || focusNodeId || selectedSinner?.id || selectedEntity;
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
      .attr('stroke', d => {
        const s = (d.source as any).id || d.source;
        const t = (d.target as any).id || d.target;
        if (s === activeId || t === activeId) {
          // If it's a Sinner, use their signature color for the radiating edges
          const node = graphData.nodes.find(n => n.id === activeId);
          if (node?.nodeType === 'sinner') return (node as any).signatureColor || '#b8202f';
          return EDGE_COLORS[d.type] || '#ccc';
        }
        return EDGE_COLORS[d.type] || '#ccc';
      })
      .attr('stroke-opacity', d => {
        const s = (d.source as any).id || d.source;
        const t = (d.target as any).id || d.target;
        if (s === activeId || t === activeId) return 0.9;
        if (activeId) return 0.05;
        return d.type === 'wing-affiliation' ? 0.25 : 0.4;
      })
      .attr('filter', d => {
        const s = (d.source as any).id || d.source;
        const t = (d.target as any).id || d.target;
        return (s === activeId || t === activeId) ? 'url(#edge-glow)' : null;
      });
  }, [hoverId, focusNodeId, selectedSinner, selectedEntity, graphData]);

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
    svg.on('click', (e) => {
      // Clear focus if clicking the background
      if (e.target.tagName === 'svg' && onClearFocus) {
        onClearFocus();
      }
    });

    const linksG = g.append('g').attr('class', 'links-layer');
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

    // 2. Force Simulation — Hub-and-Spoke Topography
    // Inner core: Sinners + Literary/Theological sources
    // Outer ring: Wings, Associations, Fingers (major factions)
    // Mid ring: Abnormalities, Characters, child entities

    const minDim = Math.min(width, height);

    const simulation = d3.forceSimulation<GraphNode>(graphData.nodes)
      .velocityDecay(0.6)    // high friction — damps oscillation quickly
      .alphaDecay(0.05)      // settles in ~60 ticks (fast cooling)
      .alphaMin(0.001)
      .force('link', d3.forceLink<GraphNode, GraphLink>(graphData.links)
        .id(d => d.id)
        .distance(d => {
          if (d.type === 'literary-origin') return 80 + physics.nodeSpacing * 0.1;  // rút ngắn distance
          if (d.type === 'ego-synchronization') return 75 + physics.nodeSpacing * 0.1;
          if (d.type === 'structural-hierarchy') return 140 + physics.nodeSpacing * 0.4;
          if (d.type === 'wing-affiliation') return 250 + physics.nodeSpacing * 0.5; // Fixed: was excessively large
          if (d.type === 'bridge-continuity') return 180 + physics.nodeSpacing * 0.4;
          return physics.nodeSpacing;
        })
        .strength(d => {
          if (d.type === 'wing-affiliation') return 0.05;
          if (d.type === 'ego-synchronization') return 0.45;
          if (d.type === 'literary-origin') return 0.06;  // giảm strength — để radial thắng
          if (d.type === 'structural-hierarchy') return 0.2;
          return 0.1;
        })
      )

      // Many-Body: Factions push 2.5x harder to anchor themselves as pillars
      .force('charge', d3.forceManyBody<GraphNode>().strength(d => {
        // Dùng entityType (đã resolve từ CrossGameEntity.type) — KHÔNG phải nodeType
        const isMajorFaction =
          d.entityType === 'wing' ||
          d.entityType === 'association' ||
          d.entityType === 'finger';        // "finger" = Five Fingers syndicates

        if (isMajorFaction) return physics.repulsion * 2.5;  // ≈ -7500 @ default -3000
        if (d.nodeType === 'literary-source') return physics.repulsion * 1.5;
          if (d.nodeType === 'sinner') return physics.repulsion * 0.3; // Reduce repulsion so they don't fight the circular layout
        return physics.repulsion;
      }).theta(0.85).distanceMax(500))  // tăng distanceMax: Wings ở xa cần "nghe" lực đẩy từ xa hơn

      // Soft gravity — keeps graph centered on screen
      // General centering — nhẹ, cho tất cả nodes
      .force('gravX', d3.forceX<GraphNode>(width / 2).strength(physics.centering * 0.1))
      .force('gravY', d3.forceY<GraphNode>(height / 2).strength(physics.centering * 0.1))

      // Dedicated radial distribution — chỉ cho Sinners
      // Dùng forceX/forceY theo góc để ép 13 Sinners thành vòng tròn đều
      .force('sinnerRing', (() => {
        // Tính góc đều cho mỗi Sinner theo thứ tự index
        const sinnerList = graphData.nodes.filter(n => n.nodeType === 'sinner');
        const angleMap = new Map<string, number>();
        sinnerList.forEach((s, i) => {
          angleMap.set(s.id, (2 * Math.PI * i) / sinnerList.length);
        });

        const R = 160; // target radius — khớp với forceRadial target
        const cx = width / 2;
        const cy = height / 2;

        return d3.forceX<GraphNode>(d => {
          if (d.nodeType !== 'sinner') return cx;
          const angle = angleMap.get(d.id) ?? 0;
          return cx + R * Math.cos(angle);
        }).strength(d => d.nodeType === 'sinner' ? 1.0 : 0); // Tăng strength lên 1.0 để neo chặt
      })())

      .force('sinnerRingY', (() => {
        const sinnerList = graphData.nodes.filter(n => n.nodeType === 'sinner');
        const angleMap = new Map<string, number>();
        sinnerList.forEach((s, i) => {
          angleMap.set(s.id, (2 * Math.PI * i) / sinnerList.length);
        });

        const R = 160;
        const cx = width / 2;
        const cy = height / 2;

        return d3.forceY<GraphNode>(d => {
          if (d.nodeType !== 'sinner') return cy;
          const angle = angleMap.get(d.id) ?? 0;
          return cy + R * Math.sin(angle);
        }).strength(d => d.nodeType === 'sinner' ? 1.0 : 0); // Tăng strength lên 1.0 để neo chặt
      })())

      // Radial Orbits — High-intensity hub-and-spoke engine
      .force('periphery', d3.forceRadial<GraphNode>(
        d => {
          const isMajorFaction =
            d.entityType === 'wing' ||
            d.entityType === 'association' ||
            d.entityType === 'finger';


          // Dùng absolute px thay vì nhân baseR — dễ đọc, dễ tune
          if (isMajorFaction) return 460;  // Outer ring: Wings, Assocs, Fingers (đẩy rộng thêm tí)
          if (d.nodeType === 'sinner') return 160;          // Sinners: sát tâm nhất
          if (d.nodeType === 'literary-source') return 240; // Books: vành đai trong, quanh Sinners
          return 320;                                       // Mid ring: Abnormalities, Characters (Đẩy xa hẳn khỏi nhân)
        },
        width / 2, height / 2
      ).strength(d => {
        const isMajorFaction =
          d.entityType === 'wing' ||
          d.entityType === 'association' ||
          d.entityType === 'finger';
        if (isMajorFaction) return 0.95;
        if (d.nodeType === 'sinner') return 1.0;
        if (d.nodeType === 'literary-source') return 0.85;

        return 0.7;                       // Tăng mạnh lực để Abno không bị kéo lọt vào tâm
      }))

      // Collision — prevents visual overlap, tuned per shape
      .force('collision', d3.forceCollide<GraphNode>().radius(d => {
        if (d.nodeType === 'literary-source') return 62;
        if (d.entityType === 'wing') return 52;   // Wing hex lớn nhất
        if (d.entityType === 'association') return 46;
        if (d.entityType === 'finger') return 44;
        if (d.entityType === 'abnormality') return H_R + 16;
        return S_R + 14;
      }).strength(0.95).iterations(3));  // iterations 3: tránh overlap khi Wings va nhau ở outer ring

    // ── Scatter nodes before starting so the animation is graceful ────────────
    // Without this, all nodes start at (0,0) and explode outward chaotically.
    // With scatter, they start spread out and animate INTO their final positions.
    const scatterR = Math.min(width, height) * 0.35;
    graphData.nodes.forEach((node, i) => {
      if (node.x === undefined || (node.x === 0 && node.y === 0)) {
        const angle = (2 * Math.PI * i) / graphData.nodes.length;
        node.x = width / 2 + scatterR * Math.cos(angle) * (0.6 + Math.random() * 0.5);
        node.y = height / 2 + scatterR * Math.sin(angle) * (0.6 + Math.random() * 0.5);
      }
    });

    // 3. Render Links
    const links = linksG.selectAll('path').data(graphData.links).join('path').attr('class', 'link-path')
      .attr('stroke', d => EDGE_COLORS[d.type] || '#ccc')
      .attr('stroke-width', d => {
        const count = graphData.sharedThemeCount[`${(d.source as any).id}-${(d.target as any).id}`] || 0;
        return d.type === 'literary-origin' ? 1.5 + count * 0.4 : 1.2 + count * 0.4;
      })
      .attr('data-base-width', d => {
        const count = graphData.sharedThemeCount[`${(d.source as any).id}-${(d.target as any).id}`] || 0;
        return d.type === 'literary-origin' ? 1.5 + count * 0.4 : 1.2 + count * 0.4;
      })
      .attr('stroke-dasharray', d => d.type === 'wing-affiliation' || d.type === 'ego-synchronization' || d.type === 'structural-hierarchy' ? '6,4' : 'none')
      .style('pointer-events', 'stroke');

    // Live tick — drives the animation you see
    simulation.on('tick', () => {
      linksG.selectAll('path').attr('d', (d: any) => `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`);
      nodesG.selectAll('.node-group').attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });
    // ──────────────────────────────────────────────────────────────────────────

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

        [-12, 0, 12].forEach(offset => {
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
          'kabbalah-tree-of-life': 'M12 2v20 M12 7h5 M12 12h-5 M12 17h5',
          'book-of-revelations': 'M5 3l14 0c1 0 1 1 1 1s0 1-1 1l-14 0c-1 0-1-1-1-1s0-1 1-1z M5 21l14 0c1 0 1-1 1-1s0-1-1-1l-14 0c-1 0-1 1-1 1s0 1 1 1z M12 5v14',
          'cain-and-abel': 'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0 M12 7l0 10 M7 12l10 0',
        };

        // Special premium styling for theological origins — "Golden Bough" Aesthetic
        const isTheological = sourceData?.category === 'theological';
        if (isTheological) {
          // Layer 1: Diffuse outer glow (visible halo)
          el.insert('rect', ':first-child')
            .attr('x', -BK_W / 2 - 8).attr('y', -BK_H / 2 - 8)
            .attr('width', BK_W + 16).attr('height', BK_H + 16)
            .attr('fill', 'none').attr('stroke', '#f5c518')
            .attr('stroke-width', 2).attr('opacity', 0.5)
            .attr('rx', 4)
            .style('filter', 'blur(6px)');

          // Layer 2: Crisp outer frame (double-frame effect)
          el.insert('rect', ':nth-child(2)')
            .attr('x', -BK_W / 2 - 4).attr('y', -BK_H / 2 - 4)
            .attr('width', BK_W + 8).attr('height', BK_H + 8)
            .attr('fill', 'none').attr('stroke', '#f5c518')
            .attr('stroke-width', 1.2).attr('opacity', 0.7)
            .attr('rx', 3)
            .attr('stroke-dasharray', '4 2');

          // Layer 3: Upgrade inner card border
          el.select('.node-hit')
            .attr('stroke', '#f5c518')
            .attr('stroke-width', 2.5)
            .style('filter', 'drop-shadow(0 0 8px rgba(245,197,24,0.4))');

          // Corner accents (decorative gilded corners)
          const cx = BK_W / 2 + 1, cy = BK_H / 2 + 1;
          [[-cx, -cy], [cx, -cy], [cx, cy], [-cx, cy]].forEach(([x, y]) => {
            el.append('circle')
              .attr('cx', x).attr('cy', y)
              .attr('r', 2.5)
              .attr('fill', '#f5c518')
              .attr('opacity', 0.6);
          });
        }

        const path = iconPaths[sourceId] || 'M12 6.253v13c-2.5-1.7-6.5-1.7-9 0v-13c2.5-1.7 6.5-1.7 9 0z M12 6.253c2.5-1.7 6.5-1.7 9 0v13c-2.5-1.7-6.5-1.7-9 0';

        // Icon: theological gets brighter gold, literary gets muted gold
        el.append('path')
          .attr('d', path)
          .attr('transform', `translate(${-12}, ${-12}) scale(1)`)
          .attr('fill', isTheological ? 'rgba(245,197,24,0.15)' : 'none')
          .attr('stroke', isTheological ? '#f5c518' : '#d4af37')
          .attr('stroke-width', isTheological ? 2 : 1.5)
          .attr('opacity', isTheological ? 1 : 0.8)
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

        } else if (d.entityType === 'abnormality') {
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

        } else if (d.entityType === 'association') {
          // Diamond for Associations
          const dR = H_R;
          el.append('path').attr('class', 'node-hit')
            .attr('d', `M0 -${dR} L${dR} 0 L0 ${dR} L-${dR} 0 Z`)
            .attr('fill', '#0c0c0e').attr('stroke', '#d4af37').attr('stroke-width', 2);

          el.append('text').text(d.name.split(' ')[0].charAt(0))
            .attr('text-anchor', 'middle').attr('dy', '0.35em')
            .attr('fill', '#d4af37').attr('font-size', '16px').attr('font-weight', '900')
            .attr('font-family', 'serif');

        } else if (d.entityType === 'finger') {
          // Triangle for Fingers (Syndicates) - Sharp & Grimy
          const tR = H_R;
          const fingerColor = '#9333ea'; // Purple/Crimson Syndicate feel

          el.append('path').attr('class', 'node-hit finger-node')
            .attr('d', `M0 -${tR} L${tR} ${tR} L-${tR} ${tR} Z`)
            .attr('fill', '#080809').attr('stroke', fingerColor).attr('stroke-width', 2.5);

          // Kanji/Han character from Confucian Virtues
          el.append('text').attr('class', 'finger-virtue')
            .text((d as any).tokenLabel || '?')
            .attr('text-anchor', 'middle').attr('dy', '0.65em')
            .attr('fill', '#e2e8f0').attr('font-size', '16px').attr('font-weight', '900')
            .attr('font-family', '"Noto Serif SC", "Source Han Serif", serif')
            .style('filter', 'drop-shadow(0 0 5px rgba(147, 51, 234, 0.5))');

        } else if (d.entityType === 'character') {
          // Circle for characters like Binah
          el.append('circle').attr('class', 'node-hit')
            .attr('r', H_R - 2).attr('fill', '#0a0a0c').attr('stroke', '#0ea5e9').attr('stroke-width', 2);
        } else {
          // Fallback shape (syndicates, facilities, etc.)
          el.append('circle').attr('class', 'node-hit')
            .attr('r', H_R).attr('fill', '#0c0c0e').attr('stroke', '#888').attr('stroke-width', 1.8);
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
    }); // End nodeGroups.each

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
        onNodeClick(sinners.find(s => s.id === d.id)!);
      } else if (d.nodeType === 'literary-source') {
        onSourceClick(d.id.replace('lit-', ''));
      } else {
        if (d.entityType === 'wing' && onToggleExpand) {
          onToggleExpand(d.id);
        }
        onEntityClick(d.id);
      }
    }).on('contextmenu', (e, d) => {
      e.preventDefault();
      onPin(d);
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
