import * as d3 from 'd3';
import type { GraphLink, GraphNode, PhysicsSettings } from './LoreGraphConstants';

let simulation: d3.Simulation<GraphNode, GraphLink>;
let nodes: GraphNode[] = [];
let links: GraphLink[] = [];
let physics: PhysicsSettings;

self.onmessage = (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'init':
      physics = data.physics;
      initSimulation();
      break;

    case 'updateData':
      nodes = data.nodes;
      links = data.links;
      updateSimulationData();
      break;

    case 'updatePhysics':
      physics = data.physics;
      updateSimulationPhysics();
      break;

    case 'dragStart':
      {
        const node = nodes.find(n => n.id === data.id);
        if (node) {
          simulation.alphaTarget(0.3).restart();
          node.fx = data.x;
          node.fy = data.y;
        }
      }
      break;

    case 'dragMove':
      {
        const node = nodes.find(n => n.id === data.id);
        if (node) {
          node.fx = data.x;
          node.fy = data.y;
        }
      }
      break;

    case 'dragEnd':
      {
        const node = nodes.find(n => n.id === data.id);
        if (node) {
          simulation.alphaTarget(0);
          node.fx = null;
          node.fy = null;
        }
      }
      break;
  }
};

function initSimulation() {
  simulation = d3.forceSimulation<GraphNode>()
    .velocityDecay(0.6)
    .alphaDecay(0.05)
    .on('tick', () => {
      self.postMessage({
        type: 'tick',
        nodes: nodes.map(n => ({ id: n.id, x: n.x, y: n.y }))
      });
    });

  updateSimulationPhysics();
}

function updateSimulationData() {
  if (!simulation) return;

  simulation.nodes(nodes);
  const linkForce = simulation.force('link') as d3.ForceLink<GraphNode, GraphLink>;
  if (linkForce) linkForce.links(links);

  simulation.alpha(0.3).restart();
}

function updateSimulationPhysics() {
  if (!simulation) return;

  const S_R = 26;
  const H_R = 28;
  // const W_R = 42;

  const spacingScale = physics.nodeSpacing / 180;

  simulation
    .force('link', d3.forceLink<GraphNode, GraphLink>(links)
      .id(d => d.id)
      .distance(d => {
        if (d.type === 'literary-origin') return (80 + physics.nodeSpacing * 0.1) * spacingScale;
        if (d.type === 'ego-synchronization') return (120 + physics.nodeSpacing * 0.2) * spacingScale;
        if (d.type === 'structural-hierarchy') return (140 + physics.nodeSpacing * 0.4) * spacingScale;
        if (d.type === 'wing-affiliation') return (300 + physics.nodeSpacing * 0.5) * spacingScale;
        return physics.nodeSpacing;
      })
      .strength(d => {
        if (d.type === 'wing-affiliation') return 0.05;
        if (d.type === 'ego-synchronization') return 0.35;
        if (d.type === 'literary-origin') return 0.06;
        return 0.15;
      })
    )
    .force('charge', d3.forceManyBody<GraphNode>().strength(d => {
      const isMajorFaction = d.entityType === 'wing' || d.entityType === 'association' || d.entityType === 'finger';
      if (isMajorFaction) return physics.repulsion * 2.5;
      if (d.nodeType === 'literary-source') return physics.repulsion * 1.5;
      if (d.nodeType === 'sinner') return physics.repulsion * 0.3;
      return physics.repulsion;
    }).theta(0.85).distanceMax(1000))
    .force('center', d3.forceCenter(0, 0).strength(physics.centering))
    .force('periphery', d3.forceRadial<GraphNode>(
      d => {
        const isMajorFaction = d.entityType === 'wing' || d.entityType === 'association' || d.entityType === 'finger';
        if (isMajorFaction) return 900 * spacingScale;
        if (d.entityType === 'abnormality') return 600 * spacingScale;
        if (d.nodeType === 'literary-source') return 350 * spacingScale;
        if (d.id === 'dante') return 0;
        if (d.nodeType === 'sinner') return 250 * spacingScale;
        return 470 * spacingScale;
      },
      0, 0
    ).strength(d => {
      // Lower strength allows repulsion and spacing to work better
      if (d.id === 'dante') return 1.0;
      if (d.nodeType === 'sinner') return 0.4;
      return 0.25;
    }))
    .force('collision', d3.forceCollide<GraphNode>().radius(d => {
      if (d.nodeType === 'literary-source') return 62;
      if (d.entityType === 'wing') return 52;
      if (d.entityType === 'association') return 46;
      if (d.entityType === 'finger') return 44;
      if (d.entityType === 'abnormality') return H_R + 16;
      return S_R + 14;
    }).strength(0.95).iterations(3));

  simulation.alpha(1.0).restart();
}
