/**
 * PrivacyHero
 * Path: src/features/settings/components/PrivacyHero.jsx
 *
 * The privacy explainer at the top of Settings (#privacy): two slabs, two captions, what
 * happens to a dropped image, and what Konva does download.
 */
import { PRIVACY_STEPS } from '../settingsConstants';

export default function PrivacyHero() {
  return (
    <section id="privacy" className="settings-hero" aria-labelledby="privacy-title">
      <div className="settings-hero__inner">
        <div className="settings-hero__titles">
          <h1 id="privacy-title" className="settings-hero__title">
            <span className="k-headline is-entering">Nothing leaves</span>
            <span className="k-headline is-entering settings-hero__slab-b">your device.</span>
          </h1>
          <div className="settings-hero__captions">
            <p className="k-caption is-entering">
              Konva has no <em>upload</em> server.
            </p>
            <p className="k-caption k-caption--right is-entering settings-hero__caption-b">
              Your images stay in this <em>tab</em>.
            </p>
          </div>
        </div>

        <div className="settings-hero__cards">
          <div className="settings-hero__steps">
            <h2>When you drop an image</h2>
            <ol>
              {PRIVACY_STEPS.map((text, i) => (
                <li key={text}>
                  <span className="settings-hero__num" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="settings-hero__downloads">
            <h2>What does download</h2>
            <p>
              Only the files Konva needs to run: the app itself, and the background-removal model, AVIF encoder or
              HEIC decoder the first time you use them. Your images, file names and metadata are never part of a
              request. If you paste an image link into Studio, your browser fetches that link directly.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
