'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { useGameStore } from '@/lib/game/store';
import { LevelData } from '@/lib/game/levels';

interface PlayerProps {
  level: LevelData;
}

export function Player({ level }: PlayerProps) {
  const {
    position,
    rotation,
    velocity,
    isGrounded,
    health,
    score,
    isPlaying,
    isPaused,
    isGameOver,
    isLevelComplete,
    setPosition,
    setRotation,
    setVelocity,
    setGrounded,
    takeDamage,
    addScore,
    setLevelProgress,
    setGameOver,
    setLevelComplete,
    updateTime,
    startTime,
  } = useGameStore();

  const playerRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<CANNON.Body>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const pointerLockedRef = useRef(false);
  const worldRef = useRef<CANNON.World>(null);
  const lastTimeRef = useRef(0);

  const { camera, gl, size } = useThree();

  // Initialize physics world
  useEffect(() => {
    const world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -30, 0),
    });
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;
    world.defaultContactMaterial.restitution = 0;
    world.defaultContactMaterial.friction = 0.5;
    worldRef.current = world;

    // Create player body
    const shape = new CANNON.Cylinder(0.5, 0.5, 1.8, 8);
    const body = new CANNON.Body({
      mass: 80,
      shape,
      material: new CANNON.Material('player'),
      fixedRotation: true,
    });
    body.position.set(...level.spawnPoint);
    world.addBody(body);
    bodyRef.current = body;

    // Create ground body
    const groundShape = new CANNON.Box(new CANNON.Vec3(50, 0.5, 50));
    const groundBody = new CANNON.Body({
      mass: 0,
      shape: groundShape,
      material: new CANNON.Material('ground'),
    });
    groundBody.position.set(0, -0.5, 0);
    world.addBody(groundBody);

    // Add level obstacles to physics
    level.obstacles.forEach((obs) => {
      if (obs.type === 'box' || obs.type === 'wall') {
        const scale = obs.scale || [1, 1, 1];
        const shape = new CANNON.Box(new CANNON.Vec3(scale[0] / 2, scale[1] / 2, scale[2] / 2));
        const obstacleBody = new CANNON.Body({
          mass: 0,
          shape,
        });
        obstacleBody.position.set(...obs.position);
        if (obs.rotation) {
          obstacleBody.quaternion.setFromEuler(...obs.rotation);
        }
        world.addBody(obstacleBody);
      }
    });

    // Add moving platforms
    level.movingPlatforms.forEach((platform) => {
      const scale = platform.scale;
      const shape = new CANNON.Box(new CANNON.Vec3(scale[0] / 2, scale[1] / 2, scale[2] / 2));
      const platformBody = new CANNON.Body({
        mass: 0,
        shape,
        collisionResponse: true,
      });
      platformBody.position.set(...platform.position);
      world.addBody(platformBody);
      platform.body = platformBody;
    });

    return () => {
      world.removeBody(body);
      level.obstacles.forEach(() => {});
      level.movingPlatforms.forEach(() => {});
    };
  }, [level]);

  // Pointer lock for mouse look
  useEffect(() => {
    const canvas = gl.domElement;
    const onClick = () => canvas.requestPointerLock();
    const onPointerLockChange = () => {
      pointerLockedRef.current = document.pointerLockElement === canvas;
    };

    canvas.addEventListener('click', onClick);
    document.addEventListener('pointerlockchange', onPointerLockChange);

    return () => {
      canvas.removeEventListener('click', onClick);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
    };
  }, [gl]);

  // Keyboard input
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
      if (e.code === 'Escape') {
        document.exitPointerLock();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Mouse movement for camera rotation
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!pointerLockedRef.current || isPaused || isGameOver || isLevelComplete) return;

      const sensitivity = useGameStore.getState().sensitivity;
      const [yaw, pitch] = useGameStore.getState().rotation;

      const newYaw = yaw - e.movementX * sensitivity;
      const newPitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch - e.movementY * sensitivity));

      useGameStore.getState().setRotation([newYaw, newPitch, 0]);
    };

    document.addEventListener('mousemove', onMouseMove);
    return () => document.removeEventListener('mousemove', onMouseMove);
  }, [isPaused, isGameOver, isLevelComplete]);

  // Physics and movement update
  useFrame((state, delta) => {
    if (!isPlaying || isPaused || isGameOver || isLevelComplete || !bodyRef.current) return;

    const body = bodyRef.current;
    const world = worldRef.current;
    if (!world) return;

    // Step physics
    world.step(1 / 60, delta, 3);

    // Update player position from physics
    const pos = body.position;
    setPosition([pos.x, pos.y, pos.z]);

    // Check grounded
    const ray = new CANNON.Ray(body.position, new CANNON.Vec3(0, -1, 0));
    ray.intersectWorld(world, {
      collisionFilterMask: -1,
      skipBackfaces: true,
    });
    const grounded = ray.hasHit && ray.result.distance < 1.1;
    setGrounded(grounded);

    // Movement input
    const moveSpeed = 15;
    const jumpForce = 220;
    const input = new CANNON.Vec3(0, 0, 0);

    const yaw = useGameStore.getState().rotation[0];
    const forward = new CANNON.Vec3(-Math.sin(yaw), 0, -Math.cos(yaw));
    const right = new CANNON.Vec3(Math.cos(yaw), 0, -Math.sin(yaw));

    if (keysRef.current['KeyW'] || keysRef.current['ArrowUp']) input.vadd(forward, input);
    if (keysRef.current['KeyS'] || keysRef.current['ArrowDown']) input.vsub(forward, input);
    if (keysRef.current['KeyD'] || keysRef.current['ArrowRight']) input.vadd(right, input);
    if (keysRef.current['KeyA'] || keysRef.current['ArrowLeft']) input.vsub(right, input);

    if (input.length() > 0) {
      input.normalize();
      input.scale(moveSpeed, input);
      body.velocity.x = input.x;
      body.velocity.z = input.z;
    } else {
      body.velocity.x *= 0.8;
      body.velocity.z *= 0.8;
    }

    if ((keysRef.current['Space'] || keysRef.current['ArrowUp']) && grounded) {
      body.velocity.y = jumpForce;
    }

    // Update camera
    if (cameraRef.current) {
      cameraRef.current.position.set(pos.x, pos.y + 0.8, pos.z);
      cameraRef.current.rotation.set(
        useGameStore.getState().rotation[1],
        useGameStore.getState().rotation[0],
        0,
        'YXZ'
      );
    }

    // Update three.js camera
    camera.position.copy(cameraRef.current?.position || new THREE.Vector3());
    camera.rotation.copy(cameraRef.current?.rotation || new THREE.Euler());
    camera.updateProjectionMatrix();

    // Check collectibles
    level.collectibles.forEach((collectible) => {
      if (!collectible.collected) {
        const dist = Math.sqrt(
          Math.pow(pos.x - collectible.position[0], 2) +
          Math.pow(pos.y - collectible.position[1], 2) +
          Math.pow(pos.z - collectible.position[2], 2)
        );
        if (dist < 1.5) {
          collectible.collected = true;
          addScore(collectible.value);
        }
      }
    });

    // Check goal
    const goalDist = Math.sqrt(
      Math.pow(pos.x - level.goalPosition[0], 2) +
      Math.pow(pos.y - level.goalPosition[1], 2) +
      Math.pow(pos.z - level.goalPosition[2], 2)
    );
    if (goalDist < 3) {
      setLevelComplete(true);
    }

    // Check hazards
    level.obstacles.forEach((obs) => {
      if (obs.type === 'spike' || obs.type === 'lava') {
        const scale = obs.scale || [1, 1, 1];
        const dist = Math.sqrt(
          Math.pow(pos.x - obs.position[0], 2) +
          Math.pow(pos.y - obs.position[1], 2) +
          Math.pow(pos.z - obs.position[2], 2)
        );
        if (dist < Math.max(scale[0], scale[2]) / 2 + 0.5) {
          takeDamage(obs.type === 'lava' ? 20 : 10);
        }
      }
    });

    // Update time
    updateTime(Date.now() - startTime);

    // Check time limit
    if (level.timeLimit && (Date.now() - startTime) / 1000 > level.timeLimit) {
      setGameOver(true);
    }

    // Check health
    if (health <= 0) {
      setGameOver(true);
    }

    // Update level progress
    const totalDist = Math.sqrt(
      Math.pow(level.spawnPoint[0] - level.goalPosition[0], 2) +
      Math.pow(level.spawnPoint[2] - level.goalPosition[2], 2)
    );
    const currentDist = Math.sqrt(
      Math.pow(pos.x - level.goalPosition[0], 2) +
      Math.pow(pos.z - level.goalPosition[2], 2)
    );
    setLevelProgress(1 - currentDist / totalDist);
  });

  // Sync Three.js camera with ref
  useEffect(() => {
    cameraRef.current = camera;
  }, [camera]);

  return (
    <group ref={playerRef} position={position} rotation={[0, rotation[0], 0]}>
      {/* Player body (invisible in first person, visible in third person) */}
      <mesh visible={false} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.5, 1.8, 8]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}