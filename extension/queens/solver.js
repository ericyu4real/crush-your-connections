/**
 * Pure LinkedIn Queens solver. No DOM, no browser APIs.
 *
 * A solution is an array `queens` of length n where queens[row] = column.
 * Rules:
 *   - exactly one queen per row, column, and colored region
 *   - queens may not touch, including diagonally (Chebyshev distance 1)
 *   - queens farther apart on the same diagonal are allowed
 */

export function chebyshev(r1, c1, r2, c2) {
  return Math.max(Math.abs(r1 - r2), Math.abs(c1 - c2));
}

export function queensTouch(r1, c1, r2, c2) {
  return chebyshev(r1, c1, r2, c2) === 1;
}

export function uniqueRegions(regions) {
  const ids = new Set();
  for (const row of regions) {
    for (const id of row) ids.add(id);
  }
  return ids;
}

export function cellsByRegion(regions) {
  const map = new Map();
  for (let r = 0; r < regions.length; r++) {
    for (let c = 0; c < regions[r].length; c++) {
      const id = regions[r][c];
      if (!map.has(id)) map.set(id, []);
      map.get(id).push({ r, c });
    }
  }
  return map;
}

/**
 * Independently check a placement against the game rules.
 * `queens` is an array of column indices, one per row.
 */
export function isValidSolution(regions, queens) {
  if (!Array.isArray(regions) || regions.length === 0) return false;
  const n = regions.length;
  if (!regions.every((row) => Array.isArray(row) && row.length === n)) return false;
  if (!Array.isArray(queens) || queens.length !== n) return false;

  const cols = new Set();
  const regionIds = new Set();
  for (let r = 0; r < n; r++) {
    const c = queens[r];
    if (!Number.isInteger(c) || c < 0 || c >= n) return false;
    if (cols.has(c)) return false;
    cols.add(c);
    const region = regions[r][c];
    if (regionIds.has(region)) return false;
    regionIds.add(region);
    for (let r2 = 0; r2 < r; r2++) {
      if (queensTouch(r, c, r2, queens[r2])) return false;
    }
  }
  if (cols.size !== n || regionIds.size !== n) return false;
  if (uniqueRegions(regions).size !== n) return false;
  return true;
}

/**
 * Find one valid placement, or null if none exists.
 * Searches smallest regions first (fewest candidate cells).
 */
export function solve(regions) {
  if (!Array.isArray(regions) || regions.length === 0) return null;
  const n = regions.length;
  if (!regions.every((row) => Array.isArray(row) && row.length === n)) return null;

  const byRegion = cellsByRegion(regions);
  if (byRegion.size !== n) return null;

  const regionIds = [...byRegion.keys()].sort(
    (a, b) => byRegion.get(a).length - byRegion.get(b).length,
  );

  const placed = [];
  const rowUsed = Array(n).fill(false);
  const colUsed = Array(n).fill(false);

  function canPlace(r, c) {
    if (rowUsed[r] || colUsed[c]) return false;
    for (const q of placed) {
      if (queensTouch(r, c, q.r, q.c)) return false;
    }
    return true;
  }

  function search(index) {
    if (index === regionIds.length) return true;
    const cells = byRegion.get(regionIds[index]);
    for (let i = 0; i < cells.length; i++) {
      const { r, c } = cells[i];
      if (!canPlace(r, c)) continue;
      placed.push({ r, c });
      rowUsed[r] = true;
      colUsed[c] = true;
      if (search(index + 1)) return true;
      placed.pop();
      rowUsed[r] = false;
      colUsed[c] = false;
    }
    return false;
  }

  if (!search(0)) return null;
  const queens = Array(n).fill(-1);
  for (const q of placed) queens[q.r] = q.c;
  return queens;
}
