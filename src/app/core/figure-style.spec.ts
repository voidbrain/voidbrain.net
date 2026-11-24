import { figureStyle } from './figure-style';

describe('figureStyle', () => {
  it('reads the style test from the query and defaults to the flat figure', () => {
    expect(figureStyle('')).toBe('flat');
    expect(figureStyle('?figure=manga')).toBe('manga');
    expect(figureStyle('?a=1&figure=human')).toBe('human');
    expect(figureStyle('?figure=humanoid')).toBe('flat');
    expect(figureStyle('?figure=other')).toBe('flat');
  });
});
