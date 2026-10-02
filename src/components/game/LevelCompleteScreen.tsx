'use client';

import { useGameStore } from '@/lib/game/store';
import { ArrowRight, RotateCcw, Home, Trophy, Timer, Target, CheckCircle } from 'lucide-react';
import { formatTime } from '@/lib/utils';

interface LevelCompleteScreenProps {
  onNextLevel: () => void;
  onRestart: () => void;
}

export function LevelCompleteScreen({ onNextLevel, onRestart }: LevelCompleteScreenProps) {
  const { score, currentTime, levelId, levelProgress } = useGameStore();
  const levelNum = parseInt(levelId.replace('level-', ''));
  const nextLevel = `level-${levelNum + 1}`;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-20 pointer-events-auto">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      <div className="relative glass-dark rounded-2xl p-8 min-w-[400px] max-w-md w-full mx-4 pointer-events-auto animate-in fade-in zoom-in-95 duration-200 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        
        <h2 className="text-3xl font-bold mb-1">Level Complete!</h2>
        <p className="text-muted-foreground mb-6">Level {levelNum} cleared successfully</p>

        <div className="grid grid-cols-3 gap-4 mb-6 glass-dark/50 rounded-xl p-4">
          <div>
            <Trophy className="h-6 w-6 mx-auto text-yellow-500 mb-1" />
            <p className="text-2xl font-bold font-mono">{score.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Score</p>
          </div>
          <div>
            <Timer className="h-6 w-6 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold font-mono">{formatTime(currentTime)}</p>
            <p className="text-xs text-muted-foreground">Time</p>
          </div>
          <div>
            <Target className="h-6 w-6 mx-auto text-green-500 mb-1" />
            <p className="text-2xl font-bold font-mono">100%</p>
            <p className="text-xs text-muted-foreground">Progress</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onNextLevel}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-lg font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <ArrowRight className="h-5 w-5" />
            Next Level
          </button>
          <button
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-3 text-lg font-medium text-foreground hover:bg-muted transition-colors"
          >
            <RotateCcw className="h-5 w-5" />
            Replay Level
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-3 text-lg font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Home className="h-5 w-5" />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}