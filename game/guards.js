// guards.js — the patrolling guards: waypoints, vision cones, suspicion,
// distraction by a tossed coin, and the chase when they are sure they saw you.

import { angleDiff, angleTo, canSeeWatcher, collideCircleRect, distance } from './vision.js';

export const GUARD_RANGE = 175;
export const GUARD_HALF_ANGLE = 0.62; // ~35 degrees each side
export const GUARD_RADIUS = 13;

export function makeGuard(def) {
  return {
    x: def.x,
    y: def.y,
    speed: def.speed,
    pause: def.pause || 1,
    waypoints: def.waypoints,
    wpIndex: 1,
    facing: 0,
    pauseLeft: 0,
    mode: 'patrol', // patrol | investigate | chase | look
    alert: 0, // 0..1 suspicion; 1 means certain — the guard chases
    investigateX: 0,
    investigateY: 0,
    lookLeft: 0,
    chaseLeft: 0,
    returnX: def.x,
    returnY: def.y,
  };
}

// Turn `facing` toward `target` by at most `maxTurn` radians this step.
function turnToward(facing, target, maxTurn) {
  const d = angleDiff(target, facing);
  if (Math.abs(d) <= maxTurn) return target;
  return facing + Math.sign(d) * maxTurn;
}

function moveGuardToward(g, tx, ty, dt, solids, speed) {
  const a = angleTo(g.x, g.y, tx, ty);
  g.facing = turnToward(g.facing, a, 5 * dt);
  const nx = g.x + Math.cos(g.facing) * speed * dt;
  const ny = g.y + Math.sin(g.facing) * speed * dt;
  g.x = nx;
  g.y = ny;
  for (const s of solids) {
    const fixed = collideCircleRect(g.x, g.y, GUARD_RADIUS, s);
    if (fixed) { g.x = fixed.x; g.y = fixed.y; }
  }
}

export function guardSeesThief(g, thief, solids) {
  return canSeeWatcher(g.x, g.y, g.facing, GUARD_HALF_ANGLE, GUARD_RANGE, thief.x, thief.y, solids);
}

// A coin clatters down: guards close by walk over to look at it.
export function distractGuards(guards, x, y) {
  for (const g of guards) {
    if (g.mode === 'chase') continue;
    if (distance(g.x, g.y, x, y) < 250) {
      g.mode = 'investigate';
      g.investigateX = x;
      g.investigateY = y;
      g.alert = Math.max(0, g.alert - 0.25);
    }
  }
}

export function updateGuard(g, dt, state, solids) {
  const thief = state.player;
  const seen = guardSeesThief(g, thief, solids);

  if (seen) {
    g.alert = Math.min(1, g.alert + dt * 1.15);
  } else {
    g.alert = Math.max(0, g.alert - dt * 0.45);
  }

  if (g.alert >= 1 && g.mode !== 'chase') {
    g.mode = 'chase';
    g.chaseLeft = 3;
  }

  if (g.mode === 'chase') {
    g.chaseLeft -= dt;
    moveGuardToward(g, thief.x, thief.y, dt, solids, g.speed * 1.45);
    if (g.chaseLeft <= 0 || g.alert <= 0.25) {
      g.mode = 'patrol';
      g.alert = Math.max(0, g.alert - 0.3);
    }
    return;
  }

  if (g.mode === 'investigate') {
    const d = distance(g.x, g.y, g.investigateX, g.investigateY);
    if (d > 14) {
      moveGuardToward(g, g.investigateX, g.investigateY, dt, solids, g.speed * 1.15);
    } else {
      g.mode = 'look';
      g.lookLeft = 2.2;
    }
    return;
  }

  if (g.mode === 'look') {
    g.lookLeft -= dt;
    g.facing += dt * 1.6; // scan the room while wondering what that noise was
    if (g.lookLeft <= 0) g.mode = 'patrol';
    return;
  }

  // Patrol: walk the waypoints, pausing to look around at each one.
  if (g.pauseLeft > 0) {
    g.pauseLeft -= dt;
    g.facing += dt * 0.5;
    return;
  }
  const wp = g.waypoints[g.wpIndex];
  const d = distance(g.x, g.y, wp[0], wp[1]);
  if (d < 8) {
    g.wpIndex = (g.wpIndex + 1) % g.waypoints.length;
    g.pauseLeft = g.pause;
    return;
  }
  moveGuardToward(g, wp[0], wp[1], dt, solids, g.speed);
}

// Has this guard caught the thief? Touching while chasing, or bumping into a
// guard who is already half sure of you.
export function guardCatchesThief(g, thief) {
  const d = distance(g.x, g.y, thief.x, thief.y);
  if (g.mode === 'chase') return d < 26;
  return d < 22 && g.alert > 0.5;
}
