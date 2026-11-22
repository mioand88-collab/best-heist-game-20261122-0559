// levels.js — the three rooms of the heist. Pure data: walls, crates, patrols,
// cameras, loot, pickups, the thief's start and the green exit door.
// Every room offers at least two routes to the loot, and crates break sight lines.

export const ROOM = { x: 24, y: 64, w: 912, h: 560 };

function borderWalls() {
  return [
    { x: 24, y: 64, w: 912, h: 16 },   // top
    { x: 24, y: 608, w: 912, h: 16 },  // bottom
    { x: 24, y: 64, w: 16, h: 560 },   // left
    { x: 920, y: 64, w: 16, h: 560 },  // right
  ];
}

export const LEVELS = [
  {
    name: 'Room 1 — The Marble Gallery',
    hint: 'Two ways round the long wall. The painting hangs top-right.',
    walls: [
      ...borderWalls(),
      { x: 330, y: 180, w: 16, h: 180 }, // long divider: pass above or below it
      { x: 560, y: 380, w: 220, h: 16 }, // low shelf wall
    ],
    crates: [
      { x: 480, y: 200, w: 70, h: 70 },
      { x: 640, y: 140, w: 60, h: 60 },
      { x: 150, y: 380, w: 64, h: 64 },
    ],
    guards: [
      { x: 300, y: 500, speed: 62, pause: 1.2,
        waypoints: [[300, 500], [300, 150], [620, 150], [620, 500]] },
      { x: 700, y: 450, speed: 55, pause: 1.6,
        waypoints: [[700, 450], [850, 450], [850, 260]] },
    ],
    cameras: [
      { x: 480, y: 80, baseAngle: Math.PI / 2, sweep: 0.65, speed: 0.55, range: 210 },
    ],
    loot: { x: 862, y: 122, kind: 'painting', name: 'The Starlit Muse' },
    gems: [{ x: 420, y: 520 }, { x: 700, y: 520 }, { x: 500, y: 122 }],
    coins: [{ x: 180, y: 300 }, { x: 760, y: 300 }],
    player: { x: 84, y: 560 },
    exit: { x: 24, y: 96, w: 20, h: 64 },
  },
  {
    name: 'Room 2 — The Gilded Corridor',
    hint: 'Three lanes, three patrols. Slip through the gaps, never the middle.',
    walls: [
      ...borderWalls(),
      { x: 200, y: 64, w: 16, h: 200 },  // gap below: y 264..380
      { x: 200, y: 380, w: 16, h: 228 },
      { x: 480, y: 200, w: 16, h: 408 }, // gap above: y 64..200
      { x: 700, y: 64, w: 16, h: 260 },  // gap below: y 324..608
    ],
    crates: [
      { x: 330, y: 450, w: 80, h: 60 },
      { x: 580, y: 122, w: 70, h: 60 },
      { x: 260, y: 300, w: 56, h: 56 },
    ],
    guards: [
      { x: 320, y: 130, speed: 66, pause: 1.0,
        waypoints: [[320, 130], [440, 130], [440, 540], [320, 540]] },
      { x: 600, y: 520, speed: 60, pause: 1.4,
        waypoints: [[600, 520], [600, 240], [660, 240], [660, 520]] },
      { x: 800, y: 300, speed: 58, pause: 1.2,
        waypoints: [[800, 300], [880, 300], [880, 480], [800, 480]] },
    ],
    cameras: [
      { x: 360, y: 80, baseAngle: Math.PI / 2, sweep: 0.6, speed: 0.6, range: 200 },
      { x: 820, y: 608, baseAngle: -Math.PI / 2, sweep: 0.6, speed: 0.5, range: 200 },
    ],
    loot: { x: 852, y: 148, kind: 'goblet', name: 'The Gilded Goblet' },
    gems: [{ x: 120, y: 160 }, { x: 560, y: 540 }, { x: 760, y: 420 }],
    coins: [{ x: 420, y: 300 }, { x: 640, y: 540 }],
    player: { x: 84, y: 560 },
    exit: { x: 920, y: 500, w: 20, h: 64 },
  },
  {
    name: 'Room 3 — The Velvet Vault',
    hint: 'The diamond sits in a walled vault. Enter left, leave right — or the reverse.',
    walls: [
      ...borderWalls(),
      { x: 380, y: 200, w: 200, h: 16 }, // vault top
      { x: 380, y: 440, w: 200, h: 16 }, // vault bottom
      { x: 380, y: 200, w: 16, h: 120 }, // vault left, gap below (y 320..440)
      { x: 564, y: 336, w: 16, h: 120 }, // vault right, gap above (y 200..336)
    ],
    crates: [
      { x: 180, y: 140, w: 70, h: 70 },
      { x: 700, y: 480, w: 70, h: 70 },
      { x: 250, y: 470, w: 64, h: 64 },
      { x: 660, y: 130, w: 64, h: 64 },
    ],
    guards: [
      { x: 300, y: 300, speed: 70, pause: 0.9,
        waypoints: [[300, 300], [300, 520], [660, 520], [660, 300]] },
      { x: 480, y: 120, speed: 62, pause: 1.3,
        waypoints: [[480, 120], [820, 120], [820, 300], [480, 300]] },
      { x: 760, y: 380, speed: 66, pause: 1.0,
        waypoints: [[760, 380], [480, 380], [480, 560], [760, 560]] },
    ],
    cameras: [
      { x: 480, y: 216, baseAngle: Math.PI / 2, sweep: 0.7, speed: 0.65, range: 220 },
      { x: 480, y: 424, baseAngle: -Math.PI / 2, sweep: 0.7, speed: 0.6, range: 220 },
    ],
    loot: { x: 480, y: 328, kind: 'diamond', name: 'The Velvet Diamond' },
    gems: [{ x: 120, y: 120 }, { x: 860, y: 560 }, { x: 860, y: 120 }, { x: 120, y: 480 }],
    coins: [{ x: 300, y: 560 }, { x: 700, y: 120 }],
    player: { x: 84, y: 560 },
    exit: { x: 24, y: 96, w: 20, h: 64 },
  },
];

// All rectangles that block movement and sight in a level.
export function levelSolids(level) {
  return [...level.walls, ...level.crates];
}
