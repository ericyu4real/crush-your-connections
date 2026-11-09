import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { mountOverlay, overlayHost, updateOverlay } from '../extension/overlay.js';
import { statusView } from '../extension/status.js';

test('overlay appears with Crush when a Zip board is found', () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  const doc = dom.window.document;
  let clicked = 0;
  mountOverlay({ onSolve: () => { clicked += 1; } }, doc);
  updateOverlay(statusView({ game: 'zip', hasBoard: true, n: 8, solved: false }), doc);
  const host = overlayHost(doc);
  assert.equal(host.id, 'crush-your-connections-host');
  assert.equal(host.style.display, 'block');
  assert.equal(host.shadowRoot.querySelector('.kicker').textContent, 'Crush Your Connections');
  assert.equal(host.shadowRoot.querySelector('.title').textContent, 'Found 8×8 Zip');
  assert.equal(host.shadowRoot.querySelector('.fill').textContent, 'Crush');
  assert.equal(host.shadowRoot.querySelector('.card').dataset.tone, 'ready');
  host.shadowRoot.querySelector('.fill').click();
  assert.equal(clicked, 1);
  dom.window.close();
});

test('overlay names Queens when a Queens board is found', () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  const doc = dom.window.document;
  mountOverlay({}, doc);
  updateOverlay(statusView({ game: 'queens', hasBoard: true, n: 9, solved: false, cellCount: 81 }), doc);
  assert.equal(overlayHost(doc).shadowRoot.querySelector('.title').textContent, 'Found 9×9 Queens');
  dom.window.close();
});

test('overlay stays hidden until a game is identified', () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  const doc = dom.window.document;
  mountOverlay({}, doc);
  updateOverlay(statusView(null), doc);
  assert.equal(overlayHost(doc).style.display, 'none');
  dom.window.close();
});
