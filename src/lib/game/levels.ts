export interface LevelData {
  id: string;
  name: string;
  description: string;
  spawnPoint: [number, number, number];
  goalPosition: [number, number, number];
  obstacles: ObstacleData[];
  collectibles: CollectibleData[];
  movingPlatforms: MovingPlatformData[];
  timeLimit?: number;
  parTime?: number;
  parScore?: number;
}

export interface ObstacleData {
  id: string;
  type: 'box' | 'wall' | 'spike' | 'lava' | 'rotating' | 'swinging';
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  color?: string;
  properties?: Record<string, any>;
}

export interface CollectibleData {
  id: string;
  type: 'coin' | 'gem' | 'key' | 'powerup';
  position: [number, number, number];
  value: number;
  rotationSpeed?: number;
}

export interface MovingPlatformData {
  id: string;
  position: [number, number, number];
  scale: [number, number, number];
  path: [number, number, number][];
  speed: number;
  loop: boolean;
}

export const levels: LevelData[] = [
  {
    id: 'level-1',
    name: 'Neon Corridors - Tutorial',
    description: 'Learn the basics of movement, jumping, and collecting.',
    spawnPoint: [0, 1.5, 0],
    goalPosition: [0, 1.5, -50],
    obstacles: [
      { id: 'floor', type: 'box', position: [0, -0.5, 0], scale: [100, 1, 100], color: '#1a1a2e' },
      { id: 'wall-left', type: 'wall', position: [-10, 2, -25], scale: [1, 4, 50], color: '#16213e' },
      { id: 'wall-right', type: 'wall', position: [10, 2, -25], scale: [1, 4, 50], color: '#16213e' },
      { id: 'platform-1', type: 'box', position: [-5, 1, -10], scale: [3, 0.5, 3], color: '#0f3460' },
      { id: 'platform-2', type: 'box', position: [5, 2, -20], scale: [3, 0.5, 3], color: '#0f3460' },
      { id: 'platform-3', type: 'box', position: [-3, 3, -30], scale: [2, 0.5, 2], color: '#0f3460' },
      { id: 'spike-1', type: 'spike', position: [0, 0.25, -15], scale: [2, 0.5, 2], color: '#e94560' },
      { id: 'rotating-1', type: 'rotating', position: [0, 2, -40], scale: [8, 0.3, 1], color: '#e94560', properties: { speed: 0.5 } },
    ],
    collectibles: [
      { id: 'coin-1', type: 'coin', position: [-5, 2, -10], value: 10, rotationSpeed: 2 },
      { id: 'coin-2', type: 'coin', position: [5, 3, -20], value: 10, rotationSpeed: 2 },
      { id: 'coin-3', type: 'coin', position: [-3, 4, -30], value: 10, rotationSpeed: 2 },
      { id: 'gem-1', type: 'gem', position: [0, 3, -40], value: 50, rotationSpeed: 3 },
      { id: 'coin-4', type: 'coin', position: [0, 2, -50], value: 10, rotationSpeed: 2 },
    ],
    movingPlatforms: [
      {
        id: 'moving-1',
        position: [0, 1.5, -25],
        scale: [3, 0.5, 3],
        path: [[-7, 1.5, -25], [7, 1.5, -25]],
        speed: 2,
        loop: true,
      },
    ],
    timeLimit: 120,
    parTime: 45,
    parScore: 100,
  },
  {
    id: 'level-2',
    name: 'Neon Corridors - The Gauntlet',
    description: 'Navigate moving platforms, avoid rotating blades, and race against time.',
    spawnPoint: [0, 1.5, 0],
    goalPosition: [0, 1.5, -80],
    obstacles: [
      { id: 'floor', type: 'box', position: [0, -0.5, 0], scale: [100, 1, 100], color: '#1a1a2e' },
      { id: 'wall-left', type: 'wall', position: [-12, 2, -40], scale: [1, 4, 80], color: '#16213e' },
      { id: 'wall-right', type: 'wall', position: [12, 2, -40], scale: [1, 4, 80], color: '#16213e' },
      { id: 'rotating-1', type: 'rotating', position: [0, 2, -10], scale: [10, 0.3, 1], color: '#e94560', properties: { speed: 1 } },
      { id: 'rotating-2', type: 'rotating', position: [0, 3, -20], scale: [10, 0.3, 1], color: '#e94560', properties: { speed: -1.5 } },
      { id: 'rotating-3', type: 'rotating', position: [0, 2, -30], scale: [10, 0.3, 1], color: '#e94560', properties: { speed: 2 } },
      { id: 'spike-field', type: 'spike', position: [0, 0.25, -40], scale: [20, 0.5, 10], color: '#e94560' },
      { id: 'lava-1', type: 'lava', position: [-8, 0.25, -50], scale: [4, 0.5, 20], color: '#ff6b35' },
      { id: 'lava-2', type: 'lava', position: [8, 0.25, -50], scale: [4, 0.5, 20], color: '#ff6b35' },
      { id: 'swinging-1', type: 'swinging', position: [0, 5, -60], scale: [1, 8, 1], color: '#e94560', properties: { amplitude: 5, speed: 1 } },
    ],
    collectibles: [
      { id: 'coin-1', type: 'coin', position: [-5, 2, -5], value: 10, rotationSpeed: 2 },
      { id: 'coin-2', type: 'coin', position: [5, 3, -15], value: 10, rotationSpeed: 2 },
      { id: 'gem-1', type: 'gem', position: [0, 4, -25], value: 50, rotationSpeed: 3 },
      { id: 'coin-3', type: 'coin', position: [-8, 2, -35], value: 10, rotationSpeed: 2 },
      { id: 'coin-4', type: 'coin', position: [8, 2, -35], value: 10, rotationSpeed: 2 },
      { id: 'powerup-1', type: 'powerup', position: [0, 2, -45], value: 100, rotationSpeed: 4 },
      { id: 'coin-5', type: 'coin', position: [-5, 2, -55], value: 10, rotationSpeed: 2 },
      { id: 'coin-6', type: 'coin', position: [5, 2, -55], value: 10, rotationSpeed: 2 },
      { id: 'gem-2', type: 'gem', position: [0, 3, -70], value: 50, rotationSpeed: 3 },
      { id: 'coin-7', type: 'coin', position: [0, 2, -80], value: 10, rotationSpeed: 2 },
    ],
    movingPlatforms: [
      {
        id: 'moving-1',
        position: [-5, 1.5, -15],
        scale: [2, 0.5, 2],
        path: [[-5, 1.5, -15], [-5, 3.5, -15]],
        speed: 1.5,
        loop: true,
      },
      {
        id: 'moving-2',
        position: [5, 1.5, -25],
        scale: [2, 0.5, 2],
        path: [[5, 1.5, -25], [5, 4, -25]],
        speed: 1.5,
        loop: true,
      },
      {
        id: 'moving-3',
        position: [0, 1.5, -55],
        scale: [4, 0.5, 4],
        path: [[-8, 1.5, -55], [8, 1.5, -55]],
        speed: 2,
        loop: true,
      },
    ],
    timeLimit: 180,
    parTime: 90,
    parScore: 250,
  },
];

export function getLevel(id: string): LevelData | undefined {
  return levels.find((l) => l.id === id);
}

export function getAllLevels(): LevelData[] {
  return levels;
}