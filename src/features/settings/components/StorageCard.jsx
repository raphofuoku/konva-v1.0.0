/**
 * StorageCard
 * Path: src/features/settings/components/StorageCard.jsx
 *
 * Every konva-* key with its current value and size, a Clear button for each, and
 * "Clear everything" with an inline confirm step.
 */
import { useEffect, useRef, useState } from 'react';
import Icon from '../../../components/ui/Icon';
import { Note } from '../../studio/panels/controls';
import { STORED_KEYS, kb } from '../settingsStorage';
import { mb } from '../modelCache';
import { COPY, MODEL_SIZE } from '../settingsConstants';

function buildRows({ stored, model }) {
  const { raw, bytes, defaults: d, history } = stored;
  const size = (id) => kb(bytes[id]);
  const modelHere = model.status === 'cached' || model.status === 'removing';
  const plural = history.length === 1 ? '' : 's';

  return [
    {
      id: 'defaults',
      label: 'Remembered defaults',
      detail: raw.defaults
        ? `${d.format.toUpperCase()} · ${d.mode === 'target' ? `under ${d.targetKB} KB` : `q${d.quality}`} · metadata ${d.strip ? 'stripped' : 'kept'} · ${size('defaults')}`
        : 'nothing saved yet',
      empty: !raw.defaults,
    },
    {
      id: 'history',
      label: 'Recent exports',
      detail: history.length ? `${history.length} file name${plural} · ${size('history')}` : 'empty',
      empty: !raw.history,
    },
    {
      id: 'theme',
      label: 'Theme preference',
      detail: raw.theme ? `${raw.theme} · ${size('theme')}` : 'not set · matches your system',
      empty: !raw.theme,
    },
    {
      id: 'model',
      label: 'Background-removal model',
      detail: modelHere ? `cached · ${model.bytes ? mb(model.bytes) : `about ${MODEL_SIZE}`}` : 'not downloaded',
      empty: !raw.model && !modelHere,
      busy: model.status === 'removing',
    },
    {
      id: 'onboarded',
      label: 'Studio tour',
      detail: raw.onboarded ? `seen, so it stays hidden · ${size('onboarded')}` : 'not seen yet',
      empty: !raw.onboarded,
    },
  ];
}

export default function StorageCard({ s }) {
  const rows = buildRows(s);
  const allEmpty = rows.every((r) => r.empty);
  const [confirming, setConfirming] = useState(false);
  const [clearing, setClearing] = useState(false);
  const trigger = useRef(null);
  const yes = useRef(null);
  const focusNext = useRef(null); // 'yes' | 'trigger', applied after the swap renders

  useEffect(() => {
    if (focusNext.current === 'yes') yes.current?.focus();
    else if (focusNext.current === 'trigger') trigger.current?.focus();
    focusNext.current = null;
  }, [confirming]);

  const open = () => {
    if (allEmpty) return;
    focusNext.current = 'yes';
    setConfirming(true);
  };
  const cancel = () => {
    focusNext.current = 'trigger';
    setConfirming(false);
  };
  const confirm = async () => {
    if (clearing) return;
    setClearing(true);
    await s.clearAll();
    setClearing(false);
    focusNext.current = 'trigger';
    setConfirming(false);
  };

  return (
    <section id="storage" className="k-card settings-card settings-card--storage" aria-labelledby="h-storage">
      <div>
        <h2 id="h-storage" className="k-card__title">
          Stored on this device
        </h2>
        <p className="settings-card__lede">Settings and a short list of file names you exported. No images are kept.</p>
      </div>

      {!s.canStore && <Note tone="warn">{COPY.storageBlocked}</Note>}

      <ul className="settings-stored">
        {rows.map((r) => (
          <li key={r.id} className="settings-stored__row">
            <div className="settings-row__text">
              <div className="settings-row__title">{r.label}</div>
              <div className="settings-row__note settings-row__note--mono">
                <span className="settings-stored__key">{STORED_KEYS[r.id]}</span> · {r.detail}
              </div>
            </div>
            <button
              type="button"
              className="k-btn k-btn--ghost settings-small"
              aria-disabled={r.empty || r.busy || undefined}
              aria-label={`Clear ${r.label.toLowerCase()}`}
              onClick={() => !r.empty && !r.busy && s.clearRow(r.id)}
            >
              {r.busy ? 'Clearing…' : 'Clear'}
            </button>
          </li>
        ))}
      </ul>

      {confirming ? (
        <div className="settings-confirm" role="group" aria-labelledby="settings-confirm-text">
          <p id="settings-confirm-text" className="settings-confirm__text">
            <Icon name="warning" size={20} />
            <span>
              This resets your defaults and theme, empties recent exports, shows the tour again and deletes the
              downloaded model.
            </span>
          </p>
          <div className="settings-confirm__actions">
            <button
              ref={yes}
              type="button"
              className="k-btn k-btn--danger settings-danger"
              aria-disabled={clearing || undefined}
              onClick={confirm}
            >
              <Icon name="delete_forever" />
              {clearing ? 'Clearing…' : 'Yes, clear everything'}
            </button>
            <button type="button" className="k-btn k-btn--ghost settings-small" onClick={cancel}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          ref={trigger}
          type="button"
          className="k-btn k-btn--danger settings-danger settings-start"
          aria-disabled={allEmpty || undefined}
          onClick={open}
        >
          <Icon name="delete_forever" />
          {allEmpty ? 'Nothing stored right now' : 'Clear everything Konva stored'}
        </button>
      )}
    </section>
  );
}
