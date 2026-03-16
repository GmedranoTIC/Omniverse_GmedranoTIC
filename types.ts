
export type ObjectType = 'glb' | 'image' | 'text' | 'link';

export interface WorldObject {
  id: string;
  type: ObjectType;
  name: string;
  url: string; // Blob URL or external URL
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  content?: string; // For text objects
}

export interface WorldState {
  objects: WorldObject[];
  environment: 'sunset' | 'dawn' | 'night' | 'warehouse' | 'city';
  groundColor: string;
}

export enum EditorMode {
  EDIT = 'edit',
  PLAY = 'play'
}
