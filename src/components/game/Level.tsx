'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LevelData, ObstacleData, CollectibleData, MovingPlatformData } from '@/lib/game/levels';

interface LevelProps {
  level: LevelData;
}

export function Level({ level }: LevelProps) {
  const obstaclesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const collectiblesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const platformsRef = useRef<Map<string, THREE.Mesh>>(new Map());

  // Create obstacle geometries and materials
  const obstacleGeometries = useMemo(() => {
    const geoms = new Map<string, THREE.BufferGeometry>();
    level.obstacles.forEach((obs) => {
      const key = `${obs.type}-${JSON.stringify(obs.scale || [1,1,1])}`;
      if (!geoms.has(key)) {
        let geom: THREE.BufferGeometry;
        if (obs.type === 'spike') {
          geom = new THREE.ConeGeometry((obs.scale?.[0] || 1) / 2, obs.scale?.[1] || 1, 4);
        } else {
          const scale = obs.scale || [1, 1, 1];
          geom = new THREE.BoxGeometry(scale[0], scale[1], scale[2]);
        }
        geoms.set(key, geom);
      }
    });
    return geoms;
  }, [level.obstacles]);

  const obstacleMaterials = useMemo(() => {
    const mats = new Map<string, THREE.Material>();
    level.obstacles.forEach((obs) => {
      const color = obs.color || '#16213e';
      if (!mats.has(color)) {
        mats.set(color, new THREE.MeshStandardMaterial({
          color,
          metalness: 0.3,
          roughness: 0.7,
          emissive: new THREE.Color(color).multiplyScalar(0.1),
          emissiveIntensity: 0.5,
        }));
      }
    });
    return mats;
  }, [level.obstacles]);

  // Create collectible geometries and materials
  const collectibleGeometries = useMemo(() => {
    const geoms = new Map<string, THREE.BufferGeometry>();
    level.collectibles.forEach((col) => {
      const key = col.type;
      if (!geoms.has(key)) {
        let geom: THREE.BufferGeometry;
        switch (col.type) {
          case 'coin':
            geom = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16);
            break;
          case 'gem':
            geom = new THREE.OctahedronGeometry(0.5);
            break;
          case 'key':
            geom = new THREE.TorusGeometry(0.3, 0.1, 8, 16);
            break;
          case 'powerup':
            geom = new THREE.IcosahedronGeometry(0.5);
            break;
          default:
            geom = new THREE.SphereGeometry(0.4);
        }
        geoms.set(key, geom);
      }
    });
    return geoms;
  }, [level.collectibles]);

  const collectibleMaterials = useMemo(() => {
    const mats = new Map<string, THREE.Material>();
    level.collectibles.forEach((col) => {
      let color: string;
      switch (col.type) {
        case 'coin': color = '#ffd700'; break;
        case 'gem': color = '#00ffff'; break;
        case 'key': color = '#ff6b35'; break;
        case 'powerup': color = '#ff00ff'; break;
        default: color = '#ffffff';
      }
      if (!mats.has(color)) {
        mats.set(color, new THREE.MeshStandardMaterial({
          color,
          metalness: 0.8,
          roughness: 0.2,
          emissive: new THREE.Color(color),
          emissiveIntensity: 0.8,
        }));
      }
    });
    return mats;
  }, [level.collectibles]);

  // Initialize meshes
  useEffect(() => {
    // Obstacles
    level.obstacles.forEach((obs) => {
      const scale = obs.scale || [1, 1, 1];
      const key = `${obs.type}-${JSON.stringify(scale)}`;
      const geom = obstacleGeometries.get(key);
      const mat = obstacleMaterials.get(obs.color || '#16213e');
      if (geom && mat) {
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(...obs.position);
        if (obs.rotation) {
          mesh.rotation.set(...obs.rotation);
        }
        mesh.scale.set(...scale);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData = { type: obs.type, ...obs.properties };
        obstaclesRef.current.set(obs.id, mesh);
      }
    });

    // Collectibles
    level.collectibles.forEach((col) => {
      const geom = collectibleGeometries.get(col.type);
      let color: string;
      switch (col.type) {
        case 'coin': color = '#ffd700'; break;
        case 'gem': color = '#00ffff'; break;
        case 'key': color = '#ff6b35'; break;
        case 'powerup': color = '#ff00ff'; break;
        default: color = '#ffffff';
      }
      const mat = collectibleMaterials.get(color);
      if (geom && mat) {
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(...col.position);
        mesh.castShadow = true;
        mesh.userData = { ...col, collected: false };
        collectiblesRef.current.set(col.id, mesh);
      }
    });

    // Moving platforms
    level.movingPlatforms.forEach((platform) => {
      const geom = new THREE.BoxGeometry(...platform.scale);
      const mat = new THREE.MeshStandardMaterial({
        color: '#0f3460',
        metalness: 0.3,
        roughness: 0.7,
        emissive: new THREE.Color('#0f3460').multiplyScalar(0.1),
        emissiveIntensity: 0.5,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(...platform.position);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      platformsRef.current.set(platform.id, mesh);
    });
  }, [level, obstacleGeometries, obstacleMaterials, collectibleGeometries, collectibleMaterials]);

  // Animation loop
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Animate collectibles
    collectiblesRef.current.forEach((mesh, id) => {
      const col = level.collectibles.find((c) => c.id === id);
      if (col && !col.collected) {
        const speed = col.rotationSpeed || 1;
        mesh.rotation.y += delta * speed;
        mesh.position.y = col.position[1] + Math.sin(time * 2 + col.position[0]) * 0.2;
      }
    });

    // Animate rotating obstacles
    obstaclesRef.current.forEach((mesh, id) => {
      const obs = level.obstacles.find((o) => o.id === id);
      if (obs && obs.type === 'rotating' && obs.properties?.speed) {
        mesh.rotation.y += delta * obs.properties.speed;
      }
    });

    // Animate swinging obstacles
    obstaclesRef.current.forEach((mesh, id) => {
      const obs = level.obstacles.find((o) => o.id === id);
      if (obs && obs.type === 'swinging' && obs.properties?.amplitude && obs.properties?.speed) {
        mesh.position.x = obs.position[0] + Math.sin(time * obs.properties.speed) * obs.properties.amplitude;
      }
    });

    // Animate moving platforms
    platformsRef.current.forEach((mesh, id) => {
      const platform = level.movingPlatforms.find((p) => p.id === id);
      if (platform && platform.path.length >= 2) {
        const t = (Math.sin(time * platform.speed) + 1) / 2;
        const start = new THREE.Vector3(...platform.path[0]);
        const end = new THREE.Vector3(...platform.path[1]);
        const pos = start.lerp(end, platform.loop ? t : Math.min(1, t));
        mesh.position.copy(pos);
        if (platform.body) {
          platform.body.position.copy(pos);
        }
      }
    });

    // Pulse lava
    obstaclesRef.current.forEach((mesh, id) => {
      const obs = level.obstacles.find((o) => o.id === id);
      if (obs && obs.type === 'lava') {
        const intensity = 0.5 + Math.sin(time * 4) * 0.3;
        if (mesh.material instanceof THREE.MeshStandardMaterial) {
          mesh.material.emissiveIntensity = intensity;
        }
      }
    });
  });

  return (
    <group>
      {/* Obstacles */}
      {Array.from(obstaclesRef.current.values()).map((mesh, i) => (
        <primitive key={`obs-${i}`} object={mesh} dispose={null} />
      ))}

      {/* Collectibles */}
      {Array.from(collectiblesRef.current.values()).map((mesh, i) => (
        <primitive key={`col-${i}`} object={mesh} dispose={null} />
      ))}

      {/* Moving Platforms */}
      {Array.from(platformsRef.current.values()).map((mesh, i) => (
        <primitive key={`plat-${i}`} object={mesh} dispose={null} />
      ))}

      {/* Goal marker */}
      <mesh position={level.goalPosition} castShadow>
        <cylinderGeometry args={[2, 2, 0.2, 16]} />
        <meshStandardMaterial
          color="#00ff00"
          emissive="#00ff00"
          emissiveIntensity={1}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[level.goalPosition[0], level.goalPosition[1] + 2, level.goalPosition[2])} castShadow>
        <boxGeometry args={[0.5, 4, 0.5]} />
        <meshStandardMaterial
          color="#00ff00"
          emissive="#00ff00"
          emissiveIntensity={1}
        />
      </mesh>
    </group>
  );
}