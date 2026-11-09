import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDebug } from '../extension/debug.js';

test('formatDebug is copy-pasteable without a screenshot', () => {
  const text = formatDebug({
    version: '1.0.0',
    tab: { id: 12, url: 'https://www.linkedin.com/games/zip/', title: 'Zip' },
    info: {
      game: 'zip',
      identified: true,
      hasBoard: true,
      n: 8,
      href: 'https://www.linkedin.com/games/zip/',
      hasGrid: true,
      cellCount: 64,
    },
    inject: 'injected',
    lastError: 'Could not establish connection. Receiving end does not exist.',
  });
  assert.match(text, /Crush Your Connections debug/);
  assert.match(text, /version: 1\.0\.0/);
  assert.match(text, /game: zip/);
  assert.match(text, /hasBoard: true/);
  assert.match(text, /cellCount: 64/);
  assert.match(text, /inject: injected/);
  assert.doesNotMatch(text, /Receiving end does not exist/);
});

test('formatDebug still works when the content script never answered', () => {
  const text = formatDebug({
    version: '1.0.0',
    tab: { id: 3, url: 'https://www.linkedin.com/games/queens/' },
    info: null,
    inject: 'injected-but-silent',
    lastError: 'Receiving end does not exist.',
  });
  assert.match(text, /info: null/);
  assert.match(text, /injected-but-silent/);
});
