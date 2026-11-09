import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { isBoardSolved as zipSolved, readBoard as readZip } from '../extension/zip/board.js';
import { isBoardSolved as queensSolved, readBoard as readQueens } from '../extension/queens/board.js';
import { board2, board2Solution } from './zip/boards.mjs';
import { renderZipFixture } from './zip/fixture-html.mjs';
import { board4, board4FixtureColors, board4Solution } from './queens/boards.mjs';
import { renderFixtureHtml } from './queens/fixture-html.mjs';

const COMMAND = 'crush-solver-command';
const RESULT = 'crush-solver-result';

function send(type) {
  return new Promise((resolve) => {
    const id = `test-${type}-${Math.random().toString(16).slice(2)}`;
    window.addEventListener(RESULT, function onResult(event) {
      if (event.detail?.id !== id) return;
      window.removeEventListener(RESULT, onResult);
      resolve(event.detail);
    });
    window.dispatchEvent(new CustomEvent(COMMAND, { detail: { type, id } }));
  });
}

test('identifies a Zip board and only fills after Crush', async () => {
  const html = renderZipFixture(board2);
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    url: 'http://127.0.0.1/games/zip/',
  });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.CustomEvent = dom.window.CustomEvent;
  globalThis.PointerEvent = dom.window.PointerEvent || class PointerEvent extends dom.window.MouseEvent {};
  await import(`../extension/page.js?zip=${Date.now()}`);

  try {
    const status = await send('GET_STATUS');
    assert.equal(status.game, 'zip');
    assert.equal(status.identified, true);
    assert.equal(status.hasBoard, true);
    assert.equal(status.n, 2);
    assert.equal(status.solved, false);
    assert.equal(zipSolved(readZip()), false);

    const result = await send('CRUSH');
    assert.equal(result.ok, true);
    assert.equal(result.solved, true);
    assert.equal(result.game, 'zip');
    const board = readZip();
    assert.equal(zipSolved(board), true);
    assert.deepEqual([...board.path], board2Solution);
  } finally {
    dom.window.close();
    delete globalThis.window;
    delete globalThis.document;
    delete globalThis.CustomEvent;
    delete globalThis.PointerEvent;
  }
});

test('identifies a Queens board and only fills after Crush', async () => {
  const html = renderFixtureHtml({
    regions: board4,
    colors: board4FixtureColors,
  });
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    url: 'http://127.0.0.1/games/queens/',
  });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.CustomEvent = dom.window.CustomEvent;
  globalThis.PointerEvent = dom.window.PointerEvent || class PointerEvent extends dom.window.MouseEvent {};
  await import(`../extension/page.js?queens=${Date.now()}`);

  try {
    const status = await send('GET_STATUS');
    assert.equal(status.game, 'queens');
    assert.equal(status.identified, true);
    assert.equal(status.hasBoard, true);
    assert.equal(status.n, 4);
    assert.equal(status.solved, false);
    assert.equal(queensSolved(readQueens()), false);

    const result = await send('CRUSH');
    assert.equal(result.ok, true);
    assert.equal(result.solved, true);
    assert.equal(result.game, 'queens');
    const board = readQueens();
    assert.equal(queensSolved(board), true);
    assert.deepEqual(
      board.states.map((row) => row.findIndex((state) => state === 'queen')),
      board4Solution,
    );
  } finally {
    dom.window.close();
    delete globalThis.window;
    delete globalThis.document;
    delete globalThis.CustomEvent;
    delete globalThis.PointerEvent;
  }
});
