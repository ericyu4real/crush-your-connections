import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isValidSolution, queensTouch, solve } from '../../extension/queens/solver.js';
import {
  board4,
  board4LongDiagonal,
  board4Solution,
  board5,
  live920,
  live920Solution,
  liveUltimate4107,
  liveUltimate4107Solution,
  unsolvable2,
} from './boards.mjs';

/**
 * Rule checks implemented in the test file so a bug in isValidSolution
 * cannot rubber-stamp the solver's own output.
 */
function assertIndependentRules(regions, queens) {
  const n = regions.length;
  assert.equal(queens.length, n, 'one entry per row');

  const cols = new Set();
  const regionIds = new Set();
  const allRegions = new Set(regions.flat());
  assert.equal(allRegions.size, n, 'board must have n regions');

  for (let r = 0; r < n; r++) {
    const c = queens[r];
    assert.ok(Number.isInteger(c) && c >= 0 && c < n, `row ${r} column in range`);
    assert.equal(cols.has(c), false, `column ${c} used twice`);
    cols.add(c);
    const region = regions[r][c];
    assert.equal(regionIds.has(region), false, `region ${region} used twice`);
    regionIds.add(region);
  }
  assert.equal(cols.size, n);
  assert.equal(regionIds.size, n);

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const touch = Math.max(Math.abs(i - j), Math.abs(queens[i] - queens[j])) === 1;
      assert.equal(touch, false, `queens at (${i},${queens[i]}) and (${j},${queens[j]}) touch`);
    }
  }
}

test('2x2 has no solution because every pair of queens would touch', () => {
  assert.equal(solve(unsolvable2), null);
});

test('4x4 solver matches the known placement and passes independent rules', () => {
  const queens = solve(board4);
  assert.deepEqual(queens, board4Solution);
  assert.equal(isValidSolution(board4, queens), true);
  assertIndependentRules(board4, queens);
});

test('4x4 rejects a touching placement', () => {
  const touching = [0, 1, 2, 3];
  assert.equal(isValidSolution(board4, touching), false);
  assert.equal(queensTouch(0, 0, 1, 1), true);
});

test('queens farther apart on the same diagonal are allowed', () => {
  assert.equal(queensTouch(0, 0, 1, 1), true, 'diagonal neighbors touch');
  assert.equal(queensTouch(0, 0, 2, 2), false, 'same diagonal two cells away does not touch');

  const queens = solve(board4LongDiagonal);
  assert.ok(queens);
  assert.equal(isValidSolution(board4LongDiagonal, queens), true);
  assertIndependentRules(board4LongDiagonal, queens);

  const liveQueens = solve(live920);
  assert.ok(liveQueens);
  let hasLongDiagonal = false;
  for (let i = 0; i < liveQueens.length; i++) {
    for (let j = i + 1; j < liveQueens.length; j++) {
      if (
        Math.abs(i - j) === Math.abs(liveQueens[i] - liveQueens[j]) &&
        Math.abs(i - j) >= 2
      ) {
        hasLongDiagonal = true;
      }
    }
  }
  assert.equal(
    hasLongDiagonal,
    true,
    'the live 8x8 solution should include two queens on a long diagonal',
  );
  assert.equal(isValidSolution(live920, liveQueens), true);
});

test('5x5 representative board solves and validates', () => {
  const queens = solve(board5);
  assert.ok(queens);
  assert.equal(isValidSolution(board5, queens), true);
  assertIndependentRules(board5, queens);
  assert.equal(queens.filter((c, r) => queens.indexOf(c) === r).length, 5);
});

test('live LinkedIn #920 8x8 board solves and validates', () => {
  const queens = solve(live920);
  assert.ok(queens, 'expected a solution for the live 8x8');
  assert.deepEqual(queens, live920Solution);
  assert.equal(queens.length, 8);
  assert.equal(isValidSolution(live920, queens), true);
  assertIndependentRules(live920, queens);

  const yellowCells = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (live920[r][c] === 'Lime Yellow') yellowCells.push({ r, c });
    }
  }
  assert.ok(
    yellowCells.some((cell) => queens[cell.r] === cell.c),
    'Lime Yellow is a 3-cell region so the solution must occupy one of its cells',
  );
});

test('live Queens Ultimate #4107 8x8 board solves and validates', () => {
  const queens = solve(liveUltimate4107);
  assert.ok(queens, 'expected a solution for the live Queens Ultimate 8x8');
  assert.deepEqual(queens, liveUltimate4107Solution);
  assert.equal(isValidSolution(liveUltimate4107, queens), true);
  assertIndependentRules(liveUltimate4107, queens);
});

test('solver returns null for a non-square board', () => {
  assert.equal(solve([['A', 'B'], ['A']]), null);
});

test('isValidSolution rejects duplicate columns and missing queens', () => {
  assert.equal(isValidSolution(board4, [1, 1, 0, 2]), false);
  assert.equal(isValidSolution(board4, [1, 3, 0]), false);
  assert.equal(isValidSolution(board4, [1, 3, 0, 2]), true);
});
