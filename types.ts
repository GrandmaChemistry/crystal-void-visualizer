export type Vector3 = [number, number, number];

export enum CrystalType {
  FCC = 'FCC',
  BCC = 'BCC',
}

export type VoidDisplayMode = 'dot' | 'wireframe' | 'solid';

export interface CrystalStructureData {
  atoms: Vector3[];
  octahedralVoids: Vector3[];
  tetrahedralVoids: Vector3[];
  description: string;
  packingEfficiency: string;
  coordinationNumber: number;
  effectiveOctahedralCount: number;
  effectiveTetrahedralCount: number;
}

export type ChatMessage = {
  role: 'user' | 'model';
  text: string;
};

export interface SelectedVoidInfo {
  type: 'oct' | 'tet';
  index: number;
  position: Vector3;
  neighbors: Vector3[];
}