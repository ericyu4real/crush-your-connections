import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isValidPath, solve } from '../../extension/zip/solver.js';
import {
  board2,
  board2Solution,
  board2Walled,
  board2WalledSolution,
  board3,
  live601,
  live601Solution,
} from './boards.mjs';

test('2x2 without walls snakes 1-2-3-4', () => {
  const path = solve(board2);
  assert.deepEqual(path, board2Solution);
  assert.equal(isValidPath(board2, path), true);
});

test('a down wall under 1 still leaves a valid 2x2 snake', () => {
  const path = solve(board2Walled);
  assert.deepEqual(path, board2WalledSolution);
  assert.equal(isValidPath(board2Walled, path), true);
});

test('3x3 with four corners numbered has a full covering path', () => {
  const path = solve(board3);
  assert.ok(path);
  assert.equal(path.length, 9);
  assert.equal(isValidPath(board3, path), true);
  assert.equal(path[0], 0, 'must start at 1');
  assert.equal(path[path.length - 1], 6, 'must end at 4');
});

test('live LinkedIn Zip #601 8x8 solves and matches the independently checked path', () => {
  const path = solve(live601);
  assert.ok(path, 'expected a solution for the live 8x8');
  assert.deepEqual(path, live601Solution);
  assert.equal(isValidPath(live601, path), true);
  assert.equal(path.length, 64);
  assert.equal(live601.numberAt[path[0]], 1);
  assert.equal(live601.numberAt[path[path.length - 1]], 14);
});

test('isValidPath rejects a path that skips a checkpoint', () => {
  const bad = board2Solution.slice();
  [bad[1], bad[2]] = [bad[2], bad[1]];
  assert.equal(isValidPath(board2, bad), false);
});

test('solver returns null when a required number is missing', () => {
  assert.equal(solve({ rows: 2, cols: 2, numberAt: [1, null, null, 3], rightWalls: [], downWalls: [] }), null);
});
