// vision.js — shared sight geometry: angles, and whether a watcher can see a point
// through a room full of walls and crates. Guards and cameras both use canSeeWatcher.

// Smallest signed difference between two angles, in (-PI, PI].
export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d <= -Math.PI) d += Math.PI * 2;
  return d;
}

export function angleTo(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

export function distance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

// Liang-Barsky clipping: does segment (x1,y1)-(x2,y2) pass through rect r?
export function segmentHitsRect(x1, y1, x2, y2, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let t0 = 0;
  let t1 = 1;
  const p = [-dx, dx, -dy, dy];
  const q = [x1 - r.x, r.x + r.w - x1, y1 - r.y, r.y + r.h - y1];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return false;
    } else {
      const t = q[i] / p[i];
      if (p[i] < 0) {
        if (t > t1) return false;
        if (t > t0) t0 = t;
      } else {
        if (t < t0) return false;
        if (t < t1) t1 = t;
      }
    }
  }
  return true;
}

// Is the straight line from (x1,y1) to (x2,y2) blocked by any solid rectangle?
export function lineBlocked(x1, y1, x2, y2, solids) {
  for (const s of solids) {
    if (segmentHitsRect(x1, y1, x2, y2, s)) return true;
  }
  return false;
}

// Can a watcher at (wx,wy) facing `facing` with a cone of `halfAngle` and
// `range` see the point (tx,ty)? Walls and crates in `solids` block sight.
export function canSeeWatcher(wx, wy, facing, halfAngle, range, tx, ty, solids) {
  const d = distance(wx, wy, tx, ty);
  if (d > range) return false;
  if (d < 8) return true;
  if (Math.abs(angleDiff(angleTo(wx, wy, tx, ty), facing)) > halfAngle) return false;
  return !lineBlocked(wx, wy, tx, ty, solids);
}

// Circle (cx,cy,r) against a rectangle: push the circle out, return corrected pos.
export function collideCircleRect(cx, cy, r, rect) {
  const nx = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
  const ny = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
  const dx = cx - nx;
  const dy = cy - ny;
  const d2 = dx * dx + dy * dy;
  if (d2 >= r * r) return null;
  if (d2 === 0) return { x: cx, y: rect.y - r };
  const d = Math.sqrt(d2);
  return { x: nx + (dx / d) * r, y: ny + (dy / d) * r };
}
