// Generators for the animated HUD pieces (docs/DESIGN.md, "HUD components"). Every value is generated from a
// seed and a time: nothing here is real data, and the same inputs always give the same output.

/** A small, fast seeded random generator (mulberry32): values in [0, 1). */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A sum of three seeded sine waves sampled at `points` positions, scrolled by time `t` (seconds). In [-1, 1]. */
export function signalSeries(seed: number, t: number, points: number): number[] {
  const rnd = seededRandom(seed);
  const waves = [0, 1, 2].map((k) => ({
    freq: 1 + rnd() * (3 + k * 4),
    speed: 0.4 + rnd() * 1.6,
    phase: rnd() * Math.PI * 2,
    amp: 1 / (k + 1.4),
  }));
  const total = waves.reduce((s, w) => s + w.amp, 0);
  return Array.from({ length: points }, (_, i) => {
    const x = points > 1 ? i / (points - 1) : 0;
    const v = waves.reduce(
      (s, w) => s + w.amp * Math.sin(x * w.freq * Math.PI * 2 + t * w.speed + w.phase),
      0,
    );
    return v / total;
  });
}

/** A seeded random walk of `length` steps, kept in [0, 1]. */
export function randomWalk(seed: number, length: number, step = 0.12): number[] {
  const rnd = seededRandom(seed);
  let v = rnd();
  return Array.from({ length }, () => {
    v = Math.min(1, Math.max(0, v + (rnd() - 0.5) * 2 * step));
    return v;
  });
}

/** SVG polyline points for values in [-1, 1] across a `width` × `height` box. */
export function toPolyline(values: readonly number[], width: number, height: number): string {
  const n = values.length;
  return values
    .map((v, i) => {
      const x = n > 1 ? (i / (n - 1)) * width : 0;
      const y = ((1 - v) / 2) * height;
      return `${round(x)},${round(y)}`;
    })
    .join(' ');
}

const GLYPHS = '01アイウエオカキクケコサシスセソ<>/\\#$%&*+=_ΔΣΩ';

/** A grid of glyphs that changes a few cells per tick: `rows` strings of `cols` characters. */
export function glyphGrid(seed: number, tick: number, rows: number, cols: number): string[] {
  return Array.from({ length: rows }, (_, r) => {
    let line = '';
    for (let c = 0; c < cols; c++) {
      // each cell changes on its own slow cycle, so the grid flickers instead of scrolling
      const cycle = 3 + ((r * 7 + c * 13 + seed) % 11);
      const rnd = seededRandom(seed * 7919 + r * 131 + c * 17 + Math.floor(tick / cycle) * 104729);
      line += GLYPHS[Math.floor(rnd() * GLYPHS.length)];
    }
    return line;
  });
}

/** A square of modules shaped like a QR code (three finder squares, seeded noise). Decorative: it encodes nothing. */
export function fakeQr(seed: number, size = 21): boolean[][] {
  const rnd = seededRandom(seed);
  const finder = (r: number, c: number): boolean | null => {
    for (const [fr, fc] of [
      [0, 0],
      [0, size - 7],
      [size - 7, 0],
    ]) {
      const y = r - fr;
      const x = c - fc;
      if (y >= -1 && y <= 7 && x >= -1 && x <= 7) {
        if (y < 0 || y > 6 || x < 0 || x > 6) return false; // quiet ring
        const edge = Math.max(Math.abs(y - 3), Math.abs(x - 3));
        return edge !== 2;
      }
    }
    return null;
  };
  return Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (_, c) => finder(r, c) ?? rnd() < 0.48),
  );
}

/** Polylines of a wireframe sphere (`lat` parallels, `lon` meridians) rotated by `yaw`/`pitch`, projected
 *  orthographically into a box of `size`; each line is split where it passes behind the sphere. */
export function sphereLines(
  yaw: number,
  pitch: number,
  lat: number,
  lon: number,
  size: number,
): string[] {
  const r = size / 2;
  const project = (theta: number, phi: number): [number, number, number] => {
    // theta: longitude, phi: latitude
    let x = Math.cos(phi) * Math.sin(theta);
    let y = Math.sin(phi);
    let z = Math.cos(phi) * Math.cos(theta);
    [x, z] = [x * Math.cos(yaw) + z * Math.sin(yaw), -x * Math.sin(yaw) + z * Math.cos(yaw)];
    [y, z] = [y * Math.cos(pitch) - z * Math.sin(pitch), y * Math.sin(pitch) + z * Math.cos(pitch)];
    return [r + x * r, r - y * r, z];
  };
  const lines: string[] = [];
  const trace = (pointAt: (s: number) => [number, number, number], steps: number) => {
    let current: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const [x, y, z] = pointAt(i / steps);
      if (z >= 0) current.push(`${round(x)},${round(y)}`);
      else if (current.length) {
        if (current.length > 1) lines.push(current.join(' '));
        current = [];
      }
    }
    if (current.length > 1) lines.push(current.join(' '));
  };
  for (let i = 1; i < lat; i++) {
    const phi = -Math.PI / 2 + (i / lat) * Math.PI;
    trace((s) => project(s * Math.PI * 2, phi), 48);
  }
  for (let j = 0; j < lon; j++) {
    const theta = (j / lon) * Math.PI * 2;
    trace((s) => project(theta, -Math.PI / 2 + s * Math.PI), 32);
  }
  return lines;
}

const LOG_TEMPLATES = [
  'boot :: void.kernel v{n}.{m} ok',
  'sync :: node_{h} → mesh [{p}%]',
  'build :: chunk-{h}.js {n}.{m} kB',
  'lorem :: ipsum dolor sit amet {h}',
  'fpv :: ch{c} armed / disarmed',
  'scan :: sector {n}-{m} clear',
  'cache :: hit {h} / miss {c}',
  'dream :: consectetur adipiscing {h}',
  'net :: ping {n}ms // jitter {c}ms',
  'sys :: future_is_now = true',
];

/** A fake log line (decorative), the same for the same seed and index. */
export function logLine(seed: number, index: number): string {
  const rnd = seededRandom(seed * 31 + index * 977);
  const pick = LOG_TEMPLATES[Math.floor(rnd() * LOG_TEMPLATES.length)];
  const hex = Math.floor(rnd() * 0xffff)
    .toString(16)
    .padStart(4, '0');
  const time = `${String(Math.floor(rnd() * 24)).padStart(2, '0')}:${String(Math.floor(rnd() * 60)).padStart(2, '0')}`;
  const line = pick
    .replace('{n}', String(Math.floor(rnd() * 99)))
    .replace('{m}', String(Math.floor(rnd() * 99)))
    .replace('{h}', hex)
    .replace('{p}', String(Math.floor(rnd() * 100)))
    .replace('{c}', String(1 + Math.floor(rnd() * 8)));
  return `[${time}] ${line}`;
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

export interface Blip {
  /** Bearing in radians, [0, 2π). */
  readonly angle: number;
  /** Distance from the centre, (0, 1]. */
  readonly dist: number;
}

/** `count` seeded radar contacts. */
export function radarBlips(seed: number, count: number): Blip[] {
  const rnd = seededRandom(seed);
  return Array.from({ length: count }, () => ({
    angle: rnd() * Math.PI * 2,
    dist: 0.15 + rnd() * 0.85,
  }));
}

/** How lit a contact at `angle` is when the sweep points at `sweep` (radians): 1 just swept, fading to 0 after one
 *  turn. A contact the sweep has not reached yet is dark. */
export function sweepFade(angle: number, sweep: number): number {
  const turn = Math.PI * 2;
  const behind = (((sweep - angle) % turn) + turn) % turn;
  return 1 - behind / turn;
}

/** A seeded Game of Life board: `rows` × `cols` cells, about a third alive. */
export function lifeSeed(seed: number, rows: number, cols: number): boolean[][] {
  const rnd = seededRandom(seed);
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => rnd() < 0.33));
}

/** One Game of Life generation (B3/S23) on a board whose edges wrap around. */
export function lifeStep(board: readonly (readonly boolean[])[]): boolean[][] {
  const rows = board.length;
  return board.map((row, r) =>
    row.map((alive, c) => {
      const cols = row.length;
      let n = 0;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++)
          if ((dr || dc) && board[(r + dr + rows) % rows][(c + dc + cols) % cols]) n++;
      return n === 3 || (alive && n === 2);
    }),
  );
}

/** Contour lines of a generated terrain seen from straight above, in a `width` × `height` box: one SVG path per
 *  level, from the lowest to the highest. The ground breathes with time `t` (seconds), so the lines drift and swell
 *  like something alive; `drift` slides the map sideways. Marching squares on a `cols` × `rows` grid. */
export function topoContours(
  seed: number,
  t: number,
  drift: number,
  levels: number,
  cols: number,
  rows: number,
  width: number,
  height: number,
): string[] {
  const rnd = seededRandom(seed);
  // hills and hollows (negative heights), spread over a map a bit wider than the box so sliding finds more
  const hills = Array.from({ length: 11 }, (_, k) => ({
    x: rnd() * 1.6 - 0.3,
    y: rnd() * 1.2 - 0.1,
    r: 0.1 + rnd() * 0.18,
    a: (k % 4 === 3 ? -0.6 : 1) * (0.5 + rnd() * 0.6),
    speed: 0.3 + rnd() * 0.6,
    phase: rnd() * Math.PI * 2,
  }));
  // heights in about [0, 1]: a few hills whose size pulses, plus a slow ripple
  const field = (u: number, v: number) => {
    let h = 0;
    for (const k of hills) {
      const pulse = 1 + 0.25 * Math.sin(t * k.speed + k.phase);
      const dx = u + drift - k.x;
      const dy = v - k.y;
      h += k.a * pulse * Math.exp(-(dx * dx + dy * dy) / (k.r * k.r));
    }
    h += 0.12 * Math.sin(u * 9 + t * 0.7) * Math.cos(v * 7 - t * 0.5);
    return 0.35 + h * 0.55;
  };
  const grid: number[][] = [];
  for (let r = 0; r <= rows; r++) {
    const row: number[] = [];
    for (let c = 0; c <= cols; c++) row.push(field(c / cols, r / rows));
    grid.push(row);
  }
  const sx = width / cols;
  const sy = height / rows;
  const paths: string[] = [];
  for (let l = 1; l <= levels; l++) {
    const iso = l / (levels + 1);
    let d = '';
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const a = grid[r][c];
        const b = grid[r][c + 1];
        const cc = grid[r + 1][c + 1];
        const dd = grid[r + 1][c];
        const idx = (a > iso ? 8 : 0) | (b > iso ? 4 : 0) | (cc > iso ? 2 : 0) | (dd > iso ? 1 : 0);
        if (idx === 0 || idx === 15) continue;
        // where the level crosses each side of the cell
        const lerp = (p: number, q: number) => (iso - p) / (q - p);
        const top = [(c + lerp(a, b)) * sx, r * sy];
        const right = [(c + 1) * sx, (r + lerp(b, cc)) * sy];
        const bottom = [(c + lerp(dd, cc)) * sx, (r + 1) * sy];
        const left = [c * sx, (r + lerp(a, dd)) * sy];
        const seg = (p: number[], q: number[]) => {
          d += `M${round(p[0])} ${round(p[1])}L${round(q[0])} ${round(q[1])}`;
        };
        switch (idx) {
          case 1:
          case 14:
            seg(left, bottom);
            break;
          case 2:
          case 13:
            seg(bottom, right);
            break;
          case 3:
          case 12:
            seg(left, right);
            break;
          case 4:
          case 11:
            seg(top, right);
            break;
          case 6:
          case 9:
            seg(top, bottom);
            break;
          case 7:
          case 8:
            seg(left, top);
            break;
          case 5:
            seg(left, top);
            seg(bottom, right);
            break;
          case 10:
            seg(top, right);
            seg(left, bottom);
            break;
        }
      }
    }
    paths.push(d);
  }
  return paths;
}

/** A smooth, generated flight attitude at time `t` (seconds): roll and pitch in degrees, heading in [0, 360). Roll
 *  stays within ±35°, pitch within ±20°. */
export function attitude(
  seed: number,
  t: number,
): { roll: number; pitch: number; heading: number } {
  const rnd = seededRandom(seed);
  const w = Array.from({ length: 6 }, () => ({ f: 0.15 + rnd() * 0.5, p: rnd() * Math.PI * 2 }));
  const roll = 22 * Math.sin(t * w[0].f + w[0].p) + 13 * Math.sin(t * w[1].f * 2.3 + w[1].p);
  const pitch = 12 * Math.sin(t * w[2].f + w[2].p) + 8 * Math.sin(t * w[3].f * 1.7 + w[3].p);
  const heading = (((t * 9 + 40 * Math.sin(t * w[4].f + w[4].p)) % 360) + 360) % 360;
  return { roll: round(roll), pitch: round(pitch), heading: Math.floor(heading) };
}

/** The 12 edges of a cube of half-size `scale` (in [0, 1]) rotated by `yaw`/`pitch`, with a light perspective,
 *  as [x1, y1, x2, y2] in a box of `size`. */
export function cubeEdges(yaw: number, pitch: number, scale: number, size: number): number[][] {
  const r = size / 2;
  const corners = [0, 1, 2, 3, 4, 5, 6, 7].map((k) => {
    let x = k & 1 ? scale : -scale;
    let y = k & 2 ? scale : -scale;
    let z = k & 4 ? scale : -scale;
    [x, z] = [x * Math.cos(yaw) + z * Math.sin(yaw), -x * Math.sin(yaw) + z * Math.cos(yaw)];
    [y, z] = [y * Math.cos(pitch) - z * Math.sin(pitch), y * Math.sin(pitch) + z * Math.cos(pitch)];
    const p = 1 / (1 + z * 0.2) / 2; // keeps every rotation inside the box
    return [round(r + x * r * p), round(r - y * r * p)];
  });
  const edges: number[][] = [];
  for (let a = 0; a < 8; a++)
    for (const bit of [1, 2, 4]) if (!(a & bit)) edges.push([...corners[a], ...corners[a | bit]]);
  return edges;
}
