export interface Summary {
  count: number;
  mean: number;
  median: number;
  stdDev: number; // sample standard deviation
  min: number;
  max: number;
}

const round = (n: number): number => Math.round(n * 1e6) / 1e6;

/** Summary statistics for a list of numbers, or null when the list is empty. */
export function summarize(values: number[]): Summary | null {
  if (values.length === 0) return null;

  const count = values.length;
  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((total, v) => total + v, 0);
  const mean = sum / count;

  const mid = Math.floor(count / 2);
  const median =
    count % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

  const squaredDiffs = values.reduce((total, v) => total + (v - mean) ** 2, 0);
  const stdDev = count > 1 ? Math.sqrt(squaredDiffs / (count - 1)) : 0;

  return {
    count,
    mean: round(mean),
    median: round(median),
    stdDev: round(stdDev),
    min: sorted[0],
    max: sorted[count - 1],
  };
}

/** Summaries for every measurement name that appears in the given runs. */
export function computeStats(
  runs: { measurements: Record<string, number> }[],
): Record<string, Summary> {
  const valuesByName = new Map<string, number[]>();

  for (const run of runs) {
    for (const [name, value] of Object.entries(run.measurements)) {
      const list = valuesByName.get(name) ?? [];
      list.push(value);
      valuesByName.set(name, list);
    }
  }

  const result: Record<string, Summary> = {};
  for (const [name, values] of valuesByName) {
    result[name] = summarize(values)!;
  }
  return result;
}
