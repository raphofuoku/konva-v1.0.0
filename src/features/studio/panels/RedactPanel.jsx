/**
 * RedactPanel
 * Path: src/features/studio/panels/RedactPanel.jsx
 *
 * Blur or pixelate rectangles. Areas are drawn on the canvas or added here; while this
 * panel is open, the arrow keys nudge the last area (Shift for bigger steps).
 */
import { useEffect } from 'react';
import Icon from '../../../components/ui/Icon';
import { NUDGE } from '../studioConstants';
import { NeedsImage, Note, Range, Section, Seg } from './controls';

const MODES = [
  { value: 'blur', label: 'Blur' },
  { value: 'pixelate', label: 'Pixelate' },
];
const TYPING = 'input, textarea, select, [contenteditable="true"]';

export default function RedactPanel({ st }) {
  const s = st.settings;
  const g = st.geometry;
  const ready = st.selected?.status === 'ready';
  const { areas, nudgeArea } = st;
  const hasAreas = areas.length > 0;

  useEffect(() => {
    if (!hasAreas) return undefined;
    const onKey = (e) => {
      if (!e.key.startsWith('Arrow') || e.metaKey || e.ctrlKey || e.altKey) return;
      // Not while typing, and not while a dialog (palette, tour, code view) has focus.
      if (e.target instanceof Element && e.target.closest(`${TYPING}, [role="dialog"]`)) return;
      e.preventDefault();
      const d = e.shiftKey ? NUDGE.big : NUDGE.step;
      const dx = e.key === 'ArrowLeft' ? -d : e.key === 'ArrowRight' ? d : 0;
      const dy = e.key === 'ArrowUp' ? -d : e.key === 'ArrowDown' ? d : 0;
      nudgeArea(dx, dy);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hasAreas, nudgeArea]);

  return (
    <>
      <p className="k-caption k-caption--shadow panel-caption">
        Drag on the image to <em>cover</em> an area.
      </p>

      <Section title="Style">
        <Seg label="Redact style" options={MODES} value={s.rMode} onChange={(rMode) => st.set({ rMode })} />
        <Range label="Strength" value={s.rStrength} min={4} max={40} onChange={(rStrength) => st.set({ rStrength })} />
      </Section>

      <Section
        title={`Covered areas · ${areas.length}`}
        aside={
          areas.length > 1 ? (
            <button type="button" className="panel-link" onClick={st.clearAreas}>
              Clear all
            </button>
          ) : null
        }
      >
        {!ready ? (
          <NeedsImage>Add an image to redact it. Areas belong to each file.</NeedsImage>
        ) : (
          <>
            {hasAreas && (
              <ul className="panel-areas">
                {areas.map((a, i) => (
                  <li key={i}>
                    <span>
                      area {i + 1}
                      {g ? ` · ${Math.round(a.w * g.ow)}×${Math.round(a.h * g.oh)}` : ''}
                    </span>
                    <button type="button" className="panel-areas__del" onClick={() => st.removeArea(i)} aria-label={`Remove area ${i + 1}`}>
                      <Icon name="delete" size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button type="button" className="k-btn k-btn--ghost panel-start" onClick={() => st.addArea()}>
              <Icon name="add_box" size={18} />
              Add an area in the centre
            </button>
            <Note>
              Drag on the image to draw an area. With a keyboard, add one here and move the newest one with the arrow
              keys (hold Shift for bigger steps).
            </Note>
          </>
        )}
      </Section>
    </>
  );
}