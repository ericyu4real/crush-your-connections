import * as zip from './zip/board.js';
import * as queens from './queens/board.js';

function hrefOf(root = document) {
  return (
    (root.defaultView && root.defaultView.location && root.defaultView.location.href) ||
    (typeof location !== 'undefined' ? location.href : '')
  );
}

export function detect(root = document) {
  const href = hrefOf(root);
  const zipBoard = zip.readBoard(root);
  const queensBoard = queens.readBoard(root);

  if (zip.isZipUrl(href) || zipBoard) {
    return {
      game: 'zip',
      identified: true,
      hasBoard: !!zipBoard,
      board: zipBoard,
    };
  }
  if (queens.isQueensUrl(href) || queensBoard) {
    return {
      game: 'queens',
      identified: true,
      hasBoard: !!queensBoard,
      board: queensBoard,
    };
  }
  return { game: null, identified: false, hasBoard: false, board: null };
}

export function boardStatus(root = document) {
  const found = detect(root);
  if (found.game === 'zip') return { game: 'zip', ...zip.boardStatus(root) };
  if (found.game === 'queens') return { game: 'queens', ...queens.boardStatus(root) };
  return {
    ok: true,
    game: null,
    identified: false,
    hasBoard: false,
    n: null,
    solved: false,
    completed: false,
  };
}

export function pageDebug(root = document) {
  const found = detect(root);
  if (found.game === 'zip') return { game: 'zip', ...zip.pageDebug(root) };
  if (found.game === 'queens') return { game: 'queens', ...queens.pageDebug(root) };
  return {
    game: null,
    identified: false,
    hasBoard: false,
    href: hrefOf(root),
    hasGrid: false,
    cellCount: 0,
  };
}

export async function runSolve(options) {
  const found = detect();
  if (found.game === 'zip') {
    const result = await zip.runSolve(options);
    return { ...result, game: 'zip' };
  }
  if (found.game === 'queens') {
    const result = await queens.runSolve(options);
    return { ...result, game: 'queens' };
  }
  return { ok: false, error: found.identified ? 'need-start' : 'not-game', game: found.game };
}
