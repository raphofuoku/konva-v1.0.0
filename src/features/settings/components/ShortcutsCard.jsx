/**
 * ShortcutsCard
 * Path: src/features/settings/components/ShortcutsCard.jsx
 *
 * Studio's keyboard shortcuts, shown with this platform's modifier key.
 */
import { MOD_KEY } from '../../studio/studioUi';
import { SHORTCUTS } from '../settingsConstants';

const WORDS = new Set(['to']); // joining words render as text, not as keys

export default function ShortcutsCard() {
  return (
    <section id="shortcuts" className="k-card settings-card" aria-labelledby="h-shortcuts">
      <div>
        <h2 id="h-shortcuts" className="k-card__title">
          Keyboard shortcuts
        </h2>
        <p className="settings-card__lede">These work in Studio. Single keys pause while you type in a field.</p>
      </div>
      <dl className="settings-keys">
        {SHORTCUTS.map((k) => (
          <div key={k.label} className="settings-keys__row">
            <dt>{k.label}</dt>
            <dd>
              {k.keys.map((key, i) =>
                WORDS.has(key) ? (
                  <span key={i} className="settings-keys__word">
                    {key}
                  </span>
                ) : (
                  <kbd key={i} className="k-kbd">
                    {key === 'mod' ? MOD_KEY : key}
                  </kbd>
                )
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
