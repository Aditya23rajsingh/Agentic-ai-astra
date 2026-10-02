'use client';

import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, Html, Effects, Bloom, ContactShadows } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useGameStore, initialState } from '@/lib/game/store';
import { getLevel } from '@/lib/game/levels';
import { Player } from './Player';
import { Level } from './Level';
import { HUD } from './HUD';
import { PauseMenu } from './PauseMenu';
import { GameOverScreen } from './GameOverScreen';
import { LevelCompleteScreen } from './LevelCompleteScreen';

export function GameCanvas() {
  const { levelId, isPlaying, isPaused, isGameOver, isLevelComplete, resetLevel, setPlaying, setPaused } = useGameStore();
  const [mounted, setMounted] = useState(false);
  const level = getLevel(levelId);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !level) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [0, 5, 10], fov: 75 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        shadows={true}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1;
        }}
      >
        <Effects multisampling={8}>
          <Bloom
            intensity={0.5}
            luminanceThreshold={0.8}
            luminanceSmoothing={0.025}
            height={0.5}
          />
        </Effects>

        <fog attach="fog" args={['#0a0a1a', 10, 80]} />

        <ambientLight intensity={0.5} color="#ffffff" />
        <directionalLight
          position={[10, 20, 10]}
          intensity={2}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={1}
          shadow-camera-far={100}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
          shadow-bias={-0.001}
        />

        <Level level={level} />

        <Player level={level} />

        <ContactShadows
          position={[0, -0.5, 0]}
          opacity={0.3}
          scale={100}
          blur={2}
          far={50}
        />

        <Html
          position={[0, 0, 0]}
          transform
          sprite
          fullscreen
          distanceFactor={10}
          zIndexRange={[100, 200]}
        >
          <HUD />
          {isPaused && !isGameOver && !isLevelComplete && <PauseMenu onResume={() => setPaused(false)} onRestart={resetLevel} />}
          {isGameOver && <GameOverScreen onRestart={resetLevel} />}
          {isLevelComplete && <LevelCompleteScreen onNextLevel={() => {}} onRestart={resetLevel} />}
        </Html>
      </Canvas>
    </div>
  );
}