import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HudClock } from './clock';

// Drives requestAnimationFrame by hand: the clock must advance while running and schedule nothing while frozen.
describe('HudClock', () => {
  let queue: FrameRequestCallback[];
  let win: Window;
  let saved: { raf: typeof requestAnimationFrame; caf: typeof cancelAnimationFrame };

  beforeEach(() => {
    win = TestBed.inject(DOCUMENT).defaultView!;
    saved = { raf: win.requestAnimationFrame, caf: win.cancelAnimationFrame };
    queue = [];
    win.requestAnimationFrame = (cb) => queue.push(cb);
    win.cancelAnimationFrame = () => undefined;
  });

  afterEach(() => {
    win.requestAnimationFrame = saved.raf;
    win.cancelAnimationFrame = saved.caf;
  });

  const frame = (t: number) => {
    const pending = queue.splice(0);
    pending.forEach((cb) => cb(t));
  };

  it('advances its seconds frame by frame', () => {
    const clock = TestBed.inject(HudClock);
    frame(1000);
    frame(1050);
    frame(1100);
    expect(clock.seconds()).toBeCloseTo(0.1, 2);
    expect(queue.length).toBe(1);
  });

  it('stops scheduling frames once reduced motion is on', () => {
    const clock = TestBed.inject(HudClock);
    frame(1000);
    frame(1050);
    clock.reducedMotion.set(true);
    frame(1100); // the last scheduled frame sees reduced motion and schedules no other
    expect(queue.length).toBe(0);
    const frozen = clock.seconds();
    expect(frozen).toBeGreaterThan(0);
  });
});
