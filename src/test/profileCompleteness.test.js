import { describe, it, expect } from 'vitest';
import { computeMissingFields, hasMissingFields } from '../lib/profileCompleteness';

describe('computeMissingFields', () => {
  it('flags parentName and childEmail as missing when null', () => {
    const missing = computeMissingFields(null, { name: 'Kid', email: null });
    expect(missing).toEqual({ parentName: true, childEmail: true });
  });

  it('flags nothing missing when both are present', () => {
    const missing = computeMissingFields('Parent Name', { name: 'Kid', email: 'kid@test.com' });
    expect(missing).toEqual({ parentName: false, childEmail: false });
  });

  it('treats an absent child as childEmail missing', () => {
    const missing = computeMissingFields('Parent Name', undefined);
    expect(missing.childEmail).toBe(true);
  });
});

describe('hasMissingFields', () => {
  it('returns true when any field is missing', () => {
    expect(hasMissingFields({ parentName: false, childEmail: true })).toBe(true);
  });

  it('returns false when nothing is missing', () => {
    expect(hasMissingFields({ parentName: false, childEmail: false })).toBe(false);
  });
});
