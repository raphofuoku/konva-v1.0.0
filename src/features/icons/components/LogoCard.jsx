/**
 * LogoCard
 * Path: src/features/icons/components/LogoCard.jsx
 *
 * The logo in (choose, drop, paste or the sample) and every drawing option: background,
 * shape, padding, app names and theme colour. The whole card is the drop target.
 */
import { useRef, useState } from 'react';
import { fmt } from '../../../lib/konvaEngine';
import Icon from '../../../components/ui/Icon';
import { Range, Seg } from '../../studio/panels/controls';
import { ACCEPT, BGS, COPY, PAD_MAX, SHAPES } from '../iconConstants';
import '../../studio/panels/Panels.css';

const RADIUS = { square: '6px', rounded: '22%', circle: '50%' };

// Dark or light icon colour on a picked swatch.
function inkOn(hex) {
  const n = parseInt(hex.slice(1), 16);
  const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.6 ? '#1F2150' : '#FFFFFF';
}

export default function LogoCard({ ip }) {
  const { src, loading, error, warn, load, loadSample, opts, bg, setOpt, meta, setMeta, icons, busy } = ip;
  const fileRef = useRef(null);
  const [drag, setDrag] = useState(false);

  const onDragOver = (e) => {
    e.preventDefault();
    if (!drag) setDrag(true);
  };
  const onDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setDrag(false);
  };
  const onDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) load(file);
  };

  // The sticker shows the real 512 px icon once it's drawn, so shape and padding are exact.
  const shown = icons.find((i) => i.id === 'and512')?.url || src?.url;
  const meta1 = src
    ? `${src.svg ? 'SVG · vector' : `${src.w}×${src.h}`}${src.size ? ` · ${fmt(src.size)}` : ''}`
    : 'drop an SVG or PNG';
  const customOn = opts.bg === 'custom';

  return (
    <section
      className="k-card icons-logo"
      aria-labelledby="icons-logo-title"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <h2 id="icons-logo-title" className="icons-sr">Your logo</h2>
      <div className="icons-drop">
        <div
          className={`k-sticker k-checker icons-sticker${drag ? ' is-hot' : ''}`}
          style={{ borderRadius: RADIUS[opts.shape] }}
        >
          {src && shown && <img src={shown} alt={`${src.name} as an icon`} />}
          {!src && !loading && (
            <div className="icons-sticker__empty">
              <span>{drag ? 'let go' : 'your logo'}</span>
            </div>
          )}
          {loading && <div className="icons-sticker__loading k-skeleton" />}
        </div>

        <div className="icons-src">
          <span className="icons-src__name">{src ? src.name : 'No logo yet'}</span>
          <span className="icons-src__meta">{loading ? 'reading…' : meta1}</span>
          {loading && (
            <div className="k-progress k-progress--indeterminate icons-src__bar" role="status" aria-label="Reading logo">
              <div className="k-progress__bar" />
            </div>
          )}
        </div>
      </div>

      {warn && (
        <p className="k-note k-note--warn icons-note" role="note">
          <Icon name="warning" size={18} />
          <span>{warn}</span>
        </p>
      )}
      {error && (
        <p className="k-note k-note--bad icons-note" role="alert">
          <Icon name="error" size={18} />
          <span>{error}</span>
        </p>
      )}

      <div className="icons-actions">
        <button type="button" className="k-btn" onClick={() => fileRef.current?.click()} disabled={!!busy}>
          <Icon name="upload_file" />
          Choose logo
        </button>
        {!src?.sample && (
          <button type="button" className="k-btn k-btn--ghost icons-actions__ghost" onClick={loadSample} disabled={!!busy}>
            Use the sample
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) load(file);
            e.target.value = '';
          }}
        />
      </div>
      <p className="icons-hint">
        SVG, or a square PNG of 512 px or more, gives the sharpest results. You can also drop or paste it.
      </p>

      <div className="icons-group">
        <h3 className="k-eyebrow">Background</h3>
        <div className="icons-swatches" role="group" aria-label="Background">
          {BGS.map((b) => (
            <button
              key={b.value}
              type="button"
              className={`icons-swatch${b.value === 'transparent' ? ' k-checker' : ''}`}
              style={b.value === 'transparent' ? undefined : { background: b.value }}
              aria-pressed={opts.bg === b.value}
              aria-label={b.label}
              title={b.label}
              onClick={() => setOpt({ bg: b.value })}
            />
          ))}
          <label
            className={`icons-swatch icons-swatch--custom${customOn ? ' is-on' : ''}`}
            style={customOn ? { background: opts.customBg, color: inkOn(opts.customBg) } : undefined}
            title={customOn ? `Custom colour ${opts.customBg}` : 'Custom colour'}
          >
            <Icon name="colorize" />
            <input
              type="color"
              value={opts.customBg.toLowerCase()}
              aria-label="Custom background colour"
              onClick={() => setOpt({ bg: 'custom' })}
              onChange={(e) => setOpt({ bg: 'custom', customBg: e.target.value.toUpperCase() })}
            />
          </label>
        </div>
        {bg === 'transparent' && <p className="icons-hint icons-hint--flush">{COPY.solidFill}</p>}
      </div>

      <div className="icons-group">
        <h3 className="k-eyebrow">Shape</h3>
        <Seg label="Shape" options={SHAPES} value={opts.shape} onChange={(shape) => setOpt({ shape })} />
      </div>

      <Range
        label="Padding"
        value={opts.pad}
        display={`${opts.pad}%`}
        min={0}
        max={PAD_MAX}
        onChange={(pad) => setOpt({ pad })}
      />

      <div className="icons-names">
        <label className="icons-label">
          App name
          <input
            className="k-field"
            type="text"
            value={meta.name}
            onChange={(e) => setMeta({ name: e.target.value })}
          />
        </label>
        <label className="icons-label">
          Short name
          <input
            className="k-field"
            type="text"
            value={meta.short}
            onChange={(e) => setMeta({ short: e.target.value })}
          />
        </label>
      </div>

      <label className="icons-theme">
        Theme colour
        <span className="icons-theme__val">
          <b>{opts.theme}</b>
          <input
            type="color"
            value={opts.theme.toLowerCase()}
            aria-label="Theme colour"
            onChange={(e) => setOpt({ theme: e.target.value.toUpperCase() })}
          />
        </span>
      </label>
    </section>
  );
}
