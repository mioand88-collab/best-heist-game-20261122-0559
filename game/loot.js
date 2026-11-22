// loot.js — the prize and the pickups: the room's one loot target, the small
// gems worth points, loose coins to spend on tools, and the thrown coin itself.

import { distance } from './vision.js';
import { distractGuards } from './guards.js';
import { jamNearestCamera } from './cameras.js';

export const PICKUP_RADIUS = 22;
export const GEM_SCORE = 25;
export const LOOT_SCORE = 100;

// The thief walks over a gem, a coin or the loot target: collect what is near.
export function collectPickups(state) {
  const p = state.player;
  for (const gem of state.gems) {
    if (!gem.taken && distance(p.x, p.y, gem.x, gem.y) < PICKUP_RADIUS + 4) {
      gem.taken = true;
      state.score += GEM_SCORE;
      state.events.push('gem');
    }
  }
  for (const coin of state.coinPickups) {
    if (!coin.taken && distance(p.x, p.y, coin.x, coin.y) < PICKUP_RADIUS + 4) {
      coin.taken = true;
      state.coins += 1;
      state.events.push('coin');
    }
  }
  if (!state.lootTaken && distance(p.x, p.y, state.loot.x, state.loot.y) < 30) {
    state.lootTaken = true;
    state.score += LOOT_SCORE;
    state.events.push('loot');
  }
}

// Left-click: toss a coin at (x,y). Costs 1 coin; nearby guards investigate.
export function throwCoin(state, x, y) {
  if (state.coins <= 0) {
    state.events.push('nocoin');
    return false;
  }
  state.coins -= 1;
  state.thrownCoins.push({ x, y, age: 0 });
  distractGuards(state.guards, x, y);
  state.events.push('throw');
  return true;
}

// Right-click: jam the nearest camera for 6 seconds. Costs 2 coins.
export function useJammer(state) {
  if (state.coins < 2) {
    state.events.push('nocoin');
    return false;
  }
  const ok = jamNearestCamera(state.cameras, state.player.x, state.player.y, state.time, 6);
  if (!ok) {
    state.events.push('nojam');
    return false;
  }
  state.coins -= 2;
  state.events.push('jam');
  return true;
}

// Has the thief reached the green exit with the loot in hand?
export function reachedExit(state) {
  if (!state.lootTaken) return false;
  const e = state.exit;
  const p = state.player;
  return p.x > e.x - 6 && p.x < e.x + e.w + 6 && p.y > e.y - 6 && p.y < e.y + e.h + 6;
}
