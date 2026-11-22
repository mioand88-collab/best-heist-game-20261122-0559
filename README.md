[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/mioand88-collab/best-heist-game-20261122-0559/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/mioand88-collab/best-heist-game-20261122-0559/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

# The Velvet Vault — a heist game

A quiet top-down heist in three rooms. You are Rook, a thief crossing a museum
after dark: slip past patrolling guards and their vision cones, wait out the
sweeping security cameras, grab the loot — the Starlit Muse, the Gilded Goblet,
the Velvet Diamond — and reach the green exit before the alarm meter hits 100%.

- **Several routes per room**: walls and crates break sight lines, so every room
  has more than one way to the loot.
- **Tools at a cost**: toss a coin (1 coin) to lure a guard away, or fire the
  jammer (2 coins) to freeze the nearest camera for 6 seconds. Coins are
  scattered around the rooms — and worth the risk.
- **Patrols you have to read**: guards walk waypoints and pause to look around;
  cameras sweep back and forth. Being seen raises your alarm; being sure gets
  you chased. At 100% alarm the vault locks down.
- **Feel**: a tension drone that swells with the alarm, a caught moment with a
  warning first, and a getaway that pays off the planning with a time bonus.
- **Original**: own idea, art, sounds (all synthesised live with WebAudio) and
  names. No libraries, no network requests — plain static files under `game/`.

## How to play

Open `game/index.html` in a desktop browser (or serve `game/` with any static
server). Move with <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or arrow keys,
left-click to throw a coin, right-click to jam a camera, <kbd>R</kbd> to restart
a room, <kbd>Enter</kbd> to start or continue.

## How it is built

- `game/main.js` — game loop, movement, win/lose, screens
- `game/state.js` — game state and room loading
- `game/levels.js` — the three rooms: walls, crates, patrols, cameras, loot
- `game/vision.js` — sight geometry and line-of-sight
- `game/guards.js` — guard patrols, suspicion, distraction, chase
- `game/cameras.js` — sweeping cameras and the jammer
- `game/loot.js` — loot, gems, coins, the thrown coin
- `game/alarm.js` — the alarm meter
- `game/render.js` — all canvas drawing, HUD included
- `game/sound.js` — WebAudio synth sounds and the tension drone
- `game/input.js` — keyboard and mouse

`main.ts` (Node 22, stdlib only) copies `game/` and `screenshots/` to `/output`
and writes `/output/dossier.json` with the vendored make.fun library.

---

Built for the make.fun bounty — [enter here](https://make.fun/r/r2sxe3g2)
