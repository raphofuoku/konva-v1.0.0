# Konva

**Edit images locally. Upload nothing.**

Konva is an image editor that runs entirely in your browser. Convert, resize, crop, adjust, watermark, redact and inspect images, remove backgrounds with an on-device AI model, build a favicon pack from a logo, or turn a stack of images into one PDF. Your images never leave your device: there is no server, no upload and no account.

> **v2 ("Amplified").** A full rebuild on Vite and React 19 with a new design system, a single Studio for every image tool, and offline support. Work happens on the `feat/amplified` branch. See [Roadmap](#roadmap) for what's left before the v2 release.

## Features

### Studio (`/studio`)
One workspace for single images or whole batches. Drop files, paste from the clipboard, open a folder, or paste an image link.

| Tool | What it does |
|---|---|
| **Convert** | JPEG, PNG, WEBP and AVIF out; iPhone HEIC in. Set a quality, or a target size such as 200 KB. A live size estimate updates as you move the slider. |
| **Resize** | Pixels with aspect lock, or a percentage with presets. Warns before upscaling. |
| **Crop** | Free, 1:1, 4:5 and 16:9, plus presets for Instagram, LinkedIn, X and YouTube. Rotate and flip. |
| **Adjust** | Brightness, contrast, saturation, grayscale and blur, with a before/after slider. **Background removal** uses an optional AI model that downloads once and then works offline. |
| **Watermark** | Text in any of nine positions or tiled across the image, with opacity and size. |
| **Redact** | Blur or pixelate faces, number plates and addresses. Draw areas, then nudge them with the arrow keys. |
| **Metadata** | Read EXIF and GPS (JPEG), strip location on export, copy the colour palette as hex, pick colours with the eyedropper. |

Batch work:
- Settings apply to every file, or override them on one file.
- Rename outputs with `{name}`, `{n}`, `{w}` and `{h}`.
- Download everything as one ZIP, or save straight into a folder.

Developer extras: copy the result, copy it as Base64, generate a responsive `srcset` (320 to 1920 px) with its HTML, and share through the system share sheet.

### Icon pack (`/icons`)
One logo in (SVG or raster). Out comes a ZIP with:
- favicons at 16, 32 and 48 px, plus a multi-size `favicon.ico`
- an Apple touch icon, Android icons and a maskable icon
- a `site.webmanifest`
- the `<head>` snippet to paste into your site

You choose the background, shape and padding.

### Images to PDF (`/pdf`)
Add images (HEIC included), drag or use the arrow buttons to put them in order, then pick A4, Letter or "fit image" pages, orientation, margins and fit. Konva saves one PDF.

### Settings (`/settings`)
- **How privacy works**, explained step by step.
- **Defaults** for format, quality or target size, and metadata stripping.
- **Theme:** light, dark or match system.
- **Offline:** install as an app, apply a waiting update, and manage the background-removal model.
- **Shortcuts:** the full list.
- **Stored data:** every item Konva keeps on your device, with a button to clear each one.

### Everywhere
- **Offline:** after one visit, every page opens without a connection, and each tool works offline after its first use.
- **Installable** as an app (Chromium browsers show an Install button in Settings).
- **Light and dark themes**, keyboard support throughout, `prefers-reduced-motion` respected, and 44 px tap targets on phones.

## Privacy

Every image is decoded, edited and encoded on your device with the Canvas API and WebAssembly. Nothing Konva does sends image data anywhere.

A few things are downloaded the first time they're needed, and none of them carry your images:

| What | When | From |
|---|---|---|
| AVIF encoder (WASM) | Exporting AVIF in a browser that can't encode it natively | Konva's own site |
| HEIC decoder (WASM) | Opening a HEIC photo the browser can't read itself | Konva's own site |
| Background-removal model (ormbg, about 42 MB) and ONNX Runtime | You press "Download model" in Adjust | Hugging Face and jsDelivr by default, or Konva's own site ([self-hosting](#self-hosting-background-removal)) |
| An image you paste a link to | You paste the link | That website, fetched directly by your browser |

What stays on your device:
- **Local storage:** your theme, your default export settings, the names (not the images) of your last 8 exports, and two small flags. They're listed and clearable in Settings › Stored data.
- **Cache Storage:** the app files and the model, so they work offline.

## Keyboard shortcuts (Studio)

| Keys | Action |
|---|---|
| `1` to `7` | Switch tool |
| `[` and `]` | Previous / next file |
| `\` | Toggle before/after |
| `D` | Download the current file |
| `Shift` + `D` | Download all |
| `⌘ K` / `Ctrl K` | Command palette |
| `Esc` | Close the top overlay |
| Arrow keys (Redact) | Nudge the newest area (`Shift` for bigger steps) |

## Tech stack

- **React 19** and **React Router 6**
- **Vite 8**
- **Plain CSS** with custom properties (`src/styles/tokens.css`, `src/styles/components.css`). No CSS framework.
- **Canvas API** for drawing and encoding, plus hand-written ZIP, ICO and PDF writers (`src/lib/konvaEngine.js`)
- **@jsquash/avif** (AVIF encoding fallback) and **heic-to** (HEIC decoding), both loaded on demand
- **Transformers.js** with ONNX Runtime Web, running the **ormbg** model for background removal, loaded on demand
- **Hand-written service worker** (`src/pwa/`), generated at build time with no extra dependencies
- **Poppins**, **IBM Plex Mono** (via Fontsource) and **Material Symbols Sharp**, all served locally

## Design system

The "Amplified" look comes from Amp Yellow `#FADF3C`, Ink Navy `#33366F` and Electric Violet `#6A3DF0`. Its signature pieces are navy slab headlines, tilted caption strips, a crop-mark logo, hard-offset buttons that press in, and a yellow halo around images.

- Every colour, size, radius and shadow is a token in `src/styles/tokens.css`.
- Dark mode remaps the same tokens under `[data-theme="dark"]`.
- Shared components live in `src/styles/components.css` as `.k-*` classes.
- Page CSS sits next to each feature and uses tokens only.

Design references and the developer handoff are in `design-doc/`.

## Project structure

```
src/
  main.jsx, App.jsx        entry, routes
  components/layout/       top bar, logo, footer, theme button
  components/ui/           icon, toasts
  features/home/           landing page
  features/studio/         Studio: useStudio hook, panels, stage, tray, palette, tour
  features/icons/          icon pack generator
  features/pdf/            images to PDF
  features/settings/       settings page, stored data, model cache
  hooks/                   shared hooks (theme, media queries, install, updates...)
  lib/                     konvaEngine.js (image engine), theme, install prompt
  pwa/                     service worker template, build step, registration
  styles/                  tokens.css, components.css
public/                    icons, manifest, OG image, third-party notices
scripts/fetch-model.mjs    optional: self-host background removal
```

## Development

Requires Node 20.19 or newer (Vite 8).

```bash
npm install
npm run dev        # dev server at http://localhost:5173 (no service worker)
npm run build      # production build to dist/, then writes dist/sw.js
npm run preview    # serve the production build at http://localhost:4173
```

Offline mode only exists in production builds. To try it, run `npm run build && npm run preview`, open the page once, then switch DevTools › Network to Offline and reload.

### Self-hosting background removal

By default the model comes from the Hugging Face hub and the ONNX Runtime from jsDelivr. To serve both from your own domain:

```bash
npm run model:fetch   # fills public/models/ and public/ort/ (both git-ignored)
```

Then set these in `.env` and in your host's build settings:

```
VITE_MODEL_BASE=/models/
VITE_ORT_BASE=/ort/
```

On the host, use `npm run model:fetch && npm run build` as the build command.

### Deploying

Konva is a static site: deploy `dist/` anywhere that can serve a single-page app, rewriting unknown paths to `index.html`.

Two hosting details:
- Serve `sw.js` without long-term caching.
- `dist/assets/` files are content-hashed and can be cached forever.

## Browser support

Konva targets current Chrome, Edge, Safari and Firefox. Some features depend on the browser:
- **AVIF export** uses the browser's encoder when it has one, otherwise a WebAssembly encoder.
- **HEIC** opens natively in Safari; elsewhere through the WebAssembly decoder.
- **Open a folder** and **save into a folder** need the File System Access API (Chromium).
- The **Install** button and the **eyedropper** are Chromium-only. In other browsers, use the browser's own "Add to Home Screen" or "Install" option.

## Licences

Third-party software, fonts and the model are listed with their licences in [`public/third-party-notices.txt`](./public/third-party-notices.txt), also linked from the site footer. `heic-to` (LGPL-3.0) is shipped unmodified as a separate file.

## Roadmap

### Shipped in v2
- [x] Vite and React 19, replacing Create React App
- [x] "Amplified" design system with light and dark themes
- [x] One Studio with seven tools, batch processing and per-file overrides
- [x] Drag-and-drop, paste, folder and URL input
- [x] ZIP download and save into a folder
- [x] Live output size estimate, and target-size mode
- [x] AVIF output and HEIC input
- [x] Crop with social presets; rotate and flip
- [x] Adjustments with a before/after slider
- [x] Watermark
- [x] Redact (blur or pixelate)
- [x] EXIF reading, GPS stripping and colour palette
- [x] On-device background removal
- [x] Icon pack generator
- [x] Images to PDF
- [x] Remembered defaults, toasts, keyboard shortcuts, command palette and a first-run tour
- [x] Settings with a privacy explainer and stored-data controls
- [x] Offline support, install as an app, and update prompts
- [x] Third-party notices

### Before the v2 release
- [ ] Keep EXIF when "Strip metadata" is off. Today the canvas always drops it, so the switch has no effect (the panels say so).
- [ ] Logo watermarks. The Home page promises "text or logo"; Studio only does text so far.
- [ ] Add a licence for Konva's own code.
- [ ] Contrast audit (4.5:1) in both themes.
- [ ] 44 px tap target for the top bar logo on phones.
- [ ] Fresh screenshots for this README.
- [ ] Merge `feat/amplified` into `main` and deploy.

### Later
- [ ] Multi-language UI
- [ ] Sticky "Save PDF" bar on phones
- [ ] Subset the icon font to cut first-load size

## Author

**Raphael Ofuoku**
[LinkedIn](https://www.linkedin.com/in/raphaelofuoku/) · [GitHub](https://github.com/raphofuoku)