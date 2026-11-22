// render.js — everything the player sees: the room, the cones, the loot and
// the HUD, all drawn on one canvas. Safe cover is dark wood and shadow,
// danger is warm cone light, loot glows gold, the exit glows green.

import { alarmColour } from './alarm.js';
import { cameraIsJammed } from './cameras.js';
import { LEVELS } from './levels.js';

const W = 960;
const H = 640;

function drawCone(ctx, x, y, facing, halfAngle, range, colour) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, facing - halfAngle, facing + halfAngle);
  ctx.closePath();
  ctx.fillStyle = colour;
  ctx.fill();
  ctx.strokeStyle = colour.replace(/[\d.]+\)$/, '0.5)');
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawGuard(ctx, g) {
  const alert = g.alert;
  const coneColour = alert > 0.6
    ? `rgba(255, 70, 50, ${0.16 + alert * 0.22})`
    : `rgba(255, 205, 80, ${0.13 + alert * 0.16})`;
  drawCone(ctx, g.x, g.y, g.facing, 0.62, 175, coneColour);

  // Body: a night-watchman in navy with a gold cap brim.
  ctx.beginPath();
  ctx.arc(g.x, g.y, 13, 0, Math.PI * 2);
  ctx.fillStyle = g.mode === 'chase' ? '#7a1f1f' : '#2b3a5e';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#d8b45a';
  ctx.stroke();
  // Facing tick and cap.
  ctx.beginPath();
  ctx.moveTo(g.x, g.y);
  ctx.lineTo(g.x + Math.cos(g.facing) * 17, g.y + Math.sin(g.facing) * 17);
  ctx.strokeStyle = '#e8d28a';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(g.x, g.y, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#e8d28a';
  ctx.fill();

  if (alert > 0.55) {
    ctx.font = 'bold 20px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = alert >= 1 ? '#ff5544' : '#ffcc44';
    ctx.fillText(alert >= 1 ? '!' : '?', g.x, g.y - 22);
  } else if (g.mode === 'investigate' || g.mode === 'look') {
    ctx.font = 'bold 18px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffcc44';
    ctx.fillText('?', g.x, g.y - 22);
  }
}

function drawCamera(ctx, cam, now) {
  const jammed = cameraIsJammed(cam, now);
  const alert = cam.alert;
  if (!jammed) {
    const colour = alert > 0.6
      ? `rgba(255, 70, 90, ${0.14 + alert * 0.22})`
      : `rgba(255, 90, 130, 0.13)`;
    drawCone(ctx, cam.x, cam.y, cam.facing, 0.5, cam.range, colour);
  }
  // Wall mount and lens.
  ctx.beginPath();
  ctx.arc(cam.x, cam.y, 8, 0, Math.PI * 2);
  ctx.fillStyle = jammed ? '#555' : '#3a3a48';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = jammed ? '#888' : '#ff5a7a';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cam.x + Math.cos(cam.facing) * 4, cam.y + Math.sin(cam.facing) * 4, 3, 0, Math.PI * 2);
  ctx.fillStyle = jammed ? '#888' : (alert > 0.6 ? '#ff2244' : '#ff5a7a');
  ctx.fill();
  if (jammed) {
    ctx.font = 'bold 11px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#bbb';
    ctx.fillText('JAMMED', cam.x, cam.y - 14);
  }
}

function drawLoot(ctx, loot, now) {
  const pulse = 0.6 + 0.4 * Math.sin(now * 3);
  const glow = ctx.createRadialGradient(loot.x, loot.y, 4, loot.x, loot.y, 46);
  glow.addColorStop(0, `rgba(255, 215, 120, ${0.35 * pulse})`);
  glow.addColorStop(1, 'rgba(255, 215, 120, 0)');
  ctx.beginPath();
  ctx.arc(loot.x, loot.y, 46, 0, Math.PI * 2);
  ctx.fillStyle = glow;
  ctx.fill();

  if (loot.kind === 'painting') {
    ctx.fillStyle = '#8a6a2a';
    ctx.fillRect(loot.x - 22, loot.y - 16, 44, 32);
    ctx.fillStyle = '#1b2a4a';
    ctx.fillRect(loot.x - 18, loot.y - 12, 36, 24);
    ctx.fillStyle = '#ffd76a';
    ctx.beginPath();
    ctx.arc(loot.x - 6, loot.y - 4, 4, 0, Math.PI * 2);
    ctx.arc(loot.x + 8, loot.y + 5, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (loot.kind === 'goblet') {
    ctx.fillStyle = '#e8c85a';
    ctx.beginPath();
    ctx.moveTo(loot.x - 12, loot.y - 12);
    ctx.lineTo(loot.x + 12, loot.y - 12);
    ctx.lineTo(loot.x + 7, loot.y + 4);
    ctx.lineTo(loot.x + 3, loot.y + 12);
    ctx.lineTo(loot.x - 3, loot.y + 12);
    ctx.lineTo(loot.x - 7, loot.y + 4);
    ctx.closePath();
    ctx.fill();
  } else {
    // diamond
    ctx.fillStyle = '#8fe8ff';
    ctx.beginPath();
    ctx.moveTo(loot.x, loot.y - 16);
    ctx.lineTo(loot.x + 14, loot.y - 2);
    ctx.lineTo(loot.x, loot.y + 16);
    ctx.lineTo(loot.x - 14, loot.y - 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(loot.x - 14, loot.y - 2);
    ctx.lineTo(loot.x + 14, loot.y - 2);
    ctx.stroke();
  }
  ctx.font = 'bold 11px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffe9a8';
  ctx.fillText(loot.name.toUpperCase(), loot.x, loot.y + 34);
}

function drawThief(ctx, p) {
  // A hooded figure in charcoal with a gold sash, facing where they move.
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
  ctx.fillStyle = '#1e1e28';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#d8b45a';
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x + Math.cos(p.facing) * (p.r + 5), p.y + Math.sin(p.facing) * (p.r + 5));
  ctx.strokeStyle = '#e8d28a';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = '#e8d28a';
  ctx.fill();
}

function drawHud(ctx, state) {
  ctx.fillStyle = 'rgba(8, 8, 14, 0.92)';
  ctx.fillRect(0, 0, W, 56);
  ctx.strokeStyle = '#6b5a2e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 56);
  ctx.lineTo(W, 56);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#d8b45a';
  ctx.font = 'bold 15px Georgia, serif';
  ctx.fillText(state.level.name, 16, 24);
  ctx.fillStyle = '#9a8f74';
  ctx.font = 'italic 12px Georgia, serif';
  ctx.fillText(`Score ${state.score}   •   Room ${state.levelIndex + 1} of ${LEVELS.length}`, 16, 44);

  // Alarm meter, centre.
  const mx = 360;
  const mw = 240;
  ctx.fillStyle = '#e8e0c8';
  ctx.font = 'bold 13px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText('ALARM', mx, 22);
  ctx.fillStyle = '#22222e';
  ctx.fillRect(mx, 28, mw, 14);
  ctx.fillStyle = alarmColour(state.alarm, state.alarmFlash);
  ctx.fillRect(mx, 28, (mw * state.alarm) / 100, 14);
  ctx.strokeStyle = '#6b5a2e';
  ctx.strokeRect(mx, 28, mw, 14);
  ctx.fillStyle = '#e8e0c8';
  ctx.font = '12px Georgia, serif';
  ctx.fillText(`${Math.round(state.alarm)}%`, mx + mw + 8, 40);

  // Coins and loot, right.
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffd76a';
  ctx.font = 'bold 15px Georgia, serif';
  ctx.fillText(`◉ ${state.coins} coins`, W - 16, 24);
  ctx.fillStyle = state.lootTaken ? '#7ae08a' : '#9a8f74';
  ctx.fillText(state.lootTaken ? `◆ ${state.loot.name} — get to the exit!` : `◆ ${state.loot.name}`, W - 16, 44);
}

function drawRoom(ctx, state) {
  const level = state.level;
  // Floor: deep green marble tiles.
  ctx.fillStyle = '#1a2b22';
  ctx.fillRect(24, 64, 912, 560);
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let x = 24; x <= 936; x += 48) {
    ctx.beginPath(); ctx.moveTo(x, 64); ctx.lineTo(x, 624); ctx.stroke();
  }
  for (let y = 64; y <= 624; y += 48) {
    ctx.beginPath(); ctx.moveTo(24, y); ctx.lineTo(936, y); ctx.stroke();
  }
  // Carpet runner down the middle of the gallery.
  ctx.fillStyle = 'rgba(122, 31, 31, 0.35)';
  ctx.fillRect(440, 64, 80, 560);

  // Crates: cover that blocks sight.
  for (const c of level.crates) {
    ctx.fillStyle = '#5a4026';
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.strokeStyle = '#8a6a42';
    ctx.lineWidth = 2;
    ctx.strokeRect(c.x + 1, c.y + 1, c.w - 2, c.h - 2);
    ctx.beginPath();
    ctx.moveTo(c.x, c.y); ctx.lineTo(c.x + c.w, c.y + c.h);
    ctx.moveTo(c.x + c.w, c.y); ctx.lineTo(c.x, c.y + c.h);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.stroke();
  }

  // Walls with gold trim.
  for (const w of level.walls) {
    ctx.fillStyle = '#2e2a3a';
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.strokeStyle = '#6b5a2e';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(w.x, w.y, w.w, w.h);
  }

  // Exit door on the wall: green when the loot is taken, grey before.
  const e = state.exit;
  ctx.fillStyle = state.lootTaken ? '#2a7a3a' : '#3a3a44';
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.strokeStyle = state.lootTaken ? '#7ae08a' : '#888';
  ctx.lineWidth = 2;
  ctx.strokeRect(e.x, e.y, e.w, e.h);
  ctx.save();
  ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
  ctx.rotate(e.x < 100 ? -Math.PI / 2 : Math.PI / 2);
  ctx.fillStyle = state.lootTaken ? '#b8ffca' : '#aaa';
  ctx.font = 'bold 11px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', 0, 4);
  ctx.restore();

  // Gems and loose coins.
  for (const gem of state.gems) {
    if (gem.taken) continue;
    ctx.fillStyle = '#8fe8ff';
    ctx.beginPath();
    ctx.moveTo(gem.x, gem.y - 8);
    ctx.lineTo(gem.x + 6, gem.y);
    ctx.lineTo(gem.x, gem.y + 8);
    ctx.lineTo(gem.x - 6, gem.y);
    ctx.closePath();
    ctx.fill();
  }
  for (const coin of state.coinPickups) {
    if (coin.taken) continue;
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd76a';
    ctx.fill();
    ctx.strokeStyle = '#8a6a2a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  // Thrown coins, still ringing.
  for (const t of state.thrownCoins) {
    ctx.beginPath();
    ctx.arc(t.x, t.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#ffe9a8';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(t.x, t.y, 12 + t.age * 8, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 233, 168, ${Math.max(0, 0.7 - t.age)})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  if (!state.lootTaken) drawLoot(ctx, state.loot, state.time);

  // Watchers above the floor, thief above them.
  for (const cam of state.cameras) drawCamera(ctx, cam, state.time);
  for (const g of state.guards) drawGuard(ctx, g);
  drawThief(ctx, state.player);

  // A faint hint line from the thief to the mouse: where a coin would land.
  if (state.screen === 'play' && state.coins > 0) {
    ctx.beginPath();
    ctx.arc(state.mouse.x, state.mouse.y, 9, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 215, 106, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Timed message banner.
  if (state.time < state.messageUntil && state.message) {
    ctx.font = 'italic 15px Georgia, serif';
    ctx.textAlign = 'center';
    const tw = ctx.measureText(state.message).width;
    ctx.fillStyle = 'rgba(8, 8, 14, 0.8)';
    ctx.fillRect(W / 2 - tw / 2 - 14, 66, tw + 28, 26);
    ctx.fillStyle = '#e8d28a';
    ctx.fillText(state.message, W / 2, 85);
  }
}

function overlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(6, 6, 12, 0.82)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.fillStyle = accent || '#d8b45a';
  ctx.font = 'bold 40px Georgia, serif';
  ctx.fillText(title, W / 2, 250);
  ctx.fillStyle = '#e8e0c8';
  ctx.font = '17px Georgia, serif';
  lines.forEach((line, i) => ctx.fillText(line, W / 2, 300 + i * 30));
}

export function drawGame(ctx, state) {
  ctx.clearRect(0, 0, W, H);
  drawRoom(ctx, state);
  drawHud(ctx, state);

  if (state.screen === 'title') {
    overlay(ctx, 'THE VELVET VAULT', [
      'A quiet heist in three rooms. Steal the loot, dodge the cones,',
      'and slip out the green door before the alarm hits 100%.',
      '',
      'Move: WASD / arrows      Throw a coin: left-click (1 coin)',
      'Jammer: right-click (2 coins, freezes a camera)',
      '',
      'Press ENTER to begin the heist',
    ]);
  } else if (state.screen === 'levelClear') {
    overlay(ctx, 'ROOM CLEARED', [
      `${state.level.loot.name} is yours. Score ${state.score}.`,
      '',
      'Press ENTER for the next room',
    ], '#7ae08a');
  } else if (state.screen === 'win') {
    overlay(ctx, 'CLEAN GETAWAY!', [
      `Every room robbed. Final score ${state.score} in ${Math.round(state.totalTime)}s.`,
      'The Velvet Diamond hangs in a gallery of its own now — yours.',
      '',
      'Press R to run it again',
    ], '#7ae08a');
  } else if (state.screen === 'caught') {
    overlay(ctx, 'CAUGHT!', [
      state.caughtBy,
      `Score ${state.score}. The night watchman is not amused.`,
      '',
      'Press R to try the room again',
    ], '#ff5544');
  } else if (state.screen === 'lockdown') {
    overlay(ctx, 'LOCKDOWN!', [
      'The alarm hit 100%. Steel shutters, dogs, and a very loud siren.',
      `Score ${state.score}.`,
      '',
      'Press R to try the room again',
    ], '#ff5544');
  } else if (state.paused) {
    overlay(ctx, 'PAUSED', ['Press P to keep sneaking'], '#e8e0c8');
  }
}
