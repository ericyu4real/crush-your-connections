import { failedView, filledView, fillingView, statusView } from './status.js';
import { formatDebug } from './debug.js';

const statusEl = document.getElementById('status');
const button = document.getElementById('solve');
const hint = document.getElementById('hint');
const badgeEl = document.getElementById('badge');
const metaEl = document.getElementById('meta');
const debugEl = document.getElementById('debug');
const copyButton = document.getElementById('copy-debug');

const TAB_QUERY = {
  url: [
    'https://www.linkedin.com/games/*',
    'https://linkedin.com/games/*',
    'https://*.linkedin.com/games/*',
    'http://127.0.0.1/*',
    'http://localhost/*',
  ],
};

let lastDebug = '';

function setDebug(parts) {
  const info = parts.info;
  lastDebug = formatDebug({
    version: chrome.runtime.getManifest().version,
    ...parts,
    lastError: info?.hasBoard ? undefined : parts.lastError,
  });
  debugEl.textContent = lastDebug;
}

function setView(view) {
  document.body.dataset.tone = view.tone || 'idle';
  statusEl.textContent = view.title;
  badgeEl.textContent = view.badge || 'Idle';
  button.disabled = !view.actionEnabled;
  button.textContent = view.actionLabel || 'Crush';
  if (view.detail) hint.textContent = view.detail;
  if (view.meta) {
    metaEl.hidden = false;
    metaEl.textContent = view.meta;
  } else {
    metaEl.hidden = true;
    metaEl.textContent = '';
  }
  debugEl.hidden = !view.showDebug;
}

function looksLikeGameTab(tab) {
  return !!(tab?.url && /\/games\/(zip|queens)(\/|$|\?)/i.test(tab.url));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function askTab(tabId, type) {
  return chrome.tabs.sendMessage(tabId, { type });
}

async function ping(tabId) {
  let lastErr;
  for (const ms of [60, 160, 400, 900]) {
    try {
      return await askTab(tabId, 'GET_STATUS');
    } catch (err) {
      lastErr = err;
      await sleep(ms);
    }
  }
  throw lastErr;
}

async function attach(tab) {
  if (!tab?.id) return { tab, info: null, inject: 'no-tab' };
  try {
    const info = await askTab(tab.id, 'GET_STATUS');
    return { tab, info, inject: 'already-attached' };
  } catch (err) {
    const firstError = String(err && err.message ? err.message : err);
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['inject.js'],
      });
    } catch (injectErr) {
      return {
        tab,
        info: looksLikeGameTab(tab) ? { error: 'no-content-script' } : null,
        inject: `inject-failed: ${injectErr && injectErr.message ? injectErr.message : injectErr}`,
        lastError: firstError,
      };
    }
    try {
      const info = await ping(tab.id);
      return { tab, info, inject: 'injected', lastError: firstError };
    } catch (err2) {
      return {
        tab,
        info: looksLikeGameTab(tab) ? { error: 'no-content-script' } : null,
        inject: 'injected-but-silent',
        lastError: String(err2 && err2.message ? err2.message : err2),
      };
    }
  }
}

async function findGameTab() {
  const [active] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (active?.id) {
    const attached = await attach(active);
    if (attached.info?.identified || attached.info?.hasBoard || attached.info?.error || attached.inject !== 'no-tab') {
      return attached;
    }
  }

  const tabs = await chrome.tabs.query(TAB_QUERY);
  for (const tab of tabs) {
    if (!tab.id || tab.id === active?.id) continue;
    const attached = await attach(tab);
    if (attached.info?.identified || attached.info?.hasBoard) return attached;
  }

  return { tab: active, info: null, inject: 'not-found' };
}

let targetTabId = null;

async function refresh() {
  setView({
    title: 'Looking for a board…',
    detail: hint.textContent,
    actionEnabled: false,
    actionLabel: 'Crush',
    tone: 'idle',
    badge: 'Scanning',
  });
  try {
    const found = await findGameTab();
    targetTabId = found.tab?.id ?? null;
    setDebug(found);
    setView(statusView(found.info));
  } catch (err) {
    targetTabId = null;
    const lastError = String(err && err.message ? err.message : err);
    setDebug({ tab: null, info: null, inject: 'refresh-failed', lastError });
    setView({
      title: 'Could not reach the page.',
      detail: lastError,
      actionEnabled: false,
      actionLabel: 'Crush',
      tone: 'error',
      badge: 'Offline',
      showDebug: true,
    });
  }
}

copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(lastDebug);
    copyButton.textContent = 'Copied';
    setTimeout(() => {
      copyButton.textContent = 'Debug';
    }, 1200);
  } catch {
    copyButton.textContent = 'Copy failed';
  }
});

button.addEventListener('click', async () => {
  if (!targetTabId) {
    await refresh();
    if (!targetTabId || button.disabled) return;
  }
  setView(fillingView());
  try {
    const result = await askTab(targetTabId, 'CRUSH');
    if (result?.solved || result?.ok) {
      setView(filledView(result.n, result.game));
      return;
    }
    if (result?.error === 'need-start') {
      setView(statusView({ identified: true, hasBoard: false, game: result.game }));
      return;
    }
    if (result?.error === 'not-game' || result?.error === 'not-zip' || result?.error === 'not-queens') {
      setView(statusView({ identified: false, hasBoard: false }));
      return;
    }
    if (result?.error === 'already-running') {
      setView({
        title: 'Already solving this board.',
        detail: 'Wait for the current fill to finish.',
        actionEnabled: false,
        actionLabel: 'Solving…',
        tone: 'filling',
        badge: 'Solving',
      });
      return;
    }
    setView(failedView(result?.error));
  } catch (err) {
    setView(failedView(err && err.message ? err.message : err));
  }
});

refresh();
