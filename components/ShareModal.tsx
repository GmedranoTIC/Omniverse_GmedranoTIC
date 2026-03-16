
import React, { useState } from 'react';
import { X, Copy, Check, Lock, Globe, Shield } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomUrl: string;
  onSetPassword: (password: string) => void;
  currentPassword?: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ 
  isOpen, 
  onClose, 
  roomUrl, 
  onSetPassword,
  currentPassword 
}) => {
  const [copied, setCopied] = useState(false);
  const [password, setPassword] = useState(currentPassword || '');
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400">
              <Globe size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Share Space</h2>
              <p className="text-xs text-white/40">Invite others to build with you</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Share Link</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 truncate font-mono">
                {roomUrl}
              </div>
              <button 
                onClick={handleCopy}
                className={`px-4 rounded-xl flex items-center justify-center transition-all ${copied ? 'bg-emerald-600 text-white' : 'bg-white text-black hover:bg-white/90'}`}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
                <Lock size={16} className="text-amber-400" />
                <span>Space Password</span>
              </div>
              {!isEditingPassword && (
                <button 
                  onClick={() => setIsEditingPassword(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  {password ? 'Change' : 'Set Password'}
                </button>
              )}
            </div>

            {isEditingPassword ? (
              <div className="flex gap-2 animate-in slide-in-from-top-2 duration-200">
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
                <button 
                  onClick={() => {
                    onSetPassword(password);
                    setIsEditingPassword(false);
                  }}
                  className="px-4 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-500 transition-colors"
                >
                  Save
                </button>
              </div>
            ) : (
              <p className="text-xs text-white/40">
                {password ? 'Space is protected with a password' : 'No password set. Anyone with the link can enter.'}
              </p>
            )}
          </div>

          <div className="flex items-start gap-3 p-4 bg-indigo-600/10 rounded-xl border border-indigo-500/20">
            <Shield size={18} className="text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-xs text-indigo-200/60 leading-relaxed">
              Collaborative spaces allow multiple users to edit the world in real-time. 
              Changes are saved automatically to the cloud.
            </p>
          </div>
        </div>

        <div className="p-6 bg-black/20 border-t border-white/5 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-semibold transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
