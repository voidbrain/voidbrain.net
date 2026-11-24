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
