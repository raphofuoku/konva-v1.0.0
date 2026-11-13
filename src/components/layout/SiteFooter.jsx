import Logo from './Logo';
import './layout.css';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="k-footer">Edit locally. Stay private.</div>
      <div className="site-footer__row">
        <Logo size={22} />
        <span>Made by Raphael Ofuoku · open source</span>
        <a href="https://github.com/raphofuoku/konva-v1.0.0" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </div>
    </footer>
  );
}