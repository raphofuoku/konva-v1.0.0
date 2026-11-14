/**
 * PageCard
 * Path: src/features/pdf/components/PageCard.jsx
 *
 * One page: a white sheet at the real page proportions with the margins and image fit
 * drawn in, the page number and file name, and move earlier / later / remove buttons.
 * A page still being read shows a shimmer and can't be moved yet.
 */
import Icon from '../../../components/ui/Icon';
import { pageSize } from '../pdfLayout';

export default function PageCard({ page, index, count, opts, busy, dragging, over, dragProps, onMove, onRemove }) {
  const ready = page.status === 'ready';
  const { pw, ph, m } = pageSize(page, opts);
  const fit = opts.size === 'fit' ? 'contain' : opts.fit;
  const n = index + 1;
  const locked = busy || !ready;

  return (
    <li
      className={`pdf-card${ready ? ' is-ready' : ''}${dragging ? ' is-dragging' : ''}${over ? ' is-over' : ''}`}
      draggable={!locked}
      {...(locked ? {} : dragProps)}
    >
      <div className="pdf-sheet" style={{ aspectRatio: `${pw} / ${ph}` }}>
        <div
          className="pdf-sheet__box"
          style={{ top: `${(m / ph) * 100}%`, bottom: `${(m / ph) * 100}%`, left: `${(m / pw) * 100}%`, right: `${(m / pw) * 100}%` }}
        >
          {ready ? (
            <img src={page.thumb} alt="" draggable={false} style={{ objectFit: fit }} />
          ) : (
            <div className="k-skeleton pdf-sheet__ph" />
          )}
        </div>
      </div>

      <div className="pdf-card__label">
        <span className="pdf-card__num">{String(n).padStart(2, '0')}</span>
        <span className="pdf-card__name" title={page.name}>
          {ready ? page.name : 'Reading…'}
        </span>
      </div>

      <div className="pdf-card__actions">
        <button
          type="button"
          className="pdf-act"
          data-page={page.id}
          data-act="left"
          aria-label={`Move page ${n} earlier`}
          disabled={locked || index === 0}
          onClick={() => onMove(index, -1)}
        >
          <Icon name="chevron_left" size={20} />
        </button>
        <button
          type="button"
          className="pdf-act"
          data-page={page.id}
          data-act="right"
          aria-label={`Move page ${n} later`}
          disabled={locked || index === count - 1}
          onClick={() => onMove(index, 1)}
        >
          <Icon name="chevron_right" size={20} />
        </button>
        <button
          type="button"
          className="pdf-act pdf-act--remove"
          data-page={page.id}
          data-act="remove"
          aria-label={`Remove page ${n}`}
          disabled={busy}
          onClick={() => onRemove(index)}
        >
          <Icon name="delete" size={18} />
        </button>
      </div>
    </li>
  );
}
