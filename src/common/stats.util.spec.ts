import { computeStats, summarize } from './stats.util';

describe('summarize', () => {
  it('returns null for an empty list', () => {
    expect(summarize([])).toBeNull();
  });

  it('computes stats for an odd-length list', () => {
    expect(summarize([1, 2, 3])).toEqual({
      count: 3,
      mean: 2,
      median: 2,
      stdDev: 1,
      min: 1,
      max: 3,
    });
  });

  it('uses the average of the middle two for the median of an even-length list', () => {
    expect(summarize([4, 1, 3, 2])?.median).toBe(2.5);
  });

  it('has a standard deviation of 0 for a single value', () => {
    expect(summarize([5])?.stdDev).toBe(0);
  });
});

describe('computeStats', () => {
  it('summarizes each measurement name separately', () => {
    const stats = computeStats([
      { measurements: { speed: 1, voltage: 7 } },
      { measurements: { speed: 3 } },
    ]);
    expect(stats.speed.count).toBe(2);
    expect(stats.speed.mean).toBe(2);
    expect(stats.voltage.count).toBe(1);
  });
});
