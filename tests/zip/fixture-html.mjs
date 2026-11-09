export function renderZipFixture({
  rows,
  cols,
  numberAt,
  rightWalls = [],
  downWalls = [],
  path = [],
  title = 'Zip fixture',
} = {}) {
  const total = rows * cols;
  const cells = [];
  for (let i = 0; i < total; i++) {
    const num = numberAt[i];
    const content = num
      ? `<div data-cell-content="true" aria-label="${num}">${num}</div>`
      : '';
    cells.push(
      `<div role="button" data-cell-idx="${i}" data-testid="cell-${i}">${content}</div>`,
    );
  }

  const walls = [
    ...rightWalls.map((cellIdx) => ({ cellIdx, direction: 'WallDirection_RIGHT' })),
    ...downWalls.map((cellIdx) => ({ cellIdx, direction: 'WallDirection_DOWN' })),
  ];

  return `<!doctype html>
<html>
<head><meta charset="utf-8"><title>${title}</title></head>
<body>
  <div data-testid="zip-game-container">
    <div data-testid="interactive-grid" data-trail-grid style="--rows:${rows}; --cols:${cols}">
      ${cells.join('')}
    </div>
  </div>
  <p id="status">playing</p>
  <div id="completion" hidden>
    <h2>You're crushing it!</h2>
    <button type="button">Copy score</button>
  </div>
  <script>
    const ROWS = ${rows};
    const COLS = ${cols};
    const TOTAL = ${total};
    const walls = ${JSON.stringify(walls)};
    const state = { path: ${JSON.stringify(path)}, gridSize: ${rows}, walls };
    const cells = [...document.querySelectorAll('[data-cell-idx]')];
    for (const el of cells) {
      el.__reactFiber$zip = {
        memoizedProps: state,
        return: {
          memoizedProps: { gridCols: COLS, gridRows: ROWS, onKeyDown: function () {} },
          return: null,
        },
      };
      el.addEventListener('mousedown', () => {
        const idx = Number(el.getAttribute('data-cell-idx'));
        const last = state.path[state.path.length - 1];
        if (state.path.includes(idx)) return;
        if (state.path.length === 0 || adjacent(last, idx)) {
          state.path.push(idx);
          const fill = document.createElement('div');
          fill.setAttribute('data-testid', 'filled-cell');
          el.appendChild(fill);
          if (state.path.length === TOTAL) {
            document.getElementById('status').textContent = 'solved';
            document.getElementById('completion').hidden = false;
          }
        }
      });
    }
    function adjacent(a, b) {
      const ar = Math.floor(a / COLS), ac = a % COLS;
      const br = Math.floor(b / COLS), bc = b % COLS;
      return Math.abs(ar - br) + Math.abs(ac - bc) === 1;
    }
    for (const idx of state.path) {
      const el = document.querySelector('[data-cell-idx="' + idx + '"]');
      if (!el.querySelector('[data-testid="filled-cell"]')) {
        const fill = document.createElement('div');
        fill.setAttribute('data-testid', 'filled-cell');
        el.appendChild(fill);
      }
    }
  </script>
</body>
</html>`;
}
