/**
 * SectionNav
 * Path: src/features/settings/components/SectionNav.jsx
 *
 * Sticky list of jump links to the Settings cards (900px and wider). The card nearest the
 * top of the viewport is marked with aria-current.
 */
import { useEffect, useState } from 'react';
import Icon from '../../../components/ui/Icon';
import { SECTIONS } from '../settingsConstants';

export default function SectionNav() {
  const [active, setActive] = useState(SECTIONS[0].id);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const seen = new Map();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target.id, e.isIntersecting));
        const first = SECTIONS.find((s) => seen.get(s.id));
        if (first) setActive(first.id);
      },
      { rootMargin: '-20% 0px -55% 0px' } // a band across the upper middle of the viewport
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <nav className="settings-nav" aria-label="Settings sections">
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="settings-nav__link"
          aria-current={active === s.id ? 'location' : undefined}
          onClick={() => setActive(s.id)}
        >
          <Icon name={s.icon} />
          {s.label}
        </a>
      ))}
    </nav>
  );
}
