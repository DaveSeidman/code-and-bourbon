import { useMemo, useState, useRef, useEffect } from "react";
import { Canvas, useLoader, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  useGLTF,
  MeshTransmissionMaterial,
} from "@react-three/drei";
import * as THREE from "three";
import glassModel from "../../assets/models/glass2.glb";
import logo from "../../assets/images/logo.svg";
import "./index.scss";

const isMobileDevice = () => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const touch =
    typeof window !== "undefined" &&
    ("ontouchstart" in window || navigator.maxTouchPoints > 0);
  return touch && /iPhone|iPad|iPod|Android/i.test(ua);
};

function PhotoRing({ count = 6, radius = 10 }) {
  const textures = useLoader(
    THREE.TextureLoader,
    Array.from({ length: count }, (_, i) => `/images/image${i + 1}.JPG`)
  );

  const photos = useMemo(() => {
    return textures.map((texture, i) => {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;

      return {
        texture,
        position: [x, -3.5, z],
        rotation: [0, angle, 0],
      };
    });
  }, [textures, count, radius]);

  return (
    <group>
      {photos.map((photo, i) => (
        <mesh key={i} position={photo.position} rotation={photo.rotation}>
          <planeGeometry args={[18, 13]} />
          <meshBasicMaterial
            map={photo.texture}
            side={THREE.BackSide}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function GlassModel({ isMobile }) {
  const { scene } = useGLTF(glassModel);

  const quality = useMemo(() => {
    // tweak these freely
    return isMobile
      ? {
        transmissionSamples: 1,
        transmissionResolution: 128,
        chromaticAberration: 0.0,
        distortion: 0.25,
        envMapIntensityThin: 5,
      }
      : {
        transmissionSamples: 4,
        transmissionResolution: 512,
        chromaticAberration: 0.2,
        distortion: 0.8,
        envMapIntensityThin: 15,
      };
  }, [isMobile]);

  const glassMeshes = useMemo(() => {
    const meshes = [];
    scene.traverse((child) => {
      if (child.isMesh) {
        const name = child.material?.name;
        if (name === "glass-thick" || (name && name.includes("glass-thin"))) {
          meshes.push({ mesh: child, type: name });
          child.visible = false;
        }
      }
    });
    return meshes;
  }, [scene]);

  return (
    <group>
      <primitive object={scene} />
      {glassMeshes.map(({ mesh, type }) => (
        <mesh
          key={mesh.uuid}
          geometry={mesh.geometry}
          position={mesh.position}
          rotation={mesh.rotation}
          scale={mesh.scale}
        >
          {type === "glass-thick" ? (
            <MeshTransmissionMaterial
              transmission={1}
              roughness={0.3}
              thickness={0.05}
              ior={1.4}
              color={'rgb(206, 228, 226)'}
              chromaticAberration={quality.chromaticAberration}
              backside={true}
              backsideThickness={0.04}
              samples={quality.transmissionSamples}
              resolution={quality.transmissionResolution}
              distortion={quality.distortion}
              distortionScale={0.1}
              clearcoat={0.4}
              clearcoatRoughness={0.2}
              envMapIntensity={0.1}
            />
          ) : (
            <meshPhysicalMaterial
              transparent
              opacity={0.15}
              roughness={0.2}
              metalness={0.9}
              envMapIntensity={quality.envMapIntensityThin}
              clearcoat={0.5}
              clearcoatRoughness={0.4}
            />
          )}
        </mesh>
      ))}
    </group>
  );
}

function CameraController({ baseFov = 20, zoomFov = 35 }) {
  const { camera, gl, invalidate } = useThree();
  const [isDown, setIsDown] = useState(false);
  const velocity = useRef(0);
  const currentFov = useRef(baseFov);

  useFrame(() => {
    const target = isDown ? zoomFov : baseFov;

    // Your original values
    const stiffness = 0.25;
    const damping = 0.55;

    const displacement = target - currentFov.current;
    velocity.current += displacement * stiffness;
    velocity.current *= damping;
    currentFov.current += velocity.current;

    camera.fov = currentFov.current;
    camera.updateProjectionMatrix();

    // Keep demand-rendering alive only while we're still moving
    if (Math.abs(displacement) > 0.0005 || Math.abs(velocity.current) > 0.0005) {
      invalidate();
    }
  });

  useEffect(() => {
    const canvas = gl.domElement;

    const handleDown = () => {
      setIsDown(true);
      invalidate();
    };
    const handleUp = () => {
      setIsDown(false);
      invalidate();
    };

    canvas.addEventListener("pointerdown", handleDown);
    window.addEventListener("pointerup", handleUp);
    canvas.addEventListener("pointerleave", handleUp);

    return () => {
      canvas.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("pointerup", handleUp);
      canvas.removeEventListener("pointerleave", handleUp);
    };
  }, [gl, invalidate]);

  return null;
}

function OrbitMomentum({ controlsRef, orbitVelRef }) {
  const { invalidate } = useThree();
  const isDragging = useRef(false);
  const lastAz = useRef(null);

  const baseDrift = 0.10;  // rad/sec initial + minimum drift
  const halfLife = 5.0;    // seconds
  const maxRadPerSec = 1.2;

  const RAD_PER_SEC_PER_AUTOUNIT = (2 * Math.PI) / 60;

  const wrapDelta = (d) =>
    THREE.MathUtils.euclideanModulo(d + Math.PI, Math.PI * 2) - Math.PI;

  useEffect(() => {
    const down = () => (isDragging.current = true);
    const up = () => (isDragging.current = false);

    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  useFrame((_, dt) => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (lastAz.current == null) {
      lastAz.current = controls.getAzimuthalAngle();
      orbitVelRef.current = baseDrift;
    }

    const az = controls.getAzimuthalAngle();
    const delta = wrapDelta(az - lastAz.current);
    const measuredVel = delta / Math.max(dt, 1e-4);

    if (isDragging.current) {
      orbitVelRef.current = measuredVel;
    } else {
      const sign = Math.sign(orbitVelRef.current) || 1;
      const target = sign * baseDrift;
      const decay = Math.pow(0.5, dt / halfLife);
      orbitVelRef.current = target + (orbitVelRef.current - target) * decay;
    }

    orbitVelRef.current = THREE.MathUtils.clamp(
      orbitVelRef.current,
      -maxRadPerSec,
      maxRadPerSec
    );

    controls.autoRotate = true;
    controls.autoRotateSpeed = orbitVelRef.current / RAD_PER_SEC_PER_AUTOUNIT;
    controls.update();

    invalidate(); // keep drifting visible with frameloop="demand"
    lastAz.current = controls.getAzimuthalAngle();
  });

  return null;
}


// Camera elevation: 15 degrees above horizontal = polar angle of 75 degrees
const ELEVATION_DEG = 15;
const VERTICAL_RANGE_DEG = 7.5;
const CENTER_POLAR = Math.PI / 2 - (ELEVATION_DEG * Math.PI) / 180;
const MIN_POLAR = CENTER_POLAR - (VERTICAL_RANGE_DEG * Math.PI) / 180;
const MAX_POLAR = CENTER_POLAR + (VERTICAL_RANGE_DEG * Math.PI) / 180;
const DISTANCE = 12;

export default function Hero() {
  const isMobile = useMemo(() => isMobileDevice(), []);

  const controlsRef = useRef();
  const orbitVelRef = useRef(0);

  const initialY = Math.sin((ELEVATION_DEG * Math.PI) / 180) * DISTANCE;
  const initialZ = Math.cos((ELEVATION_DEG * Math.PI) / 180) * DISTANCE;

  // DPR: keep mobile capped at 1.0; desktop can go higher if you want
  const dpr = useMemo(() => (isMobile ? [0.6, 1.0] : [1.0, 1.5]), [isMobile]);

  return (
    <div className="hero">
      <Canvas
        camera={{
          position: [0, initialY, initialZ],
          fov: 20,
          near: 0.1,
          far: 50,
        }}
        frameloop="demand"
        dpr={dpr}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
          alpha: false,
          stencil: false,
        }}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <Environment preset="sunset" background environmentIntensity={1} environmentRotation={[0, 3.8, 0]} />
        {/* <ambientLight intensity={0.5} /> */}
        <directionalLight position={[2, -10, 0]} intensity={.5} />
        <directionalLight position={[-5, 5, -5]} intensity={1.5} />
        <ambientLight intensity={-5} />

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={MIN_POLAR}
          maxPolarAngle={MAX_POLAR}
        />

        <OrbitMomentum controlsRef={controlsRef} orbitVelRef={orbitVelRef} />


        <CameraController baseFov={13} zoomFov={20} />
        <PhotoRing count={6} radius={12} />
        <GlassModel isMobile={isMobile} />
      </Canvas>

      <img
        className="hero-logo"
        src={logo}
        alt="Code and Bourbon Logo"
        draggable={false}
        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation() }}
        onDragStart={(e) => e.preventDefault()}
        onTouchStart={(e) => e.preventDefault()}
      // style={{
      //   WebkitTouchCallout: "none",
      //   WebkitUserSelect: "none",
      //   userSelect: "none",
      //   WebkitUserDrag: "none",
      //   touchAction: "none",
      //   WebkitTapHighlightColor: "transparent",
      // }}
      />
    </div>
  );
}
