/**
 * CropPanel
 * Path: src/features/studio/panels/CropPanel.jsx
 *
 * Aspect ratio and social presets (centred crop), plus rotate and flip.
 */
import { CROPS, SOCIAL } from '../../../lib/konvaEngine';
import Icon from '../../../components/ui/Icon';
import { Note, Section, Seg } from './controls';

const norm = (deg) => (((deg % 360) + 360) % 360);

export default function CropPanel({ st }) {
  const s = st.settings;
  const social = SOCIAL.some((c) => c.id === s.crop);

  // A social preset also sets the export width. Leaving one for a plain ratio clears that width again.
  const pickRatio = (crop) => st.set({ crop, ...(social ? { width: null, height: null } : {}) });
  const pickSocial = (c) => st.set({ crop: c.id, resizeMode: 'px', width: c.w, height: null, lock: true });

  const turns = [
    { id: 'left', icon: 'rotate_left', label: 'Rotate left', run: () => st.set({ rotate: norm((s.rotate || 0) - 90) }) },
    { id: 'right', icon: 'rotate_right', label: 'Rotate right', run: () => st.set({ rotate: norm((s.rotate || 0) + 90) }) },
    { id: 'fh', icon: 'flip', label: 'Flip horizontal', pressed: s.flipH, run: () => st.set({ flipH: !s.flipH }) },
    { id: 'fv', icon: 'flip', label: 'Flip vertical', pressed: s.flipV, vertical: true, run: () => st.set({ flipV: !s.flipV }) },
  ];

  const reset = () => st.set({ crop: 'free', rotate: 0, flipH: false, flipV: false, ...(social ? { width: null, height: null } : {}) });

  return (
    <>
      <Section title="Aspect">
        <Seg label="Aspect ratio" options={CROPS.map((c) => ({ value: c.id, label: c.label }))} value={social ? null : s.crop} onChange={pickRatio} />
      </Section>

      <Section title="Social sizes">
        <div className="panel-presets" role="group" aria-label="Social sizes">
          {SOCIAL.map((c) => (
            <button key={c.id} type="button" className="panel-preset" aria-pressed={s.crop === c.id} onClick={() => pickSocial(c)}>
              <span>{c.label}</span>
              <span className="panel-preset__dims">
                {c.w}×{c.h}
              </span>
            </button>
          ))}
        </div>
        <Note>Konva crops from the centre, then sizes the result to fit.</Note>
      </Section>

      <Section title="Rotate and flip">
        <div className="panel-tools4" role="group" aria-label="Rotate and flip">
          {turns.map((t) => (
            <button
              key={t.id}
              type="button"
              className="panel-iconbtn"
              aria-label={t.label}
              title={t.label}
              aria-pressed={t.pressed === undefined ? undefined : t.pressed}
              onClick={t.run}
            >
              <Icon name={t.icon} size={22} className={t.vertical ? 'panel-icon--turned' : ''} />
            </button>
          ))}
        </div>
        {(s.rotate || 0) !== 0 && <Note>Rotated {s.rotate}°.</Note>}
      </Section>

      <button type="button" className="k-btn k-btn--ghost panel-start" onClick={reset}>
        <Icon name="restart_alt" size={18} />
        Reset crop and rotation
      </button>
    </>
  );
}