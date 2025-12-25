"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "@/components/providers/theme-provider";

function FloatingShape({
  position,
  color,
  scale = 1,
  speed = 1,
  distort = 0.3,
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
  speed?: number;
  distort?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1 * speed;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15 * speed;
    }
  });

  return (
    <Float
      speed={speed}
      rotationIntensity={0.5}
      floatIntensity={0.5}
      floatingRange={[-0.1, 0.1]}
    >
      <mesh ref={meshRef} position={position} scale={scale}>
        <icosahedronGeometry args={[1, 1]} />
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={distort}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
}

function FloatingTorus({
  position,
  color,
  scale = 1,
  speed = 1,
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
  speed?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2 * speed;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.1 * speed;
    }
  });

  return (
    <Float speed={speed * 0.5} floatIntensity={0.3}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <torusGeometry args={[1, 0.3, 16, 32]} />
        <meshStandardMaterial
          color={color}
          roughness={0.3}
          metalness={0.9}
          transparent
          opacity={0.8}
        />
      </mesh>
    </Float>
  );
}

function Particles({ count = 100 }: { count?: number }) {
  const { resolvedTheme } = useTheme();
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.05}
        color={resolvedTheme === "dark" ? "#6366f1" : "#818cf8"}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function MouseParallax() {
  const { camera } = useThree();

  useFrame(({ pointer }) => {
    camera.position.x = THREE.MathUtils.lerp(
      camera.position.x,
      pointer.x * 0.5,
      0.05
    );
    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      pointer.y * 0.3,
      0.05
    );
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function Scene() {
  const { resolvedTheme } = useTheme();

  const colors = useMemo(() => {
    if (resolvedTheme === "dark") {
      return {
        primary: "#6366f1",
        secondary: "#a855f7",
        accent: "#ec4899",
        tertiary: "#06b6d4",
      };
    }
    return {
      primary: "#4f46e5",
      secondary: "#9333ea",
      accent: "#db2777",
      tertiary: "#0891b2",
    };
  }, [resolvedTheme]);

  return (
    <>
      {/* Ambient light */}
      <ambientLight intensity={0.4} />

      {/* Main directional light */}
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} />

      {/* Point lights for color */}
      <pointLight position={[5, 5, 5]} color={colors.primary} intensity={2} />
      <pointLight
        position={[-5, -5, 5]}
        color={colors.secondary}
        intensity={1.5}
      />

      {/* Floating shapes */}
      <FloatingShape
        position={[-3, 1, -2]}
        color={colors.primary}
        scale={0.8}
        speed={0.8}
      />
      <FloatingShape
        position={[3, -1, -3]}
        color={colors.secondary}
        scale={1}
        speed={0.6}
        distort={0.4}
      />
      <FloatingShape
        position={[0, 2, -4]}
        color={colors.accent}
        scale={0.6}
        speed={1}
        distort={0.2}
      />

      {/* Floating torus */}
      <FloatingTorus
        position={[-2, -2, -2]}
        color={colors.tertiary}
        scale={0.5}
        speed={0.7}
      />
      <FloatingTorus
        position={[4, 0, -5]}
        color={colors.primary}
        scale={0.7}
        speed={0.5}
      />

      {/* Particles */}
      <Particles count={150} />

      {/* Mouse parallax effect */}
      <MouseParallax />
    </>
  );
}

export function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene />
      </Canvas>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-background/50 to-background pointer-events-none" />
    </div>
  );
}
