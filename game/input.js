// input.js — keyboard and mouse for the heist: WASD/arrows to move, left
// click to toss a coin, right click to fire the jammer, R to restart, Enter
// to start or continue. Also converts a click into room coordinates.

export function bindInput(canvas, handlers) {
  const keys = {};

  const KEYMAP = {
    KeyW: 'up', ArrowUp: 'up',
    KeyS: 'down', ArrowDown: 'down',
    KeyA: 'left', ArrowLeft: 'left',
    KeyD: 'right', ArrowRight: 'right',
  };

  window.addEventListener('keydown', (e) => {
    if (KEYMAP[e.code]) {
      keys[KEYMAP[e.code]] = true;
      e.preventDefault();
    }
    if (e.code === 'KeyR') handlers.onRestart();
    if (e.code === 'Enter') handlers.onConfirm();
    if (e.code === 'KeyP') handlers.onPause();
  });
  window.addEventListener('keyup', (e) => {
    if (KEYMAP[e.code]) keys[KEYMAP[e.code]] = false;
  });
  window.addEventListener('blur', () => {
    for (const k of Object.keys(keys)) keys[k] = false;
  });

  function roomPoint(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  canvas.addEventListener('mousedown', (e) => {
    const p = roomPoint(e);
    if (e.button === 0) handlers.onThrowCoin(p.x, p.y);
    if (e.button === 2) handlers.onJammer();
  });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  canvas.addEventListener('mousemove', (e) => {
    const p = roomPoint(e);
    handlers.onMouseMove(p.x, p.y);
  });

  return keys;
}

// A unit movement vector from the held keys (diagonals normalised).
export function moveVector(keys) {
  let x = 0;
  let y = 0;
  if (keys.left) x -= 1;
  if (keys.right) x += 1;
  if (keys.up) y -= 1;
  if (keys.down) y += 1;
  if (x !== 0 && y !== 0) {
    x *= Math.SQRT1_2;
    y *= Math.SQRT1_2;
  }
  return { x, y };
}
