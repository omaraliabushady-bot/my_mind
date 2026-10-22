import confetti from 'canvas-confetti';

export function fireTaskConfetti(originX = 0.5, originY = 0.5): void {
  try {
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { x: originX, y: originY },
      colors: ['#00f2fe', '#b026ff', '#00f5a0', '#ffffff', '#38bdf8'],
      ticks: 180,
      gravity: 1.2,
      scalar: 0.85,
      disableForReducedMotion: true
    });
  } catch {
    // fallback if canvas not available
  }
}

export function firePomodoroCelebration(): void {
  try {
    const end = Date.now() + 1.2 * 1000;
    const colors = ['#00f2fe', '#b026ff', '#f5af19'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  } catch {
    // ignore
  }
}
