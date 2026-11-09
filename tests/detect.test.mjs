import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { boardStatus, detect } from '../extension/detect.js';
import { board2 } from './zip/boards.mjs';
import { renderZipFixture } from './zip/fixture-html.mjs';
import { board4, board4FixtureColors } from './queens/boards.mjs';
import { renderFixtureHtml } from './queens/fixture-html.mjs';

function load(html, url) {
  const dom = new JSDOM(html, { url });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  return dom;
}

function unload(dom) {
  dom.window.close();
  delete globalThis.window;
  delete globalThis.document;
}

test('detects Zip from the URL before a board exists', () => {
  const dom = load('<!doctype html><html><body></body></html>', 'https://www.linkedin.com/games/zip/');
  try {
    const found = detect(document);
    assert.equal(found.game, 'zip');
    assert.equal(found.identified, true);
    assert.equal(found.hasBoard, false);
  } finally {
    unload(dom);
  }
});

test('detects Queens from the URL before a board exists', () => {
  const dom = load('<!doctype html><html><body></body></html>', 'https://www.linkedin.com/games/queens/');
  try {
    const found = detect(document);
    assert.equal(found.game, 'queens');
    assert.equal(found.identified, true);
    assert.equal(found.hasBoard, false);
  } finally {
    unload(dom);
  }
});

test('reads a Zip fixture as Zip', () => {
  const dom = load(renderZipFixture(board2), 'http://127.0.0.1/games/zip/');
  try {
    const status = boardStatus(document);
    assert.equal(status.game, 'zip');
    assert.equal(status.hasBoard, true);
    assert.equal(status.n, 2);
  } finally {
    unload(dom);
  }
});

test('reads a Queens fixture as Queens', () => {
  const html = renderFixtureHtml({ regions: board4, colors: board4FixtureColors });
  const dom = load(html, 'http://127.0.0.1/games/queens/');
  try {
    const status = boardStatus(document);
    assert.equal(status.game, 'queens');
    assert.equal(status.hasBoard, true);
    assert.equal(status.n, 4);
  } finally {
    unload(dom);
  }
});

test('ignores unrelated pages', () => {
  const dom = load('<!doctype html><html><body></body></html>', 'https://www.linkedin.com/feed/');
  try {
    const found = detect(document);
    assert.equal(found.game, null);
    assert.equal(found.identified, false);
    assert.equal(found.hasBoard, false);
  } finally {
    unload(dom);
  }
});
