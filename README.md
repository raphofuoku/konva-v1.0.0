# Konva

**Konva** is a web application that allows users to upload images, convert them into various formats (JPEG, PNG, WEBP), resize images with customizable dimensions or percentage, and download the processed images in high quality. The app prioritizes user privacy — all processing happens client-side, in your browser. Images are never uploaded to a server.

> **v2 in progress.** Konva is mid-redesign: the build now runs on Vite + React 19, and the UI is being migrated onto a centralized design-token system before new features land. See [Roadmap](#roadmap) below for what's shipped vs. planned.

## Features

### Image Conversion
Convert images to different formats (JPEG, PNG, WEBP) while maintaining high quality.

### Image Resizing
Easily resize images by dimensions or percentage, with an option to lock the aspect ratio.

### Multiple Upload Options
Upload images from your local device or enter an image URL.

### Quality Control
Adjust the image quality during conversion.

### Responsive Design
Fully responsive and optimized for both desktop and mobile devices.

### Download
Save the converted or resized images with a simple download button.

## Technologies Used

- **React 19** — UI library
- **Vite** — build tool and dev server
- **React Router** (`react-router-dom` v6, upgrade to the unified `react-router` package planned) — routing
- **HTML5 Canvas API** — image resizing and format conversion (drawn via `canvas.toDataURL`)
- **browser-image-compression** — client-side pre-compression before conversion
- **FileSaver.js** — triggering image downloads
- **CSS Custom Properties** (`src/styles/tokens.css`) — centralized design tokens for color, typography, spacing, radius, and shadow; single source of truth for the app's visual style, including dark-mode support

## Design System

All styling values — color, font, spacing, border-radius, shadow — live in one file: [`src/styles/tokens.css`](./src/styles/tokens.css). Component CSS files reference these as `var(--token-name)` rather than hardcoding values, so a rebrand or dark-mode toggle is a change in one place instead of hunting through every `.css` file. Dark mode is implemented via a `[data-theme="dark"]` override block that remaps the same semantic tokens components already use — no per-component work needed once a component is migrated.

*Migration to the token system is in progress — see Roadmap.*

**Scope of the "zero hardcoded values" migration.** When the roadmap below says a component's CSS has "zero hardcoded hex/px values," that claim covers exactly four categories: hex colors, spacing (margin/padding/gap), border-radius, and box-shadow — the things `tokens.css` defines a scale for. It intentionally does **not** cover:

- **Fixed element dimensions** — icon/image sizes, card widths/heights, dropdown widths. These are component-specific sizing decisions, not theme-level values, and `tokens.css` doesn't define a scale meant for arbitrary dimensions.
- **Position offsets** — `top`/`left`/`right`/`bottom` values used for absolute/relative positioning.
- **Font sizes expressed in raw px** — a separate, smaller cleanup. Every px font-size found during the v2 migration happened to map exactly to an existing `font-size-*` token, so this is a low-risk follow-up whenever it's prioritized, not a gap in the color/spacing/radius/shadow work.
- **Transition/motion durations** — `tokens.css` has a motion scale (`--transition-fast/base/slow`) but adopting it wasn't part of the token-migration pass.

Where a component's exact hex value doesn't have a matching token (e.g. a `#333` or `#ccc` picked ad hoc in v1), the migration maps it to the *closest* existing token rather than inventing a new one-off token or leaving it hardcoded — these are called out per-component in migration review notes when they happen.

## How to Use

### Image Conversion

1. **Upload an image:** Either from your device or by providing an image URL.
2. **Select the desired format:** JPEG, PNG, or WEBP.
3. **Adjust the image quality:** Use the quality slider to control the output quality.
4. **Click "Convert":** The image will be processed.
5. **Download the image:** A download button will appear to save the converted image.

### Image Resizing

1. **Upload an image:** From your device or by entering an image URL.
2. **Choose resize method:** Resize by dimensions (width and height) or by percentage.
3. **Lock aspect ratio:** (Optional) Enable the "Lock Aspect Ratio" checkbox to maintain the original aspect ratio while resizing.
4. **Click "Resize":** Apply the resizing to the image.
5. **Download the resized image:** A download button will appear to save the image.

## Development

```bash
npm install       # install dependencies
npm run dev        # start the dev server (Vite, localhost:3000)
npm run build       # production build to /dist
npm run preview      # locally preview the production build
```

## Roadmap

### Shipped in v2 so far
- [x] Migrated off Create React App (deprecated) onto Vite
- [x] Upgraded React 18 → React 19
- [x] Added centralized design tokens (`src/styles/tokens.css`)
- [x] Migrated every component's CSS onto design tokens, within the scope defined above (color / spacing / radius / shadow)
- [x] Dark mode toggle (persisted to `localStorage`, applied via `data-theme` on `<html>`)

### In progress
- [ ] Review the handful of flagged, non-exact color/spacing matches surfaced during migration (see PR/migration notes)

### Planned — P0 (next up)
- [ ] Drag-and-drop and clipboard-paste image upload
- [ ] Batch download as a single ZIP file
- [ ] Live output file-size estimate while adjusting quality
- [ ] Toast notifications in place of `alert()`

### Planned — P1
- [ ] Basic crop tool before convert/resize
- [ ] AVIF output support
- [ ] Remember last-used format/quality/size settings
- [ ] EXIF metadata stripping (privacy — on by default)
- [ ] Per-file setting overrides in batch mode
- [ ] Keyboard shortcuts
- [ ] Font sizes onto `font-size-*` tokens (see Design System scope note)

### Under consideration — P2
- [ ] PWA / offline support
- [ ] Multi-language UI
- [ ] Before/after comparison slider
- [ ] Watermark overlay tool

### Explicitly out of scope
Konva stays client-side only — no backend, no accounts, no image data ever leaving the browser. AI-based editing (background removal, upscaling) is not planned unless that constraint changes, since it would likely require server-side or WASM processing beyond the current architecture.

## Screenshots

*The screenshots below are from v1 and will be refreshed once the design-system migration lands.*

### Homepage
[Screenshot of Konva Homepage](./public/konva-homepage.png)

### Image Conversion Page
[Screenshot of Konva Image Converter](./public/konva-converter.png)

### Image Resizing Page
[Screenshot of Konva Image Resize](./public/konva-resize.png)

## Author

**Raphael Ofuoku**
[LinkedIn](https://www.linkedin.com/in/raphaelofuoku/) · [GitHub](https://github.com/raphofuoku)