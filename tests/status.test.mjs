import { test } from 'node:test';
import assert from 'node:assert/strict';
import { failedView, filledView, fillingView, statusView } from '../extension/status.js';

test('statusView stays hidden off game pages', () => {
  assert.equal(statusView(null).visible, false);
  assert.equal(statusView({ identified: false, hasBoard: false }).visible, false);
  assert.match(statusView(null).title, /Zip or Queens/);
  assert.equal(statusView(null).actionLabel, 'Crush');
});

test('statusView tells you to reload when the content script is missing', () => {
  const view = statusView({ error: 'no-content-script' });
  assert.equal(view.visible, false);
  assert.match(view.title, /reload/i);
  assert.match(view.detail, /copy debug/i);
});

test('statusView enables Crush when a Zip board is found', () => {
  const view = statusView({
    game: 'zip',
    identified: true,
    hasBoard: true,
    n: 8,
    solved: false,
    cellCount: 64,
    wallRight: 2,
    wallDown: 0,
  });
  assert.equal(view.visible, true);
  assert.equal(view.actionEnabled, true);
  assert.equal(view.actionLabel, 'Crush');
  assert.equal(view.title, 'Found 8×8 Zip');
  assert.equal(view.badge, 'Ready');
  assert.equal(view.tone, 'ready');
  assert.equal(view.meta, 'Zip · 8×8 · 64 cells · 2 walls');
});

test('statusView enables Crush when a Queens board is found', () => {
  const view = statusView({
    game: 'queens',
    identified: true,
    hasBoard: true,
    n: 9,
    solved: false,
    cellCount: 81,
  });
  assert.equal(view.visible, true);
  assert.equal(view.actionEnabled, true);
  assert.equal(view.actionLabel, 'Crush');
  assert.equal(view.title, 'Found 9×9 Queens');
  assert.equal(view.meta, 'Queens · 9×9 · 81 cells');
});

test('filling and filled views keep the detector visible', () => {
  assert.equal(fillingView(8, 'zip').actionEnabled, false);
  assert.equal(fillingView(8, 'zip').title, 'Solving 8×8 Zip…');
  assert.equal(filledView(9, 'queens').tone, 'solved');
  assert.equal(filledView(9, 'queens').title, 'Solved 9×9 Queens');
  assert.equal(failedView('no-solution').actionEnabled, true);
  assert.equal(failedView('no-solution').actionLabel, 'Crush');
});
