"use client";

import { useEffect, useRef } from "react";

export default function StarsBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const createStaticStars = () => {
      const starsContainer = containerRef.current;
      if (!starsContainer) return;

      // Create static stars
      for (let i = 0; i < 200; i++) {
        const star = document.createElement("div");
        star.className = "star";
        star.style.width = `${Math.random() * 2 + 1}px`;
        star.style.height = star.style.width;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 4}s`;
        starsContainer.appendChild(star);
      }
    };

    const createShootingStar = () => {
      const starsContainer = containerRef.current;
      if (!starsContainer) return;

      // Create shooting star
      const shootingStar = document.createElement("div");
      shootingStar.className = "shooting-star";

      // Random starting position from top-left to top-right
      const startX = Math.random() * window.innerWidth;
      const startY = Math.random() * (window.innerHeight * 0.3); // Only from top 30% of screen

      shootingStar.style.left = `${startX}px`;
      shootingStar.style.top = `${startY}px`;

      // Random duration between 2 and 3 seconds
      shootingStar.style.animationDuration = `${Math.random() * 1 + 2}s`;

      starsContainer.appendChild(shootingStar);

      // Remove shooting star after animation
      setTimeout(() => {
        if (starsContainer.contains(shootingStar)) {
          starsContainer.removeChild(shootingStar);
        }
      }, 3000); // Match the maximum animation duration
    };

    // Create initial static stars
    createStaticStars();

    // Create shooting stars periodically with random intervals
    const createRandomShootingStar = () => {
      createShootingStar();
      // Random interval between 2 and 4 seconds
      const nextInterval = Math.random() * 2000 + 2000;
      setTimeout(createRandomShootingStar, nextInterval);
    };

    // Start the shooting stars
    const shootingStarInterval = setTimeout(createRandomShootingStar, 2000);

    return () => {
      clearTimeout(shootingStarInterval);
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
