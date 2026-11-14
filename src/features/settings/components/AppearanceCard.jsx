/**
 * AppearanceCard
 * Path: src/features/settings/components/AppearanceCard.jsx
 *
 * Light, Dark or Match system, each with a swatch, plus the reduced-motion note.
 */
import Icon from '../../../components/ui/Icon';
import { THEMES } from '../settingsConstants';

export default function AppearanceCard({ s }) {
  const { pref, resolved, setPref } = s.theme;

  return (
    <section id="appearance" className="k-card settings-card" aria-labelledby="h-appearance">
      <h2 id="h-appearance" className="k-card__title">
        Appearance
      </h2>

      <div className="settings-themes" role="group" aria-label="Theme">
        {THEMES.map((t) => (
          <button
            key={t.value}
            type="button"
            className="settings-theme"
            aria-pressed={pref === t.value}
            onClick={() => setPref(t.value)}
          >
            <span className={`settings-swatch ${t.swatch}`} aria-hidden="true" />
            <span className="settings-theme__label">
              <Icon name={t.icon} size={18} />
              {t.label}
            </span>
          </button>
        ))}
      </div>

      {pref === 'system' && (
        <p className="settings-muted">Your system is set to {resolved} right now, so Konva is too.</p>
      )}
      <p className="settings-muted">Konva follows your system’s reduced-motion setting: no pulses, no tilting on load.</p>
    </section>
  );
}
