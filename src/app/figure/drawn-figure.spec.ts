import { TestBed } from '@angular/core/testing';
import { StateId } from '../core/states';
import { DrawnFigure } from './drawn-figure';

describe('DrawnFigure', () => {
  async function render(state: StateId) {
    const fixture = TestBed.createComponent(DrawnFigure);
    fixture.componentRef.setInput('state', state);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('is one labelled image whose drawing is hidden from assistive technology', async () => {
    const el = await render('work');
    expect(el.getAttribute('role')).toBe('img');
    expect(el.getAttribute('aria-label')).toMatch(/^Drawn figure of Daniele/);
    expect(el.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('draws the prop of each state: glasses, goggles with antenna, sleep mask', async () => {
    const work = await render('work');
    expect(work.querySelectorAll('.eyes circle')).toHaveLength(2);
    const play = await render('play');
    expect(play.querySelector('.eyes')).toBeNull(); // behind the goggles
    expect(play.querySelectorAll('circle.i').length).toBeGreaterThan(0); // the antenna tip
    const sleep = await render('sleep');
    expect(sleep.querySelector('.eyes')).toBeNull();
    expect(sleep.querySelector('rect[rx="16"]')).not.toBeNull(); // the mask
  });

  it('points its patterns at the page itself, query included, so they survive the base href', async () => {
    const el = await render('work');
    const fill = el.querySelector('circle[opacity]')?.getAttribute('fill') ?? '';
    expect(fill).toMatch(/^url\("\/.*#vb-dots-\d+"\)$/);
  });

  it('gives every instance its own pattern ids', async () => {
    const a = await render('work');
    const b = await render('work');
    const id = (el: HTMLElement) => el.querySelector('pattern')?.id;
    expect(id(a)).toBeTruthy();
    expect(id(a)).not.toBe(id(b));
  });

  it('poses the head per state and turns it towards the pointer', async () => {
    const fixture = TestBed.createComponent(DrawnFigure);
    fixture.componentRef.setInput('state', 'play');
    await fixture.whenStable();
    const head = () =>
      (fixture.nativeElement as HTMLElement).querySelector<SVGGElement>('.head')!.style.transform;
    expect(head()).toContain('rotate(0deg)');
    window.dispatchEvent(
      new PointerEvent('pointermove', { clientX: window.innerWidth, clientY: 0 }),
    );
    await fixture.whenStable();
    expect(head()).toContain('rotate(3deg)');
    fixture.componentRef.setInput('state', 'sleep');
    await fixture.whenStable();
    expect(head()).toContain('rotate(-11deg)'); // asleep: the pose only, no pointer
  });

  it('ignores the pointer with reduced motion', async () => {
    const real = window.matchMedia;
    // the test DOM has no matchMedia: a stub that always reports reduced motion
    window.matchMedia = (() => ({ matches: true })) as unknown as typeof window.matchMedia;
    try {
      const fixture = TestBed.createComponent(DrawnFigure);
      fixture.componentRef.setInput('state', 'play');
      await fixture.whenStable();
      window.dispatchEvent(
        new PointerEvent('pointermove', { clientX: window.innerWidth, clientY: 0 }),
      );
      await fixture.whenStable();
      const head = (fixture.nativeElement as HTMLElement).querySelector<SVGGElement>('.head')!;
      expect(head.style.transform).toContain('rotate(0deg)');
    } finally {
      window.matchMedia = real;
    }
  });
});
