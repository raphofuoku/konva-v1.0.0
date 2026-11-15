/**
 * ConvertPanel
 * Path: src/features/studio/panels/ConvertPanel.jsx
 *
 * Output format, quality or target size, and metadata stripping.
 */
import { NumberField, Note, Range, Section, Seg, SwitchRow } from './controls';

const FORMATS = [
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png', label: 'PNG' },
  { value: 'webp', label: 'WEBP' },
  { value: 'avif', label: 'AVIF' },
];
const MODES = [
  { value: 'quality', label: 'Quality' },
  { value: 'target', label: 'Target size' },
];

function targetNote(s, est, g) {
  if (s.format === 'png') return 'PNG is lossless, so there is no quality to search. Switch to WEBP or JPEG.';
  if (est && !est.approx && est.miss) {
    return `Can’t get under ${s.targetKB} KB at ${g ? `${g.ow}×${g.oh}` : 'this size'}, even at the lowest quality. Resize it first.`;
  }
  if (est && !est.approx && est.q != null) return `Konva tried qualities until the file fit. Landed on q${Math.round(est.q * 100)}.`;
  return 'Konva tries qualities until the file fits.';
}

export default function ConvertPanel({ st }) {
  const s = st.settings;
  const est = st.estimate;
  const png = s.format === 'png';

  return (
    <>
      <Section title="Output format">
        <Seg label="Output format" options={FORMATS} value={s.format} onChange={(format) => st.set({ format })} />
        {s.format === 'avif' && !st.caps.avif && !est?.unsupported && (
          <Note icon="info">
            This browser can’t save AVIF itself, so Konva uses its own encoder: a one-time 3 MB download, then it works
            offline. Large photos take a few seconds.
          </Note>
        )}
        {est?.unsupported && (
          <Note tone="warn">The AVIF encoder didn’t load. Go online once so it can be cached, or choose WEBP.</Note>
        )}
        {png && st.selected?.alpha === false && (
          <Note icon="info">This image has no transparency, so WEBP or JPEG will usually be much smaller.</Note>
        )}
        {s.format === 'jpeg' && st.selected?.alpha && (
          <Note tone="warn">JPEG has no transparency, so see-through areas turn black. Choose PNG or WEBP to keep them.</Note>
        )}
      </Section>

      <Section title="Compression">
        <Seg label="Compression mode" options={MODES} value={s.mode} onChange={(mode) => st.set({ mode })} />
        {s.mode === 'quality' ? (
          <>
            <Range
              label="Quality"
              value={s.quality}
              display={png ? 'n/a' : `${s.quality}%`}
              min={10}
              max={100}
              disabled={png}
              onChange={(quality) => st.set({ quality })}
            />
            {png && <Note>PNG is lossless, so quality doesn’t apply. Resize or switch to WEBP to shrink it.</Note>}
          </>
        ) : (
          <>
            <NumberField
              label="Make it under"
              value={s.targetKB}
              min={5}
              max={100000}
              step={10}
              suffix="KB"
              disabled={png}
              onCommit={(targetKB) => st.set({ targetKB })}
            />
            <Note>{targetNote(s, est, st.geometry)}</Note>
          </>
        )}
      </Section>

      <Section>
        <SwitchRow
          checked={s.strip}
          onChange={(strip) => st.set({ strip })}
          title="Strip metadata"
          hint="Removes camera details and GPS location on export"
        />
        {!s.strip && (
          <Note icon="info">Konva can’t keep metadata yet: re-encoding in the browser always removes it.</Note>
        )}
      </Section>
    </>
  );
}