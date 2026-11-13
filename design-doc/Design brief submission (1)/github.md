repo: raphofuoku/konva-v1.0.0
branch: main

## Last sync
date: 2026-11-13T14:05:00Z

### Updated in this project
- Real AVIF (jsquash), HEIC (heic-to) and background removal (ormbg) wired into the engine
- Full state sets on every tool, first-run onboarding, accessibility pass
- Launch kit: OG images, store screenshots, Konva favicon pack
- handoff/ package for branch redesign/amplified (hand-written CSS)

## Sync history
### Previous sync
date: 2026-11-13T11:19:34Z

### Updated in this project
- Redesigned Home and a unified Studio (convert, resize, crop, adjust, watermark, redact, metadata) in the "Amplified" poster system
- Studio runs real in-browser processing (canvas encode, size estimate, target-size search, ZIP export) via konva-engine.js, ported from src/lib/image.js and formatBytes.js
- Crop-mark logo (from src/assets/Logo.png) applied across all pages
- Added Icon pack, Images to PDF and Settings pages


## Screen map
| Project screen | Repo files |
|---|---|
| Home.dc.html | src/features/home/*, src/components/layout/Header.jsx, Footer.jsx, ThemeToggle.jsx |
| Studio.dc.html | src/features/convert/ConvertOptionsPage.jsx, ConverterUploadPage.jsx, src/features/resize/ResizePage.jsx, src/components/ui/* |
| konva-engine.js | src/lib/image.js, src/lib/formatBytes.js, src/lib/downloadZip.js |
| Konva Board.dc.html (logos) | src/assets/Logo.png |
| Icons.dc.html | public/manifest.json, public/favicon-*.png (output conventions) |
| PDF.dc.html | (new, no repo source) |
| Settings.dc.html | src/lib/theme.js, src/components/layout/ThemeToggle.jsx |
