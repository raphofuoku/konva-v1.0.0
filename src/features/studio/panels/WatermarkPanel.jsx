/**
 * WatermarkPanel
 * Path: src/features/studio/panels/WatermarkPanel.jsx
 *
 * Text watermark: on/off, text, nine positions or tiled, opacity and size.
 */
import { Note, Range, Section, SwitchRow } from './controls';

const POSITIONS = ['tl', 'tc', 'tr', 'ml', 'mc', 'mr', 'bl', 'bc', 'br'];
const WORDS = { t: 'top', m: 'middle', b: 'bottom', l: 'left', c: 'centre', r: 'right' };
const posName = (id) => (id === 'mc' ? 'centre' : `${WORDS[id[0]]} ${WORDS[id[1]]}`);

export default function WatermarkPanel({ st }) {
  const s = st.settings;

  return (
    <>
      <Section>
        <SwitchRow checked={s.wmOn} onChange={(wmOn) => st.set({ wmOn })} title="Add a text watermark" />
        <label className="panel-field">
          Text
          <input
            className="k-field panel-field--text"
            type="text"
            maxLength={80}
            value={s.wmText}
            onChange={(e) => st.set({ wmText: e.target.value, wmOn: true })}
          />
        </label>
        {s.wmOn && !s.wmText.trim() && <Note tone="warn">Type some text, or the watermark stays off.</Note>}
      </Section>

      <Section title="Position">
        <div className={`panel-grid9${s.wmTile ? ' is-muted' : ''}`} role="group" aria-label="Watermark position">
          {POSITIONS.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={!s.wmTile && s.wmPos === id}
              aria-label={posName(id)}
              title={posName(id)}
              onClick={() => st.set({ wmPos: id, wmOn: true, wmTile: false })}
            >
              <span className="panel-grid9__dot" />
            </button>
          ))}
        </div>
        <SwitchRow checked={s.wmTile} onChange={(wmTile) => st.set({ wmTile, wmOn: true })} title="Tile across the image" />
      </Section>

      <Section>
        <Range label="Opacity" value={s.wmOpacity} display={`${s.wmOpacity}%`} min={10} max={100} onChange={(wmOpacity) => st.set({ wmOpacity })} />
        <Range label="Size" value={s.wmSize} display={`${s.wmSize}%`} min={2} max={15} onChange={(wmSize) => st.set({ wmSize })} />
        <Note>Size is a share of the image width, so it looks the same on every file in the batch.</Note>
      </Section>
    </>
  );
}