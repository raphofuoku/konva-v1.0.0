import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../components/layout/Logo';
import ThemeButton from '../../components/layout/ThemeButton';
import Icon from '../../components/ui/Icon';

const LINKS = [
  { to: '/studio', label: 'Studio' },
  { href: '#tools', label: 'Tools' },
  { href: '#how', label: 'How it works' },
  { href: '#privacy', label: 'Privacy' },
];

const renderLinks = (onClick) =>
  LINKS.map((l) =>
    l.to ? (
      <Link key={l.label} to={l.to} onClick={onClick}>{l.label}</Link>
    ) : (
      <a key={l.label} href={l.href} onClick={onClick}>{l.label}</a>
    )
  );

export default function HomeHeader() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <header className="home-header">
        <Logo size={30} />
        <nav className="home-header__nav" aria-label="Sections">{renderLinks()}</nav>
        <div className="home-header__actions">
          <ThemeButton />
          <button
            type="button"
            className="k-iconbtn home-header__menu"
            aria-expanded={open}
            aria-controls="home-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            <Icon name={open ? 'close' : 'menu'} />
          </button>
        </div>
      </header>
      {open && (
        <nav id="home-menu" className="home-menu" aria-label="Sections">
          {renderLinks(close)}
        </nav>
      )}
    </>
  );
}