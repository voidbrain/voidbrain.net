import { DOCUMENT } from '@angular/core';
import { DeferBlockBehavior, TestBed } from '@angular/core/testing';
import { App } from './app';

// Across the shell, the poster, the URL hash and the HUD pieces: the join the unit specs of core/ do not cover.
describe('App shell', () => {
  let doc: Document;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      deferBlockBehavior: DeferBlockBehavior.Manual,
    }).compileComponents();
    doc = TestBed.inject(DOCUMENT);
    doc.defaultView!.history.replaceState(null, '', '/');
  });

  async function render(hash = '') {
    if (hash) doc.defaultView!.history.replaceState(null, '', hash);
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  const title = (el: HTMLElement) => el.querySelector('h2')?.textContent?.trim();

  it('shows the owner and opens on the work poster', async () => {
    const { el } = await render();
    expect(el.querySelector('h1')?.textContent).toContain('Daniele Bordignon');
    expect(title(el)).toBe('Work');
    expect(doc.documentElement.dataset['state']).toBe('work');
  });

  it('opens the state the hash names', async () => {
    const { el } = await render('/#sleep');
    expect(title(el)).toBe('Sleep');
    expect(doc.documentElement.dataset['state']).toBe('sleep');
  });

  it('switches with the buttons and writes the hash', async () => {
    const { fixture, el } = await render();
    const play = [...el.querySelectorAll<HTMLButtonElement>('.switcher button')].find((b) =>
      b.textContent?.includes('Play'),
    )!;
    play.click();
    await fixture.whenStable();
    expect(title(el)).toBe('Play');
    expect(play.getAttribute('aria-pressed')).toBe('true');
    expect(doc.location.hash).toBe('#play');
    expect(doc.documentElement.dataset['state']).toBe('play');
  });

  it('switches with the arrow keys, unless a HUD piece handled them', async () => {
    const { fixture, el } = await render();
    doc.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await fixture.whenStable();
    expect(title(el)).toBe('Sleep');

    const sphere = el.querySelector<HTMLElement>('vb-wire-sphere')!;
    sphere.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }),
    );
    await fixture.whenStable();
    expect(title(el)).toBe('Sleep');
  });

  it('follows a hash change from the address bar or the back button', async () => {
    const { fixture, el } = await render();
    doc.defaultView!.history.replaceState(null, '', '/#play');
    doc.defaultView!.dispatchEvent(new HashChangeEvent('hashchange'));
    await fixture.whenStable();
    expect(title(el)).toBe('Play');
  });

  it('keeps the state when the skip link or another in-page anchor changes the hash', async () => {
    const { fixture, el } = await render('/#play');
    el.querySelector<HTMLAnchorElement>('.skip-link')!.click();
    await fixture.whenStable();
    expect(title(el)).toBe('Play');
    expect(doc.activeElement?.id).toBe('poster-title');

    doc.defaultView!.history.replaceState(null, '', '/#poster-title');
    doc.defaultView!.dispatchEvent(new HashChangeEvent('hashchange'));
    await fixture.whenStable();
    expect(title(el)).toBe('Play');
  });

  it('moves focus to the new heading when the poster that held it is replaced', async () => {
    const { fixture, el } = await render();
    el.querySelector<HTMLElement>('vb-poster a')!.focus();
    doc.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    expect(title(el)).toBe('Play');
    expect(doc.activeElement?.id).toBe('poster-title');
  });

  it('labels every HUD piece as decorative and keyboard-reachable', async () => {
    for (const hash of ['/#work', '/#play', '/#sleep']) {
      const { el } = await render(hash);
      const pieces = [...el.querySelectorAll<HTMLElement>('.hud')];
      expect(pieces.length).toBeGreaterThanOrEqual(4);
      for (const piece of pieces) {
        expect(piece.getAttribute('role')).toBe('group');
        expect(piece.getAttribute('aria-roledescription')).toBe('decorative animation');
        expect(piece.getAttribute('tabindex')).toBe('0');
        expect(piece.getAttribute('aria-label')).toMatch(/decorative/);
      }
    }
  });
});
