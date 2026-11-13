import { NavLink } from 'react-router-dom';
import { useOfflineReady } from '../../hooks/useOfflineReady';
import Icon from '../ui/Icon';
import Logo from './Logo';
import ThemeButton from './ThemeButton';
import './layout.css';

export const PAGE_LINKS = [
  { to: '/studio', label: 'Studio' },
  { to: '/icons', label: 'Icon pack' },
  { to: '/pdf', label: 'Images to PDF' },
  { to: '/settings', label: 'Settings' },
];

const links = () =>
  PAGE_LINKS.map((l) => (
    <NavLink key={l.to} to={l.to} className="k-topbar__link">
      {l.label}
    </NavLink>
  ));

// children render on the right, before the theme button (Studio puts its search button there).
export default function TopBar({ children, className = '' }) {
  const offline = useOfflineReady();

  return (
    <>
      <a href="#k-main" className="k-skip">Skip to content</a>
      <header className={`k-topbar ${className}`.trim()}>
        <Logo />
        <nav className="k-topbar__nav" aria-label="Pages">{links()}</nav>
        <div className="k-topbar__spacer" />
        {offline && (
          <span className="k-chip k-chip--ok topbar-offline" title="Every tool is cached on this device">
            <Icon name="offline_pin" size={16} />
            Offline ready
          </span>
        )}
        {children}
        <ThemeButton />
      </header>
      <nav className="k-subnav" aria-label="Pages">{links()}</nav>
    </>
  );
}