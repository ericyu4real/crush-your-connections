export function formatDebug({ version, tab, info, inject, lastError } = {}) {
  const lines = [
    'Crush Your Connections debug',
    `version: ${version || '-'}`,
    `tab: ${tab?.id ?? '-'} ${tab?.url || '(no url)'}`,
    `title: ${tab?.title || '-'}`,
    `inject: ${inject || 'none'}`,
  ];
  if (lastError && !info?.hasBoard) lines.push(`error: ${lastError}`);
  if (!info) {
    lines.push('info: null');
    return lines.join('\n');
  }
  lines.push(`game: ${info.game || '-'}`);
  lines.push(`identified: ${!!info.identified}`);
  lines.push(`hasBoard: ${!!info.hasBoard}`);
  lines.push(`n: ${info.n ?? '-'}`);
  lines.push(`href: ${info.href || '-'}`);
  lines.push(`hasGrid: ${info.hasGrid ?? '-'}`);
  lines.push(`cellCount: ${info.cellCount ?? '-'}`);
  if (info.error) lines.push(`info.error: ${info.error}`);
  return lines.join('\n');
}
