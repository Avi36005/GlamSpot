"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

export function TiltCard({
  children,
  className = "",
  maxRotation = 10,
  perspective = 1000,
}: {
  children: React.ReactNode;
  className?: string;
  maxRotation?: number;
  perspective?: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    // Disable tilt on mobile/touch devices for better scroll accessibility
    const mediaQuery = window.matchMedia("(pointer: coarse)");
    setIsMobile(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateXSpring = useSpring(0, { stiffness: 120, damping: 20 });
  const rotateYSpring = useSpring(0, { stiffness: 120, damping: 20 });
  const scaleSpring = useSpring(1, { stiffness: 120, damping: 20 });

  // Glossy reflection coordinates
  const sheenX = useTransform(x, [0, 1], ["0%", "100%"]);
  const sheenY = useTransform(y, [0, 1], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const el = cardRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Normalised position: 0 to 1
    const pctX = mouseX / width;
    const pctY = mouseY / height;

    x.set(pctX);
    y.set(pctY);

    // Tilt calculations: -0.5 to 0.5 multiplied by max rotation
    rotateXSpring.set(-(pctY - 0.5) * maxRotation);
    rotateYSpring.set((pctX - 0.5) * maxRotation);
  };

  const handleMouseEnter = () => {
    if (isMobile) return;
    setHovering(true);
    scaleSpring.set(1.02);
  };

  const handleMouseLeave = () => {
    setHovering(false);
    scaleSpring.set(1);
    rotateXSpring.set(0);
    rotateYSpring.set(0);
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        perspective: `${perspective}px`,
        rotateX: isMobile ? 0 : rotateXSpring,
        rotateY: isMobile ? 0 : rotateYSpring,
        scale: isMobile ? 1 : scaleSpring,
      }}
      className={`relative ${className}`}
    >
      {/* Glossy reflection/glare overlay */}
      {!isMobile && hovering && (
        <motion.div
          style={{
            transform: "translateZ(20px)",
            background: `radial-gradient(circle 180px at ${sheenX} ${sheenY}, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 80%)`,
            pointerEvents: "none",
          }}
          className="absolute inset-0 z-10 rounded-2xl opacity-80 mix-blend-overlay transition-opacity duration-300"
        />
      )}
      {children}
    </motion.div>
  );
}
