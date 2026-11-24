import {
  fakeQr,
  glyphGrid,
  logLine,
  randomWalk,
  seededRandom,
  signalSeries,
  sphereLines,
  toPolyline,
} from './hud';

describe('hud generators', () => {
  it('seededRandom repeats for a seed, differs across seeds and stays in [0, 1)', () => {
    const a = seededRandom(42);
    const b = seededRandom(42);
    const c = seededRandom(43);
    const xs = Array.from({ length: 200 }, () => a());
    expect(xs).toEqual(Array.from({ length: 200 }, () => b()));
    expect(xs[0]).not.toBe(c());
    expect(xs.every((x) => x >= 0 && x < 1)).toBe(true);
  });

  it('signalSeries has the asked length, stays in [-1, 1] and moves with time', () => {
    const s0 = signalSeries(7, 0, 64);
    const s1 = signalSeries(7, 1.5, 64);
    expect(s0).toHaveLength(64);
    expect(s0.every((v) => v >= -1 && v <= 1)).toBe(true);
    expect(s1).not.toEqual(s0);
    expect(signalSeries(7, 0, 64)).toEqual(s0);
  });

  it('randomWalk stays in [0, 1] and repeats for a seed', () => {
    const w = randomWalk(3, 100);
    expect(w).toHaveLength(100);
    expect(w.every((v) => v >= 0 && v <= 1)).toBe(true);
    expect(randomWalk(3, 100)).toEqual(w);
  });

  it('toPolyline maps -1..1 onto the box, top to bottom', () => {
    expect(toPolyline([1, 0, -1], 100, 50)).toBe('0,0 50,25 100,50');
  });

  it('glyphGrid has rows × cols glyphs and changes only some cells per tick', () => {
    const g0 = glyphGrid(1, 0, 4, 10);
    const g1 = glyphGrid(1, 1, 4, 10);
    expect(g0).toHaveLength(4);
    expect(g0.every((row) => [...row].length === 10)).toBe(true);
    const changed = g0
      .join('')
      .split('')
      .filter((ch, i) => ch !== g1.join('')[i]).length;
    expect(changed).toBeLessThan(40);
  });

  it('fakeQr draws three finder squares and repeats for a seed', () => {
    const q = fakeQr(9);
    expect(q).toHaveLength(21);
    // finder corners are dark, their inner ring light, the centre dark
    for (const [r, c] of [
      [0, 0],
      [0, 14],
      [14, 0],
    ]) {
      expect(q[r][c]).toBe(true);
      expect(q[r + 1][c + 1]).toBe(false);
      expect(q[r + 3][c + 3]).toBe(true);
    }
    expect(fakeQr(9)).toEqual(q);
  });

  it('sphereLines returns visible polylines inside the box', () => {
    const lines = sphereLines(0.4, 0.2, 8, 12, 100);
    expect(lines.length).toBeGreaterThan(8);
    const coords = lines.flatMap((l) => l.split(' ').flatMap((p) => p.split(',').map(Number)));
    expect(coords.every((n) => n >= -0.1 && n <= 100.1)).toBe(true);
  });

  it('logLine is stable for a seed and index and has a time stamp', () => {
    expect(logLine(5, 3)).toBe(logLine(5, 3));
    expect(logLine(5, 3)).toMatch(/^\[\d{2}:\d{2}\] \S+ :: /);
    expect(logLine(5, 3)).not.toContain('{');
  });
});
