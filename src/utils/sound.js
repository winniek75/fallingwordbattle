// Web Audio API sound effects for Falling Word Battle

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume if suspended (autoplay policy)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Correct answer chime — C-E-G triad (ascending arpeggio)
 * Sine wave, gain 0.2, duration 0.3s each, spaced 0.1s apart
 */
export function playCorrectSound() {
  try {
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0.2;

      osc.connect(gain);
      gain.connect(ctx.destination);

      const startTime = ctx.currentTime + i * 0.1;
      osc.start(startTime);
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
      osc.stop(startTime + 0.3);
    });
  } catch (e) {
    // Silently fail if audio context not available
  }
}

/**
 * Wrong answer sound — square wave, 150Hz dropping to 100Hz, 0.2s duration
 */
export function playWrongSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) {
    // Silently fail if audio context not available
  }
}
