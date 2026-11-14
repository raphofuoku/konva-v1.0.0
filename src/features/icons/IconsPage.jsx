/**
 * IconsPage
 * Path: src/features/icons/IconsPage.jsx
 *
 * Icon pack: one logo in, favicons, touch icons, a multi-size ICO, the manifest and the
 * head snippet out, drawn on this device and zipped. Logo card on the left; preview,
 * export and code cards on the right (stacked below 920px).
 */
import { useEffect } from 'react';
import TopBar from '../../components/layout/TopBar';
import SiteFooter from '../../components/layout/SiteFooter';
import { useIconPack } from './useIconPack';
import LogoCard from './components/LogoCard';
import PreviewCard from './components/PreviewCard';
import ExportCard from './components/ExportCard';
import CodeCard from './components/CodeCard';
import './Icons.css';

export default function IconsPage() {
  const ip = useIconPack();

  // A file dropped outside the logo card would otherwise replace the page.
  useEffect(() => {
    const block = (e) => e.preventDefault();
    window.addEventListener('dragover', block);
    window.addEventListener('drop', block);
    return () => {
      window.removeEventListener('dragover', block);
      window.removeEventListener('drop', block);
    };
  }, []);

  return (
    <div className="icons-page k-dotgrid">
      <TopBar />

      <main id="k-main" tabIndex={-1} className="icons">
        <div className="icons-head">
          <div className="icons-head__titles">
            <h1 className="k-headline k-headline--h1 is-entering">Icon pack.</h1>
            <p className="k-caption k-caption--shadow is-entering icons-head__caption">
              One logo in, <em>every size</em> out.
            </p>
          </div>
          <p className="icons-head__lede">
            Favicons, touch icons, a multi-size ICO and the manifest, drawn on this device and zipped. Nothing is
            uploaded.
          </p>
        </div>

        <div className="icons-grid">
          <LogoCard ip={ip} />
          <div className="icons-side">
            <PreviewCard ip={ip} />
            <ExportCard ip={ip} />
            <CodeCard ip={ip} />
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
