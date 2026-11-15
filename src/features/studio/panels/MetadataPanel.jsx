/**
 * MetadataPanel
 * Path: src/features/studio/panels/MetadataPanel.jsx
 *
 * What the file contains (type, size, pixels, EXIF, GPS, transparency), metadata stripping,
 * and the colour palette with click-to-copy hex codes.
 */
import { fmt } from '../../../lib/konvaEngine';
import Icon from '../../../components/ui/Icon';
import { useToast } from '../../../components/ui/Toasts';
import { NeedsImage, Note, Section, SwitchRow } from './controls';

const isJpeg = (f) => /jpe?g/i.test(f.type) || /\.jpe?g$/i.test(f.name);
const dateLabel = (ms) => (ms ? new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'unknown');

function facts(f) {
  // The EXIF scan only reads JPEG files, so say so rather than claiming "none".
  const exif = !isJpeg(f) ? 'not checked (JPEG only)' : f.exif?.found ? `${fmt(f.exif.bytes)} block` : 'none found';
  const gps = !isJpeg(f) ? 'not checked' : f.exif?.gps ? 'present' : 'none found';
  return [
    ['File', f.name],
    ['Type', f.type || 'unknown'],
    ['Size', fmt(f.size)],
    ['Pixels', f.w ? `${f.w} × ${f.h}` : 'unknown'],
    ['Modified', dateLabel(f.lastModified)],
    ['EXIF', exif],
    ['GPS', gps],
    ['Transparency', f.alpha ? 'yes' : 'no'],
  ];
}

export default function MetadataPanel({ st }) {
  const toast = useToast();
  const f = st.selected;
  const s = st.settings;
  const ready = f?.status === 'ready';
  const canEyedrop = typeof window !== 'undefined' && typeof window.EyeDropper === 'function';

  const copy = async (hex, picked = false) => {
    try {
      await navigator.clipboard.writeText(hex);
      toast('ok', picked ? `Picked and copied ${hex}` : `Copied ${hex}`);
    } catch {
      toast('info', `${hex} (copy blocked; select it instead)`);
    }
  };

  const eyedrop = async () => {
    try {
      const r = await new window.EyeDropper().open();
      await copy(r.sRGBHex.toUpperCase(), true);
    } catch {
      // Esc closes the picker; nothing to report.
    }
  };

  if (!ready) {
    return <NeedsImage>{f?.status === 'loading' ? 'Reading the file…' : 'Add an image to see what it contains.'}</NeedsImage>;
  }

  return (
    <>
      <Section title="This file">
        <dl className="panel-facts">
          {facts(f).map(([k, v]) => (
            <div key={k} className="panel-facts__row">
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        {f.orig && <Note icon="info">These are the cut-out’s details. The original is kept for compare and restore.</Note>}
        {f.exif?.gps && s.strip && (
          <span className="k-chip k-chip--ok panel-start">
            <Icon name="location_off" size={15} />
            Location data removed on export
          </span>
        )}
      </Section>

      <Section>
        <SwitchRow
          checked={s.strip}
          onChange={(strip) => st.set({ strip })}
          title="Strip metadata"
          hint="Re-encoding drops EXIF, camera and GPS data"
        />
        {!s.strip && <Note icon="info">Konva can’t keep metadata yet: re-encoding in the browser always removes it.</Note>}
      </Section>

      <Section
        title="Palette · click to copy"
        aside={
          canEyedrop ? (
            <button type="button" className="k-btn k-btn--ghost panel-small" onClick={eyedrop}>
              <Icon name="colorize" size={16} />
              Eyedropper
            </button>
          ) : null
        }
      >
        {f.palette.length ? (
          <div className="panel-palette">
            {f.palette.map((hex) => (
              <button key={hex} type="button" className="panel-swatch" onClick={() => copy(hex)} aria-label={`Copy ${hex}`}>
                <span className="panel-swatch__chip" style={{ background: hex }} />
                {hex}
              </button>
            ))}
          </div>
        ) : (
          <Note>No solid colours found (the image is mostly transparent).</Note>
        )}
      </Section>
    </>
  );
}