
import React, { useRef, Suspense } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { 
  useGLTF, 
  TransformControls, 
  PointerLockControls, 
  Text, 
  Image as DreiImage, 
  Html,
  Float
} from '@react-three/drei';
import * as THREE from 'three';
import { WorldState, EditorMode, WorldObject } from '../types';
import Player from './Player';

interface WorldSceneProps {
  world: WorldState;
  mode: EditorMode;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<WorldObject>) => void;
}

const Model: React.FC<{ object: WorldObject }> = ({ object }) => {
  const { scene } = useGLTF(object.url);
  // Clone to prevent shared state issues between multiple instances
  const clonedScene = scene.clone();
  
  return (
    <primitive 
      object={clonedScene} 
      position={object.position} 
      rotation={object.rotation} 
      scale={object.scale} 
    />
  );
};

const WorldScene: React.FC<WorldSceneProps> = ({ 
  world, 
  mode, 
  selectedId, 
  onSelect, 
  onUpdate 
}) => {
  const selectedObject = world.objects.find(o => o.id === selectedId);

  return (
    <>
      {mode === EditorMode.PLAY ? (
        <>
          <PointerLockControls />
          <Player />
        </>
      ) : null}

      <Suspense fallback={null}>
        {world.objects.map((obj) => {
          const isSelected = selectedId === obj.id;

          return (
            <group 
              key={obj.id} 
              onClick={(e) => {
                if (mode === EditorMode.EDIT) {
                  e.stopPropagation();
                  onSelect(obj.id);
                }
              }}
            >
              {obj.type === 'glb' && (
                <Model object={obj} />
              )}

              {obj.type === 'image' && (
                <DreiImage 
                  url={obj.url} 
                  position={obj.position} 
                  rotation={obj.rotation} 
                  scale={[obj.scale[0], obj.scale[1]]} 
                  transparent
                />
              )}

              {obj.type === 'text' && (
                <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
                  <Text
                    position={obj.position}
                    rotation={obj.rotation}
                    fontSize={0.5 * obj.scale[0]}
                    color="white"
                    maxWidth={2}
                    textAlign="center"
                    anchorX="center"
                    anchorY="middle"
                  >
                    {obj.content}
                  </Text>
                </Float>
              )}

              {obj.type === 'link' && (
                <group position={obj.position} rotation={obj.rotation}>
                  <mesh>
                    <boxGeometry args={[1, 2, 0.1]} />
                    <meshStandardMaterial color="#4f46e5" transparent opacity={0.3} />
                  </mesh>
                  <Html position={[0, 0, 0.06]} transform occlude>
                    <div className="p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white w-48 text-center pointer-events-auto">
                      <p className="text-xs opacity-50 mb-2 truncate">{obj.url}</p>
                      <button 
                        onClick={() => window.open(obj.url, '_blank')}
                        className="bg-indigo-600 px-4 py-1 rounded text-sm hover:bg-indigo-500 transition-colors"
                      >
                        Visit Portal
                      </button>
                    </div>
                  </Html>
                </group>
              )}

              {mode === EditorMode.EDIT && isSelected && (
                <TransformControls 
                  object={null} // We'll manage position ourselves
                  onMouseUp={() => {
                    // This is where we'd catch final position if we used Drei's managed state
                    // For now, simpler selection works.
                  }}
                />
              )}
            </group>
          );
        })}
      </Suspense>
    </>
  );
};

export default WorldScene;
