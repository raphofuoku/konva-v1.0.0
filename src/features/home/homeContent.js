export const TOOLS = [
  { icon: 'sync_alt', name: 'Convert', to: '/studio#convert', where: 'studio',
      desc: 'JPEG, PNG, WEBP and AVIF out, iPhone HEIC in. A live size estimate moves with the quality slider, or set a target like 200 KB.' },
  { icon: 'crop', name: 'Resize & crop', to: '/studio#crop', where: 'studio',
      desc: 'Pixels or percent with aspect lock. Crop presets for Instagram, LinkedIn, X and YouTube. Rotate and flip.' },
  { icon: 'tune', name: 'Adjust', to: '/studio#adjust', where: 'studio',
      desc: 'Brightness, contrast, saturation, grayscale and blur, checked against the original with a before/after slider.' },
  { icon: 'branding_watermark', name: 'Watermark', to: '/studio#watermark', where: 'studio',
      desc: 'Text or logo in any corner or tiled across the image, at the opacity you choose.' },
  { icon: 'blur_on', name: 'Redact', to: '/studio#redact', where: 'studio',
      desc: 'Blur or pixelate faces, number plates and addresses before you share a photo.' },
  { icon: 'palette', name: 'Metadata & palette', to: '/studio#metadata', where: 'studio',
      desc: 'Read the EXIF, strip location on export, and copy the image’s colour palette as hex codes.' },
  { icon: 'auto_fix_high', name: 'Background removal', to: '/studio#adjust', where: 'studio',
      desc: 'An optional AI model that downloads once, then cuts out subjects in your browser.' },
  { icon: 'apps', name: 'Icon & favicon pack', to: '/icons', where: 'page',
      desc: 'One logo in. Every favicon, touch icon, ICO file and manifest snippet out, zipped.' },
  { icon: 'picture_as_pdf', name: 'Images to PDF', to: '/pdf', where: 'page',
      desc: 'Drag pages into order, choose a page size and margins, save a single PDF.' },
];

export const STEPS = [
  { a: 'Drop, paste or ', k: 'browse', b: ' an image.' },
  { a: 'Pick a ', k: 'tool', b: ' from the rail.' },
  { a: 'Watch the ', k: 'file size', b: ' update as you tweak.' },
  { a: '', k: 'Download', b: ' it, or zip the whole batch.' },
];

export const STEP_TILTS = [-1.5, 1, -1, 1.5];

export const PRIVACY = [
  { icon: 'memory', title: 'Processed in this tab',
      text: 'Your browser does the decoding, editing and encoding. Konva has no upload endpoint, so there is nowhere for a file to go.' },
  { icon: 'location_off', title: 'Metadata stripped by default',
      text: 'Camera details and GPS location are removed when you export. You can switch it off per file if you need them.' },
  { icon: 'wifi_off', title: 'Works offline',
      text: 'Install Konva as an app. After the first visit every tool runs without a connection, including background removal once its model is cached.' },
];