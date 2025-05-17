"use client";

import { useEffect } from "react";

function createStars() {
  const starsContainer = document.querySelector(".stars-container");
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

  // Create shooting stars
  function createShootingStar() {
    const shootingStar = document.createElement("div");
    shootingStar.className = "shooting-star";
    shootingStar.style.left = `${Math.random() * 100}%`;
    shootingStar.style.top = `${Math.random() * 50}%`;
    shootingStar.style.animationDuration = `${Math.random() * 2 + 2}s`;
    starsContainer.appendChild(shootingStar);

    // Remove shooting star after animation
    setTimeout(() => {
      shootingStar.remove();
    }, 3000);
  }

  // Create shooting stars periodically
  const interval = setInterval(createShootingStar, 2000);

  // Cleanup function
  return () => {
    clearInterval(interval);
    starsContainer.innerHTML = "";
  };
}

export default function StarsBackground() {
  useEffect(() => {
    const cleanup = createStars();
    return cleanup;
  }, []);

  return <div className="stars-container" />;
}
