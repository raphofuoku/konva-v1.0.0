import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { dataUrlToBlob } from './image';

/**
 * Bundles multiple converted images into a single ZIP and triggers the
 * download. Replaces the old "click Download N times" flow from
 * ConvertOptionsPage.
 */
export async function downloadAsZip(items, zipFilename = 'konva-images.zip') {
  const zip = new JSZip();

  await Promise.all(
    items.map(async ({ dataUrl, filename }) => {
      const blob = await dataUrlToBlob(dataUrl);
      zip.file(filename, blob);
    })
  );

  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, zipFilename);
}
