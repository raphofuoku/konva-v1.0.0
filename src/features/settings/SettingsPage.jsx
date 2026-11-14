/**
 * SettingsPage
 * Path: src/features/settings/SettingsPage.jsx
 *
 * Privacy explainer (#privacy), then the settings cards: defaults, appearance, offline,
 * shortcuts and stored data, with a sticky section list at 900px and wider.
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import TopBar from '../../components/layout/TopBar';
import SiteFooter from '../../components/layout/SiteFooter';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useSettings } from './useSettings';
import PrivacyHero from './components/PrivacyHero';
import SectionNav from './components/SectionNav';
import DefaultsCard from './components/DefaultsCard';
import AppearanceCard from './components/AppearanceCard';
import OfflineCard from './components/OfflineCard';
import ShortcutsCard from './components/ShortcutsCard';
import StorageCard from './components/StorageCard';
import '../studio/panels/Panels.css';
import './Settings.css';

export default function SettingsPage() {
  const s = useSettings();
  const wide = useMediaQuery('(min-width: 900px)');
  const { hash } = useLocation();

  // Links such as /settings#privacy arrive before the page has rendered, so scroll once it has.
  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(decodeURIComponent(hash.slice(1)));
    el?.scrollIntoView({ block: 'start', behavior: 'instant' }); // a jump on arrival, not a long glide
  }, [hash]);

  return (
    <div className="settings-page k-dotgrid">
      <TopBar />

      <main id="k-main" tabIndex={-1} className="settings-main">
        <PrivacyHero />

        <div className="settings-body">
          {wide && <SectionNav />}
          <div className="settings-cards">
            <DefaultsCard s={s} />
            <AppearanceCard s={s} />
            <OfflineCard s={s} />
            <ShortcutsCard />
            <StorageCard s={s} />
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
