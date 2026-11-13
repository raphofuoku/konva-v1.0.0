import { Link } from 'react-router-dom';
import TopBar from '../components/layout/TopBar';

export default function PlaceholderPage({ title }) {
  return (
    <>
      <TopBar />
      <main id="k-main" tabIndex={-1} className="page-placeholder k-dotgrid">
        <div className="k-card">
          <h1 className="k-card__title">{title}</h1>
          <p>This screen is part of the Amplified redesign and lands in a later commit on this branch.</p>
          <Link to="/" className="k-btn">Back to home</Link>
        </div>
      </main>
    </>
  );
}