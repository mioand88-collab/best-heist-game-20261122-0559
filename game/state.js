// state.js — the heist's state: which screen is showing, the thief, the
// watchers, the loot, the alarm and the score. loadLevel builds one room
// from its definition in levels.js.

import { LEVELS } from './levels.js';
import { makeGuard } from './guards.js';
import { makeCamera } from './cameras.js';

export const PLAYER_SPEED = 155;
export const PLAYER_RADIUS = 12;

export function createGameState() {
  return {
    screen: 'title', // title | play | levelClear | win | caught | lockdown
    levelIndex: 0,
    level: LEVELS[0],
    player: { x: 84, y: 560, r: PLAYER_RADIUS, facing: -Math.PI / 2 },
    guards: [],
    cameras: [],
    gems: [],
    coinPickups: [],
    thrownCoins: [],
    loot: LEVELS[0].loot,
    exit: LEVELS[0].exit,
    lootTaken: false,
    coins: 3,
    score: 0,
    alarm: 0,
    alarmFlash: 0,
    time: 0, // game clock, seconds since this room began
    levelTime: 0,
    totalTime: 0,
    events: [], // sound cues collected each frame, drained by main.js
    mouse: { x: 0, y: 0 },
    message: '',
    messageUntil: 0,
    paused: false,
    caughtBy: '',
    stepAcc: 0,
  };
}

export function loadLevel(state, index) {
  const level = LEVELS[index];
  state.levelIndex = index;
  state.level = level;
  state.player.x = level.player.x;
  state.player.y = level.player.y;
  state.player.facing = -Math.PI / 2;
  state.guards = level.guards.map(makeGuard);
  state.cameras = level.cameras.map(makeCamera);
  state.gems = level.gems.map((g) => ({ ...g, taken: false }));
  state.coinPickups = level.coins.map((c) => ({ ...c, taken: false }));
  state.thrownCoins = [];
  state.loot = level.loot;
  state.exit = level.exit;
  state.lootTaken = false;
  state.alarm = 0;
  state.alarmFlash = 0;
  state.time = 0;
  state.levelTime = 0;
  state.events = [];
  state.message = level.name;
  state.messageUntil = 3;
  state.paused = false;
}

// A short line of feedback under the HUD, shown for a few seconds.
export function flashMessage(state, text, seconds) {
  state.message = text;
  state.messageUntil = state.time + (seconds || 2.5);
}
