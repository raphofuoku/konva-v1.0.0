/**
 * SiteFooter
 * Path: src/components/layout/SiteFooter.jsx
 *
 * Navy strapline, logo, credit, and links to the source code and the open-source notices.
 */
import Logo from './Logo';
import './layout.css';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="k-footer">Edit locally. Stay private.</div>
      <div className="site-footer__row">
        <Logo size={22} />
        <span>Made by Raphael Ofuoku · open source</span>
        <span className="site-footer__links">
          <a href="/third-party-notices.txt" target="_blank" rel="noreferrer">
            Open-source notices
          </a>
          <a href="https://github.com/raphofuoku/konva-v1.0.0" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </span>
      </div>
    </footer>
  );
}
