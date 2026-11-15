/**
 * HomePage
 * Path: src/features/home/HomePage.jsx
 *
 * Home: drop hero (hands files to Studio), tools, how it works, privacy.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isImage } from '../../lib/konvaEngine';
import { setHandoff } from '../../lib/handoff';
import Icon from '../../components/ui/Icon';
import SiteFooter from '../../components/layout/SiteFooter';
import HomeHeader from './HomeHeader';
import { PRIVACY, STEPS, STEP_TILTS, TOOLS } from './homeContent';
import './home.css';

const NOT_IMAGE = 'That doesn’t look like an image. Konva reads JPEG, PNG, WEBP, AVIF and HEIC.';
const URL_BLOCKED = 'That site doesn’t let other pages fetch its images. Save the image to your device, then drop it here.';

export default function HomePage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState('');
  const [err, setErr] = useState('');

  const openInStudio = useCallback(
    (list) => {
      const files = [...list].filter(isImage);
      if (!files.length) {
        setErr(NOT_IMAGE);
        return;
      }
      setErr('');
      setBusy(true);
      setHandoff(files);
      navigate('/studio');
    },
    [navigate]
  );

  // Paste anywhere on the page. Text pastes (like into the URL field) carry no files and pass through.
  useEffect(() => {
    const onPaste = (e) => {
      const files = [...(e.clipboardData?.files || [])];
      if (!files.length) return;
      e.preventDefault();
      openInStudio(files);
    };
    // Stop a file dropped outside the zone from replacing the page.
    const block = (e) => e.preventDefault();
    window.addEventListener('paste', onPaste);
    window.addEventListener('dragover', block);
    window.addEventListener('drop', block);
    return () => {
      window.removeEventListener('paste', onPaste);
      window.removeEventListener('dragover', block);
      window.removeEventListener('drop', block);
    };
  }, [openInStudio]);

  const onDragOver = (e) => {
    e.preventDefault();
    if (!drag) setDrag(true);
  };
  const onDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setDrag(false);
  };
  const onDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    openInStudio(e.dataTransfer?.files || []);
  };

  const onUrl = async (e) => {
    e.preventDefault();
    const target = url.trim();
    if (!target) return;
    setErr('');
    setBusy(true);
    try {
      const res = await fetch(target);
      if (!res.ok) throw new Error('fetch failed');
      const blob = await res.blob();
      if (!blob.type.startsWith('image/')) {
        setBusy(false);
        setErr(NOT_IMAGE);
        return;
      }
      const name = new URL(target).pathname.split('/').pop() || 'image';
      openInStudio([new File([blob], name, { type: blob.type })]);
    } catch {
      setBusy(false);
      setErr(URL_BLOCKED);
    }
  };

  const dropIcon = busy ? 'hourglass_top' : drag ? 'download' : 'add_photo_alternate';
  const dropTitle = busy ? 'Opening in Studio…' : drag ? 'Let go to open it in Studio' : 'Drop, paste or browse';

  return (
    <div className="home">
      <a href="#k-main" className="k-skip">Skip to content</a>
      <HomeHeader />

      <main id="k-main" tabIndex={-1}>
        {/* Hero: the dropzone is the call to action */}
        <section className="home-hero" aria-label="Intro">
          <div className="home-hero__inner">
            <h1 className="home-hero__title">
              <span className="k-headline is-entering home-hero__slab home-hero__slab--a">Your images.</span>
              <span className="k-headline is-entering home-hero__slab home-hero__slab--b">Amplified.</span>
            </h1>

            <div className="home-hero__captions">
              <p className="k-caption is-entering">Drop an <em>image</em> below.</p>
              <p className="k-caption k-caption--right is-entering">It <em>never</em> leaves this tab.</p>
            </div>

            <div className="home-drop-wrap">
              <div
                className={`k-sticker home-drop${drag ? ' is-hot' : ''}`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
              >
                <span className="home-drop__badge"><Icon name={dropIcon} /></span>
                <p className="home-drop__title">{dropTitle}</p>
                <p className="home-drop__hint">
                  JPEG, PNG, WEBP, AVIF and HEIC · several files at once · opens in Studio
                </p>

                <div className="home-drop__actions">
                  <button type="button" className="k-btn" onClick={() => fileRef.current?.click()} disabled={busy}>
                    <Icon name="folder_open" />
                    Browse files
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,.heic,.heif,.avif"
                    multiple
                    hidden
                    onChange={(e) => {
                      openInStudio(e.target.files || []);
                      e.target.value = '';
                    }}
                  />
                  <form className="home-url" onSubmit={onUrl}>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="or paste an image URL"
                      aria-label="Image URL"
                    />
                    <button type="submit" disabled={busy}>Fetch</button>
                  </form>
                </div>

                {err && (
                  <div role="alert" className="home-drop__err">
                    <Icon name="error" />
                    {err}
                  </div>
                )}
              </div>
            </div>

            <div className="home-hero__chips">
              <span className="k-chip">server uploads <b>0</b></span>
              <span className="k-chip">accounts <b>0</b></span>
              <span className="k-chip">output formats <b>4</b></span>
            </div>
          </div>
        </section>

        {/* Tools */}
        <section id="tools" className="home-section home-tools">
          <div className="home-section__inner">
            <div className="home-tools__head">
              <h2 className="home-stack">
                <span className="k-headline k-headline--h1">Every tool.</span>
                <span className="k-headline k-headline--h1 k-headline--indent">One tab.</span>
              </h2>
              <p className="home-tools__lede">
                The image jobs you usually spread across five websites, in one editor. Each one runs on your device.
              </p>
            </div>
            <div className="home-tools__grid">
              {TOOLS.map((t) => (
                <Link key={t.name} to={t.to} className="home-tool">
                  <div className="home-tool__top">
                    <span className="home-tool__icon"><Icon name={t.icon} /></span>
                    <span className="home-tool__where">{t.where}</span>
                  </div>
                  <span className="home-tool__name">{t.name}</span>
                  <span className="home-tool__desc">{t.desc}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="home-section home-how">
          <div className="home-section__inner home-how__inner">
            <h2 className="home-stack">
              <span className="k-headline">How it</span>
              <span className="k-headline k-headline--indent">works.</span>
            </h2>
            <ol className="home-steps">
              {STEPS.map((s, i) => (
                <li
                  key={s.k}
                  className="home-step"
                  style={{ '--i': i, '--tilt': `${STEP_TILTS[i]}deg`, zIndex: STEPS.length - i }}
                >
                  <span className="home-step__n">{String(i + 1).padStart(2, '0')}</span>
                  <span className="home-step__text">
                    {s.a}<em>{s.k}</em>{s.b}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Privacy */}
        <section id="privacy" className="home-section home-privacy">
          <div className="home-section__inner">
            <h2 className="home-stack">
              <span className="k-headline k-headline--h1">Nothing leaves</span>
              <span className="k-headline k-headline--h1 k-headline--indent">your device.</span>
            </h2>
            <div className="home-privacy__grid">
              {PRIVACY.map((p) => (
                <div key={p.title} className="home-privacy__item">
                  <Icon name={p.icon} />
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}