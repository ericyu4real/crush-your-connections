const HOST_ID = 'crush-your-connections-host';
const states = new WeakMap();

const STYLES = `
:host {
  all: initial;
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 2147483646;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
.card {
  width: 260px;
  padding: 14px;
  border-radius: 18px;
  color: #f4efe8;
  background:
    radial-gradient(120% 80% at 100% -20%, rgba(255, 106, 42, 0.2), transparent 42%),
    rgba(14, 15, 20, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(18px);
}
.card[data-tone="ready"] {
  border-color: rgba(255, 106, 42, 0.38);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.42), 0 0 40px rgba(255, 106, 42, 0.12);
}
.card[data-tone="solved"] { border-color: rgba(62, 201, 128, 0.35); }
.card[data-tone="error"] { border-color: rgba(255, 92, 92, 0.35); }
.top { display: flex; gap: 10px; align-items: flex-start; }
img.logo {
  width: 38px; height: 38px; border-radius: 11px; flex: none;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.3);
}
.copy { min-width: 0; flex: 1; }
.kicker {
  font-size: 9px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
  color: rgba(244, 239, 232, 0.5);
}
.title { margin-top: 2px; font-size: 14px; font-weight: 700; line-height: 1.3; letter-spacing: -0.02em; }
.detail { margin-top: 3px; font-size: 11px; line-height: 1.4; color: rgba(244, 239, 232, 0.62); }
.close {
  margin: -4px -4px 0 0; width: 22px; height: 22px; border: 0; border-radius: 999px;
  background: transparent; color: rgba(244, 239, 232, 0.5); font-size: 16px; line-height: 1; cursor: pointer;
}
.close:hover { background: rgba(255, 255, 255, 0.08); color: #fff; }
.rail {
  display: none; height: 3px; margin-top: 12px; border-radius: 99px; overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
}
.card[data-tone="filling"] .rail { display: block; }
.bar {
  width: 40%; height: 100%; border-radius: inherit;
  background: linear-gradient(90deg, #ff8a4d, #ff6a2a);
  animation: slide 1s ease-in-out infinite;
}
.fill {
  display: block; width: 100%; margin-top: 12px; border: 0; border-radius: 12px;
  padding: 10px 12px; font: inherit; font-size: 13px; font-weight: 750; cursor: pointer;
  background: linear-gradient(180deg, #ff8a4d, #ff6a2a); color: #1a0d06;
  box-shadow: 0 10px 22px rgba(255, 106, 42, 0.28);
}
.fill:hover:not(:disabled) { filter: brightness(1.06); }
.fill:disabled {
  background: rgba(255, 255, 255, 0.1); color: rgba(244, 239, 232, 0.38);
  cursor: default; filter: none; box-shadow: none;
}
.card[data-tone="solved"] .fill { display: none; }
.card[data-tone="filling"] .fill {
  background: linear-gradient(90deg, #ff8a4d, #ff6a2a, #ff8a4d);
  background-size: 200% 100%;
  animation: shimmer 1s linear infinite;
  color: #1a0d06;
}
@keyframes slide {
  from { transform: translateX(-120%); }
  to { transform: translateX(280%); }
}
@keyframes shimmer {
  from { background-position: 0 0; }
  to { background-position: 200% 0; }
}
@media (prefers-reduced-motion: reduce) {
  .bar, .fill { animation: none !important; }
}
`;

function docOf(root) {
  return root.nodeType === 9 ? root : root.ownerDocument || document;
}

function stateFor(doc) {
  let state = states.get(doc);
  if (!state) {
    state = { host: null, shadow: null, onSolve: null, onDismiss: null };
    states.set(doc, state);
  }
  return state;
}

function ensureHost(doc) {
  const state = stateFor(doc);
  if (state.host && state.host.isConnected) return state.host;

  let host = doc.getElementById(HOST_ID);
  if (host && host.shadowRoot) {
    state.host = host;
    state.shadow = host.shadowRoot;
    return host;
  }

  host = doc.createElement('div');
  host.id = HOST_ID;
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `
    <style>${STYLES}</style>
    <div class="card" hidden>
      <div class="top">
        <img class="logo" alt="" width="38" height="38">
        <div class="copy">
          <div class="kicker">Crush Your Connections</div>
          <div class="title"></div>
          <div class="detail"></div>
        </div>
        <button class="close" type="button" aria-label="Hide detector">×</button>
      </div>
      <div class="rail"><div class="bar"></div></div>
      <button class="fill" type="button">Crush</button>
    </div>
  `;
  shadow.querySelector('.close').addEventListener('click', () => {
    if (state.onDismiss) state.onDismiss();
  });
  shadow.querySelector('.fill').addEventListener('click', () => {
    if (shadow.querySelector('.fill').disabled) return;
    if (state.onSolve) state.onSolve();
  });
  host.style.display = 'none';
  doc.documentElement.appendChild(host);
  state.host = host;
  state.shadow = shadow;
  return host;
}

export function mountOverlay(options = {}, root = document) {
  const doc = docOf(root);
  const state = stateFor(doc);
  state.onSolve = options.onSolve || null;
  state.onDismiss = options.onDismiss || null;
  ensureHost(doc);
  const logo = state.shadow.querySelector('img.logo');
  if (options.iconUrl) logo.src = options.iconUrl;
  else logo.remove();
  return state.host;
}

export function updateOverlay(view, root = document) {
  const doc = docOf(root);
  const state = stateFor(doc);
  if (!state.shadow || !state.host) return;
  const card = state.shadow.querySelector('.card');
  const visible = !!(view && view.visible);
  card.hidden = !visible;
  state.host.style.display = visible ? 'block' : 'none';
  if (!visible) return;
  card.dataset.tone = view.tone || 'idle';
  state.shadow.querySelector('.title').textContent = view.title || '';
  state.shadow.querySelector('.detail').textContent = view.detail || view.meta || '';
  const button = state.shadow.querySelector('.fill');
  button.textContent = view.actionLabel || 'Crush';
  button.disabled = !view.actionEnabled;
}

export function overlayHost(root = document) {
  return stateFor(docOf(root)).host;
}
