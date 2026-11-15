/**
 * Stage
 * Path: src/features/studio/components/Stage.jsx
 *
 * The canvas area (#k-main). Drop target for files; shows the empty state or the preview,
 * plus the error card and the export / background-removal progress cards.
 */
import { useState } from 'react';
import Icon from '../../../components/ui/Icon';
import { useElementSize } from '../../../hooks/useElementSize';
import StageEmpty from './StageEmpty';
import StagePreview from './StagePreview';

function ErrorCard({ f, onRemove, onRetry }) {
  return (
    <div className="studio-overlay studio-overlay--center">
      <div className="studio-error" role="alert">
        <div className="studio-error__body">
          <span className="studio-error__icon">
            <Icon name="priority_high" size={22} />
          </span>
          <div>
            <p className="studio-error__title">Couldn’t read {f.name}</p>
            <p className="studio-error__text">{f.error}</p>
          </div>
        </div>
        <div className="studio-error__actions">
          <button type="button" className="k-btn k-btn--ghost" onClick={onRemove}>
            Remove file
          </button>
          <button type="button" className="k-btn" onClick={onRetry}>
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

function ProgressCard({ title, value, detail, note, pct, onCancel }) {
  return (
    <div className="studio-overlay studio-overlay--bottom">
      <div className="studio-proc" role="status" aria-live="polite">
        <div className="studio-proc__top">
          <span>{title}</span>
          {value && <b>{value}</b>}
        </div>
        {detail && <div className="studio-proc__detail">{detail}</div>}
        <div className={`k-progress${pct == null ? ' k-progress--indeterminate' : ''}`}>
          <div className="k-progress__bar" style={pct == null ? undefined : { width: `${pct}%` }} />
        </div>
        <div className="studio-proc__foot">
          <span>{note}</span>
          {onCancel && (
            <button type="button" className="k-btn k-btn--ghost" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Stage({ st, mobile, compare, onCompare, openPicker }) {
  const [drag, setDrag] = useState(false);
  const [ref, size] = useElementSize();
  const f = st.selected;
  const empty = st.files.length === 0;

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
    const dropped = e.dataTransfer?.files;
    if (dropped?.length) st.addFiles(dropped);
  };

  const busy = st.busy;
  const busyPct = busy ? Math.round((busy.done / Math.max(1, busy.total)) * 100) : 0;
  const modelPct = st.model === 'loading' ? st.modelProgress.pct : null;

  return (
    <main
      id="k-main"
      tabIndex={-1}
      ref={ref}
      aria-label="Canvas"
      className={`studio-stage k-dotgrid${drag ? ' is-drag' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {empty && <StageEmpty st={st} drag={drag} openPicker={openPicker} />}

      {f && f.status !== 'error' && (
        <StagePreview st={st} stage={size} mobile={mobile} drag={drag} compare={compare} onCompare={onCompare} />
      )}

      {f?.status === 'error' && !busy && (
        <ErrorCard f={f} onRemove={() => st.removeFile(f.id)} onRetry={() => st.retryFile(f.id)} />
      )}

      {busy && (
        <ProgressCard
          title={`Exporting ${Math.min(busy.total, busy.done + 1)} of ${busy.total}`}
          value={`${busyPct}%`}
          detail={busy.name}
          note="Encoding on this device · keep this tab open"
          pct={busyPct}
          onCancel={busy.cancellable ? st.cancelBusy : undefined}
        />
      )}

      {st.bgBusy && !busy && (
        <ProgressCard
          title={modelPct != null ? 'Downloading the background model' : 'Removing the background'}
          value={modelPct != null ? `${modelPct}%` : null}
          detail={f?.name}
          note={modelPct != null ? 'About 42 MB, once. Then it works offline.' : 'Running on this device. Large photos take 5 to 20 seconds.'}
          pct={modelPct}
        />
      )}
    </main>
  );
}