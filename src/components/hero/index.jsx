import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Environment, RoundedBox } from '@react-three/drei';
import { TextureLoader, BoxGeometry, Vector2, MeshStandardMaterial } from 'three';

import header1Img from '../../assets/images/header1.png';
import logo from '../../assets/images/logo.svg';
import './index.scss';

const edgeLength = 0.18;
const gap = 0.02;
// Shared base geometry
const sharedGeometry = new BoxGeometry(edgeLength, edgeLength, edgeLength);

function Cubes({ pointer }) {
  // const roundedBoxRef = useRef();
  const texture = useLoader(TextureLoader, header1Img);
  const [cubes, setCubes] = useState([]);
  const TORQUE_SWITCH_THRESHOLD = 2;
  const RESET_TWEEN_SPEED = 10;

  useEffect(() => {
    setCubes((prevCubes) => prevCubes.map((cube) => {
      // const dx = cube.position[0] - x;
      // const dy = cube.position[1] - y;
      const dx = cube.position[0] - pointer.x;
      const dy = cube.position[1] - pointer.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const influence = Math.max(0, 1 - distance); // TODO: change one to set the radius of influence

      const newTorque = { ...cube.torque };
      let newDirection = cube.direction;

      if (!cube.direction) {
        newDirection = Math.abs(pointer.vx) > Math.abs(pointer.vy) ? 'y' : 'x';
      } else if (cube.direction === 'x' && Math.abs(pointer.vy) > Math.abs(cube.torque.x) * TORQUE_SWITCH_THRESHOLD) {
        newDirection = 'y';
        newTorque.x = 0;
      } else if (cube.direction === 'y' && Math.abs(pointer.vx) > Math.abs(cube.torque.y) * TORQUE_SWITCH_THRESHOLD) {
        newDirection = 'x';
        newTorque.y = 0;
      }

      if (newDirection === 'x') {
        newTorque.x += pointer.vy * influence * -0.5;
      } else {
        newTorque.y += pointer.vx * influence * 0.5;
      }

      return {
        ...cube,
        torque: newTorque,
        direction: newDirection,
      };
    }));

    // prevPointer.current = { ...pointer.current };
  }, [pointer]);

  useFrame(() => {
    setCubes((prevCubes) => prevCubes.map((cube) => {
      const newRotation = [
        cube.rotation[0] + cube.torque.x,
        cube.rotation[1] + cube.torque.y,
        cube.rotation[2],
      ];

      if (cube.direction === 'x') {
        newRotation[1] += (0 - newRotation[1]) / RESET_TWEEN_SPEED;
      } else {
        newRotation[0] += (0 - newRotation[0]) / RESET_TWEEN_SPEED;
      }

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
    const size = 80;
    const maxDim = Math.max(window.innerWidth, window.innerHeight);
    const cols = Math.ceil(maxDim / size);
    const rows = Math.ceil(maxDim / size);
    const nextCubes = [];

    for (let col = 0; col <= cols; col += 1) {
      for (let row = 0; row <= rows; row += 1) {
        // Clone the shared geometry and modify UVs once
        // const geometry = roundedBoxRef.current.geometry.clone();
        const geometry = sharedGeometry.clone();
        const uv = geometry.attributes.uv.array;

        for (let i = 0; i <= uv.length; i += 2) {
          uv[i] = col / (cols + 1) + uv[i] * (1 / (cols + 1));
          uv[i + 1] = row / (rows + 1) + uv[i + 1] * (1 / (rows + 1));
        }
        geometry.attributes.uv.needsUpdate = true;

        nextCubes.push({
          position: [((col - cols / 2) * (edgeLength + gap)), ((row - rows / 2) * (edgeLength + gap)), 0],
          rotation: [0, 0, 0],
          torque: { x: 0, y: 0 },
          direction: null,
          geometry, // Store precomputed geometry here
        });
      }
    }

    setCubes(nextCubes);
  }, []);

  return (
    <group>
      {/* <RoundedBox ref={roundedBoxRef} args={[edgeLength, edgeLength, edgeLength]} radius={0.001}> </RoundedBox> */}
      {cubes.map((cube, index) => (
        <mesh
          castShadow
          receiveShadow
          key={index}
          rotation={cube.rotation}
          position={cube.position}
          geometry={cube.geometry}
        >
          <meshStandardMaterial
            map={texture}
            metalness={0.2}
            roughness={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function Hero() {
  const [pointer, setPointer] = useState({ x: 0, y: 0, vx: 0, vy: 0 });
  const prevPointer = useRef({ x: 0, y: 0 });

  const mouseMove = (e) => {
    const { top, height, width } = e.target.getBoundingClientRect();
    const x = (e.clientX / width) * 2 - 1;
    const y = (1 - (e.clientY - top) / height) * 2 - 1;

    setPointer(() => {
      const newPointer = { x, y, vx: x - prevPointer.current.x, vy: y - prevPointer.current.y };

      prevPointer.current = { x: newPointer.x, y: newPointer.y };
      return newPointer;
    });
  };

  return (
    <div
      className="hero"
      onMouseMove={mouseMove}
    >
      <Canvas
        shadows
        shadowMap
        camera={{
          position: [0, 0, 10],
          fov: 10,
        }}
      >
        <ambientLight intensity={1.5} />
        <pointLight intensity={10} position={[0, 4, 0]} castShadow />
        <Environment preset="city" />
        <Cubes
          pointer={pointer}
          prevPointer={prevPointer.current}
        />
      </Canvas>
      <div className="hero-logo">
        <img src={logo} />
      </div>
    </div>
  );
}
