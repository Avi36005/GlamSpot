"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

// 3D Tilt / Parallax Group based on mouse position
function ParallaxScene({ children, isMobile }: { children: React.ReactNode; isMobile: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const { mouse } = useThree();

  useFrame(() => {
    if (!groupRef.current) return;
    // Limit mouse rotation range: ~2-4 degrees (0.04 - 0.08 radians)
    const maxRotX = isMobile ? 0.02 : 0.06;
    const maxRotY = isMobile ? 0.02 : 0.06;
    const targetX = mouse.x * maxRotY;
    const targetY = mouse.y * maxRotX;

    // Smoothly lerp towards target rotation
    groupRef.current.rotation.y += (targetX - groupRef.current.rotation.y) * 0.05;
    groupRef.current.rotation.x += (-targetY - groupRef.current.rotation.x) * 0.05;
  });

  return <group ref={groupRef}>{children}</group>;
}

// Soft floating particles system
function ShimmerParticles({ count }: { count: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions] = useState(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 8; // X range [-4, 4]
      arr[i * 3 + 1] = (Math.random() - 0.5) * 6; // Y range [-3, 3]
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4; // Z range [-2, 2]
    }
    return arr;
  });

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    const posAttr = pointsRef.current.geometry.attributes.position;
    if (posAttr) {
      const array = posAttr.array as Float32Array;
      for (let i = 0; i < count; i++) {
        // Drift slowly upwards
        array[i * 3 + 1] += 0.0015;
        // Oscillate slightly horizontally
        array[i * 3] += Math.sin(time * 0.5 + i) * 0.0005;

        // Wrap around when particle floats off the top
        if (array[i * 3 + 1] > 3) {
          array[i * 3 + 1] = -3;
          array[i * 3] = (Math.random() - 0.5) * 8;
        }
      }
      posAttr.needsUpdate = true;
    }
    pointsRef.current.rotation.y = time * 0.01;
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#ffb5a7"
        size={0.035}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.3}
      />
    </Points>
  );
}

export default function ThreeGLHero() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(motionQuery.matches);
    const motionListener = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    motionQuery.addEventListener("change", motionListener);

    const mobileQuery = window.matchMedia("(max-width: 768px)");
    setIsMobile(mobileQuery.matches);
    const mobileListener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mobileQuery.addEventListener("change", mobileListener);

    return () => {
      motionQuery.removeEventListener("change", motionListener);
      mobileQuery.removeEventListener("change", mobileListener);
    };
  }, []);

  // Static fallback for prefers-reduced-motion
  if (reduceMotion) {
    return (
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_25%_25%,rgba(201,24,74,0.06),transparent_45%),radial-gradient(circle_at_75%_75%,rgba(255,181,167,0.08),transparent_50%)]" />
    );
  }

  // Adjust parameters dynamically for mobile to guarantee steady 60fps
  const particleCount = isMobile ? 80 : 250;

  return (
    <div className="absolute inset-0 z-10 h-full w-full pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={isMobile ? 1 : [1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ParallaxScene isMobile={isMobile}>
            <ShimmerParticles count={particleCount} />
          </ParallaxScene>
        </Suspense>
      </Canvas>
    </div>
  );
}
