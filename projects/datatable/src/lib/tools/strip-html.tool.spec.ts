import { stripHtml } from './strip-html.tool';

describe('stripHtml', () => {
  it('should preserve word separation when stripping tags by default', () => {
    expect(stripHtml('<strong>Hello</strong><span>world</span>')).toBe('Hello world');
  });

  it('should strip tags without inserting spaces when requested', () => {
    expect(stripHtml('Compte sési<span color="warn">O</span>', '')).toBe('Compte sésiO');
  });

  it('should decode named and numeric HTML entities', () => {
    expect(stripHtml('R&amp;D&nbsp;&#38;&#x20AC;')).toBe('R&D &€');
  });

  it('should return an empty string for empty values', () => {
    expect(stripHtml(null)).toBe('');
    expect(stripHtml(undefined)).toBe('');
    expect(stripHtml('')).toBe('');
  });
});
