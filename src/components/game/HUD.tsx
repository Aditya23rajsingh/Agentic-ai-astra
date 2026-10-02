'use client';

import { useGameStore } from '@/lib/game/store';
import { formatTime } from '@/lib/utils';
import { Heart, Target, Timer, Trophy, Pause } from 'lucide-react';

export function HUD() {
  const { health, maxHealth, score, levelProgress, currentTime, isPlaying, isPaused, levelId } = useGameStore();

  if (!isPlaying && !isPaused) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-10 px-4 py-4">
      {/* Top left - Health */}
      <div className="absolute top-0 left-0 flex items-center gap-2">
        <div className="glass-dark rounded-lg px-4 py-2 flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          <div className="relative w-48 h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-300"
              style={{ width: `${(health / maxHealth) * 100}%` }}
            />
          </div>
          <span className="text-sm font-mono text-white/80 w-16 text-right">
            {health}/{maxHealth}
          </span>
        </div>
      </div>

      {/* Top center - Level progress */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="glass-dark rounded-lg px-4 py-2 flex items-center gap-2 min-w-[300px]">
          <Target className="h-5 w-5 text-primary" />
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-300"
              style={{ width: `${levelProgress * 100}%` }}
            />
          </div>
          <span className="text-sm font-mono text-white/80 w-12 text-right">
            {Math.round(levelProgress * 100)}%
          </span>
        </div>
      </div>

      {/* Top right - Score and Timer */}
      <div className="absolute top-0 right-0 flex items-center gap-4">
        <div className="glass-dark rounded-lg px-4 py-2 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span className="text-lg font-mono font-bold text-white">{score.toLocaleString()}</span>
        </div>
        <div className="glass-dark rounded-lg px-4 py-2 flex items-center gap-2">
          <Timer className="h-5 w-5 text-primary" />
          <span className="text-lg font-mono font-bold text-white tabular-nums">
            {formatTime(currentTime)}
          </span>
        </div>
      </div>

      {/* Bottom center - Controls hint */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-4 text-white/60 text-sm">
        <kbd className="px-2 py-1 bg-black/50 rounded border border-white/10">WASD</kbd>
        <span>Move</span>
        <kbd className="px-2 py-1 bg-black/50 rounded border border-white/10">Space</kbd>
        <span>Jump</span>
        <kbd className="px-2 py-1 bg-black/50 rounded border border-white/10">Mouse</kbd>
        <span>Look</span>
        <kbd className="px-2 py-1 bg-black/50 rounded border border-white/10">Esc</kbd>
        <span>Pause</span>
      </div>

      {/* Level indicator */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 glass-dark rounded-lg px-4 py-1 text-sm text-white/80">
        {levelId.replace('level-', 'Level ')}
      </div>
    </div>
  );
}