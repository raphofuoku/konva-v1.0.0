/**
 * Onboarding
 * Path: src/features/studio/components/Onboarding.jsx
 *
 * First-run tour: three full-screen steps over a dark scrim. Next / Skip / Esc all end it,
 * and StudioPage records konva-onboarded=1 so it doesn't come back.
 */
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../../../components/ui/Icon';
import { MOD_KEY } from '../studioUi';
import './Overlays.css';

const steps = (mobile) => [
  { title: 'Drop it. Edit it. Keep it.', a: 'Drop, paste or browse for images.', b: 'They never leave this tab.' },
  {
    title: 'Seven tools, one canvas.',
    a: mobile ? 'Pick a tool from the bar at the bottom.' : 'Pick a tool on the left, or press 1 to 7.',
    b: 'Changes apply to the selected file or all.',
  },
  {
    title: 'Know the size first.',
    a: 'The estimate updates as you change settings.',
    b: mobile ? 'Tap Download when it looks right.' : `Press D to save, ${MOD_KEY} K for every command.`,
  },
];

export default function Onboarding({ step, mobile, onNext, onFinish }) {
  const nextRef = useRef(null);
  const all = steps(mobile);
  const i = Math.min(step, all.length - 1);
  const s = all[i];
  const last = i === all.length - 1;

  useEffect(() => {
    nextRef.current?.focus();
  }, [i]);

  // Keep Tab inside the dialog (Next and Skip are its only stops).
  const trap = (e) => {
    if (e.key !== 'Tab') return;
    const items = [...e.currentTarget.querySelectorAll('button')];
    const first = items[0];
    const end = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      end.focus();
    } else if (!e.shiftKey && document.activeElement === end) {
      e.preventDefault();
      first.focus();
    }
  };

  return createPortal(
    <div className="k-scrim k-scrim--solid studio-tour">
      <div className="studio-tour__dialog" role="dialog" aria-modal="true" aria-labelledby="studio-tour-title" onKeyDown={trap}>
        <span className="studio-tour__count">
          {String(i + 1).padStart(2, '0')} / {String(all.length).padStart(2, '0')}
        </span>

        {/* key replays the entrance animation on every step */}
        <div key={i} className="studio-tour__body">
          <h2 id="studio-tour-title" className="k-headline k-headline--h1 is-entering studio-tour__title">
            {s.title}
          </h2>
          <div className="studio-tour__lines">
            <p className="k-caption is-entering">{s.a}</p>
            <p className="k-caption k-caption--right is-entering">{s.b}</p>
          </div>
        </div>

        <div className="studio-tour__actions">
          <button ref={nextRef} type="button" className="k-btn studio-tour__next" onClick={last ? onFinish : onNext}>
            {last ? 'Start editing' : 'Next'}
            <Icon name="arrow_forward" />
          </button>
          <button type="button" className="studio-tour__skip" onClick={onFinish}>
            Skip the tour
          </button>
        </div>

        <div className="studio-tour__dots" aria-hidden="true">
          {all.map((_, k) => (
            <span key={k} className={k === i ? 'is-on' : ''} />
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}