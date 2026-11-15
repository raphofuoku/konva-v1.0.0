import { Link } from 'react-router-dom';

export default function Logo({ size = 24, to = '/', className = '' }) {
  return (
    <Link
      to={to}
      aria-label="Konva home"
      className={`k-logo ${className}`.trim()}
      style={{ '--s': `${size}px` }}
    >
      <span className="k-logo__tr" aria-hidden="true" />
      <span className="k-logo__bl" aria-hidden="true" />
      <span className="k-logo__word">konva</span>
    </Link>
  );
}