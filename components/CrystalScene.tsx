import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Line, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { CrystalStructureData, Vector3, VoidDisplayMode, CrystalType, SelectedVoidInfo } from '../types';

// Type augmentation for React Three Fiber elements
// Extending global JSX namespace
declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      sphereGeometry: any;
      meshPhysicalMaterial: any;
      meshBasicMaterial: any;
      group: any;
      lineSegments: any;
      edgesGeometry: any;
      lineBasicMaterial: any;
      ambientLight: any;
      pointLight: any;
      gridHelper: any;
    }
  }
}

// Extending React's internal JSX namespace to ensure compatibility with modern React type definitions
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      sphereGeometry: any;
      meshPhysicalMaterial: any;
      meshBasicMaterial: any;
      group: any;
      lineSegments: any;
      edgesGeometry: any;
      lineBasicMaterial: any;
      ambientLight: any;
      pointLight: any;
      gridHelper: any;
    }
  }
}

interface CrystalSceneProps {
  data: CrystalStructureData;
  crystalType: CrystalType;
  showAtoms: boolean;
  showOctahedral: boolean;
  showTetrahedral: boolean;
  voidDisplayMode: VoidDisplayMode;
  gridSize: number;
  selectedVoid: SelectedVoidInfo | null;
  onSelectVoid: (info: SelectedVoidInfo | null) => void;
}

// --- Helpers for Geometry ---

const getDistance = (v1: Vector3, v2: Vector3) => {
  return Math.sqrt(Math.pow(v1[0]-v2[0], 2) + Math.pow(v1[1]-v2[1], 2) + Math.pow(v1[2]-v2[2], 2));
}

// Find N nearest lattice points (atoms) for a void to build its polyhedron
const getNeighbors = (voidPos: Vector3, type: CrystalType, isOct: boolean): Vector3[] => {
  const candidates: Vector3[] = [];
  const range = 1.2;
  const cx = voidPos[0]; 
  const cy = voidPos[1]; 
  const cz = voidPos[2];

  const minX = Math.floor(cx - range);
  const maxX = Math.ceil(cx + range);
  const minY = Math.floor(cy - range);
  const maxY = Math.ceil(cy + range);
  const minZ = Math.floor(cz - range);
  const maxZ = Math.ceil(cz + range);

  for(let x=minX; x<=maxX; x++){
    for(let y=minY; y<=maxY; y++){
      for(let z=minZ; z<=maxZ; z++){
        candidates.push([x,y,z]);
        
        if (type === CrystalType.FCC) {
          candidates.push([x+0.5, y+0.5, z]);
          candidates.push([x+0.5, y, z+0.5]);
          candidates.push([x, y+0.5, z+0.5]);
        } else if (type === CrystalType.BCC) {
          candidates.push([x+0.5, y+0.5, z+0.5]);
        }
      }
    }
  }

  const sorted = candidates.map(p => ({
    pos: p,
    dist: getDistance(p, voidPos)
  })).sort((a,b) => a.dist - b.dist);

  const clean = sorted.filter(a => a.dist > 0.001);
  const count = isOct ? 6 : 4;
  
  return clean.slice(0, count).map(c => c.pos);
};

// --- Components ---

const AtomInstance: React.FC<{ 
  position: Vector3; 
  color: string; 
  opacity?: number; 
  scale?: number; 
  isVoid?: boolean;
  onClick?: (e: any) => void;
  isSelected?: boolean;
  isGhost?: boolean;
  label?: string;
}> = ({ position, color, opacity = 1, scale = 1, isVoid, onClick, isSelected, isGhost }) => {
  
  const displayColor = isSelected ? '#4ade80' : color;

  return (
    <mesh 
      position={position} 
      scale={[scale, scale, scale]} 
      onClick={(e: any) => {
        if(onClick) {
          e.stopPropagation();
          onClick(e);
        }
      }}
      onPointerOver={(e: any) => { if(onClick) document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e: any) => { if(onClick) document.body.style.cursor = 'auto'; }}
    >
      <sphereGeometry args={[0.15, 64, 64]} /> 
      <meshPhysicalMaterial 
        color={displayColor}
        emissive={displayColor}
        emissiveIntensity={0.1}
        roughness={0.15}
        metalness={0.1}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
        transparent={opacity < 1 || isGhost} 
        opacity={isGhost ? 0.7 : opacity}
      />
      {isSelected && (
         <mesh scale={[1.15, 1.15, 1.15]}>
            <sphereGeometry args={[0.15, 32, 32]} />
            <meshBasicMaterial color="#86efac" wireframe transparent opacity={0.5} />
         </mesh>
      )}
    </mesh>
  );
};

const PolyhedronShape: React.FC<{
  center: Vector3;
  neighbors: Vector3[];
  color: string;
  mode: 'wireframe' | 'solid';
  isSelected?: boolean;
  onClick?: (e: any) => void;
}> = ({ center, neighbors, color, mode, isSelected, onClick }) => {
  const geometry = useMemo(() => {
    if (neighbors.length < 4) return null;
    
    const geom = new THREE.BufferGeometry();
    
    // Tet: 4 points, 4 faces
    if (neighbors.length === 4) {
       const indices = [
         0, 1, 2,
         0, 1, 3,
         1, 2, 3,
         2, 0, 3
       ];
       const positions = new Float32Array(neighbors.flatMap(v => v));
       geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
       geom.setIndex(indices);
       geom.computeVertexNormals();
    } else if (neighbors.length === 6) {
       // Octahedron
       const used = new Set<number>();
       const pairs: [number, number][] = [];
       
       for(let i=0; i<6; i++){
         if(used.has(i)) continue;
         let maxD = -1;
         let partner = -1;
         for(let j=i+1; j<6; j++){
           if(used.has(j)) continue;
           const d = getDistance(neighbors[i], neighbors[j]);
           if(d > maxD) { maxD = d; partner = j; }
         }
         if(partner !== -1) {
           pairs.push([i, partner]);
           used.add(i); used.add(partner);
         }
       }
       
       if(pairs.length === 3) {
         const indices: number[] = [];
         const axes = [pairs[0], pairs[1], pairs[2]];
         for(let x of axes[0]) {
           for(let y of axes[1]) {
             for(let z of axes[2]) {
               indices.push(x, y, z);
             }
           }
         }
         const positions = new Float32Array(neighbors.flatMap(v => v));
         geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
         geom.setIndex(indices);
         geom.computeVertexNormals();
       }
    }
    
    return geom;
  }, [neighbors]);

  if (!geometry) return null;

  return (
    <group 
        onClick={(e: any) => {
          if(onClick) {
            e.stopPropagation();
            onClick(e);
          }
        }}
        onPointerOver={(e: any) => { if(onClick) document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e: any) => { if(onClick) document.body.style.cursor = 'auto'; }}
    >
      <mesh geometry={geometry}>
        {mode === 'wireframe' ? (
           <meshBasicMaterial color={color} wireframe />
        ) : (
           <meshPhysicalMaterial 
              color={color} 
              transparent 
              opacity={isSelected ? 0.6 : 0.3} 
              side={THREE.DoubleSide} 
              roughness={0.1}
              metalness={0.1}
              clearcoat={1}
              depthWrite={false}
           />
        )}
      </mesh>
      
      {mode === 'wireframe' && (
         <mesh position={center}>
             <sphereGeometry args={[0.05]} />
             <meshPhysicalMaterial 
                color={color} 
                emissive={color}
                emissiveIntensity={0.1}
                roughness={0.2}
                clearcoat={1}
             />
         </mesh>
      )}

      {isSelected && (
        <mesh geometry={geometry}>
           <meshBasicMaterial color="white" wireframe transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
};

// Main Scene Component
const CrystalScene: React.FC<CrystalSceneProps> = ({ 
  data, crystalType, showAtoms, showOctahedral, showTetrahedral, 
  voidDisplayMode, gridSize, selectedVoid, onSelectVoid 
}) => {
  
  const { fullAtoms, fullOct, fullTet } = useMemo(() => {
    const fullAtoms: Vector3[] = [];
    const fullOct: { pos: Vector3, neighbors: Vector3[] }[] = [];
    const fullTet: { pos: Vector3, neighbors: Vector3[] }[] = [];

    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
          
          data.atoms.forEach(a => {
            fullAtoms.push([a[0] + x, a[1] + y, a[2] + z]);
          });

          data.octahedralVoids.forEach(v => {
            const pos: Vector3 = [v[0] + x, v[1] + y, v[2] + z];
            const neighbors = getNeighbors(pos, crystalType, true);
            fullOct.push({ pos, neighbors });
          });

          data.tetrahedralVoids.forEach(v => {
            const pos: Vector3 = [v[0] + x, v[1] + y, v[2] + z];
            const neighbors = getNeighbors(pos, crystalType, false);
            fullTet.push({ pos, neighbors });
          });
        }
      }
    }
    
    const uniqueAtoms = new Map<string, Vector3>();
    fullAtoms.forEach(p => {
        const key = `${p[0].toFixed(2)},${p[1].toFixed(2)},${p[2].toFixed(2)}`;
        uniqueAtoms.set(key, p);
    });

    return { 
        fullAtoms: Array.from(uniqueAtoms.values()), 
        fullOct, 
        fullTet 
    };
  }, [data, gridSize, crystalType]);

  const ghostAtoms = useMemo(() => {
    if (!selectedVoid) return [];
    return selectedVoid.neighbors.filter(n => {
      return !fullAtoms.some(fa => getDistance(fa, n) < 0.01);
    });
  }, [selectedVoid, fullAtoms]);

  const handleVoidClick = (type: 'oct' | 'tet', index: number, pos: Vector3, neighbors: Vector3[]) => {
    onSelectVoid({ type, index, position: pos, neighbors });
  };

  const handleAtomClick = (pos: Vector3) => {
    onSelectVoid(null);
  };

  const handleBgClick = (e: any) => {
    onSelectVoid(null);
  };

  return (
    <Canvas camera={{ position: [2.5 * gridSize + 1, 3, 3 * gridSize + 1], fov: 45 }} onPointerMissed={handleBgClick}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#cbd5e1" />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#ffffff" />
      <Environment preset="city" />

      <group position={[ -0.5 * gridSize, -0.5 * gridSize, -0.5 * gridSize]}>
        
        {Array.from({ length: gridSize }).map((_, x) => 
          Array.from({ length: gridSize }).map((_, y) => 
            Array.from({ length: gridSize }).map((_, z) => (
                <group key={`box-${x}-${y}-${z}`} position={[x + 0.5, y + 0.5, z + 0.5]}>
                     <lineSegments>
                        <edgesGeometry args={[new THREE.BoxGeometry(1, 1, 1)]} />
                        <lineBasicMaterial color="#94a3b8" opacity={0.3} transparent />
                     </lineSegments>
                </group>
            ))
          )
        )}

        {showAtoms && fullAtoms.map((pos, idx) => {
           const isNeighbor = selectedVoid?.neighbors.some(n => getDistance(n, pos) < 0.01);
           return (
              <AtomInstance 
                key={`atom-${idx}`} 
                position={pos} 
                color="#fb923c"
                isSelected={isNeighbor}
                scale={isNeighbor ? 1.15 : 1}
                onClick={() => handleAtomClick(pos)}
              />
           )
        })}

        {ghostAtoms.map((pos, idx) => (
           <AtomInstance 
             key={`ghost-atom-${idx}`}
             position={pos}
             color="#fb923c"
             isSelected={true}
             isGhost={true}
             scale={1.15}
           />
        ))}

        {showOctahedral && fullOct.map((item, idx) => {
            const isSelectedPos = selectedVoid && getDistance(selectedVoid.position, item.pos) < 0.01;
            
            if (voidDisplayMode === 'dot') {
              return (
                <AtomInstance 
                    key={`oct-${idx}`} 
                    position={item.pos} 
                    color="#ef4444" 
                    scale={0.6}
                    opacity={0.8}
                    onClick={() => handleVoidClick('oct', idx, item.pos, item.neighbors)}
                    isSelected={isSelectedPos || false}
                    label={isSelectedPos ? `Octahedral` : undefined}
                />
              );
            } else {
              return (
                <PolyhedronShape 
                    key={`oct-poly-${idx}`}
                    center={item.pos}
                    neighbors={item.neighbors}
                    color="#ef4444"
                    mode={voidDisplayMode}
                    isSelected={isSelectedPos}
                    onClick={() => handleVoidClick('oct', idx, item.pos, item.neighbors)}
                />
              );
            }
        })}

        {showTetrahedral && fullTet.map((item, idx) => {
            const isSelectedPos = selectedVoid && getDistance(selectedVoid.position, item.pos) < 0.01;

            if (voidDisplayMode === 'dot') {
              return (
                <AtomInstance 
                    key={`tet-${idx}`} 
                    position={item.pos} 
                    color="#10b981"
                    scale={0.4}
                    opacity={0.8}
                    onClick={() => handleVoidClick('tet', idx, item.pos, item.neighbors)}
                    isSelected={isSelectedPos || false}
                    label={isSelectedPos ? `Tetrahedral` : undefined}
                />
              );
            } else {
               return (
                <PolyhedronShape 
                    key={`tet-poly-${idx}`}
                    center={item.pos}
                    neighbors={item.neighbors}
                    color="#10b981"
                    mode={voidDisplayMode}
                    isSelected={isSelectedPos}
                    onClick={() => handleVoidClick('tet', idx, item.pos, item.neighbors)}
                />
              );
            }
        })}
        
        {selectedVoid && (
            <group>
                {selectedVoid.neighbors.map((n, i) => (
                    <Line
                        key={`line-${i}`}
                        points={[selectedVoid.position, n]}
                        color="white"
                        opacity={0.6}
                        transparent
                        lineWidth={1.5}
                    />
                ))}
            </group>
        )}

      </group>

      <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
      <gridHelper args={[10 * gridSize, 10 * gridSize, 0x475569, 0x1e293b]} position={[0, -0.5 * gridSize - 0.5, 0]} />
      <ContactShadows opacity={0.5} scale={20} blur={2} far={4} resolution={256} color="#000000" position={[0, -0.5 * gridSize - 0.51, 0]} />
    </Canvas>
  );
};

export default CrystalScene;