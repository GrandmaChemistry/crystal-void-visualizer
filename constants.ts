import { CrystalStructureData, CrystalType, Vector3 } from './types';

// Helper to generate symmetric points effectively if needed, 
// but for a single unit cell, hardcoding is clearer for educational accuracy.

const generateFCC = (): CrystalStructureData => {
  const atoms: Vector3[] = [];
  // Corners
  for(let x=0; x<=1; x++) for(let y=0; y<=1; y++) for(let z=0; z<=1; z++) atoms.push([x,y,z]);
  // Face Centers
  atoms.push([0.5, 0.5, 0], [0.5, 0, 0.5], [0, 0.5, 0.5]); // Bottom-Left-Back cluster
  atoms.push([0.5, 0.5, 1], [0.5, 1, 0.5], [1, 0.5, 0.5]); // Top-Right-Front cluster

  // Octahedral Voids: Body center + Edge centers
  // Note: Standard unit cell edge centers are usually enough visualization.
  // Actually, showing all unique positions within the cell is better.
  const octFiltered: Vector3[] = [
    [0.5, 0.5, 0.5], // Body center (1)
    [0.5, 0, 0], [0, 0.5, 0], [0, 0, 0.5], // Edge centers (12 edges)
    [0.5, 1, 0], [1, 0.5, 0], [1, 0, 0.5],
    [0, 0.5, 1], [0, 1, 0.5], [0.5, 0, 1],
    [1, 1, 0.5], [1, 0.5, 1], [0.5, 1, 1] 
  ];

  // Tetrahedral Voids: center of the 8 small cubelets
  const tet: Vector3[] = [
    [0.25, 0.25, 0.25], [0.75, 0.25, 0.25],
    [0.25, 0.75, 0.25], [0.75, 0.75, 0.25],
    [0.25, 0.25, 0.75], [0.75, 0.25, 0.75],
    [0.25, 0.75, 0.75], [0.75, 0.75, 0.75]
  ];

  return {
    atoms,
    octahedralVoids: octFiltered,
    tetrahedralVoids: tet,
    description: "面心立方 (FCC): 原子位于立方体的角和每个面的中心。它是最紧密堆积结构之一。",
    packingEfficiency: "74%",
    coordinationNumber: 12,
    // FCC: 1 body center (1) + 12 edge centers (12 * 1/4 = 3) = 4 effective
    effectiveOctahedralCount: 4,
    // FCC: 8 internal (8 * 1 = 8) = 8 effective
    effectiveTetrahedralCount: 8
  };
};

const generateBCC = (): CrystalStructureData => {
  const atoms: Vector3[] = [];
  // Corners
  for(let x=0; x<=1; x++) for(let y=0; y<=1; y++) for(let z=0; z<=1; z++) atoms.push([x,y,z]);
  // Body Center
  atoms.push([0.5, 0.5, 0.5]);

  // Octahedral Voids in BCC: Face centers and Edge centers
  const oct: Vector3[] = [];

  // 1. Face Centers (6 faces) -> Coordinate pattern: Two 0.5, One integer (0 or 1)
  // z-faces
  oct.push([0.5, 0.5, 0], [0.5, 0.5, 1]);
  // y-faces
  oct.push([0.5, 0, 0.5], [0.5, 1, 0.5]);
  // x-faces
  oct.push([0, 0.5, 0.5], [1, 0.5, 0.5]);

  // 2. Edge Centers (12 edges) -> Coordinate pattern: One 0.5, Two integers (0 or 1)
  // Parallel to X axis (y,z are 0 or 1)
  for(let y of [0,1]) for(let z of [0,1]) oct.push([0.5, y, z]);
  // Parallel to Y axis (x,z are 0 or 1)
  for(let x of [0,1]) for(let z of [0,1]) oct.push([x, 0.5, z]);
  // Parallel to Z axis (x,y are 0 or 1)
  for(let x of [0,1]) for(let y of [0,1]) oct.push([x, y, 0.5]);

  // Tetrahedral Voids in BCC: 4 on each face. 
  // Coordinates are like (0.5, 0.25, 0), etc.
  const tet: Vector3[] = [];
  // For each face, there are 4 tet voids.
  // Z-faces (z=0, z=1)
  const zFaces = [0, 1];
  zFaces.forEach(z => {
      tet.push([0.5, 0.25, z], [0.5, 0.75, z], [0.25, 0.5, z], [0.75, 0.5, z]);
  });
  // Y-faces
  const yFaces = [0, 1];
  yFaces.forEach(y => {
      tet.push([0.5, y, 0.25], [0.5, y, 0.75], [0.25, y, 0.5], [0.75, y, 0.5]);
  });
  // X-faces
  const xFaces = [0, 1];
  xFaces.forEach(x => {
      tet.push([x, 0.5, 0.25], [x, 0.5, 0.75], [x, 0.25, 0.5], [x, 0.75, 0.5]);
  });

  return {
    atoms,
    octahedralVoids: oct,
    tetrahedralVoids: tet,
    description: "体心立方 (BCC): 原子位于立方体的角和体中心。它的堆积密度略低于FCC。",
    packingEfficiency: "68%",
    coordinationNumber: 8,
    // BCC Oct: 6 face centers (6 * 1/2 = 3) + 12 edge centers (12 * 1/4 = 3) = 6 effective
    effectiveOctahedralCount: 6,
    // BCC Tet: 24 face sites (shared by 2 cells -> 24 * 1/2 = 12) = 12 effective
    effectiveTetrahedralCount: 12
  };
};

export const STRUCTURES: Record<CrystalType, CrystalStructureData> = {
  [CrystalType.FCC]: generateFCC(),
  [CrystalType.BCC]: generateBCC(),
};