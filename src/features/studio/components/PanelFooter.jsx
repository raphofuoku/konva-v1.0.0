/**
 * PanelFooter
 * Path: src/features/studio/components/PanelFooter.jsx
 *
 * Shared footer under every tool panel: size chips, the download button and the dev actions.
 */
import Icon from '../../../components/ui/Icon';
import { buildChips, formatLabel } from '../studioUi';

export default function PanelFooter({ st }) {
  const f = st.selected;
  const ready = f?.status === 'ready';
  const chips = buildChips(f, st.settings, st.estimate);

  const actions = [
    st.caps.clipboardImage && { id: 'copy', icon: 'content_copy', label: 'Copy', title: 'Copy result to clipboard', run: st.copyImage },
    { id: 'b64', icon: 'data_object', label: 'Base64', title: 'Copy as Base64 data URI', run: st.copyBase64 },
    { id: 'srcset', icon: 'code', label: 'srcset', title: 'Responsive srcset snippet', run: st.showSrcset },
    st.caps.share && { id: 'share', icon: 'ios_share', label: 'Share', title: 'Share', run: st.share },
  ].filter(Boolean);

  return (
    <div className="studio-panel__foot">
      {chips.length > 0 && (
        <div className="studio-chips">
          {chips.map((c) => (
            <span key={c.key} className={`k-chip${c.tone ? ` k-chip--${c.tone}` : ''}`}>
              <Icon name={c.icon} size={14} />
              {c.label} <b>{c.value}</b>
            </span>
          ))}
        </div>
      )}

      <button type="button" className="k-btn k-btn--block" onClick={st.downloadCurrent} disabled={!ready || !!st.busy}>
        <Icon name="download" />
        Download {formatLabel(st.settings.format)}
      </button>

      <div className="studio-dev" role="group" aria-label="Developer actions">
        {actions.map((a) => (
          <button key={a.id} type="button" title={a.title} onClick={a.run} disabled={!ready}>
            <Icon name={a.icon} size={18} />
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}