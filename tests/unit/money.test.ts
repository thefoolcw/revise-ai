import { describe, it, expect } from 'vitest';
import { formatMinor } from '../../src/server/premium/product';

describe('decimal-safe pricing', () => {
  it('formats the production Premium price as £3.99 from 399 minor units', () => {
    expect(formatMinor(399, 'GBP')).toBe('£3.99');
  });
  it('pads single-digit pence', () => {
    expect(formatMinor(5, 'GBP')).toBe('£0.05');
    expect(formatMinor(1050, 'GBP')).toBe('£10.50');
  });
  it('never produces floating-point artefacts', () => {
    // 0.1 + 0.2 style bug would surface here if floats were used.
    expect(formatMinor(399 + 1, 'GBP')).toBe('£4.00');
    expect(formatMinor(1999, 'GBP')).toBe('£19.99');
  });
  it('supports other currencies', () => {
    expect(formatMinor(399, 'EUR')).toBe('€3.99');
  });
  it('rejects invalid amounts instead of silently formatting them', () => {
    expect(() => formatMinor(-1, 'GBP')).toThrow();
    expect(() => formatMinor(3.99, 'GBP')).toThrow();
    expect(() => formatMinor(NaN, 'GBP')).toThrow();
  });
});
