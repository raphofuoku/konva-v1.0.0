/**
 * studioUi
 * Path: src/features/studio/studioUi.js
 *
 * Pure display helpers for the Studio layout: chips, dimension line, sticker box, labels.
 */
import { CROPS, SOCIAL, fmt, pct } from '../../lib/konvaEngine';

export const MOBILE_QUERY = '(max-width: 819px)';

export const MOD_KEY =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? '⌘' : 'Ctrl';

// Space kept clear around the image inside the stage (room for the stage bar and the halo).
export const STAGE_PAD = {
  desktop: { t: 72, r: 64, b: 56, l: 64 },
  mobile: { t: 60, r: 28, b: 32, l: 28 },
};

// Fit a dw×dh image inside the stage, never upscaling past 3×.
export function stickerBox(stage, pad, dw, dh) {
  const aw = Math.max(80, stage.width - pad.l - pad.r);
  const ah = Math.max(80, stage.height - pad.t - pad.b);
  const k = Math.min(aw / dw, ah / dh, 3);
  const width = Math.round(dw * k);
  const height = Math.round(dh * k);
  return { left: Math.round(pad.l + (aw - width) / 2), top: Math.round(pad.t + (ah - height) / 2), width, height };
}

export const formatLabel = (format) => (format === 'jpeg' ? 'JPG' : format.toUpperCase());

const qualityLabel = (s) => (s.format === 'png' ? 'lossless' : s.mode === 'target' ? `≤${s.targetKB} KB` : `q${s.quality}`);

// "WEBP · q80 · strip metadata" for the empty state.
export const defaultsLabel = (s) => `${s.format.toUpperCase()} · ${qualityLabel(s)}${s.strip ? ' · strip metadata' : ''}`;

export const cropName = (id) => (CROPS.find((c) => c.id === id) || SOCIAL.find((c) => c.id === id) || CROPS[0]).label;

// "4032×3024 → 1600×1200 · 4.1 MB → ≈ 212 KB"
export function dimsLine(f, g, est, withSize) {
  if (!f || !g) return '';
  const changed = g.ow !== f.w || g.oh !== f.h;
  let line = `${f.w}×${f.h}${changed ? ` → ${g.ow}×${g.oh}` : ''}`;
  if (withSize && est?.size != null) line += ` · ${fmt(f.size)} → ${est.approx ? '≈ ' : ''}${fmt(est.size)}`;
  return line;
}

// Chips in the panel footer: original, estimate or result, change, format, location removed.
export function buildChips(f, s, est) {
  if (!f) return [];
  const chips = [{ key: 'orig', icon: 'description', label: 'original', value: fmt(f.size) }];
  const label = s.mode === 'target' && s.format !== 'png' ? 'result' : 'estimate';

  if (f.status === 'error') {
    // Nothing to estimate for a file that couldn't be read.
  } else if (f.status !== 'ready' || !est) chips.push({ key: 'est', icon: 'schedule', label, value: '…' });
  else if (est.unsupported) chips.push({ key: 'est', icon: 'schedule', label, value: 'on export' });
  else if (est.failed || est.size == null) chips.push({ key: 'est', icon: 'error', label, value: 'n/a' });
  else {
    const smaller = est.size < f.size;
    chips.push({
      key: 'est',
      icon: smaller ? 'south' : 'north',
      label,
      value: `${est.approx ? '≈ ' : ''}${fmt(est.size)}`,
      tone: smaller ? 'ok' : undefined,
    });
    const d = pct(f.size, est.size);
    if (d != null) {
      chips.push({
        key: 'change',
        icon: d > 0 ? 'trending_down' : 'trending_up',
        label: 'change',
        value: `${d > 0 ? '−' : '+'}${Math.abs(d)}%`,
        tone: d > 0 ? 'ok' : undefined,
      });
    }
  }

  chips.push({ key: 'fmt', icon: 'tune', label: s.format.toUpperCase(), value: qualityLabel(s), tone: 'vio' });
  if (s.strip && f.exif?.gps) chips.push({ key: 'gps', icon: 'location_off', label: 'location data', value: 'removed', tone: 'ok' });
  return chips;
}