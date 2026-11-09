import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { applySolution, isBoardSolved, readBoard } from '../../extension/queens/board.js';
import { solve, isValidSolution } from '../../extension/queens/solver.js';
import { board4, board4FixtureColors, board4Solution } from './boards.mjs';
import { renderFixtureHtml, renderUltimateFixtureHtml } from './fixture-html.mjs';

function namedRegions() {
  return board4.map((row) => row.map((key) => board4FixtureColors[key].name));
}

function load(preset) {
  const html = renderFixtureHtml({
    regions: board4,
    colors: board4FixtureColors,
    preset,
  });
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    url: 'http://127.0.0.1/fixture',
  });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  return dom;
}

function unload(dom) {
  dom.window.close();
  delete globalThis.window;
  delete globalThis.document;
}

test('fixture flow: fresh board is solved by applySolution and shows See results', async () => {
  const dom = load();
  try {
    const board = readBoard();
    const queens = solve(board.regions);
    assert.deepEqual(queens, board4Solution);
    const result = await applySolution(board, queens);
    assert.equal(result.solved, true);
    const latest = readBoard();
    assert.equal(isBoardSolved(latest), true);
    assert.equal(isValidSolution(namedRegions(), queens), true);
    assert.equal(document.getElementById('status').textContent, 'solved');
    assert.equal(document.getElementById('completion').hidden, false);
    assert.equal(document.querySelector('#completion button').textContent, 'See results');
  } finally {
    unload(dom);
  }
});

test('fixture flow: wrong queen and X marks are corrected', async () => {
  const dom = load([
    ['queen', 'cross', 'empty', 'empty'],
    ['empty', 'empty', 'cross', 'empty'],
    ['empty', 'queen', 'empty', 'empty'],
    ['cross', 'empty', 'empty', 'empty'],
  ]);
  try {
    const board = readBoard();
    assert.equal(board.states[0][0], 'queen');
    assert.equal(board.states[0][1], 'cross');
    const queens = solve(board.regions);
    const result = await applySolution(readBoard(), queens);
    assert.equal(result.solved, true);
    const latest = readBoard();
    assert.equal(latest.states[0][0], 'empty', 'incorrect queen at 0,0 was cleared');
    assert.equal(latest.states[0][board4Solution[0]], 'queen');
    assert.equal(isBoardSolved(latest), true);
    assert.equal(document.getElementById('completion').hidden, false);
  } finally {
    unload(dom);
  }
});

test('Queens Ultimate fixture: wrong queen and X marks are corrected', async () => {
  const html = renderUltimateFixtureHtml({
    regions: board4,
    colors: board4FixtureColors,
    preset: [
      ['queen', 'cross', 'empty', 'empty'],
      ['empty', 'empty', 'cross', 'empty'],
      ['empty', 'queen', 'empty', 'empty'],
      ['cross', 'empty', 'empty', 'empty'],
    ],
  });
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    url: 'https://queensultimate.com/unlimited',
  });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  try {
    const board = readBoard();
    assert.equal(board.n, 4);
    assert.equal(board.states[0][0], 'queen');
    const queens = solve(board.regions);
    const result = await applySolution(readBoard(), queens);
    assert.equal(result.solved, true);
    const latest = readBoard();
    assert.equal(latest.states[0][0], 'empty', 'incorrect queen at 0,0 was cleared');
    assert.equal(latest.states[0][board4Solution[0]], 'queen');
    assert.equal(isBoardSolved(latest), true);
    assert.equal(document.getElementById('completion').hidden, false);
    assert.equal(document.querySelector('.play-again-btn').textContent, 'Play Another');
  } finally {
    unload(dom);
  }
});
