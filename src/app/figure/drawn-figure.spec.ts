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
    expect(fill).toMatch(/^url\(\/.*#vb-dots-\d+\)$/);
  });
});
