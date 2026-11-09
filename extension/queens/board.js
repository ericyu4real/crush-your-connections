/**
 * Queens DOM integration for LinkedIn Queens and Queens Ultimate.
 *
 * LinkedIn (inspected 2026-11-07):
 *   #queens-game-board [data-testid="interactive-grid"]
 *   [data-cell-idx] / [data-testid^="cell-"]
 *   aria-label: "Empty cell|Cross|Queen of color {name}, row {r}, column {c}"
 *   clicks: React MAIN-world onClick(idx), empty → cross → queen
 *
 * Queens Ultimate (inspected 2026-11-07 on queensultimate.com/unlimited):
 *   .board-grid .cell[data-row][data-col][data-region]
 *   aria-label: "Row {r}, column {c}, {color} region, empty|marked with X|queen placed"
 *   native element.click() cycles empty → X → queen
 */

import { isValidSolution, solve } from './solver.js';

export const CELL_LABEL =
  /^(Empty cell|Cross|Queen) of color (.+), row (\d+), column (\d+)$/;

export const ULTIMATE_CELL_LABEL =
  /^Row (\d+), column (\d+), (.+) region, (empty|marked with X|queen placed)$/i;

const CLICK_TIMEOUT_MS = 1500;
const POLL_MS = 40;
const MAX_CLICKS_PER_CELL = 6;

export function parseCellLabel(label) {
  if (!label) return null;

  const linkedin = label.match(CELL_LABEL);
  if (linkedin) {
    const kind = linkedin[1];
    return {
      state: kind === 'Queen' ? 'queen' : kind === 'Cross' ? 'cross' : 'empty',
      color: linkedin[2],
      row: Number(linkedin[3]) - 1,
      col: Number(linkedin[4]) - 1,
    };
  }

  const ultimate = label.match(ULTIMATE_CELL_LABEL);
  if (ultimate) {
    const status = ultimate[4].toLowerCase();
    return {
      state: status.includes('queen') ? 'queen' : status.includes('x') ? 'cross' : 'empty',
      color: ultimate[3],
      row: Number(ultimate[1]) - 1,
      col: Number(ultimate[2]) - 1,
    };
  }

  return null;
}

function parseCellElement(el) {
  if (!el) return null;
  const parsed = parseCellLabel(el.getAttribute('aria-label'));
  const rowAttr = el.getAttribute('data-row');
  const colAttr = el.getAttribute('data-col');
  const row = parsed ? parsed.row : rowAttr == null ? NaN : Number(rowAttr);
  const col = parsed ? parsed.col : colAttr == null ? NaN : Number(colAttr);
  if (!Number.isInteger(row) || !Number.isInteger(col)) return null;

  const color = el.getAttribute('data-region') ?? parsed?.color;
  if (color == null || color === '') return null;

  let state = parsed?.state;
  if (!state) {
    if (el.classList.contains('queen')) state = 'queen';
    else if (el.classList.contains('marker')) state = 'cross';
    else state = 'empty';
  }

  return { state, color, row, col };
}

export function getGrid(root = document) {
  return (
    root.querySelector('#queens-game-board [data-testid="interactive-grid"]') ||
    root.querySelector('[data-testid="interactive-grid"]') ||
    root.querySelector('.board-grid')
  );
}

export function getCellElements(root = document) {
  const linkedinGrid =
    root.querySelector('#queens-game-board [data-testid="interactive-grid"]') ||
    root.querySelector('[data-testid="interactive-grid"]');
  if (linkedinGrid) {
    return [...linkedinGrid.querySelectorAll('[data-cell-idx], [data-testid^="cell-"]')].filter(
      (el) => parseCellElement(el),
    );
  }

  const ultimateGrid = root.querySelector('.board-grid');
  const scope = ultimateGrid || root;
  return [...scope.querySelectorAll('.cell[data-row][data-col], [data-row][data-col][data-region]')].filter(
    (el) => parseCellElement(el),
  );
}

export function readBoard(root = document) {
  const cells = getCellElements(root);
  if (cells.length === 0) return null;
  const n = Math.sqrt(cells.length);
  if (!Number.isInteger(n) || n < 2) return null;

  const regions = Array.from({ length: n }, () => Array(n).fill(null));
  const states = Array.from({ length: n }, () => Array(n).fill('empty'));
  const elements = Array.from({ length: n }, () => Array(n).fill(null));

  for (const el of cells) {
    const parsed = parseCellElement(el);
    if (!parsed) continue;
    if (parsed.row < 0 || parsed.row >= n || parsed.col < 0 || parsed.col >= n) {
      return null;
    }
    regions[parsed.row][parsed.col] = parsed.color;
    states[parsed.row][parsed.col] = parsed.state;
    elements[parsed.row][parsed.col] = el;
  }

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (regions[r][c] == null || !elements[r][c]) return null;
    }
  }

  return { n, regions, states, elements };
}

export function boardFingerprint(regions) {
  return regions.map((row) => row.join('\t')).join('\n');
}

export function placedQueens(states) {
  const queens = Array(states.length).fill(-1);
  for (let r = 0; r < states.length; r++) {
    for (let c = 0; c < states[r].length; c++) {
      if (states[r][c] === 'queen') {
        if (queens[r] !== -1) return null;
        queens[r] = c;
      }
    }
  }
  if (queens.some((c) => c < 0)) return null;
  return queens;
}

export function isBoardSolved(board) {
  if (!board) return false;
  const queens = placedQueens(board.states);
  if (!queens) return false;
  return isValidSolution(board.regions, queens);
}

function isDisplayed(el) {
  if (!el || el.hidden) return false;
  if (el.closest('[hidden]')) return false;
  return true;
}

export function looksLikeLinkedInCompletion(root = document) {
  const href = (root.defaultView && root.defaultView.location && root.defaultView.location.href) || '';
  if (/\/games\/queens\/results/i.test(href)) return true;
  if (/END_SOLVED/.test(href)) return true;
  const visibleText = [...root.querySelectorAll('h1, h2, button, a, [role="button"]')]
    .filter(isDisplayed)
    .map((el) => `${el.textContent || ''} ${el.getAttribute('aria-label') || ''}`)
    .join('\n');
  return /see results|copy score|you.?re crushing it/i.test(visibleText);
}

export function looksLikeCompletion(root = document) {
  if (looksLikeLinkedInCompletion(root)) return true;
  const visibleText = [...root.querySelectorAll('h1, h2, h3, button, a, [role="button"], [role="dialog"]')]
    .filter(isDisplayed)
    .map((el) => `${el.textContent || ''} ${el.getAttribute('aria-label') || ''}`)
    .join('\n');
  return /you crushed|play another/i.test(visibleText);
}

function visibleButton(root, pattern) {
  return [...root.querySelectorAll('button')].find((el) => {
    if (!isDisplayed(el)) return false;
    return pattern.test((el.textContent || '').replace(/\s+/g, ' ').trim());
  });
}

/** Queens Ultimate starts paused until START GAME; skip the tutorial if it is up. */
export function ensureBoardInteractive(root = document) {
  const skip = visibleButton(root, /^skip tutorial$/i);
  if (skip) skip.click();
  const start = visibleButton(root, /^start game$/i);
  if (start) start.click();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cellState(el) {
  const parsed = parseCellElement(el);
  return parsed ? parsed.state : null;
}

export function isQueensUrl(href = typeof location !== 'undefined' ? location.href : '') {
  return /\/games\/queens(\/|$|\?)/i.test(href) || /queensultimate\.com/i.test(href);
}

function viewOf(el) {
  return (el.ownerDocument && el.ownerDocument.defaultView) || globalThis;
}

/**
 * LinkedIn Queens ignores element.click() (verified 2026-11-09 on #922).
 * pointerdown + mousedown + pointerup + mouseup + click cycles
 * empty → cross → queen, and works from the isolated world.
 */
export function clickCell(el) {
  if (!el) return;
  const view = viewOf(el);
  const rect = el.getBoundingClientRect();
  const coords = {
    clientX: rect.left + rect.width / 2,
    clientY: rect.top + rect.height / 2,
    bubbles: true,
    cancelable: true,
    view,
    button: 0,
  };
  const MouseEventCtor = view.MouseEvent || globalThis.MouseEvent;
  const PointerEventCtor = view.PointerEvent || globalThis.PointerEvent;
  try {
    if (PointerEventCtor) {
      el.dispatchEvent(
        new PointerEventCtor('pointerdown', {
          ...coords,
          buttons: 1,
          pointerId: 1,
          pointerType: 'mouse',
          isPrimary: true,
        }),
      );
    }
  } catch {
    // jsdom fixtures may not implement PointerEvent.
  }
  el.dispatchEvent(new MouseEventCtor('mousedown', { ...coords, buttons: 1 }));
  try {
    if (PointerEventCtor) {
      el.dispatchEvent(
        new PointerEventCtor('pointerup', {
          ...coords,
          buttons: 0,
          pointerId: 1,
          pointerType: 'mouse',
          isPrimary: true,
        }),
      );
    }
  } catch {
    // Same as pointerdown.
  }
  el.dispatchEvent(new MouseEventCtor('mouseup', { ...coords, buttons: 0 }));
  el.dispatchEvent(new MouseEventCtor('click', { ...coords, buttons: 0 }));
}

async function waitForState(el, previous, timeoutMs = CLICK_TIMEOUT_MS) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const now = cellState(el);
    if (now && now !== previous) return now;
    await sleep(POLL_MS);
  }
  return cellState(el);
}

export async function setCellState(el, target) {
  if (!el) throw new Error('Missing cell');
  for (let i = 0; i < MAX_CLICKS_PER_CELL; i++) {
    const current = cellState(el);
    if (current === target) return current;
    if (!current) throw new Error('Could not read cell state');
    clickCell(el);
    const next = await waitForState(el, current);
    if (next === current) {
      clickCell(el);
      await waitForState(el, current);
    }
  }
  const finalState = cellState(el);
  if (finalState !== target) {
    throw new Error(`Cell stayed ${finalState}, wanted ${target}`);
  }
  return finalState;
}

export async function applySolution(board, queens, { isCancelled } = {}) {
  const { n, elements } = board;

  const cancelled = () => isCancelled && isCancelled();

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (cancelled()) return { ok: false, reason: 'cancelled' };
      const shouldBeQueen = queens[r] === c;
      const el = elements[r][c];
      const state = cellState(el);
      if (state === 'queen' && !shouldBeQueen) {
        await setCellState(el, 'empty');
        const verified = cellState(el);
        if (verified === 'queen') {
          throw new Error(`Failed to clear queen at ${r},${c}`);
        }
      }
    }
  }

  for (let r = 0; r < n; r++) {
    if (cancelled()) return { ok: false, reason: 'cancelled' };
    const c = queens[r];
    const el = elements[r][c];
    const before = cellState(el);
    if (before !== 'queen') {
      await setCellState(el, 'queen');
    }
    const verified = cellState(el);
    if (verified !== 'queen') {
      throw new Error(`Queen not placed at ${r},${c} (state=${verified})`);
    }
    const latest = readBoard();
    if (latest && isBoardSolved(latest)) {
      return { ok: true, solved: true };
    }
  }

  const latest = readBoard();
  return { ok: true, solved: !!(latest && isBoardSolved(latest)) };
}

export function solveBoard(board) {
  if (!board) return null;
  return solve(board.regions);
}

export function boardStatus(root = document) {
  const href =
    (root.defaultView && root.defaultView.location && root.defaultView.location.href) ||
    (typeof location !== 'undefined' ? location.href : '');
  if (looksLikeCompletion(root)) {
    const board = readBoard(root);
    return {
      ok: true,
      identified: true,
      hasBoard: true,
      n: board ? board.n : null,
      solved: true,
      completed: true,
    };
  }
  const board = readBoard(root);
  if (!board) {
    return {
      ok: true,
      identified: isQueensUrl(href),
      hasBoard: false,
      n: null,
      solved: false,
      completed: false,
    };
  }
  const solved = isBoardSolved(board);
  return {
    ok: true,
    identified: true,
    hasBoard: true,
    n: board.n,
    solved,
    completed: solved,
  };
}

export function pageDebug(root = document) {
  const href =
    (root.defaultView && root.defaultView.location && root.defaultView.location.href) ||
    (typeof location !== 'undefined' ? location.href : '');
  const status = boardStatus(root);
  return {
    ...status,
    href,
    hasGrid: !!getGrid(root),
    cellCount: getCellElements(root).length,
  };
}

let running = false;

export async function runSolve({ isCancelled } = {}) {
  if (running) return { ok: false, error: 'already-running' };
  const status = boardStatus();
  if (status.completed || status.solved) {
    return { ok: true, solved: true, n: status.n };
  }
  if (!status.hasBoard) {
    return { ok: false, error: status.identified ? 'need-start' : 'not-queens' };
  }

  running = true;
  try {
    ensureBoardInteractive();
    await sleep(250);
    const board = readBoard();
    if (!board) return { ok: false, error: 'need-start' };
    const queens = solveBoard(board);
    if (!queens) return { ok: false, error: 'no-solution', n: board.n };
    const result = await applySolution(readBoard() || board, queens, { isCancelled });
    const latest = readBoard();
    const solved = !!(latest && isBoardSolved(latest)) || result.solved || looksLikeCompletion();
    return { ok: solved, solved, n: board.n };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  } finally {
    running = false;
  }
}
