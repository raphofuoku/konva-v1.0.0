/**
 * PdfPage
 * Path: src/features/pdf/PdfPage.jsx
 *
 * Images to PDF: drop or paste images, drag them into order, pick the page size, orientation,
 * margins and fit, then save one PDF written on this device. Pages on the left, settings on
 * the right (stacked below about 900px). The whole main area takes file drops.
 */
import { useEffect, useRef, useState } from 'react';
import TopBar from '../../components/layout/TopBar';
import SiteFooter from '../../components/layout/SiteFooter';
import { usePdfPages } from './usePdfPages';
import { ACCEPT } from './pdfConstants';
import PageEmpty from './components/PageEmpty';
import PageGrid from './components/PageGrid';
import PdfSettings from './components/PdfSettings';
import './Pdf.css';

const hasFiles = (e) => [...(e.dataTransfer?.types || [])].includes('Files');

export default function PdfPage() {
  const pp = usePdfPages();
  const fileRef = useRef(null);
  const [drag, setDrag] = useState(false);

  const openPicker = () => fileRef.current?.click();

  // A file dropped outside the main area would otherwise replace the page.
  useEffect(() => {
    const block = (e) => e.preventDefault();
    window.addEventListener('dragover', block);
    window.addEventListener('drop', block);
    return () => {
      window.removeEventListener('dragover', block);
      window.removeEventListener('drop', block);
    };
  }, []);

  // Page cards being reordered carry no files, so only real file drags light up the drop target.
  const onDragOver = (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = pp.busy ? 'none' : 'copy';
    if (!drag && !pp.busy) setDrag(true);
  };
  const onDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setDrag(false);
  };
  const onDrop = (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    setDrag(false);
    if (e.dataTransfer.files?.length) pp.add(e.dataTransfer.files);
  };

  const empty = pp.pages.length === 0;

  return (
    <div className="pdf-page k-dotgrid">
      <TopBar />

      <main id="k-main" tabIndex={-1} className="pdf" onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
        <div className="pdf-head">
          <div className="pdf-head__titles">
            <h1 className="k-headline k-headline--h1 is-entering">Images to PDF.</h1>
            <p className="k-caption k-caption--shadow is-entering pdf-head__caption">
              Drag the pages into <em>order</em>.
            </p>
          </div>
          <p className="pdf-head__lede">
            Receipts, scans, screenshots. Each image becomes a page, and the PDF is written on this device.
          </p>
        </div>

        <div className="pdf-grid-wrap">
          <section className="pdf-pages" aria-label="Pages">
            {empty ? (
              <PageEmpty drag={drag} openPicker={openPicker} />
            ) : (
              <PageGrid pp={pp} drag={drag} openPicker={openPicker} />
            )}
          </section>
          <PdfSettings pp={pp} />
        </div>

        <p className="pdf-sr" role="status" aria-live="polite">
          {pp.live}
        </p>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept={ACCEPT}
          hidden
          onChange={(e) => {
            pp.add(e.target.files);
            e.target.value = '';
          }}
        />
      </main>

      <SiteFooter />
    </div>
  );
}
