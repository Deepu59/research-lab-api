export interface CsvRun {
  measurements: Record<string, number>;
  notes: string | null;
}

/** Split one CSV line into cells. Supports "quoted, cells" and "" as an escaped quote. */
export function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      cells.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells.map((c) => c.trim());
}

/**
 * Parse CSV text into runs. The first line is the header.
 * A column named "notes" is stored as text; every other column must be numeric.
 * Empty cells are skipped. Throws an Error with a readable message on bad input.
 */
export function parseCsv(text: string): CsvRun[] {
  const lines = text
    .replace(/^﻿/, '') // strip BOM that Excel adds
    .split(/\r?\n/)
    .filter((line) => line.trim() !== '');

  if (lines.length < 2) {
    throw new Error('CSV needs a header row and at least one data row');
  }

  const headers = parseCsvLine(lines[0]);
  if (headers.some((h) => h === '')) {
    throw new Error('CSV header contains an empty column name');
  }

  return lines.slice(1).map((line, index) => {
    const cells = parseCsvLine(line);
    const rowNumber = index + 2; // 1-based, header is row 1
    if (cells.length !== headers.length) {
      throw new Error(
        `Row ${rowNumber} has ${cells.length} columns, expected ${headers.length}`,
      );
    }

    const measurements: Record<string, number> = {};
    let notes: string | null = null;

    headers.forEach((header, col) => {
      const cell = cells[col];
      if (header.toLowerCase() === 'notes') {
        notes = cell === '' ? null : cell;
        return;
      }
      if (cell === '') return;
      const value = Number(cell);
      if (!Number.isFinite(value)) {
        throw new Error(
          `Row ${rowNumber}, column "${header}": "${cell}" is not a number`,
        );
      }
      measurements[header] = value;
    });

    return { measurements, notes };
  });
}

function escapeCell(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** Turn runs into CSV text: one column per measurement name, then notes. */
export function toCsv(
  runs: { measurements: Record<string, number>; notes: string | null }[],
): string {
  const names: string[] = [];
  for (const run of runs) {
    for (const name of Object.keys(run.measurements)) {
      if (!names.includes(name)) names.push(name);
    }
  }

  const header = [...names, 'notes'].map(escapeCell).join(',');
  const rows = runs.map((run) =>
    [
      ...names.map((name) =>
        run.measurements[name] === undefined ? '' : String(run.measurements[name]),
      ),
      escapeCell(run.notes ?? ''),
    ].join(','),
  );
  return [header, ...rows].join('\n') + '\n';
}
