import { useMemo } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal, type SankeyNode, type SankeyLink } from 'd3-sankey';
import { sinners } from '../data/sinners';
import crossGameEntities from '../data/crossGameEntities.json';

// --- Types ---
interface CustomNode {
  id: string;
  name: string;
  game: 'lobotomy' | 'ruina' | 'limbus' | 'other';
}

interface CustomLink {
  source: string;
  target: string;
  value: number;
}

// Map Sephirah to their respective Library Floors
const SEPHIRAH_FLOOR_MAP: Record<string, string> = {
  'entity-malkuth': 'Floor of History',
  'entity-yesod': 'Floor of Tech. Sciences',
  'entity-hod': 'Floor of Literature',
  'entity-netzach': 'Floor of Art',
  'entity-tiphereth': 'Floor of Natural Sciences',
  'entity-gebura': 'Floor of Language',
  'entity-chesed': 'Floor of Social Sciences',
  'entity-binah': 'Floor of Philosophy',
  'entity-hokma': 'Floor of Religion',
  'entity-keter': 'Floor of General Works'
};

export default function TrilogySankey() {
  const entities = crossGameEntities.entities;

  const data = useMemo(() => {
    const nodes: CustomNode[] = [];
    const links: CustomLink[] = [];
    const nodeSet = new Set<string>();

    const addNode = (id: string, name: string, game: CustomNode['game']) => {
      if (!nodeSet.has(id)) {
        nodes.push({ id, name, game });
        nodeSet.add(id);
      }
    };

    const addLink = (source: string, target: string, value: number) => {
      if (source === target) return;
      links.push({ source, target, value });
    };

    // 1. Root: The Seed of Light Project
    addNode('seed-of-light', 'Seed of Light', 'lobotomy');
    addNode('entity-l-corp', 'Lobotomy Corporation', 'lobotomy');
    addNode('entity-library', 'Library of Ruina', 'ruina');
    addNode('entity-limbus-company', 'Limbus Company', 'limbus');

    addLink('seed-of-light', 'entity-l-corp', 100);
    addLink('entity-l-corp', 'entity-library', 80);
    addLink('entity-library', 'entity-limbus-company', 80);

    // 2. The Core Actors (Ayin & Angela)
    addNode('entity-ayin', 'Ayin', 'lobotomy');
    addNode('entity-angela', 'Angela', 'ruina');
    addLink('entity-ayin', 'seed-of-light', 50);
    addLink('seed-of-light', 'entity-angela', 40);
    addLink('entity-angela', 'entity-library', 60);

    // 3. Lobotomy Departments -> Sephirah -> Library Floors
    const departments = [
      { id: 'dept-control', name: 'Control Team', sephirah: 'entity-malkuth' },
      { id: 'dept-info', name: 'Information Team', sephirah: 'entity-yesod' },
      { id: 'dept-training', name: 'Training Team', sephirah: 'entity-hod' },
      { id: 'dept-safety', name: 'Safety Team', sephirah: 'entity-netzach' },
      { id: 'dept-central', name: 'Central Command', sephirah: 'entity-tiphereth' },
      { id: 'dept-welfare', name: 'Welfare Team', sephirah: 'entity-gebura' },
      { id: 'dept-disciplinary', name: 'Disciplinary Team', sephirah: 'entity-chesed' },
      { id: 'dept-extraction', name: 'Extraction Team', sephirah: 'entity-binah' },
      { id: 'dept-record', name: 'Records Team', sephirah: 'entity-hokma' },
      { id: 'dept-architecture', name: 'Architecture Team', sephirah: 'entity-angela' } // Nối Architecture vào Angela
    ];

    departments.forEach(dept => {
      addNode(dept.id, dept.name, 'lobotomy');
      addLink('entity-l-corp', dept.id, 15);
      
      const s = entities.find(e => e.id === dept.sephirah) || { id: dept.sephirah, name: dept.sephirah.replace('entity-', '') };
      addNode(s.id, s.name, 'lobotomy');
      addLink(dept.id, s.id, 12);

      // Sephirah -> Floors
      const floorName = SEPHIRAH_FLOOR_MAP[s.id];
      if (floorName) {
        const floorId = `floor-${floorName.toLowerCase().replace(/\s+/g, '-')}`;
        addNode(floorId, floorName, 'ruina');
        addLink(s.id, floorId, 10);
        addLink(floorId, 'entity-library', 10);
      } else if (s.id === 'entity-angela') {
          // Special case for Angela/Architecture
          addLink('entity-angela', 'entity-library', 10);
      }
    });

    // 4. External Wings (Tributaries to Limbus)
    const externalWings = entities.filter(e => e.type === 'wing' && e.id.startsWith('wing-'));
    externalWings.forEach(w => {
        addNode(w.id, w.name, 'limbus');
        addLink(w.id, 'entity-limbus-company', 20);
    });

    // 5. Limbus Company Departments (LCCA, LCCB, LCD, LCB)
    addNode('dept-lcca', 'LCCA (Aftercare)', 'limbus');
    addNode('dept-lccb', 'LCCB (Beforecare)', 'limbus');
    addNode('dept-lcd', 'LCD (Detection)', 'limbus');
    addNode('dept-lcb', 'LCB (Bus - Mephistopheles)', 'limbus');

    addLink('entity-limbus-company', 'dept-lcca', 15);
    addLink('entity-limbus-company', 'dept-lccb', 15);
    addLink('entity-limbus-company', 'dept-lcd', 15);
    addLink('entity-limbus-company', 'dept-lcb', 40);

    // 6. Sinners (End points of the current flow)
    sinners.forEach(s => {
      addNode(s.id, s.name, 'limbus');
      addLink('dept-lcb', s.id, 15);
    });

    return { nodes, links };
  }, [entities]);

  const width = 1200;
  const height = 1000;

  const { nodes, links } = useMemo(() => {
    const sankeyGen = sankey<CustomNode, CustomLink>()
      .nodeId(d => d.id)
      .nodeWidth(20)
      .nodePadding(15)
      .extent([[50, 50], [width - 50, height - 50]]);

    // d3-sankey can work directly with string IDs if .nodeId() is provided.
    // We just need to make sure the objects are clones to avoid mutation issues.
    const graphNodes = data.nodes.map(d => ({ ...d }));
    const nodeSet = new Set(graphNodes.map(n => n.id));

    const graphLinks = data.links
      .filter(l => nodeSet.has(l.source) && nodeSet.has(l.target))
      .map(d => ({ ...d }));

    return sankeyGen({ nodes: graphNodes as any, links: graphLinks as any });
  }, [data]);

  const colorScale = (game: CustomNode['game']) => {
    switch (game) {
      case 'lobotomy': return '#7a5c3a';
      case 'ruina': return '#a08a70';
      case 'limbus': return '#b8202f';
      default: return '#4a5568';
    }
  };

  return (
    <div className="w-full h-full bg-[#050506] p-8 overflow-auto">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-bronze mb-2">Continuity Flow: The City's Evolution</h1>
        <p className="text-sm text-muted-foreground mb-8">Visualizing the structural succession from Lobotomy Corp to Limbus Company.</p>
        
        <svg width={width} height={height} className="mx-auto">
          <g>
            {links.map((link: any, i: number) => (
              <path
                key={i}
                d={sankeyLinkHorizontal()(link) || ''}
                fill="none"
                stroke={colorScale(link.source.game)}
                strokeOpacity={0.2}
                strokeWidth={Math.max(1, link.width)}
                className="hover:stroke-opacity-50 transition-all duration-300"
              />
            ))}
          </g>
          <g>
            {nodes.map((node: any, i: number) => (
              <g key={i} transform={`translate(${node.x0},${node.y0})`}>
                <rect
                  width={node.x1 - node.x0}
                  height={node.y1 - node.y0}
                  fill={colorScale(node.game)}
                  fillOpacity={0.8}
                  className="hover:fill-opacity-100 transition-all duration-300"
                />
                <text
                  x={node.x0 < width / 2 ? 25 : -5}
                  y={(node.y1 - node.y0) / 2}
                  dy="0.35em"
                  textAnchor={node.x0 < width / 2 ? 'start' : 'end'}
                  fontSize="10px"
                  fill="#e8e0d5"
                  className="pointer-events-none font-bold"
                >
                  {node.name}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}
