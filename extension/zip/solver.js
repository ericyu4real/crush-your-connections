/**
 * LinkedIn Zip solver. No DOM, no browser APIs.
 *
 * Zip is a Hamiltonian path: visit every cell exactly once, move only
 * up/down/left/right, never cross a wall, and pass numbered checkpoints
 * in increasing order (1, then 2, …, then the last number).
 */

export function neighbors(index, rows, cols, rightWalls, downWalls) {
  const r = Math.floor(index / cols);
  const c = index % cols;
  const out = [];
  if (c + 1 < cols && !rightWalls.has(index)) out.push(index + 1);
  if (c > 0 && !rightWalls.has(index - 1)) out.push(index - 1);
  if (r + 1 < rows && !downWalls.has(index)) out.push(index + cols);
  if (r > 0 && !downWalls.has(index - cols)) out.push(index - cols);
  return out;
}

function asSet(values) {
  return values instanceof Set ? values : new Set(values || []);
}

export function cellByNumber(numberAt) {
  const map = new Map();
  for (let i = 0; i < numberAt.length; i++) {
    const n = numberAt[i];
    if (Number.isInteger(n) && n > 0) map.set(n, i);
  }
  return map;
}

export function isValidPath(board, path) {
  if (!board || !Array.isArray(path)) return false;
  const { rows, cols, numberAt } = board;
  if (!rows || !cols) return false;
  const total = rows * cols;
  if (path.length !== total) return false;
  if (new Set(path).size !== total) return false;
  if (!path.every((idx) => Number.isInteger(idx) && idx >= 0 && idx < total)) return false;

  const rightWalls = asSet(board.rightWalls);
  const downWalls = asSet(board.downWalls);
  const checkpoints = cellByNumber(numberAt);
  if (!checkpoints.has(1)) return false;
  if (path[0] !== checkpoints.get(1)) return false;

  const maxNumber = Math.max(...checkpoints.keys());
  for (let n = 1; n <= maxNumber; n++) {
    if (!checkpoints.has(n)) return false;
  }

  let next = 1;
  for (let i = 0; i < path.length; i++) {
    const idx = path[i];
    const label = numberAt[idx];
    if (label) {
      if (label !== next) return false;
      next += 1;
    }
    if (i === 0) continue;
    const prev = path[i - 1];
    if (!neighbors(prev, rows, cols, rightWalls, downWalls).includes(idx)) return false;
  }
  return next === maxNumber + 1;
}

function remainingConnected(head, visited, adj, total, visitedCount) {
  const seen = new Uint8Array(total);
  const stack = [head];
  seen[head] = 1;
  let count = 1;
  while (stack.length) {
    const v = stack.pop();
    for (const u of adj[v]) {
      if (seen[u]) continue;
      if (visited[u] && u !== head) continue;
      seen[u] = 1;
      count += 1;
      stack.push(u);
    }
  }
  return count === total - visitedCount + 1;
}

/**
 * Find one valid Zip path, or null if none exists.
 * `numberAt[i]` is the checkpoint on cell i, or null/0 if empty.
 */
export function solve(board) {
  if (!board) return null;
  const { rows, cols, numberAt } = board;
  if (!rows || !cols || !Array.isArray(numberAt)) return null;
  const total = rows * cols;
  if (numberAt.length !== total) return null;

  const rightWalls = asSet(board.rightWalls);
  const downWalls = asSet(board.downWalls);
  const adj = Array.from({ length: total }, (_, i) =>
    neighbors(i, rows, cols, rightWalls, downWalls),
  );
  const checkpoints = cellByNumber(numberAt);
  if (!checkpoints.has(1)) return null;
  const maxNumber = Math.max(...checkpoints.keys());
  for (let n = 1; n <= maxNumber; n++) {
    if (!checkpoints.has(n)) return null;
  }

  const start = checkpoints.get(1);
  const end = checkpoints.get(maxNumber);
  const visited = new Uint8Array(total);
  const path = [start];
  visited[start] = 1;
  let visitedCount = 1;

  function dfs(head, expected) {
    if (visitedCount === total) return head === end;
    const here = numberAt[head];
    let nextExpected = expected;
    if (here === expected) nextExpected = expected + 1;
    const options = adj[head].filter((n) => !visited[n]);
    options.sort((a, b) => {
      const da = adj[a].reduce((sum, x) => sum + (visited[x] ? 0 : 1), 0);
      const db = adj[b].reduce((sum, x) => sum + (visited[x] ? 0 : 1), 0);
      return da - db;
    });
    for (const n of options) {
      const label = numberAt[n];
      if (label && label !== nextExpected) continue;
      visited[n] = 1;
      path.push(n);
      visitedCount += 1;
      if (remainingConnected(n, visited, adj, total, visitedCount) && dfs(n, nextExpected)) {
        return true;
      }
      visitedCount -= 1;
      path.pop();
      visited[n] = 0;
    }
    return false;
  }

  if (!dfs(start, 1)) return null;
  return path.slice();
}
