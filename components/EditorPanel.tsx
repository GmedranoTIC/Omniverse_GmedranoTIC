
import React from 'react';
import { WorldObject } from '../types';
import { Trash2, Move, RotateCcw, Maximize2, Type } from 'lucide-react';

interface EditorPanelProps {
  object: WorldObject;
  onUpdate: (updates: Partial<WorldObject>) => void;
  onDelete: () => void;
}

const EditorPanel: React.FC<EditorPanelProps> = ({ object, onUpdate, onDelete }) => {
  const handleCoordChange = (axis: 'x' | 'y' | 'z', value: string, field: 'position' | 'rotation' | 'scale') => {
    const newVal = parseFloat(value) || 0;
    const current = [...object[field]] as [number, number, number];
    const index = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
    current[index] = newVal;
    onUpdate({ [field]: current });
  };

  return (
    <div className="absolute top-24 right-6 w-80 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 z-50 animate-in fade-in slide-in-from-right-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold truncate pr-4">{object.name}</h2>
        <button 
          onClick={onDelete}
          className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div className="space-y-6">
        {object.type === 'text' && (
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
              <Type size={12} /> Content
            </label>
            <textarea
              value={object.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 min-h-[80px]"
            />
          </div>
        )}

        {/* Position */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
            <Move size={12} /> Position
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['x', 'y', 'z'].map((axis, i) => (
              <div key={axis} className="relative">
                <input 
                  type="number"
                  step="0.1"
                  value={object.position[i]}
                  onChange={(e) => handleCoordChange(axis as 'x'|'y'|'z', e.target.value, 'position')}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 pl-6 text-xs focus:outline-none focus:border-blue-500"
                />
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/20 uppercase">{axis}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rotation */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
            <RotateCcw size={12} /> Rotation (Rad)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['x', 'y', 'z'].map((axis, i) => (
              <div key={axis} className="relative">
                <input 
                  type="number"
                  step="0.1"
                  value={object.rotation[i]}
                  onChange={(e) => handleCoordChange(axis as 'x'|'y'|'z', e.target.value, 'rotation')}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 pl-6 text-xs focus:outline-none focus:border-blue-500"
                />
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/20 uppercase">{axis}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scale */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
            <Maximize2 size={12} /> Scale
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['x', 'y', 'z'].map((axis, i) => (
              <div key={axis} className="relative">
                <input 
                  type="number"
                  step="0.1"
                  value={object.scale[i]}
                  onChange={(e) => handleCoordChange(axis as 'x'|'y'|'z', e.target.value, 'scale')}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 pl-6 text-xs focus:outline-none focus:border-blue-500"
                />
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/20 uppercase">{axis}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPanel;
