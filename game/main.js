// main.js — the heist itself: the game loop, movement, the watchers' turns,
// the alarm, win and lose, and the screens in between. Wires every module
// together and starts the game.

import { LEVELS, levelSolids } from './levels.js';
import { createGameState, loadLevel, flashMessage, PLAYER_SPEED } from './state.js';
import { updateGuard, guardCatchesThief } from './guards.js';
import { updateCamera } from './cameras.js';
import { collectPickups, throwCoin, useJammer, reachedExit } from './loot.js';
import { updateAlarm } from './alarm.js';
import { drawGame } from './render.js';
import { bindInput, moveVector } from './input.js';
import { initSound, setTension, soundFX } from './sound.js';
import { collideCircleRect } from './vision.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const state = createGameState();
loadLevel(state, 0);
state.screen = 'title';

const keys = bindInput(canvas, {
  onRestart: () => restartRoom(),
  onConfirm: () => confirmPressed(),
  onPause: () => { if (state.screen === 'play') state.paused = !state.paused; },
  onThrowCoin: (x, y) => {
    if (state.screen !== 'play' || state.paused) return;
    initSound();
    if (throwCoin(state, x, y)) soundFX.coinThrow();
    else soundFX.denied();
  },
  onJammer: () => {
    if (state.screen !== 'play' || state.paused) return;
    initSound();
    if (useJammer(state)) soundFX.jammer();
    else soundFX.denied();
  },
  onMouseMove: (x, y) => { state.mouse.x = x; state.mouse.y = y; },
});

function restartRoom() {
  initSound();
  loadLevel(state, state.levelIndex);
  state.screen = 'play';
}

function confirmPressed() {
  initSound();
  if (state.screen === 'title') {
    loadLevel(state, 0);
    state.screen = 'play';
  } else if (state.screen === 'levelClear') {
    const next = state.levelIndex + 1;
    if (next < LEVELS.length) {
      loadLevel(state, next);
      state.screen = 'play';
    }
  }
}

function movePlayer(dt) {
  const v = moveVector(keys);
  if (v.x === 0 && v.y === 0) return;
  const p = state.player;
  p.facing = Math.atan2(v.y, v.x);
  p.x += v.x * PLAYER_SPEED * dt;
  p.y += v.y * PLAYER_SPEED * dt;
  const solids = levelSolids(state.level);
  for (const s of solids) {
    const fixed = collideCircleRect(p.x, p.y, p.r, s);
    if (fixed) { p.x = fixed.x; p.y = fixed.y; }
  }
  p.x = Math.max(40, Math.min(920, p.x));
  p.y = Math.max(80, Math.min(608, p.y));
  state.stepAcc += dt * PLAYER_SPEED * Math.hypot(v.x, v.y);
  if (state.stepAcc > 34) {
    state.stepAcc = 0;
    soundFX.step();
  }
}

function drainEvents() {
  for (const ev of state.events) {
    if (ev === 'gem') soundFX.gemPickup();
    else if (ev === 'coin') soundFX.coinPickup();
    else if (ev === 'loot') {
      soundFX.lootPickup();
      flashMessage(state, `${state.loot.name} secured — reach the green exit!`, 3);
    } else if (ev === 'nocoin') flashMessage(state, 'No coins left — pick some up first.', 2);
    else if (ev === 'nojam') flashMessage(state, 'No camera in jammer range.', 2);
    else if (ev === 'jam') flashMessage(state, 'Camera jammed for 6 seconds.', 2);
    else if (ev === 'throw') soundFX.coinLand();
  }
  state.events = [];
}

function update(dt) {
  if (state.screen !== 'play' || state.paused) return;
  state.time += dt;
  state.levelTime += dt;
  state.totalTime += dt;

  movePlayer(dt);
  collectPickups(state);

  const solids = levelSolids(state.level);
  for (const g of state.guards) updateGuard(g, dt, state, solids);
  for (const cam of state.cameras) updateCamera(cam, dt, state.time, state.player, solids);

  // Thrown coins ring for a moment, then go quiet.
  for (const t of state.thrownCoins) t.age += dt;
  state.thrownCoins = state.thrownCoins.filter((t) => t.age < 1.2);

  // A watcher who just became sure sounds a short warning.
  for (const g of state.guards) {
    if (g.alert >= 1 && !g.warned) { g.warned = true; soundFX.spotted(); }
    if (g.alert < 0.8) g.warned = false;
  }

  const lockedDown = updateAlarm(state, dt);
  setTension(state.alarm);
  drainEvents();

  if (lockedDown) {
    state.screen = 'lockdown';
    soundFX.caught();
    return;
  }
  for (const g of state.guards) {
    if (guardCatchesThief(g, state.player)) {
      state.screen = 'caught';
      state.caughtBy = g.mode === 'chase'
        ? 'A guard ran you down in the open.'
        : 'You walked straight into a guard.';
      soundFX.caught();
      return;
    }
  }
  if (reachedExit(state)) {
    const timeBonus = Math.max(0, 120 - Math.round(state.levelTime)) * 2;
    state.score += timeBonus;
    if (state.levelIndex + 1 >= LEVELS.length) {
      state.screen = 'win';
      soundFX.winGame();
    } else {
      state.screen = 'levelClear';
      soundFX.levelClear();
    }
  }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  update(dt);
  drawGame(ctx, state);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Test hook for the maker's own play-tests: read-only state for automation.
window.HEIST = {
  state,
  start() { confirmPressed(); },
  restart() { restartRoom(); },
  level: () => state.levelIndex,
  screen: () => state.screen,
};
