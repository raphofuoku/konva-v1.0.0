/**
 * SettingsPanel
 * Path: src/features/studio/components/SettingsPanel.jsx
 *
 * Right-hand settings column (bottom sheet on mobile): tool title, scope toggle,
 * the tool's panel and the shared footer.
 */
import { useEffect, useRef } from 'react';
import Icon from '../../../components/ui/Icon';
import { TOOLS } from '../studioConstants';
import { PANELS } from '../panels';
import PanelFooter from './PanelFooter';

const SCOPES = [
  { id: 'all', label: 'All files' },
  { id: 'this', label: 'This file only' },
];

export default function SettingsPanel({ st, sheet, onClose }) {
  const tool = TOOLS.find((t) => t.id === st.tool) || TOOLS[0];
  const Body = PANELS[tool.id];
  const closeRef = useRef(null);

  // Opening the sheet moves focus into it.
  useEffect(() => {
    if (sheet) closeRef.current?.focus();
  }, [sheet]);

  return (
    <aside
      className={`studio-panel${sheet ? ' is-sheet' : ''}`}
      aria-label="Settings"
      onKeyDown={sheet ? (e) => e.key === 'Escape' && onClose() : undefined}
    >
      <div className="studio-panel__head">
        <div className="studio-panel__title">
          <h2>
            <Icon name={tool.icon} size={22} />
            {tool.label}
          </h2>
          {sheet && (
            <button ref={closeRef} type="button" className="studio-panel__close" onClick={onClose} aria-label="Close settings">
              <Icon name="close" size={22} />
            </button>
          )}
        </div>

        {st.files.length > 1 && (
          <div className="k-seg k-seg--pill" role="group" aria-label="Apply settings to">
            {SCOPES.map((o) => (
              <button
                key={o.id}
                type="button"
                className="k-seg__opt"
                aria-pressed={st.scope === o.id}
                onClick={() => st.setScope(o.id)}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="studio-panel__body">
        {Body ? <Body st={st} /> : <p className="studio-panel__soon">The {tool.label.toLowerCase()} controls arrive in the next update.</p>}
      </div>

      <PanelFooter st={st} />
    </aside>
  );
}