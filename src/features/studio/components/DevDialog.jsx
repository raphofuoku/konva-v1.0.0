/**
 * DevDialog
 * Path: src/features/studio/components/DevDialog.jsx
 *
 * Code dialog for the dev actions: Base64 data URI or the responsive srcset snippet.
 */
import { useEffect, useRef } from 'react';
import Icon from '../../../components/ui/Icon';

const SHOW_MAX = 6000; // long data URIs are cut in the view; Copy still takes the whole thing

export default function DevDialog({ st }) {
  const d = st.dev;
  const closeRef = useRef(null);

  useEffect(() => {
    if (d) closeRef.current?.focus();
  }, [d]);

  if (!d) return null;
  const cut = d.code.length > SHOW_MAX;

  return (
    <div className="k-scrim" onClick={st.closeDev} onKeyDown={(e) => e.key === 'Escape' && st.closeDev()}>
      <div
        className="studio-devdlg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="studio-devdlg-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="studio-devdlg__head">
          <h2 id="studio-devdlg-title">{d.title}</h2>
          <button ref={closeRef} type="button" className="studio-devdlg__close" onClick={st.closeDev} aria-label="Close">
            <Icon name="close" size={22} />
          </button>
        </div>

        {cut && (
          <p className="studio-devdlg__note">
            Showing the first {SHOW_MAX.toLocaleString()} of {d.code.length.toLocaleString()} characters. Copy takes all of it.
          </p>
        )}
        <pre className="studio-devdlg__code">{cut ? `${d.code.slice(0, SHOW_MAX)}…` : d.code}</pre>

        <div className="studio-devdlg__actions">
          {d.kind === 'srcset' && (
            <button type="button" className="k-btn k-btn--ghost" onClick={st.srcsetZip} disabled={!!st.busy}>
              <Icon name="folder_zip" size={18} />
              Download sizes (.zip)
            </button>
          )}
          <button type="button" className="k-btn" onClick={st.copyDev}>
            <Icon name="content_copy" />
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}