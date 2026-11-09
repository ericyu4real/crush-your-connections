import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { applyPath, boardStatus, isBoardSolved, readBoard, wallsFromDom } from '../../extension/zip/board.js';
import { solve, isValidPath } from '../../extension/zip/solver.js';
import { board2, board2Solution, board2Walled, live601 } from './boards.mjs';
import { renderZipFixture } from './fixture-html.mjs';

function load(board, path = []) {
  const html = renderZipFixture({ ...board, path });
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    url: 'http://127.0.0.1/games/zip/',
  });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.PointerEvent = dom.window.PointerEvent || class PointerEvent extends dom.window.MouseEvent {};
  return dom;
}

function unload(dom) {
  dom.window.close();
  delete globalThis.window;
  delete globalThis.document;
  delete globalThis.PointerEvent;
}

test('readBoard reconstructs numbers and React walls from the Zip fixture', () => {
  const dom = load(board2Walled);
  try {
    const board = readBoard();
    assert.equal(board.n, 2);
    assert.deepEqual(board.numberAt, board2Walled.numberAt);
    assert.deepEqual(board.downWalls, [0]);
    assert.equal(isBoardSolved(board), false);
  } finally {
    unload(dom);
  }
});

test('applyPath clicks every cell and marks the 2x2 fixture solved', async () => {
  const dom = load(board2);
  try {
    const board = readBoard();
    const path = solve(board);
    assert.deepEqual(path, board2Solution);
    const result = await applyPath(board, path);
    assert.equal(result.solved, true);
    const latest = readBoard();
    assert.equal(isBoardSolved(latest), true);
    assert.equal(isValidPath(latest, latest.path), true);
    assert.equal(document.getElementById('status').textContent, 'solved');
  } finally {
    unload(dom);
  }
});

test('readBoard identifies the live #601 number layout', () => {
  const dom = load(live601);
  try {
    const board = readBoard();
    assert.equal(board.n, 8);
    assert.equal(board.numberAt[8], 1);
    assert.equal(board.numberAt[38], 14);
    assert.deepEqual(board.rightWalls, [8, 54]);
  } finally {
    unload(dom);
  }
});

test('readBoard still finds the numbered grid when React fiber is missing', () => {
  const dom = load(live601);
  try {
    for (const el of document.querySelectorAll('[data-cell-idx]')) {
      for (const key of Object.keys(el).filter((k) => k.startsWith('__reactFiber$'))) {
        delete el[key];
      }
    }
    const board = readBoard();
    assert.equal(board.n, 8);
    assert.equal(board.numberAt[8], 1);
    assert.equal(boardStatus().hasBoard, true);
    assert.equal(boardStatus().identified, true);
  } finally {
    unload(dom);
  }
});

test('wallsFromDom reads thick overlay borders as walls', () => {
  const dom = load(board2);
  try {
    const cell = document.querySelector('[data-cell-idx="0"]');
    const wall = document.createElement('div');
    wall.style.borderRight = '12px solid rgb(7, 7, 7)';
    cell.appendChild(wall);
    const { rightWalls, downWalls } = wallsFromDom(
      [...document.querySelectorAll('[data-cell-idx]')],
      2,
    );
    assert.deepEqual(rightWalls, [0]);
    assert.deepEqual(downWalls, []);
  } finally {
    unload(dom);
  }
});
