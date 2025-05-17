"use client";

import { useEffect, useRef } from "react";

export default function StarsBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const createStars = () => {
      const starsContainer = containerRef.current;
      if (!starsContainer) return;

      // Create shooting star
      const shootingStar = document.createElement("div");
      shootingStar.className = "shooting-star";
      shootingStar.style.left = `${Math.random() * 100}%`;
      shootingStar.style.top = `${Math.random() * 50}%`;
      shootingStar.style.animationDuration = `${Math.random() * 2 + 2}s`;

      starsContainer.appendChild(shootingStar);

      // Remove shooting star after animation
      setTimeout(() => {
        if (starsContainer.contains(shootingStar)) {
          starsContainer.removeChild(shootingStar);
        }
      }, 4000);
    };

    // Create initial stars
    const interval = setInterval(createStars, 2000);

    return () => {
      clearInterval(interval);
      // Clean up any remaining stars
      if (containerRef.current) {
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    />
  );
}
