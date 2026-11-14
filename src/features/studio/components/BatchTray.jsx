/**
 * BatchTray
 * Path: src/features/studio/components/BatchTray.jsx
 *
 * Every file in the batch as a thumbnail, plus the rename pattern and the batch exports.
 */
import { fmt } from '../../../lib/konvaEngine';
import Icon from '../../../components/ui/Icon';

function Thumb({ r, selected, onSelect, onRemove }) {
  const state = r.status === 'error' ? ', couldn’t be read' : r.status === 'loading' ? ', loading' : r.ovr ? ', custom settings' : '';
  return (
    <li className="studio-thumb">
      <button
        type="button"
        className="studio-thumb__btn"
        aria-current={selected ? 'true' : undefined}
        aria-label={`${r.name}, ${fmt(r.size)}${state}`}
        onClick={onSelect}
      >
        {r.url ? <img src={r.url} alt="" draggable={false} /> : <span className="studio-thumb__blank" />}
        {r.status === 'loading' && (
          <span className="studio-thumb__spin">
            <Icon name="progress_activity" size={22} />
          </span>
        )}
        {r.status === 'error' && (
          <span className="studio-thumb__badge is-bad" title="Couldn’t read this file">
            <Icon name="priority_high" size={14} />
          </span>
        )}
        {r.ovr && r.status !== 'error' && (
          <span className="studio-thumb__badge" title="Custom settings for this file">
            <Icon name="tune" size={14} />
          </span>
        )}
      </button>
      <button type="button" className="studio-thumb__remove" onClick={onRemove} aria-label={`Remove ${r.name}`}>
        <Icon name="close" size={14} />
      </button>
      <span className="studio-thumb__name" aria-hidden="true">{r.name}</span>
      <span className="studio-thumb__size" aria-hidden="true">{fmt(r.size)}</span>
    </li>
  );
}

export default function BatchTray({ st, openPicker }) {
  if (!st.files.length) return null;
  const count = st.files.length;
  const busy = !!st.busy;

  return (
    <section className="studio-tray" aria-label="Batch">
      <div className="studio-tray__meta">
        <span className="studio-tray__count">
          {count} file{count === 1 ? '' : 's'}
        </span>
        <span className="studio-tray__total">{fmt(st.totalSize)}</span>
      </div>

      <ul className="studio-tray__list" aria-label="Files">
        {st.files.map((r) => (
          <Thumb
            key={r.id}
            r={r}
            selected={r === st.selected}
            onSelect={() => st.select(r.id)}
            onRemove={() => st.removeFile(r.id)}
          />
        ))}
        <li>
          <button type="button" className="studio-tray__add" onClick={openPicker} aria-label="Add files">
            <Icon name="add" size={28} />
          </button>
        </li>
      </ul>

      <div className="studio-tray__actions">
        <label className="studio-rename">
          Rename pattern
          <input
            type="text"
            value={st.rename}
            onChange={(e) => st.setRename(e.target.value)}
            aria-describedby="studio-rename-hint"
            spellCheck={false}
          />
          <span id="studio-rename-hint" className="studio-rename__hint">
            {st.outputName ? `→ ${st.outputName}` : '{name} {n} {w} {h}'}
          </span>
        </label>
        <button
          type="button"
          className="k-btn studio-tray__zip"
          onClick={() => st.downloadAll()}
          disabled={busy || !st.counts.ready}
        >
          <Icon name="folder_zip" />
          <span className="studio-tray__zip-label">Download all (.zip)</span>
        </button>
        {st.caps.folder && (
          <button type="button" className="k-btn k-btn--ghost studio-tray__folder" onClick={st.saveFolder} disabled={busy || !st.counts.ready}>
            <Icon name="drive_folder_upload" size={18} />
            Save into a folder…
          </button>
        )}
      </div>
    </section>
  );
}