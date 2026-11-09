const ACTION = 'Crush';

function gameName(info) {
  if (info?.game === 'queens') return 'Queens';
  if (info?.game === 'zip') return 'Zip';
  return 'board';
}

function boardMeta(info) {
  const cells = info.cellCount || (info.n ? info.n * info.n : 0);
  const parts = [];
  if (info.game) parts.push(gameName(info));
  if (info.n) parts.push(`${info.n}×${info.n}`);
  if (cells) parts.push(`${cells} cells`);
  const walls = (Number(info.wallRight) || 0) + (Number(info.wallDown) || 0);
  if (info.game === 'zip' && walls) parts.push(`${walls} wall${walls === 1 ? '' : 's'}`);
  return parts.join(' · ');
}

export function statusView(info) {
  if (info?.error === 'timeout' || info?.error === 'no-content-script') {
    return {
      visible: false,
      title: 'Reload the game tab.',
      detail: 'Could not attach. Copy debug and paste it here.',
      actionEnabled: false,
      actionLabel: ACTION,
      tone: 'error',
      badge: 'Offline',
      meta: '',
      showDebug: true,
    };
  }
  if (!info) {
    return {
      visible: false,
      title: 'No Zip or Queens board on this page.',
      detail: 'Open LinkedIn Zip or Queens and start the game first.',
      actionEnabled: false,
      actionLabel: ACTION,
      tone: 'idle',
      badge: 'Idle',
      meta: '',
    };
  }
  const name = gameName(info);
  if (info.completed || info.solved) {
    return {
      visible: true,
      title: info.n ? `${info.n}×${info.n} ${name} solved` : 'Board solved',
      detail: 'The board is filled.',
      actionEnabled: false,
      actionLabel: ACTION,
      tone: 'solved',
      badge: 'Solved',
      meta: boardMeta(info),
    };
  }
  if (info.hasBoard) {
    return {
      visible: true,
      title: `Found ${info.n}×${info.n} ${name}`,
      detail: 'Click Crush to fill the board.',
      actionEnabled: true,
      actionLabel: ACTION,
      tone: 'ready',
      badge: 'Ready',
      meta: boardMeta(info),
    };
  }
  if (info.identified) {
    return {
      visible: true,
      title: `${name} is open`,
      detail: 'Start the game so the board is visible.',
      actionEnabled: false,
      actionLabel: ACTION,
      tone: 'waiting',
      badge: 'Waiting',
      meta: '',
    };
  }
  return {
    visible: false,
    title: 'This is not Zip or Queens.',
    detail: 'Go to LinkedIn Zip or Queens, then click the extension again.',
    actionEnabled: false,
    actionLabel: ACTION,
    tone: 'idle',
    badge: 'Idle',
    meta: '',
  };
}

export function fillingView(n, game) {
  const name = game === 'queens' ? 'Queens' : game === 'zip' ? 'Zip' : 'board';
  return {
    visible: true,
    title: n ? `Solving ${n}×${n} ${name}…` : `Solving ${name}…`,
    detail: 'Filling the board.',
    actionEnabled: false,
    actionLabel: 'Solving…',
    tone: 'filling',
    badge: 'Solving',
    meta: n ? `${n}×${n}` : '',
  };
}

export function filledView(n, game) {
  const name = game === 'queens' ? 'Queens' : game === 'zip' ? 'Zip' : 'board';
  return {
    visible: true,
    title: n ? `Solved ${n}×${n} ${name}` : 'Solved',
    detail: 'The board is filled.',
    actionEnabled: false,
    actionLabel: ACTION,
    tone: 'solved',
    badge: 'Solved',
    meta: n ? `${n}×${n}` : '',
  };
}

export function failedView(error) {
  return {
    visible: true,
    title: 'Could not solve this board.',
    detail: error ? String(error) : 'Start the game again, then click Crush.',
    actionEnabled: true,
    actionLabel: ACTION,
    tone: 'error',
    badge: 'Retry',
    meta: '',
    showDebug: true,
  };
}
