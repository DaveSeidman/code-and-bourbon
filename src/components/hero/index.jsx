import { useMemo, useState, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  MeshTransmissionMaterial,
} from "@react-three/drei";
import * as THREE from "three";
import glassModel from "../../assets/models/glass2.glb";
import ringVideo from "../../assets/videos/ring1.mp4";
import ringPoster from "../../assets/images/ring1-poster.png";
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

function VideoEnvironment({ radius = 12, height = 6, cubeMapSize = 256 }) {
  const { scene, gl, invalidate } = useThree();
  const meshRef = useRef();
  const [isPlaying, setIsPlaying] = useState(false);

  // Create video and textures
  const { video, videoTexture, posterTexture } = useMemo(() => {
    // Poster texture
    const posterTex = new THREE.TextureLoader().load(ringPoster);
    posterTex.colorSpace = THREE.SRGBColorSpace;
    posterTex.wrapS = THREE.RepeatWrapping;
    posterTex.wrapT = THREE.ClampToEdgeWrapping;
    posterTex.repeat.set(-1, 1);
    posterTex.offset.set(1, 0);

    // Video element
    const vid = document.createElement("video");
    vid.src = ringVideo;
    vid.loop = true;
    vid.muted = true;
    vid.playsInline = true;
    vid.crossOrigin = "anonymous";
    vid.preload = "auto";

    // Video texture
    const vidTex = new THREE.VideoTexture(vid);
    vidTex.colorSpace = THREE.SRGBColorSpace;
    vidTex.wrapS = THREE.RepeatWrapping;
    vidTex.wrapT = THREE.ClampToEdgeWrapping;
    vidTex.repeat.set(-1, 1);
    vidTex.offset.set(1, 0);

    return { video: vid, videoTexture: vidTex, posterTexture: posterTex };
  }, []);

  // Cube camera setup for environment map
  const { cubeCamera, cubeRenderTarget, envScene, envMesh } = useMemo(() => {
    const target = new THREE.WebGLCubeRenderTarget(cubeMapSize, {
      format: THREE.RGBAFormat,
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
    });

    const camera = new THREE.CubeCamera(0.1, 100, target);

    // Separate scene for env map rendering (just the cylinder)
    const envScn = new THREE.Scene();
    const geometry = new THREE.CylinderGeometry(radius, radius, height, 64, 1, true);
    const material = new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      toneMapped: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = -3.5;
    envScn.add(mesh);

    return { cubeCamera: camera, cubeRenderTarget: target, envScene: envScn, envMesh: mesh };
  }, [radius, height, cubeMapSize]);

  // Handle autoplay with fallback
  useEffect(() => {
    const tryPlay = async () => {
      try {
        await video.play();
        setIsPlaying(true);
        invalidate();
      } catch (e) {
        // Autoplay blocked - set up interaction listeners
        const handleInteraction = async () => {
          try {
            await video.play();
            setIsPlaying(true);
            invalidate();
          } catch (e2) {
            console.warn("Video play failed:", e2);
          }
          document.removeEventListener("click", handleInteraction);
          document.removeEventListener("touchstart", handleInteraction);
          document.removeEventListener("pointerdown", handleInteraction);
        };
        document.addEventListener("click", handleInteraction, { once: true });
        document.addEventListener("touchstart", handleInteraction, { once: true });
        document.addEventListener("pointerdown", handleInteraction, { once: true });
      }
    };

    if (video.readyState >= 3) {
      tryPlay();
    } else {
      video.addEventListener("canplay", tryPlay, { once: true });
    }

    return () => {
      video.pause();
      video.src = "";
      videoTexture.dispose();
      posterTexture.dispose();
      cubeRenderTarget.dispose();
    };
  }, [video, videoTexture, posterTexture, cubeRenderTarget, invalidate]);

  // Update textures and env map each frame
  useFrame(() => {
    const activeTexture = isPlaying && video.readyState >= video.HAVE_CURRENT_DATA
      ? videoTexture
      : posterTexture;

    // Update visible mesh
    if (meshRef.current && meshRef.current.material.map !== activeTexture) {
      meshRef.current.material.map = activeTexture;
      meshRef.current.material.needsUpdate = true;
    }

    // Update env scene mesh
    if (envMesh.material.map !== activeTexture) {
      envMesh.material.map = activeTexture;
      envMesh.material.needsUpdate = true;
    }

    if (isPlaying) {
      videoTexture.needsUpdate = true;
    }

    // Render cube map and set as scene environment
    cubeCamera.update(gl, envScene);
    scene.environment = cubeRenderTarget.texture;

    invalidate();
  });

  return (
    <mesh ref={meshRef} position={[0, -3.5, 0]}>
      <cylinderGeometry args={[radius, radius, height, 64, 1, true]} />
      <meshBasicMaterial
        map={posterTexture}
        side={THREE.BackSide}
        toneMapped={false}
      />
    </mesh>
  );
}

function GlassModel({ isMobile, orbitVelRef }) {
  const { scene } = useGLTF(glassModel);
  const innerRef = useRef();
  const liquidRotation = useRef(0);
  const liquidVelocity = useRef(0);

  const quality = useMemo(() => {
    // tweak these freely
    return isMobile
      ? {
        transmissionSamples: 1,
        transmissionResolution: 128,
        chromaticAberration: 0.0,
        distortion: 0.25,
        envMapIntensityThin: 10,
      }
      : {
        transmissionSamples: 4,
        transmissionResolution: 512,
        chromaticAberration: 0.2,
        distortion: 0.8,
        envMapIntensityThin: 25,
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

  // Find the "inner" group for liquid lag effect
  const innerGroup = useMemo(() => {
    let found = null;
    scene.traverse((child) => {
      if (child.name === "inner") {
        found = child;
      }
    });
    console.log("Inner group found:", found);
    return found;
  }, [scene]);

  // Liquid lag physics
  useFrame((_, dt) => {
    if (!innerGroup || !orbitVelRef) return;

    const orbitVel = orbitVelRef.current || 0;

    // Spring physics for liquid lag
    // The liquid "wants" to stay still (rotation 0) but gets dragged by orbit
    const lagMultiplier = 2.5;  // How much the liquid exaggerates the movement
    const stiffness = 3.0;      // How quickly it catches up
    const damping = 0.85;       // How much velocity is retained
    const maxRotation = 0.25;   // Max rotation in radians

    // Target rotation based on current orbit velocity (opposite direction = lag)
    const targetRotation = -orbitVel * lagMultiplier * 0.1;

    // Spring force toward target
    const springForce = (targetRotation - liquidRotation.current) * stiffness;

    // Update velocity and apply damping
    liquidVelocity.current += springForce * dt;
    liquidVelocity.current *= damping;

    // Update rotation
    liquidRotation.current += liquidVelocity.current;

    // Clamp rotation
    liquidRotation.current = THREE.MathUtils.clamp(
      liquidRotation.current,
      -maxRotation,
      maxRotation
    );

    // Apply to inner group
    innerGroup.rotation.y = liquidRotation.current;
  });

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
              color={'rgb(236, 255, 253)'}
              chromaticAberration={quality.chromaticAberration}
              backside={true}
              backsideThickness={0.04}
              samples={quality.transmissionSamples}
              resolution={quality.transmissionResolution}
              distortion={quality.distortion}
              distortionScale={0.1}
              clearcoat={0.4}
              clearcoatRoughness={0.2}
              envMapIntensity={4.0}
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

  const baseDrift = 0.10;  // rad/sec minimum drift speed (direction preserved from swipe)
  const halfLife = 0.3;    // seconds - how quickly it decelerates to baseDrift
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
    controls.autoRotateSpeed = -orbitVelRef.current / RAD_PER_SEC_PER_AUTOUNIT;
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
        <ambientLight intensity={15} />
        <directionalLight position={[2, 10, 0]} intensity={8} />
        <directionalLight position={[-5, 5, -5]} intensity={3} />
        <directionalLight position={[0, -5, 5]} intensity={2} />

        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableZoom={false}
          minPolarAngle={MIN_POLAR}
          maxPolarAngle={MAX_POLAR}
        />

        <OrbitMomentum controlsRef={controlsRef} orbitVelRef={orbitVelRef} />


        <CameraController baseFov={13} zoomFov={20} />
        <VideoEnvironment radius={12} height={12} cubeMapSize={256} />
        <GlassModel isMobile={isMobile} orbitVelRef={orbitVelRef} />
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