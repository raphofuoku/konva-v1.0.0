# Konva redesign: developer handoff

Visual system: **Amplified** (Amp Yellow `#FADF3C`, Ink Navy `#33366F`, Poppins + IBM Plex Mono, hard offset shadows, yellow halos, tilted caption strips). Styling is **hand-written CSS** with custom properties. No Tailwind, no CSS-in-JS.

The design files in this project are the reference. Open any `.dc.html` file in a browser to use it; most behaviour is real, so treat it as a working spec.

## 1. Create the branch

```bash
git checkout main && git pull
git checkout -b redesign/amplified
npm i @jsquash/avif heic-to @huggingface/transformers
```

Copy this folder's contents over the repo root:

| From `handoff/` | To repo |
|---|---|
| `src/styles/tokens.css` | `src/styles/tokens.css` (new) |
| `src/styles/components.css` | `src/styles/components.css` (new) |
| `src/lib/konvaEngine.js` | `src/lib/konvaEngine.js` (new; then delete `image.js`, `formatBytes.js`, `downloadZip.js` once nothing imports them) |
| `public/*` | `public/` (replaces the old favicons and `manifest.json`; rename references to `site.webmanifest`) |

In `src/main.jsx`, import the styles before anything else:

```js
import './styles/tokens.css';
import './styles/components.css';
```

Paste `public/head-snippet.html` into `index.html` `<head>`, and add `public/og-image.png`, exported from `Launch Kit.dc.html` (artboard OG A, at 1×).

Suggested commits, in order: `tokens + components css` → `engine port` → `layout (header, footer, theme)` → `home` → `studio` → `icon pack` → `images to pdf` → `settings` → `assets`.

## 2. Screen map

| Design file | Route | Replaces / builds on |
|---|---|---|
| `Home.dc.html` (hero `drop`) | `/` | `src/features/home/*`, `src/components/layout/Header.jsx`, `Footer.jsx` |
| `Studio.dc.html` (layout `rail`) | `/studio` (+ `#convert`, `#resize`, `#crop`, `#adjust`, `#watermark`, `#redact`, `#metadata`) | `src/features/convert/*`, `src/features/resize/*`; the separate convert and resize pages merge into Studio |
| `Icons.dc.html` | `/icons` | new |
| `PDF.dc.html` | `/pdf` | new |
| `Settings.dc.html` | `/settings` (privacy explainer is `#privacy`) | `src/lib/theme.js`, `ThemeToggle.jsx` |
| `Launch Kit.dc.html` | none | OG images, store screenshots, favicon pack |
| `Konva Board.dc.html` | none | every screen, state and logo option side by side |

Redirect the old `/convert` and `/resize` routes to `/studio#convert` and `/studio#resize`.

## 3. Components to build

Each one is a class in `components.css`. The classes in brackets are the hooks; the markup is in the matching design file.

- **Logo** `.k-logo` (crop-mark wordmark; `--s` sets the size). In every top bar, linking to `/`.
- **TopBar** `.k-topbar`, `.k-topbar__link[aria-current]`, `.k-subnav` below 900 px. Right side: Offline-ready chip, theme button.
- **Headline** `.k-headline`, `--indent`, `--invert`, `--h1`. Always one or two stacked slabs, never three.
- **Caption** `.k-caption`, `--right`, `--shadow`. Use `<em>` for the blue word.
- **Button** `.k-btn`, `--block`, `--ghost`, `--danger`. Only one hard-offset primary per panel.
- **Segmented** `.k-seg` + `.k-seg__opt[aria-pressed]`, `--pill`.
- **Chip** `.k-chip`, `--vio`, `--ok`. Used for the size estimate, result and change.
- **Card** `.k-card`, `--flush`, `.k-card__title`, `.k-eyebrow`.
- **Sticker** `.k-sticker` (+ `.is-hot` while a file is dragged over it), `.k-checker` for transparency.
- **Switch** `.k-switch[role=switch][aria-checked]`.
- **Progress** `.k-progress`, `--indeterminate`, `.k-skeleton`.
- **Notice** `.k-note--ok|bad|warn`. **Toast** `.k-toast--ok|bad` inside `.k-toasts` (`aria-live="polite"`).
- **Scrim** `.k-scrim` (command palette), `.k-scrim--solid` (onboarding).
- **Kbd** `.k-kbd`. **Footer** `.k-footer`. **Skip link** `.k-skip` → `#k-main`.

## 4. Engine (`src/lib/konvaEngine.js`)

Pure functions, no React. Studio state calls them as follows:

- `analyse(file, img)` → dimensions, palette, EXIF/GPS found
- `geom(w, h, settings)` → crop, resize and output size
- `drawOutput(file, settings, geom)` → canvas with every edit applied (rotate, flip, adjust, watermark, redact)
- `encode(canvas, settings, avifSupported)` → `{ blob, q, miss }`. Target-size mode is a binary search on quality. AVIF falls back to `@jsquash/avif` when `avifSupported()` is false.
- `zip(entries)`, `download(blob, name)`, `outName(pattern, file, i, settings, geom)`
- `ico(pngs)`, `pdf(pages)`: used by Icon pack and Images to PDF
- `decodeHeic(file)`: `heic-to`, called only when `<img>` can't decode the file (Safari decodes HEIC natively)
- `loadSegmenter(onProgress)` + `removeBg(blob)`: Transformers.js with `onnx-community/ormbg-ONNX` (`dtype: 'q8'`, about 42 MB), plus `cleanAlpha` on the matte

All three codecs are dynamic imports, so Vite emits separate chunks for them. Cache those chunks, the WASM files and the model files in the service worker, so they work offline after first use. For the model, set `env.remoteHost`/`env.localModelPath` to serve it from your own domain.

**Licences:** `@jsquash/avif` is Apache-2.0. `ormbg` is Apache-2.0. Transformers.js is Apache-2.0. `heic-to` is LGPL-3.0: ship it as the unmodified npm package in its own chunk, and say so in your third-party notices. Don't swap in `@imgly/background-removal` (AGPL) or BRIA RMBG (non-commercial).

## 5. Storage keys (localStorage)

`konva-theme` (`light|dark|system`), `konva-defaults` (format, quality, mode, targetKB, strip), `konva-history` (recent export names only), `konva-model` (`cached`), `konva-onboarded` (`1`). The **Stored on this device** list in Settings reads and clears exactly these keys.

## 6. Acceptance checks

- No network request contains image data. Check the Network panel while converting a batch.
- Text contrast is at least 4.5:1 in both themes. In dark mode the violet accent is `#B39DFF`.
- Everything works by keyboard: Tab order is top bar → tool rail → canvas → settings → tray. `1`–`7` switch tools, `[`/`]` change file, `\` toggles the comparison, `D`/`⇧D` download, `⌘/Ctrl K` opens the palette, `Esc` closes overlays. In Redact, arrow keys nudge the last area.
- With reduced motion on, nothing tilts, pulses or slides.
- Every tool has empty, loading, ready, processing, success and error states. Each design file's "preview state" control shows them all.
- At 390 px wide, the tool panel becomes a bottom sheet and every tap target is at least 44 px.
