/**
 * ResizePanel
 * Path: src/features/studio/panels/ResizePanel.jsx
 *
 * Resize by pixels (width and height with an aspect lock) or by percent.
 */
import Icon from '../../../components/ui/Icon';
import { NumberField, Note, Range, Section, Seg } from './controls';

const MODES = [
  { value: 'px', label: 'Pixels' },
  { value: 'pct', label: 'Percent' },
];
const PCT_PRESETS = [25, 50, 75, 100];

export default function ResizePanel({ st }) {
  const s = st.settings;
  const g = st.geometry;

  // What the fields show: the typed value, or what the current crop and lock work out to.
  const curW = s.width || g?.cw || null;
  const curH = s.lock || !s.height ? (g ? g.oh : null) : s.height;

  const setW = (width) => st.set({ resizeMode: 'px', width });
  const setH = (h) => {
    if (s.lock && g) st.set({ resizeMode: 'px', width: Math.max(1, Math.round((h * g.cw) / g.ch)), height: null });
    else st.set({ resizeMode: 'px', height: h });
  };
  // Unlocking keeps the current height; locking drops it so the ratio rules again.
  const toggleLock = () => st.set({ lock: !s.lock, height: s.lock ? curH : null });
  const resetSize = () => st.set({ width: null, height: null, pct: 100 });

  const upscaled = g && (g.ow > g.cw || g.oh > g.ch);

  return (
    <>
      <Section title="Resize by">
        <Seg label="Resize by" options={MODES} value={s.resizeMode} onChange={(resizeMode) => st.set({ resizeMode })} />
      </Section>

      {s.resizeMode === 'px' ? (
        <Section>
          <div className="panel-dims">
            <NumberField label="Width" value={curW} placeholder="auto" onCommit={setW} />
            <button
              type="button"
              className="panel-iconbtn"
              aria-pressed={s.lock}
              aria-label="Lock aspect ratio"
              title="Lock aspect ratio"
              onClick={toggleLock}
            >
              <Icon name={s.lock ? 'link' : 'link_off'} />
            </button>
            <NumberField label="Height" value={curH} placeholder="auto" onCommit={setH} />
          </div>
          <Note>Aspect ratio {s.lock ? 'locked' : 'unlocked'}. Values are in pixels.</Note>
        </Section>
      ) : (
        <Section>
          <Range label="Scale" value={s.pct} display={`${s.pct}%`} min={5} max={200} onChange={(pct) => st.set({ pct })} />
          <Seg
            label="Scale presets"
            pill
            options={PCT_PRESETS.map((v) => ({ value: v, label: `${v}%` }))}
            value={s.pct}
            onChange={(pct) => st.set({ pct })}
          />
        </Section>
      )}

      {upscaled && <Note tone="warn">That’s larger than the original, so the result will look softer.</Note>}
      {g && <Note icon="aspect_ratio">Output {g.ow}×{g.oh} px from {st.selected.w}×{st.selected.h}.</Note>}

      <button type="button" className="k-btn k-btn--ghost panel-start" onClick={resetSize}>
        <Icon name="restart_alt" size={18} />
        Original size
      </button>
    </>
  );
}