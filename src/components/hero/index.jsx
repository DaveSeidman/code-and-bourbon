import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import './index.scss';
import { BoxGeometry, MeshNormalMaterial } from 'three';

function Cubes() {
  const [cubes, setCubes] = useState([]);
  const pointer = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const prevPointer = useRef();
  const TORQUE_SWITCH_THRESHOLD = 2;

  const mouseMove = (e) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1; // Normalize to range -1 to 1
    const y = (1 - e.clientY / window.innerHeight) * 2 - 1; // Normalize to range -1 to 1
    if (!prevPointer.current) prevPointer.current = { x, y };
    pointer.current = { x, y, vx: x - prevPointer.current.x, vy: y - prevPointer.current.y };

    setCubes((prevCubes) => prevCubes.map((cube) => {
      const dx = cube.position[0] - x;
      const dy = cube.position[1] - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const influence = Math.max(0, 1 - distance);

      const newTorque = { ...cube.torque };
      const newRotation = [...cube.rotation];
      let newDirection = cube.direction;

      if (!cube.direction) {
        newDirection = Math.abs(pointer.current.vx) > Math.abs(pointer.current.vy) ? 'y' : 'x';
      } else if (cube.direction === 'x' && Math.abs(pointer.current.vy) > Math.abs(cube.torque.x) * TORQUE_SWITCH_THRESHOLD) {
        newDirection = 'y';
        newTorque.x = 0;
        newRotation[0] = 0;
      } else if (cube.direction === 'y' && Math.abs(pointer.current.vx) > Math.abs(cube.torque.y) * TORQUE_SWITCH_THRESHOLD) {
        newDirection = 'x';
        newTorque.y = 0;
        newRotation[1] = 0;
      }

      if (newDirection === 'x') {
        newTorque.x += pointer.current.vy * influence * -1;
      } else {
        newTorque.y += pointer.current.vx * influence * 1;
      }

      return {
        ...cube,
        torque: newTorque,
        rotation: newRotation,
        direction: newDirection,
      };
    }));

    prevPointer.current = { ...pointer.current };
  };

  useFrame(() => {
    setCubes((prevCubes) => prevCubes.map((cube) => {
      const newRotation = [
        cube.rotation[0] + cube.torque.x,
        cube.rotation[1] + cube.torque.y,
        cube.rotation[2],
      ];
      return {
        ...cube,
        rotation: newRotation,
        torque: {
          x: cube.torque.x * 0.975,
          y: cube.torque.y * 0.975,
        },
      };
    }));
  });

  useEffect(() => {
    const size = 50;
    const maxDim = Math.max(window.innerWidth, window.innerHeight);
    const cols = Math.ceil(maxDim / size);
    const rows = Math.ceil(maxDim / size);
    const nextCubes = [];
    for (let col = 0; col < cols; col += 1) {
      for (let row = 0; row < rows; row += 1) {
        nextCubes.push({
          position: [((col / cols) - 0.5) * 4, ((row / rows) - 0.5) * 4, 0],
          rotation: [0, 0, 0],
          torque: { x: 0, y: 0 },
          direction: null,
        });
      }
    }
    setCubes(nextCubes);

    window.addEventListener('mousemove', mouseMove);
    return () => {
      window.removeEventListener('mousemove', mouseMove);
    };
  }, []);

  return (
    <group>
      {cubes.map((cube, index) => (
        <mesh
          key={index}
          rotation={cube.rotation}
          position={cube.position}
        >
          <boxGeometry args={[0.15, 0.15, 0.15]} />
          <meshNormalMaterial />
        </mesh>
      ))}
    </group>
  );
}

export default function Hero() {
  return (
    <div className="hero">
      <Canvas camera={{ position: [0, 0, 10], fov: 15 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Cubes />
      </Canvas>
    </div>
  );
}
