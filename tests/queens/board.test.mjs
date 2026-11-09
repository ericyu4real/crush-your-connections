import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { parseCellLabel, readBoard, placedQueens, isBoardSolved, clickCell, boardStatus } from '../../extension/queens/board.js';
import { board4, board4FixtureColors, board4Solution } from './boards.mjs';
import { renderFixtureHtml, renderUltimateFixtureHtml } from './fixture-html.mjs';

test('parseCellLabel reads empty, cross, and queen labels from the live format', () => {
  assert.deepEqual(parseCellLabel('Empty cell of color Vibrant Coral, row 1, column 1'), {
    state: 'empty',
    color: 'Vibrant Coral',
    row: 0,
    col: 0,
  });
  assert.deepEqual(parseCellLabel('Cross of color Light Gray, row 2, column 5'), {
    state: 'cross',
    color: 'Light Gray',
    row: 1,
    col: 4,
  });
  assert.deepEqual(parseCellLabel('Queen of color Lime Yellow, row 8, column 8'), {
    state: 'queen',
    color: 'Lime Yellow',
    row: 7,
    col: 7,
  });
  assert.equal(parseCellLabel('Reset'), null);
});

test('parseCellLabel reads Queens Ultimate empty, X, and queen labels', () => {
  assert.deepEqual(parseCellLabel('Row 1, column 1, blue region, empty'), {
    state: 'empty',
    color: 'blue',
    row: 0,
    col: 0,
  });
  assert.deepEqual(parseCellLabel('Row 2, column 5, tan region, marked with X'), {
    state: 'cross',
    color: 'tan',
    row: 1,
    col: 4,
  });
  assert.deepEqual(parseCellLabel('Row 8, column 8, purple region, queen placed'), {
    state: 'queen',
    color: 'purple',
    row: 7,
    col: 7,
  });
});

test('readBoard reconstructs regions and states from fixture DOM', () => {
  const html = renderFixtureHtml({
    regions: board4,
    colors: board4FixtureColors,
    preset: [
      ['empty', 'queen', 'cross', 'empty'],
      ['empty', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty'],
    ],
  });
  const dom = new JSDOM(html);
  globalThis.document = dom.window.document;
  globalThis.window = dom.window;

  const board = readBoard();
  assert.equal(board.n, 4);
  assert.deepEqual(board.regions, [
    ['Vibrant Coral', 'Vibrant Coral', 'Light Gray', 'Light Gray'],
    ['Vibrant Coral', 'Lime Yellow', 'Light Gray', 'Light Gray'],
    ['Lime Yellow', 'Lime Yellow', 'Soft Blue', 'Light Gray'],
    ['Lime Yellow', 'Soft Blue', 'Soft Blue', 'Soft Blue'],
  ]);
  assert.equal(board.states[0][1], 'queen');
  assert.equal(board.states[0][2], 'cross');
  assert.equal(isBoardSolved(board), false);

  delete globalThis.document;
  delete globalThis.window;
});

test('readBoard reconstructs a Queens Ultimate board from data-row cells', () => {
  const html = renderUltimateFixtureHtml({
    regions: board4,
    colors: board4FixtureColors,
    preset: [
      ['empty', 'queen', 'cross', 'empty'],
      ['empty', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty'],
    ],
  });
  const dom = new JSDOM(html);
  globalThis.document = dom.window.document;
  globalThis.window = dom.window;

  const board = readBoard();
  assert.equal(board.n, 4);
  assert.deepEqual(board.regions, board4);
  assert.equal(board.states[0][1], 'queen');
  assert.equal(board.states[0][2], 'cross');
  assert.equal(isBoardSolved(board), false);

  delete globalThis.document;
  delete globalThis.window;
});

test('clickCell cycles empty to cross on the LinkedIn fixture via native events', () => {
  const html = renderFixtureHtml({
    regions: board4,
    colors: board4FixtureColors,
  });
  const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://127.0.0.1/games/queens/' });
  globalThis.document = dom.window.document;
  globalThis.window = dom.window;
  globalThis.PointerEvent = dom.window.PointerEvent || class PointerEvent extends dom.window.MouseEvent {};
  try {
    const el = document.querySelector('[data-cell-idx="0"]');
    assert.match(el.getAttribute('aria-label'), /^Empty cell/);
    clickCell(el);
    assert.match(el.getAttribute('aria-label'), /^Cross/);
    assert.equal(boardStatus().hasBoard, true);
    assert.equal(boardStatus().n, 4);
  } finally {
    delete globalThis.document;
    delete globalThis.window;
    delete globalThis.PointerEvent;
    dom.window.close();
  }
});

test('placedQueens requires exactly one queen per row', () => {
  assert.deepEqual(
    placedQueens([
      ['empty', 'queen', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'queen'],
      ['queen', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'queen', 'empty'],
    ]),
    board4Solution,
  );
  assert.equal(
    placedQueens([
      ['queen', 'queen', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty'],
    ]),
    null,
  );
});
