import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GameState {
  // Player state
  position: [number, number, number];
  rotation: [number, number, number];
  velocity: [number, number, number];
  isGrounded: boolean;
  health: number;
  maxHealth: number;
  
  // Game state
  score: number;
  levelId: string;
  levelProgress: number;
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  isLevelComplete: boolean;
  startTime: number;
  currentTime: number;
  
  // Settings
  sensitivity: number;
  fov: number;
  quality: 'low' | 'medium' | 'high';
  
  // Actions
  setPosition: (pos: [number, number, number]) => void;
  setRotation: (rot: [number, number, number]) => void;
  setVelocity: (vel: [number, number, number]) => void;
  setGrounded: (grounded: boolean) => void;
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;
  addScore: (points: number) => void;
  setLevelProgress: (progress: number) => void;
  setPlaying: (playing: boolean) => void;
  setPaused: (paused: boolean) => void;
  setGameOver: (over: boolean) => void;
  setLevelComplete: (complete: boolean) => void;
  updateTime: (time: number) => void;
  resetGame: () => void;
  resetLevel: () => void;
  setLevel: (levelId: string) => void;
  setSensitivity: (sens: number) => void;
  setFov: (fov: number) => void;
  setQuality: (quality: 'low' | 'medium' | 'high') => void;
}

const initialState = {
  position: [0, 1.5, 0] as [number, number, number],
  rotation: [0, 0, 0] as [number, number, number],
  velocity: [0, 0, 0] as [number, number, number],
  isGrounded: false,
  health: 100,
  maxHealth: 100,
  score: 0,
  levelId: 'level-1',
  levelProgress: 0,
  isPlaying: false,
  isPaused: false,
  isGameOver: false,
  isLevelComplete: false,
  startTime: 0,
  currentTime: 0,
  sensitivity: 0.002,
  fov: 75,
  quality: 'high' as const,
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setPosition: (pos) => set({ position: pos }),
      setRotation: (rot) => set({ rotation: rot }),
      setVelocity: (vel) => set({ velocity: vel }),
      setGrounded: (grounded) => set({ isGrounded: grounded }),
      
      takeDamage: (amount) => set((state) => ({
        health: Math.max(0, state.health - amount),
        isGameOver: state.health - amount <= 0,
      })),
      
      heal: (amount) => set((state) => ({
        health: Math.min(state.maxHealth, state.health + amount),
      })),
      
      addScore: (points) => set((state) => ({
        score: state.score + points,
      })),
      
      setLevelProgress: (progress) => set({ levelProgress: Math.max(0, Math.min(1, progress)) }),
      
      setPlaying: (playing) => set({ 
        isPlaying: playing,
        startTime: playing ? Date.now() : get().startTime,
      }),
      
      setPaused: (paused) => set({ isPaused: paused }),
      
      setGameOver: (over) => set({ isGameOver: over, isPlaying: !over }),
      
      setLevelComplete: (complete) => set({ 
        isLevelComplete: complete,
        isPlaying: !complete,
      }),
      
      updateTime: (time) => set({ currentTime: time }),
      
      resetGame: () => set(initialState),
      
      resetLevel: () => set((state) => ({
        ...initialState,
        levelId: state.levelId,
        sensitivity: state.sensitivity,
        fov: state.fov,
        quality: state.quality,
      })),
      
      setLevel: (levelId) => set({ levelId, levelProgress: 0 }),
      
      setSensitivity: (sensitivity) => set({ sensitivity }),
      setFov: (fov) => set({ fov }),
      setQuality: (quality) => set({ quality }),
    }),
    {
      name: 'game-settings',
      partialize: (state) => ({
        sensitivity: state.sensitivity,
        fov: state.fov,
        quality: state.quality,
      }),
    }
  )
);