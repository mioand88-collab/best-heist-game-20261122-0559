// cameras.js — wall-mounted security cameras that sweep their vision cone
// back and forth. A jammer freezes one for a few seconds; a camera that is
// sure it saw you locks on and sounds the alarm.

import { canSeeWatcher } from './vision.js';

export const CAMERA_RANGE = 210;
export const CAMERA_HALF_ANGLE = 0.5; // ~29 degrees each side

export function makeCamera(def) {
  return {
    x: def.x,
    y: def.y,
    baseAngle: def.baseAngle,
    sweep: def.sweep,
    speed: def.speed,
    range: def.range || CAMERA_RANGE,
    phase: Math.random() * Math.PI * 2,
    facing: def.baseAngle,
    alert: 0, // 0..1 suspicion; 1 means locked on
    jammedUntil: 0, // game clock time until which the camera is frozen
  };
}

export function cameraIsJammed(cam, now) {
  return now < cam.jammedUntil;
}

export function cameraSeesThief(cam, thief, solids, now) {
  if (cameraIsJammed(cam, now)) return false;
  return canSeeWatcher(cam.x, cam.y, cam.facing, CAMERA_HALF_ANGLE, cam.range, thief.x, thief.y, solids);
}

export function updateCamera(cam, dt, now, thief, solids) {
  if (cameraIsJammed(cam, now)) {
    cam.alert = Math.max(0, cam.alert - dt * 0.5);
    return;
  }
  cam.phase += dt * cam.speed;
  cam.facing = cam.baseAngle + Math.sin(cam.phase) * cam.sweep;
  if (cameraSeesThief(cam, thief, solids, now)) {
    cam.alert = Math.min(1, cam.alert + dt * 1.0);
  } else {
    cam.alert = Math.max(0, cam.alert - dt * 0.4);
  }
}

// Freeze the nearest camera to (x,y) within reach, for `seconds`.
export function jamNearestCamera(cameras, x, y, now, seconds) {
  let best = null;
  let bestD = 280;
  for (const cam of cameras) {
    const d = Math.hypot(cam.x - x, cam.y - y);
    if (d < bestD) { best = cam; bestD = d; }
  }
  if (!best) return false;
  best.jammedUntil = now + seconds;
  best.alert = 0;
  return true;
}
