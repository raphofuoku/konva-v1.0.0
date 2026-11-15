/**
 * AdjustPanel
 * Path: src/features/studio/panels/AdjustPanel.jsx
 *
 * Tone sliders, grayscale and the on-device background removal card.
 */
import Icon from '../../../components/ui/Icon';
import { Note, Range, Section, SwitchRow } from './controls';

const SLIDERS = [
  { key: 'bright', label: 'Brightness', min: -100, max: 100 },
  { key: 'contrast', label: 'Contrast', min: -100, max: 100 },
  { key: 'sat', label: 'Saturation', min: -100, max: 100 },
  { key: 'blur', label: 'Blur', min: 0, max: 20 },
];
const signed = (v) => `${v > 0 ? '+' : ''}${v}`;
const mb = (bytes) => (bytes / 1048576).toFixed(1);

function BackgroundCard({ st }) {
  const f = st.selected;
  const ready = f?.status === 'ready';
  const { model, modelProgress: p } = st;
  const busy = st.bgBusy || !!st.busy;

  return (
    <section className="panel-card" aria-labelledby="bg-card-title">
      <div className="panel-card__head">
        <h3 id="bg-card-title" className="panel-card__title">Remove background</h3>
        <span className="k-chip k-chip--vio panel-badge">AI · on device</span>
      </div>

      {(model === 'none' || model === 'error') && (
        <>
          <Note>
            Uses ormbg, an open segmentation model (Apache-2.0) of about 42 MB. It downloads once, stays on this device,
            and runs offline after that. Your image is never sent with it.
          </Note>
          {model === 'error' && <Note tone="bad">The last download didn’t finish. Check your connection and try again.</Note>}
          <button type="button" className="k-btn k-btn--ghost panel-start" onClick={() => st.loadModel()}>
            <Icon name="download" size={18} />
            {model === 'error' ? 'Try the download again' : 'Download model · 42 MB'}
          </button>
        </>
      )}

      {model === 'loading' && (
        <div role="status" aria-live="polite" className="panel-progress">
          <div className="panel-progress__row">
            <span>downloading model</span>
            <span>{p.total ? `${mb(p.loaded)} / ${mb(p.total)} MB` : 'starting…'}</span>
          </div>
          <div className="k-progress">
            <div className="k-progress__bar" style={{ width: `${p.pct}%` }} />
          </div>
          <Note>One-time download. Next time this is instant, even offline.</Note>
        </div>
      )}

      {model === 'ready' && (
        <>
          <span className="k-chip k-chip--ok panel-start">
            <Icon name="check" size={15} />
            Model cached · works offline
          </span>
          <button type="button" className="k-btn panel-start" onClick={st.removeBackground} disabled={!ready || busy}>
            <Icon name="auto_fix_high" />
            {st.bgBusy ? 'Removing…' : 'Remove background'}
          </button>
          {!f && <Note>Add an image to cut out its subject.</Note>}
        </>
      )}

      {f?.orig && (
        <>
          <Note icon="info">Showing the cut-out. Before / after compares it with the original.</Note>
          <button type="button" className="k-btn k-btn--ghost panel-start" onClick={st.restoreOriginal} disabled={busy}>
            <Icon name="undo" size={18} />
            Restore original
          </button>
        </>
      )}
    </section>
  );
}

export default function AdjustPanel({ st }) {
  const s = st.settings;
  const touched = SLIDERS.some((x) => s[x.key] !== 0) || s.gray;

  return (
    <>
      <Section>
        {SLIDERS.map((x) => (
          <Range
            key={x.key}
            label={x.label}
            value={s[x.key]}
            display={x.key === 'blur' ? `${s.blur}` : signed(s[x.key])}
            min={x.min}
            max={x.max}
            onChange={(v) => st.set({ [x.key]: v })}
          />
        ))}
        <SwitchRow checked={s.gray} onChange={(gray) => st.set({ gray })} title="Grayscale" />
        <button
          type="button"
          className="k-btn k-btn--ghost panel-start"
          onClick={() => st.set({ bright: 0, contrast: 0, sat: 0, blur: 0, gray: false })}
          disabled={!touched}
        >
          <Icon name="restart_alt" size={18} />
          Reset adjustments
        </button>
      </Section>

      <BackgroundCard st={st} />
    </>
  );
}