// lib/confetti.ts
import confetti, { Shape } from 'canvas-confetti';

export interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  origin?: { x: number; y: number };
  colors?: string[];
  startVelocity?: number;
  gravity?: number;
  drift?: number;
  ticks?: number;
  shapes?: Shape[];
  scalar?: number;
}

// Check if confetti should be shown (respect reduced motion preference)
export function shouldShowConfetti(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Respect user's reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return false;
  
  return true;
}

// Basic confetti burst
export function triggerConfetti(options: ConfettiOptions = {}) {
  if (!shouldShowConfetti()) return;
  
  const defaults: ConfettiOptions = {
    particleCount: 100,
    spread: 70,
    origin: { x: 0.5, y: 0.6 },
    colors: ['#0066CC', '#00AA44', '#FF6600', '#CC0066', '#6600CC'],
  };
  
  confetti({
    ...defaults,
    ...options,
  });
}

// Celebration confetti for achievements
export function triggerAchievementConfetti() {
  if (!shouldShowConfetti()) return;
  
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }

    const particleCount = 50 * (timeLeft / duration);
    
    // Left side
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#FFD700', '#FFA500', '#FF6347', '#32CD32', '#00CED1'],
    });
    
    // Right side
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#FFD700', '#FFA500', '#FF6347', '#32CD32', '#00CED1'],
    });
  }, 250);
}

// Firework-style confetti for perfect quiz scores
export function triggerFireworkConfetti() {
  if (!shouldShowConfetti()) return;
  
  const duration = 2000;
  const animationEnd = Date.now() + duration;

  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

  function firework() {
    confetti({
      particleCount: 100,
      spread: 160,
      origin: {
        x: Math.random(),
        y: Math.random() * 0.6 + 0.2,
      },
      colors: colors,
      startVelocity: 45,
      gravity: 1.2,
      drift: 0,
      ticks: 200,
      scalar: 1.2,
    });
  }

  // Initial firework
  firework();
  
  // Additional fireworks
  const interval = setInterval(() => {
    if (Date.now() >= animationEnd) {
      clearInterval(interval);
      return;
    }
    firework();
  }, 400);
}

// Gentle confetti for XP gains
export function triggerXPConfetti(xpAmount: number) {
  if (!shouldShowConfetti()) return;
  
  const intensity = Math.min(xpAmount / 50, 2); // Scale based on XP amount
  
  confetti({
    particleCount: Math.floor(30 * intensity),
    spread: 50,
    origin: { x: 0.5, y: 0.8 },
    colors: ['#FFD700', '#FFA500', '#FFFF00'],
    startVelocity: 15,
    gravity: 0.8,
    drift: 0,
    ticks: 100,
    scalar: 0.8,
  });
}

// Streak confetti for daily quiz completion
export function triggerStreakConfetti(streakDays: number) {
  if (!shouldShowConfetti()) return;
  
  // More impressive confetti for longer streaks
  const intensity = Math.min(streakDays / 10, 3);
  
  confetti({
    particleCount: Math.floor(50 * intensity),
    spread: 80,
    origin: { x: 0.5, y: 0.7 },
    colors: ['#FF4500', '#FF6347', '#FFD700', '#FFA500'],
    startVelocity: 25,
    gravity: 1,
    drift: 0.1,
    ticks: 150,
    scalar: 1,
  });
}

// Report submission confetti
export function triggerReportConfetti() {
  if (!shouldShowConfetti()) return;
  
  confetti({
    particleCount: 60,
    spread: 60,
    origin: { x: 0.5, y: 0.7 },
    colors: ['#0066CC', '#0088DD', '#00AAFF'],
    startVelocity: 20,
    gravity: 0.9,
    drift: 0,
    ticks: 120,
    scalar: 0.9,
  });
}

// Badge unlock confetti with custom colors based on rarity
export function triggerBadgeConfetti(rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary') {
  if (!shouldShowConfetti()) return;
  
  const rarityConfig = {
    common: {
      colors: ['#808080', '#A0A0A0', '#C0C0C0'],
      particleCount: 40,
      spread: 45,
    },
    uncommon: {
      colors: ['#00AA44', '#00CC55', '#00DD66'],
      particleCount: 60,
      spread: 55,
    },
    rare: {
      colors: ['#0066CC', '#0088DD', '#00AAFF'],
      particleCount: 80,
      spread: 65,
    },
    epic: {
      colors: ['#6600CC', '#8800DD', '#AA00FF'],
      particleCount: 100,
      spread: 75,
    },
    legendary: {
      colors: ['#FFD700', '#FFA500', '#FFFF00'],
      particleCount: 120,
      spread: 85,
    },
  };
  
  const config = rarityConfig[rarity];
  
  confetti({
    ...config,
    origin: { x: 0.5, y: 0.6 },
    startVelocity: 30,
    gravity: 1,
    drift: 0,
    ticks: 180,
    scalar: 1.1,
  });
}