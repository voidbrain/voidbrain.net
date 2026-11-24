import {
  cubeEdges,
  attitude,
  lifeSeed,
  lifeStep,
  fakeQr,
  glyphGrid,
  logLine,
  radarBlips,
  randomWalk,
  seededRandom,
  signalSeries,
  sphereLines,
  sweepFade,
  toPolyline,
  topoContours,
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

  it('radarBlips repeats for a seed and keeps every contact inside the scope', () => {
    const blips = radarBlips(5, 12);
    expect(blips).toHaveLength(12);
    expect(radarBlips(5, 12)).toEqual(blips);
    expect(radarBlips(6, 12)).not.toEqual(blips);
    expect(
      blips.every((b) => b.dist > 0 && b.dist <= 1 && b.angle >= 0 && b.angle < Math.PI * 2),
    ).toBe(true);
  });

  it('sweepFade lights a contact as the sweep passes and fades it over one turn', () => {
    expect(sweepFade(1, 1)).toBeCloseTo(1);
    expect(sweepFade(1, 1 + Math.PI)).toBeCloseTo(0.5);
    expect(sweepFade(1, 1 - 0.01)).toBeLessThan(0.01); // just ahead of the sweep: dark
    expect(sweepFade(1, 1 + Math.PI * 4)).toBeCloseTo(1); // whole turns change nothing
  });

  it('lifeStep follows B3/S23 and wraps around the edges', () => {
    const blinker = lifeSeed(1, 5, 5).map((row) => row.map(() => false));
    blinker[2][1] = blinker[2][2] = blinker[2][3] = true;
    const next = lifeStep(blinker);
    expect([next[1][2], next[2][2], next[3][2]]).toEqual([true, true, true]);
    expect(next[2][1] || next[2][3]).toBe(false);
    expect(lifeStep(next)).toEqual(blinker);
    const edge = blinker.map((row) => row.map(() => false));
    edge[0][0] = edge[0][4] = edge[4][0] = true; // three neighbours of [4][4] across the wrap
    expect(lifeStep(edge)[4][4]).toBe(true);
  });

  it('lifeSeed repeats for a seed and has the asked size', () => {
    const b = lifeSeed(3, 8, 12);
    expect(b).toHaveLength(8);
    expect(b[0]).toHaveLength(12);
    expect(lifeSeed(3, 8, 12)).toEqual(b);
  });

  it('topoContours draws one path per level inside the box, and the ground breathes', () => {
    const a = topoContours(4, 0, 0, 6, 32, 20, 200, 120);
    expect(a).toHaveLength(6);
    expect(a.some((d) => d.length > 0)).toBe(true);
    const nums = a
      .join(' ')
      .match(/-?\d+(\.\d+)?/g)!
      .map(Number);
    expect(nums.every((v) => v >= 0 && v <= 200)).toBe(true);
    expect(topoContours(4, 2, 0, 6, 32, 20, 200, 120)).not.toEqual(a);
    expect(topoContours(4, 0, 0, 6, 32, 20, 200, 120)).toEqual(a);
  });

  it('attitude stays within its limits and moves smoothly', () => {
    for (let t = 0; t < 120; t += 0.7) {
      const a = attitude(3, t);
      expect(Math.abs(a.roll)).toBeLessThanOrEqual(35);
      expect(Math.abs(a.pitch)).toBeLessThanOrEqual(20);
      expect(a.heading >= 0 && a.heading < 360).toBe(true);
      const b = attitude(3, t + 1 / 30);
      expect(Math.abs(b.roll - a.roll)).toBeLessThan(3);
    }
    expect(attitude(3, 5)).toEqual(attitude(3, 5));
  });

  it('cubeEdges draws twelve edges that stay in the box at any rotation', () => {
    for (const [yaw, pitch] of [
      [0, 0],
      [0.7, 0.4],
      [2.1, -1.2],
    ]) {
      const edges = cubeEdges(yaw, pitch, 1, 100);
      expect(edges).toHaveLength(12);
      expect(edges.flat().every((v) => v >= 0 && v <= 100)).toBe(true);
    }
  });
});
