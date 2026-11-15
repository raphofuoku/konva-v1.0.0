/**
 * OfflineCard
 * Path: src/features/settings/components/OfflineCard.jsx
 *
 * Offline status, a waiting update, Install as an app, and the background-removal model cache.
 */
import { useRef } from 'react';
import Icon from '../../../components/ui/Icon';
import { MODEL_SIZE } from '../settingsConstants';
import { mb } from '../modelCache';

function modelNote(model) {
  switch (model.status) {
    case 'checking':
      return 'checking this device…';
    case 'removing':
      return 'removing…';
    case 'cached':
      return `cached · ${model.bytes ? mb(model.bytes) : `about ${MODEL_SIZE}`} · runs offline`;
    default:
      return `not downloaded · ${MODEL_SIZE} on first use in Studio › Adjust`;
  }
}

export default function OfflineCard({ s }) {
  const { install, model } = s;
  const modelTitle = useRef(null);
  const removing = model.status === 'removing';
  const showRemove = model.status === 'cached' || removing;

  const onRemove = async () => {
    if (removing) return;
    await s.removeModel();
    modelTitle.current?.focus(); // the button disappears, so keep focus in this row
  };

  return (
    <section id="offline" className="k-card settings-card" aria-labelledby="h-offline">
      <div className="settings-card__head">
        <h2 id="h-offline" className="k-card__title">
          Offline and install
        </h2>
        {s.offline ? (
          <span className="k-chip k-chip--ok">
            <Icon name="offline_pin" size={16} />
            Offline ready · app files cached
          </span>
        ) : (
          <span className="k-chip">
            <Icon name="cloud_off" size={16} />
            Not cached yet
          </span>
        )}
      </div>
      {!s.offline && (
        <p className="settings-muted settings-muted--tight">
          Konva saves its files for offline use after it has loaded once online. Until then it needs a connection.
        </p>
      )}

      {s.update.ready && (
        <div className="settings-row">
          <div className="settings-row__text">
            <div className="settings-row__title">A new version is ready</div>
            <div className="settings-row__note">
              It downloaded in the background. Reload to start using it, or it switches over next time you open
              Konva.
            </div>
          </div>
          <button type="button" className="k-btn k-btn--ghost settings-small" onClick={s.update.apply}>
            <Icon name="restart_alt" />
            Reload
          </button>
        </div>
      )}

      <div className="settings-row">
        <div className="settings-row__text">
          <div className="settings-row__title">{install.installed ? 'Installed as an app' : 'Install Konva as an app'}</div>
          <div className="settings-row__note">
            {install.installed
              ? 'You’re using Konva in its own window.'
              : install.canInstall
                ? 'Opens in its own window and works without a connection.'
                : 'If the button does nothing, use your browser’s Install option in the address bar, or Share › Add to Home Screen on iPhone.'}
          </div>
        </div>
        {!install.installed && (
          <button type="button" className="k-btn" onClick={install.run}>
            <Icon name="install_desktop" />
            Install
          </button>
        )}
      </div>

      <div className="settings-row">
        <div className="settings-row__text">
          <div className="settings-row__title" ref={modelTitle} tabIndex={-1}>
            Background-removal model
          </div>
          <div className="settings-row__note settings-row__note--mono" aria-live="polite">
            {modelNote(model)}
          </div>
        </div>
        {showRemove && (
          <button
            type="button"
            className="k-btn k-btn--ghost settings-small"
            aria-disabled={removing || undefined}
            onClick={onRemove}
          >
            {removing ? 'Removing…' : 'Remove model'}
          </button>
        )}
      </div>
    </section>
  );
}
