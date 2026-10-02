'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/lib/game/store';
import { GameCanvas } from '@/components/game/GameCanvas';
import { ArrowLeft, Play, Settings, Trophy, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getAllLevels } from '@/lib/game/levels';

export default function GamePage() {
  const { isPlaying, isPaused, isGameOver, isLevelComplete, setPlaying, setLevel, levelId, resetLevel } = useGameStore();
  const [mounted, setMounted] = useState(false);
  const levels = getAllLevels();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const handleStartGame = (level: string) => {
    setLevel(level);
    resetLevel();
    setPlaying(true);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Game Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Dashboard</span>
          </Link>
          
          <h1 className="text-xl font-bold">Neon Corridors</h1>
          
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isPlaying ? 'bg-green-500/20 text-green-400' :
              isPaused ? 'bg-yellow-500/20 text-yellow-400' :
              isGameOver ? 'bg-red-500/20 text-red-400' :
              isLevelComplete ? 'bg-green-500/20 text-green-400' :
              'bg-muted text-muted-foreground'
            }`}>
              {isPlaying ? 'Playing' : isPaused ? 'Paused' : isGameOver ? 'Game Over' : isLevelComplete ? 'Level Complete' : 'Ready'}
            </span>
          </div>
        </div>
      </header>

      {/* Game Canvas */}
      <main className="flex-1 relative overflow-hidden">
        {(!isPlaying && !isGameOver && !isLevelComplete) ? (
          {/* Level Selection Screen */}
          <div className="flex h-full items-center justify-center p-4">
            <div className="w-full max-w-4xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Select Level</h2>
                <p className="text-muted-foreground">Choose a level to start playing</p>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                {levels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => handleStartGame(level.id)}
                    disabled={isPlaying}
                    className="group relative rounded-xl border border-border bg-card p-6 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all text-left"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{level.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{level.description}</p>
                      </div>
                      <Play className="h-8 w-8 text-primary/50 group-hover:text-primary group-hover:scale-110 transition-all" />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="glass rounded-lg p-3">
                        <Trophy className="h-4 w-4 text-yellow-500 mb-1" />
                        <p className="font-mono font-bold">{level.parScore || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">Par Score</p>
                      </div>
                      <div className="glass rounded-lg p-3">
                        <Trophy className="h-4 w-4 text-primary mb-1" />
                        <p className="font-mono font-bold">{level.parTime ? `${level.parTime}s` : 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">Par Time</p>
                      </div>
                      <div className="glass rounded-lg p-3">
                        <Trophy className="h-4 w-4 text-green-500 mb-1" />
                        <p className="font-mono font-bold">{level.collectibles.length}</p>
                        <p className="text-xs text-muted-foreground">Collectibles</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <GameCanvas />
        )}
      </main>
    </div>
  );
}

import { useState } from 'react';