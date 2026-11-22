// alarm.js — the alarm meter: the one number the whole heist hangs on.
// It climbs while any guard or camera is suspicious, faster the surer they
// are, and cools down while you stay unseen. At 100 the vault locks down.

export const ALARM_MAX = 100;

// How alarmed the room is right now: the highest suspicion of any watcher.
export function roomSuspicion(state) {
  let top = 0;
  for (const g of state.guards) top = Math.max(top, g.alert);
  for (const c of state.cameras) top = Math.max(top, c.alert);
  return top;
}

export function updateAlarm(state, dt) {
  const suspicion = roomSuspicion(state);
  if (suspicion > 0.05) {
    // Seen: the meter climbs, steeply when a watcher is nearly certain.
    state.alarm = Math.min(ALARM_MAX, state.alarm + dt * (6 + 34 * suspicion));
    if (suspicion > 0.6) state.alarmFlash = 0.25;
  } else {
    // Hidden: the room slowly calms down.
    state.alarm = Math.max(0, state.alarm - dt * 3.5);
  }
  if (state.alarmFlash > 0) state.alarmFlash -= dt;
  return state.alarm >= ALARM_MAX;
}

// Alarm colour for the HUD meter: calm gold, warm amber, then flashing red.
export function alarmColour(alarm, flash) {
  if (flash > 0 || alarm >= 75) return '#ff4444';
  if (alarm >= 45) return '#ffaa22';
  return '#d8b45a';
}
