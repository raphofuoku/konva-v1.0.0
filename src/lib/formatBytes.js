const UNITS = ['B', 'KB', 'MB', 'GB'];

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes === 0) return '0 B';

  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), UNITS.length - 1);
  const value = bytes / 1024 ** exponent;

  return `${exponent === 0 ? value : value.toFixed(1)} ${UNITS[exponent]}`;
}

/** e.g. "2.4 MB → 340 KB" for before/after readouts. */
export function formatBytesDelta(beforeBytes, afterBytes) {
  return `${formatBytes(beforeBytes)} → ${formatBytes(afterBytes)}`;
}

/** Percentage reduction, clamped to 0-100, for a "-86%" style chip. */
export function formatSizeChangePercent(beforeBytes, afterBytes) {
  if (!beforeBytes) return null;
  const change = ((beforeBytes - afterBytes) / beforeBytes) * 100;
  return Math.round(change);
}