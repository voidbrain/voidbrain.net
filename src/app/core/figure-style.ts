// Which figure style the page shows. The style tests (owner, 2026-11-24) are off by default and switched on with
// a query parameter; the shell reads this for the scan credit, the lazy self-model for the drawing.

export type FigureStyle = 'flat' | 'manga' | 'human';

/** `?figure=manga` or `?figure=human` from a location search string; anything else is the shipped flat figure. */
export function figureStyle(search: string): FigureStyle {
  const m = /[?&]figure=(manga|human)\b/.exec(search);
  return m ? (m[1] as FigureStyle) : 'flat';
}
