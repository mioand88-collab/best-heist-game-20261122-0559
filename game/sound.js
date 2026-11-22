// sound.js — every sound is synthesised live with WebAudio: no audio files,
// no network. A tiny synth: short oscillator blips with an envelope, plus a
// low tension drone that follows the alarm meter.

let ctx = null;
let drone = null;
let droneGain = null;

export function initSound() {
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume();
    return;
  }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  // The tension drone: two detuned low oscillators, kept very quiet.
  droneGain = ctx.createGain();
  droneGain.gain.value = 0;
  droneGain.connect(ctx.destination);
  drone = [55, 55.7].map((f) => {
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = f;
    o.connect(droneGain);
    o.start();
    return o;
  });
}

// The drone swells as the alarm climbs.
export function setTension(alarm) {
  if (!ctx || !droneGain) return;
  const target = alarm > 5 ? 0.012 + (alarm / 100) * 0.05 : 0;
  droneGain.gain.setTargetAtTime(target, ctx.currentTime, 0.4);
}

function blip(freq, dur, type, vol, slideTo) {
  if (!ctx) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type || 'sine';
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(vol || 0.08, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(ctx.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function chord(freqs, dur, type, vol) {
  freqs.forEach((f, i) => setTimeout(() => blip(f, dur, type, vol), i * 70));
}

export const soundFX = {
  step() { blip(190, 0.05, 'triangle', 0.02); },
  coinPickup() { blip(1320, 0.12, 'sine', 0.09, 1760); },
  gemPickup() { chord([880, 1174], 0.14, 'sine', 0.07); },
  lootPickup() { chord([523, 659, 784, 1046], 0.22, 'triangle', 0.09); },
  coinThrow() { blip(2400, 0.09, 'square', 0.04, 900); },
  coinLand() { blip(1900, 0.08, 'sine', 0.07, 1500); },
  jammer() { blip(300, 0.25, 'sawtooth', 0.05, 90); },
  denied() { blip(140, 0.15, 'square', 0.06); },
  spotted() { blip(880, 0.12, 'square', 0.08, 660); },
  alarmTick() { blip(1200, 0.06, 'square', 0.05); },
  levelClear() { chord([523, 659, 784, 1046, 1318], 0.3, 'triangle', 0.09); },
  caught() { chord([392, 311, 233, 155], 0.4, 'sawtooth', 0.08); },
  winGame() { chord([523, 659, 784, 1046, 784, 1046, 1318], 0.35, 'triangle', 0.09); },
};
