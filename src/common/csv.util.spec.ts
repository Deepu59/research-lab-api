import { parseCsv, parseCsvLine, toCsv } from './csv.util';

describe('parseCsvLine', () => {
  it('splits simple cells', () => {
    expect(parseCsvLine('a,b,c')).toEqual(['a', 'b', 'c']);
  });

  it('handles quoted cells with commas and escaped quotes', () => {
    expect(parseCsvLine('1,"hello, ""world""",3')).toEqual([
      '1',
      'hello, "world"',
      '3',
    ]);
  });
});

describe('parseCsv', () => {
  it('parses numeric columns and a notes column', () => {
    const rows = parseCsv('speed,voltage,notes\n1.5,7.4,first run\n2,,\n');
    expect(rows).toEqual([
      { measurements: { speed: 1.5, voltage: 7.4 }, notes: 'first run' },
      { measurements: { speed: 2 }, notes: null },
    ]);
  });

  it('rejects non-numeric values with a helpful message', () => {
    expect(() => parseCsv('speed\nabc')).toThrow(/Row 2.*"speed".*not a number/);
  });

  it('rejects rows with the wrong number of columns', () => {
    expect(() => parseCsv('a,b\n1')).toThrow(/Row 2 has 1 columns, expected 2/);
  });

  it('requires a header and at least one row', () => {
    expect(() => parseCsv('speed')).toThrow();
  });
});

describe('toCsv', () => {
  it('writes one column per measurement plus notes', () => {
    const csv = toCsv([
      { measurements: { speed: 1, voltage: 7 }, notes: 'ok, good' },
      { measurements: { speed: 2 }, notes: null },
    ]);
    expect(csv).toBe('speed,voltage,notes\n1,7,"ok, good"\n2,,\n');
  });

  it('round-trips through parseCsv', () => {
    const runs = [{ measurements: { a: 1, b: 2 }, notes: 'x' }];
    expect(parseCsv(toCsv(runs))).toEqual(runs);
  });
});
