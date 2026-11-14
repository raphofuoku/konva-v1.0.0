/**
 * PdfSettings
 * Path: src/features/pdf/components/PdfSettings.jsx
 *
 * The settings card: page size, orientation, margins, image fit, file name, fact chips,
 * the processing, success and error states, and the Save PDF button.
 */
import { fmt } from '../../../lib/konvaEngine';
import Icon from '../../../components/ui/Icon';
import { Seg } from '../../studio/panels/controls';
import { COPY, FIT_OPTS, MARGIN_OPTS, ORIENT_OPTS, SIZE_OPTS } from '../pdfConstants';
import { dimsLabel, marginLabel } from '../pdfLayout';

const off = (options) => options.map((o) => ({ ...o, disabled: true }));

function Group({ title, children }) {
  return (
    <div className="pdf-group">
      <h2 className="k-eyebrow">{title}</h2>
      {children}
    </div>
  );
}

export default function PdfSettings({ pp }) {
  const { pages, opts, setOpt, fname, setFname, busy, saved, error, canSave, savePdf } = pp;
  const fitPage = opts.size === 'fit';

  const pct = busy ? Math.round((busy.done / busy.total) * 100) : 0;
  const busyText = busy
    ? busy.done < busy.total
      ? `Writing page ${busy.done + 1} of ${busy.total}`
      : 'Putting the PDF together'
    : '';

  return (
    <aside className="k-card pdf-settings" aria-label="PDF settings">
      <Group title="Page size">
        <Seg label="Page size" options={SIZE_OPTS} value={opts.size} onChange={(size) => setOpt({ size })} />
      </Group>

      <Group title="Orientation">
        <Seg
          label="Orientation"
          options={fitPage ? off(ORIENT_OPTS) : ORIENT_OPTS}
          value={fitPage ? null : opts.orient}
          onChange={(orient) => setOpt({ orient })}
        />
      </Group>

      <Group title="Margins">
        <Seg label="Margins" options={MARGIN_OPTS} value={opts.margin} onChange={(margin) => setOpt({ margin })} />
      </Group>

      <Group title="Image on the page">
        <Seg
          label="Image fit"
          options={fitPage ? off(FIT_OPTS) : FIT_OPTS}
          value={fitPage ? null : opts.fit}
          onChange={(fit) => setOpt({ fit })}
        />
        {fitPage && <p className="pdf-hint">{COPY.fitHint}</p>}
      </Group>

      <label className="pdf-name">
        File name
        <span className="pdf-name__row">
          <input
            className="k-field"
            type="text"
            value={fname}
            spellCheck={false}
            autoComplete="off"
            onChange={(e) => setFname(e.target.value)}
          />
          <span className="pdf-name__ext">.pdf</span>
        </span>
      </label>

      <div className="pdf-chips">
        <span className="k-chip">
          <Icon name="description" size={14} />
          pages <b>{pages.length}</b>
        </span>
        <span className="k-chip">
          <Icon name="straighten" size={14} />
          page <b>{dimsLabel(opts)}</b>
        </span>
        <span className="k-chip k-chip--vio">
          <Icon name="padding" size={14} />
          margin <b>{marginLabel(opts)}</b>
        </span>
        {saved && (
          <span className="k-chip k-chip--ok">
            <Icon name="picture_as_pdf" size={14} />
            pdf <b>{fmt(saved.size)}</b>
          </span>
        )}
      </div>

      {busy && (
        <div className="pdf-status" role="status" aria-live="polite">
          <div className="pdf-status__row">
            <span>{busyText}</span>
            <b>{pct}%</b>
          </div>
          <div className="k-progress">
            <div className="k-progress__bar" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
      {saved && !busy && (
        <p className="k-note k-note--ok pdf-note" role="status">
          <Icon name="check_circle" size={22} />
          <span>{COPY.saved(saved.name, saved.count, fmt(saved.size))}</span>
        </p>
      )}
      {error && !busy && (
        <p className="k-note k-note--bad pdf-note" role="alert">
          <Icon name="error" size={22} />
          <span>{error}</span>
        </p>
      )}

      <button type="button" className="k-btn k-btn--block" onClick={savePdf} disabled={!canSave}>
        <Icon name="picture_as_pdf" />
        {busy ? 'Writing PDF…' : 'Save PDF'}
      </button>
      <p className="pdf-hint">{COPY.footnote}</p>
    </aside>
  );
}
