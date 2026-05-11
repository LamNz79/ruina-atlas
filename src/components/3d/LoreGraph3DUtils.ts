import * as THREE from 'three';
import type { GraphNode } from '../LoreGraphConstants';

/**
 * Scale factor to convert D3 simulation coordinates to Three.js units.
 */
export const D3_TO_3D_SCALE = 0.08;

/**
 * Maps 2D D3 coordinates to a volumetric 3D Galactic space.
 * 
 * Supports the "Moon System" for literary sources by referencing parent positions.
 */
export function mapD3To3D(
  x: number, 
  y: number, 
  node?: GraphNode, 
  visualPositions?: Map<string, THREE.Vector3>
): [number, number, number] {
  const radius2d = Math.sqrt(x * x + y * y);
  const angle = Math.atan2(y, x);

  // Base Galactic Plane (X-Z)
  const spiralWarp = radius2d * 0.002;
  const finalAngle = angle + spiralWarp;

  let orbitalRadius = radius2d * D3_TO_3D_SCALE;
  let verticalOffset = 0;

  if (node) {
    const idHash = node.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const detRandom = (idHash % 100) / 100;

    if (node.id === 'dante') {
      orbitalRadius = 0;
    } else if (node.nodeType === 'sinner') {
      // Inner Planets (Primary Focus)
      orbitalRadius = 35 + (detRandom * 20);
      verticalOffset = (detRandom - 0.5) * 8;
    } else if (node.nodeType === 'literary-source') {
      // The "Moon" System: Orbit the parent Sinner/Entity
      const parentPos = node.parentEntityId ? visualPositions?.get(node.parentEntityId) : null;
      
      if (parentPos) {
        // Position relative to parent
        const orbitDist = 12 + (detRandom * 6);
        // Use angle to ensure they don't overlap too much
        const ox = Math.cos(angle * 2 + detRandom) * orbitDist;
        const oz = Math.sin(angle * 2 + detRandom) * orbitDist;
        const oy = (detRandom - 0.5) * 10;
        return [parentPos.x + ox, parentPos.y + oy, parentPos.z + oz];
      } else {
        // Fallback: Tightened Kuiper Belt (now closer to Sinners)
        orbitalRadius = 70 + (detRandom * 25);
        verticalOffset = (detRandom - 0.5) * 20;
      }
    } else if (node.entityType === 'wing' || node.entityType === 'association') {
      // Major Factions (Inner-Middle)
      orbitalRadius = 110 + (detRandom * 30);
      verticalOffset = (detRandom - 0.5) * 15;
    } else {
      // Other entities / NPCs (Outer Rings)
      orbitalRadius = 160 + (detRandom * 60);
      verticalOffset = (detRandom - 0.5) * 30;
    }
  }

  const baseX = Math.cos(finalAngle) * orbitalRadius;
  const baseZ = Math.sin(finalAngle) * orbitalRadius;

  return [baseX, verticalOffset, baseZ];
}



/**
 * Gets the size/scale for a node based on its importance in the hierarchy.
 */
export function getNodeScale(node: GraphNode): number {
  if (node.id === 'dante') return 3.0;
  if (node.nodeType === 'sinner') return 2.0;
  if (node.entityType === 'wing') return 2.5;
  if (node.entityType === 'association') return 1.8;
  if (node.nodeType === 'literary-source') return 1.4;
  return 1.2;
}
