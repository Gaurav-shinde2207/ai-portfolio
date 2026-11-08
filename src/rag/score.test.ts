import { describe, expect, it } from 'vitest';
import { scoreAnswer } from './score';

describe('scoreAnswer', () => {
  it('passes when every keyword present (case-insensitive)', () => {
    expect(scoreAnswer('cut Outlook boot time 32%', ['outlook', '32%'])).toBe(true);
  });

  it('fails when a keyword is missing', () => {
    expect(scoreAnswer('cut Outlook boot time', ['outlook', '32%'])).toBe(false);
  });

  it('matches mixed case on both sides', () => {
    expect(scoreAnswer('Email me at ShinDeGaurav2201@gmail.com', ['shindegaurav2201'])).toBe(true);
  });
});
