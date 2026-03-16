
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Stars, Environment, ContactShadows, KeyboardControls } from '@react-three/drei';
import { v4 as uuidv4 } from 'uuid';
import { 
  Box, 
  Upload, 
  Type, 
  Globe, 
  Image as ImageIcon, 
  Trash2, 
  Move, 
  Play, 
  Edit3, 
  Download,
  Mic,
  MicOff,
  Users,
  Lock
} from 'lucide-react';

import { WorldObject, WorldState, EditorMode, ObjectType } from './types';
import WorldScene from './components/WorldScene';
import EditorPanel from './components/EditorPanel';
import VoiceAssistant from './components/VoiceAssistant';
import ShareModal from './components/ShareModal';
import { exportWorldToHTML } from './services/exporter';
import { P2PManager, P2PMessageType, P2PMessage } from './services/p2p';

const App: React.FC = () => {
  const [world, setWorld] = useState<WorldState>({
    objects: [],
    environment: 'city',
    groundColor: '#1a1a1a',
  });
  const [projectName, setProjectName] = useState('My Omniverse');
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [mode, setMode] = useState<EditorMode>(EditorMode.EDIT);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [roomPassword, setRoomPassword] = useState<string>('');
  const [isLocked, setIsLocked] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [p2p, setP2p] = useState<P2PManager | null>(null);
  const [peerId, setPeerId] = useState<string>('');
  const [connectionCount, setConnectionCount] = useState(0);

  // Get room ID from URL
  const roomId = new URLSearchParams(window.location.search).get('room');

  // Initialize P2P
  useEffect(() => {
    const manager = new P2PManager(
      (msg: P2PMessage) => {
        handleRemoteMessage(msg);
      },
      (count) => setConnectionCount(count)
    );

    manager.initialize().then((id) => {
      setPeerId(id);
      if (roomId && roomId !== id) {
        console.log('Connecting to room:', roomId);
        manager.connectToPeer(roomId);
      }
    });

    setP2p(manager);

    return () => manager.disconnect();
  }, [roomId]);

  const handleRemoteMessage = (msg: P2PMessage) => {
    switch (msg.type) {
      case P2PMessageType.SYNC_WORLD:
        setWorld(msg.payload);
        break;
      case P2PMessageType.ADD_OBJECT:
        setWorld(prev => ({
          ...prev,
          objects: [...prev.objects, msg.payload]
        }));
        break;
      case P2PMessageType.UPDATE_OBJECT:
        setWorld(prev => ({
          ...prev,
          objects: prev.objects.map(obj => 
            obj.id === msg.payload.id ? { ...obj, ...msg.payload.updates } : obj
          )
        }));
        break;
      case P2PMessageType.DELETE_OBJECT:
        setWorld(prev => ({
          ...prev,
          objects: prev.objects.filter(obj => obj.id !== msg.payload)
        }));
        break;
      case P2PMessageType.USER_JOINED:
        // If we are the host (the one who's ID matches the room ID or if no room ID yet)
        // we send the current world state to the newcomer
        if (!roomId || roomId === peerId) {
          p2p?.sendTo(msg.senderId, P2PMessageType.SYNC_WORLD, world);
        }
        break;
    }
  };

  // Auto-save to localStorage
  useEffect(() => {
    if (!roomId) {
      localStorage.setItem('omniverse_save', JSON.stringify({ world, name: projectName }));
    }
  }, [world, projectName, roomId]);

  // Mock users for collab feel
  const [connectedUsers] = useState([
    { id: '1', name: 'User_42', color: '#ff0000' },
    { id: '2', name: 'Dev_Alpha', color: '#00ff00' },
  ]);

  const addObject = useCallback((type: ObjectType, file?: File, text?: string, url?: string) => {
    let objectUrl = '';
    let name = 'New Object';

    if (file) {
      objectUrl = URL.createObjectURL(file);
      name = file.name;
    } else if (url) {
      objectUrl = url;
      name = 'External Resource';
    }

    const newObj: WorldObject = {
      id: uuidv4(),
      type,
      name,
      url: objectUrl,
      position: [Math.random() * 5 - 2.5, 1, Math.random() * 5 - 2.5],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      content: text,
    };

    setWorld(prev => ({ ...prev, objects: [...prev.objects, newObj] }));
    setSelectedObjectId(newObj.id);
    p2p?.broadcast(P2PMessageType.ADD_OBJECT, newObj);
  }, [p2p]);

  const updateObject = useCallback((id: string, updates: Partial<WorldObject>) => {
    setWorld(prev => ({
      ...prev,
      objects: prev.objects.map(obj => obj.id === id ? { ...obj, ...updates } : obj)
    }));
    p2p?.broadcast(P2PMessageType.UPDATE_OBJECT, { id, updates });
  }, [p2p]);

  const removeObject = useCallback((id: string) => {
    setWorld(prev => ({
      ...prev,
      objects: prev.objects.filter(obj => obj.id !== id)
    }));
    if (selectedObjectId === id) setSelectedObjectId(null);
    p2p?.broadcast(P2PMessageType.DELETE_OBJECT, id);
  }, [selectedObjectId, p2p]);

  const handleExport = () => {
    const html = exportWorldToHTML(world);
    const blob = new Blob([html], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'my-virtual-world.html';
    link.click();
  };

  const saveProject = () => {
    const data = JSON.stringify(world, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'omniverse-project.json';
    link.click();
  };

  const loadProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const loadedWorld = JSON.parse(content) as WorldState;
        // Basic validation
        if (loadedWorld.objects && Array.isArray(loadedWorld.objects)) {
          setWorld(loadedWorld);
          setSelectedObjectId(null);
        }
      } catch (err) {
        console.error('Failed to load project:', err);
        alert('Invalid project file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="relative w-full h-full bg-[#050505]">
      {/* UI Controls */}
      <div className="absolute top-6 left-6 z-50 flex flex-col gap-4">
        <div className="flex flex-col gap-2 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Box size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white leading-none">
                GmedranoTIC's omniverse builder
              </h1>
              <input 
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="bg-transparent border-none text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold focus:outline-none focus:text-indigo-400 transition-colors w-full"
                placeholder="UNNAMED PROJECT"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md p-2 rounded-xl border border-white/10">
          <button 
            onClick={() => setMode(EditorMode.EDIT)}
            className={`p-3 rounded-lg transition-all ${mode === EditorMode.EDIT ? 'bg-blue-600 text-white' : 'hover:bg-white/10 text-white/60'}`}
          >
            <Edit3 size={20} />
          </button>
          <button 
            onClick={() => setMode(EditorMode.PLAY)}
            className={`p-3 rounded-lg transition-all ${mode === EditorMode.PLAY ? 'bg-green-600 text-white' : 'hover:bg-white/10 text-white/60'}`}
          >
            <Play size={20} />
          </button>
        </div>

        {mode === EditorMode.EDIT && (
          <div className="flex flex-col gap-2 bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10 animate-in fade-in slide-in-from-left-4 duration-300">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Insert</h3>
            <label className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg cursor-pointer text-sm text-white/80 transition-colors">
              <Upload size={18} className="text-blue-400" />
              <span>3D Model (GLB)</span>
              <input 
                type="file" 
                accept=".glb" 
                className="hidden" 
                onChange={(e) => e.target.files?.[0] && addObject('glb', e.target.files[0])} 
              />
            </label>
            <label className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg cursor-pointer text-sm text-white/80 transition-colors">
              <ImageIcon size={18} className="text-emerald-400" />
              <span>Image</span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => e.target.files?.[0] && addObject('image', e.target.files[0])} 
              />
            </label>
            <button 
              onClick={() => {
                const txt = prompt('Enter text:');
                if (txt) addObject('text', undefined, txt);
              }}
              className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg text-sm text-white/80 transition-colors"
            >
              <Type size={18} className="text-amber-400" />
              <span>Floating Text</span>
            </button>
            <button 
              onClick={() => {
                const url = prompt('Enter URL:');
                if (url) addObject('link', undefined, undefined, url);
              }}
              className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg text-sm text-white/80 transition-colors"
            >
              <Globe size={18} className="text-purple-400" />
              <span>Web Portal</span>
            </button>
          </div>
        )}
      </div>

      {/* Right Panel for Selected Object */}
      {mode === EditorMode.EDIT && selectedObjectId && (
        <EditorPanel 
          object={world.objects.find(o => o.id === selectedObjectId)!} 
          onUpdate={(updates) => updateObject(selectedObjectId, updates)}
          onDelete={() => removeObject(selectedObjectId)}
        />
      )}

      {/* Collaboration / Voice Controls */}
      <div className="absolute bottom-6 right-6 z-50 flex gap-4">
        <button 
          onClick={() => setShowUsers(!showUsers)}
          className={`p-4 rounded-full backdrop-blur-md shadow-2xl transition-all border ${showUsers ? 'bg-indigo-600 text-white border-white/20' : 'bg-black/60 text-white/60 border-white/10 hover:bg-black/80'}`}
        >
          <Users size={24} />
          {showUsers && (
            <div className="absolute bottom-16 right-0 w-48 bg-black/90 border border-white/10 rounded-xl p-3 flex flex-col gap-2">
              <div className="text-[10px] font-bold text-white/40 uppercase mb-1">Active Users</div>
              {connectedUsers.map(u => (
                <div key={u.id} className="flex items-center gap-2 text-sm text-white/80">
                  <div className="w-2 h-2 rounded-full" style={{ background: u.color }} />
                  {u.name} (You)
                </div>
              ))}
            </div>
          )}
        </button>

        <button 
          onClick={() => setIsVoiceActive(!isVoiceActive)}
          className={`p-4 rounded-full backdrop-blur-md shadow-2xl transition-all border ${isVoiceActive ? 'bg-red-600 text-white border-white/20' : 'bg-black/60 text-white/60 border-white/10 hover:bg-black/80'}`}
        >
          {isVoiceActive ? <Mic size={24} /> : <MicOff size={24} />}
        </button>

        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md p-2 rounded-full border border-white/10">
          <button 
            onClick={saveProject}
            className="p-3 rounded-full hover:bg-white/10 text-white/60 transition-all"
            title="Save Project"
          >
            <Download size={20} />
          </button>
          <label 
            className="p-3 rounded-full hover:bg-white/10 text-white/60 transition-all cursor-pointer"
            title="Load Project"
          >
            <Upload size={20} />
            <input type="file" accept=".json" className="hidden" onChange={loadProject} />
          </label>
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="p-3 rounded-full hover:bg-white/10 text-white/60 transition-all relative"
            title="Share Space"
          >
            <Users size={20} />
            {connectionCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-black text-[8px] font-bold rounded-full flex items-center justify-center border border-black">
                {connectionCount}
              </span>
            )}
          </button>
        </div>

        <button 
          onClick={handleExport}
          className="p-4 rounded-full bg-white text-black hover:bg-white/90 shadow-2xl transition-all flex items-center gap-2 px-6 font-semibold"
        >
          <Download size={20} />
          Export World
        </button>
      </div>

      {/* Help Overlay for Controls */}
      {mode === EditorMode.PLAY && (
        <div className="absolute top-6 right-6 text-white/60 text-xs bg-black/40 p-4 rounded-lg backdrop-blur-sm">
          <p>WASD to Move</p>
          <p>MOUSE to Look</p>
          <p>SHIFT to Run</p>
          <p>SPACE to Jump</p>
          <p>ESC to Unlock Mouse</p>
        </div>
      )}

      {/* 3D Scene */}
      <div className="w-full h-full cursor-crosshair">
        <KeyboardControls
          map={[
            { name: "forward", keys: ["ArrowUp", "w", "W"] },
            { name: "backward", keys: ["ArrowDown", "s", "S"] },
            { name: "left", keys: ["ArrowLeft", "a", "A"] },
            { name: "right", keys: ["ArrowRight", "d", "D"] },
            { name: "jump", keys: ["Space"] },
            { name: "run", keys: ["Shift"] },
          ]}
        >
          <Canvas 
            shadows 
            camera={{ position: [0, 2, 5], fov: 75 }}
            gl={{ preserveDrawingBuffer: true }}
          >
            <color attach="background" args={['#0a0a0a']} />
            
            <Sky distance={450000} sunPosition={[1, 0.1, 0]} inclination={0} azimuth={0.25} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
            <Environment preset="city" />

            <WorldScene 
              world={world} 
              mode={mode} 
              selectedId={selectedObjectId}
              onSelect={setSelectedObjectId}
              onUpdate={updateObject}
            />

            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[100, 100]} />
              <meshStandardMaterial color={world.groundColor} />
            </mesh>
            <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.25} far={10} color="#000000" />
          </Canvas>
        </KeyboardControls>
      </div>

      {/* Voice Assistant Logic */}
      {isVoiceActive && <VoiceAssistant world={world} />}

      {/* Share Modal */}
      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        roomUrl={`${window.location.origin}${window.location.pathname}?room=${peerId}`}
        onSetPassword={setRoomPassword}
        currentPassword={roomPassword}
      />

      {/* Password Protection Overlay */}
      {isLocked && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black backdrop-blur-xl">
          <div className="bg-[#111] border border-white/10 p-8 rounded-2xl w-full max-w-sm text-center space-y-6">
            <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-500 mx-auto">
              <Lock size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Protected Space</h2>
              <p className="text-sm text-white/40">Enter the password to access this omniverse</p>
            </div>
            <div className="space-y-4">
              <input 
                type="password"
                value={enteredPassword}
                onChange={(e) => setEnteredPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-center focus:outline-none focus:border-indigo-500"
                onKeyDown={(e) => e.key === 'Enter' && setIsLocked(false)}
              />
              <button 
                onClick={() => setIsLocked(false)}
                className="w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-white/90 transition-all"
              >
                Unlock Space
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
