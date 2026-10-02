'use client';

import { useGameStore } from '@/lib/game/store';
import { Play, RotateCcw, X, Settings } from 'lucide-react';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
}

export function PauseMenu({ onResume, onRestart }: PauseMenuProps) {
  const { sensitivity, fov, setSensitivity, setFov } = useGameStore();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-20 pointer-events-auto">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onResume} />
      
      <div className="relative glass-dark rounded-2xl p-8 min-w-[400px] max-w-md w-full mx-4 pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Paused</h2>
          <button
            onClick={onResume}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!showSettings ? (
          <div className="space-y-3">
            <button
              onClick={onResume}
              className="w-full flex items-center gap-3 rounded-lg bg-primary px-4 py-3 text-lg font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Play className="h-5 w-5" />
              Resume Game
            </button>
            <button
              onClick={onRestart}
              className="w-full flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-lg font-medium text-foreground hover:bg-muted transition-colors"
            >
              <RotateCcw className="h-5 w-5" />
              Restart Level
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="w-full flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-lg font-medium text-foreground hover:bg-muted transition-colors"
            >
              <Settings className="h-5 w-5" />
              Settings
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full flex items-center gap-3 rounded-lg border border-destructive bg-destructive/10 px-4 py-3 text-lg font-medium text-destructive hover:bg-destructive/20 transition-colors"
            >
              <X className="h-5 w-5" />
              Exit to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Settings</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">Mouse Sensitivity</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0.0005"
                  max="0.005"
                  step="0.0001"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-muted rounded-lg appearance-none accent-primary"
                />
                <span className="text-sm font-mono text-white/60 w-16">{sensitivity.toFixed(4)}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Field of View</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="60"
                  max="110"
                  step="1"
                  value={fov}
                  onChange={(e) => setFov(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-muted rounded-lg appearance-none accent-primary"
                />
                <span className="text-sm font-mono text-white/60 w-16">{fov}°</span>
              </div>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';