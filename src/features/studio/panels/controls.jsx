/**
 * Panel controls
 * Path: src/features/studio/panels/controls.jsx
 *
 * Small building blocks shared by the seven tool panels. Class names come from
 * components.css (.k-seg, .k-switch, .k-field, .k-range-label, .k-note) and Panels.css.
 */
import { useState } from 'react';
import Icon from '../../../components/ui/Icon';

export function Section({ title, aside, children }) {
  return (
    <section className="panel-section">
      {(title || aside) && (
        <div className="panel-section__head">
          {title && <h3 className="k-eyebrow">{title}</h3>}
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}

// Segmented control. options: [{ value, label, disabled? }]
export function Seg({ label, options, value, onChange, pill = false }) {
  return (
    <div className={`k-seg${pill ? ' k-seg--pill' : ''}`} role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className="k-seg__opt"
          aria-pressed={value === o.value}
          disabled={o.disabled}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Range({ label, value, display, min, max, step = 1, onChange, disabled = false }) {
  return (
    <label className="panel-range">
      <span className="k-range-label">
        {label} <b>{display ?? value}</b>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(+e.target.value)}
      />
    </label>
  );
}

// A whole-row switch: track, title and an optional hint, all one button.
export function SwitchRow({ checked, onChange, title, hint, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className="panel-switch"
      disabled={disabled}
      onClick={() => onChange(!checked)}
    >
      <span className="k-switch" aria-hidden="true">
        <span className="k-switch__knob" />
      </span>
      <span className="panel-switch__text">
        <span className="panel-switch__title">{title}</span>
        {hint && <span className="panel-switch__hint">{hint}</span>}
      </span>
    </button>
  );
}

// Number input that lets you clear and retype freely. It commits only whole numbers inside
// [min, max] and snaps back to the real value on blur.
export function NumberField({ label, value, onCommit, min = 1, max = 16384, step = 1, suffix, disabled = false, placeholder }) {
  const [draft, setDraft] = useState(null);
  const shown = draft ?? (value ?? '');

  const onChange = (e) => {
    const text = e.target.value;
    setDraft(text);
    const n = Math.round(Number(text));
    if (text !== '' && Number.isFinite(n) && n >= min && n <= max) onCommit(n);
  };

  return (
    <label className="panel-field">
      {label}
      <span className="panel-field__row">
        <input
          className="k-field"
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={step}
          value={shown}
          placeholder={placeholder}
          disabled={disabled}
          onChange={onChange}
          onBlur={() => setDraft(null)}
        />
        {suffix && <span className="panel-field__suffix">{suffix}</span>}
      </span>
    </label>
  );
}

// Plain hint text, or a tinted .k-note when a tone is given.
export function Note({ tone, icon, children }) {
  if (!tone) {
    return (
      <p className={`panel-note${icon ? ' panel-note--icon' : ''}`}>
        {icon && <Icon name={icon} size={18} />}
        <span>{children}</span>
      </p>
    );
  }
  return (
    <p className={`k-note k-note--${tone} panel-knote`}>
      <Icon name={icon || (tone === 'ok' ? 'check_circle' : tone === 'bad' ? 'error' : 'warning')} size={18} />
      <span>{children}</span>
    </p>
  );
}

// Shown by panels that need an image to work on.
export function NeedsImage({ children }) {
  return <Note icon="add_photo_alternate">{children}</Note>;
}