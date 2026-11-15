/**
 * StageEmpty
 * Path: src/features/studio/components/StageEmpty.jsx
 *
 * Empty Studio: caption strips, the white halo dropzone and the recent exports list.
 */
import { useState } from 'react';
import Icon from '../../../components/ui/Icon';
import { MOD_KEY, defaultsLabel } from '../studioUi';

export default function StageEmpty({ st, drag, openPicker }) {
  const [url, setUrl] = useState('');

  const onUrl = async (e) => {
    e.preventDefault();
    if (await st.fetchUrl(url)) setUrl('');
  };

  return (
    <div className="studio-empty">
      <div className="studio-empty__captions">
        <p className="k-caption k-caption--shadow">
          Drop <em>images</em> here
        </p>
        <p className="k-caption k-caption--right k-caption--shadow">
          or paste with <em>{MOD_KEY} V</em>.
        </p>
      </div>

      <div className={`k-sticker studio-drop${drag ? ' is-hot' : ''}`}>
        <span className="studio-drop__badge">
          <Icon name={drag ? 'download' : 'add_photo_alternate'} size={32} />
        </span>
        <p className="studio-drop__title">{drag ? 'Let go to add them' : 'Add images to start'}</p>
        <p className="studio-drop__hint">JPEG, PNG, WEBP, AVIF and iPhone HEIC · as many as you like</p>

        <div className="studio-drop__actions">
          <button type="button" className="k-btn" onClick={openPicker}>
            <Icon name="folder_open" />
            Browse files
          </button>
          {st.caps.folder && (
            <button type="button" className="studio-drop__folder" onClick={st.openFolder}>
              <Icon name="drive_folder_upload" />
              Open a folder
            </button>
          )}
        </div>

        <form className="studio-url" onSubmit={onUrl}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="or paste an image URL"
            aria-label="Image URL"
          />
          <button type="submit" disabled={st.fetching}>
            {st.fetching ? 'Fetching' : 'Fetch'}
          </button>
        </form>

        <span className="k-chip k-chip--vio">
          <Icon name="history" size={15} />
          remembered defaults <b>{defaultsLabel(st.globalSettings)}</b>
        </span>
      </div>

      {st.history.length > 0 && (
        <section className="k-card studio-history" aria-labelledby="studio-history-title">
          <div className="studio-history__head">
            <h2 id="studio-history-title">Recent on this device</h2>
            <button type="button" className="studio-history__clear" onClick={st.clearHistory}>
              Clear
            </button>
          </div>
          <ul>
            {st.history.map((h) => (
              <li key={`${h.at}-${h.name}`}>
                <span className="studio-history__name">{h.name}</span>
                <span className="studio-history__detail">{h.detail}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}