/**
 * PageGrid
 * Path: src/features/pdf/components/PageGrid.jsx
 *
 * The page list: count and size, then one card per page (drag to reorder, or the arrow
 * buttons for keyboard and touch), then the Add images tile. Keeps focus on the control
 * that was used after a page moves or is removed.
 */
import { useLayoutEffect, useRef, useState } from 'react';
import { fmt } from '../../../lib/konvaEngine';
import Icon from '../../../components/ui/Icon';
import { PAGE_TYPE } from '../pdfConstants';
import { pageSize } from '../pdfLayout';
import PageCard from './PageCard';

export default function PageGrid({ pp, drag, openPicker }) {
  const { pages, pagesRef, opts, move, remove, clear, busy, loadingCount, totalSize } = pp;
  const listRef = useRef(null);
  const focusRef = useRef(null); // { id, act } or { index } to restore after a change
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);

  // ---------- focus ----------
  useLayoutEffect(() => {
    const want = focusRef.current;
    const root = listRef.current;
    if (!want || !root) return;
    focusRef.current = null;
    const q = (id, act) => root.querySelector(`[data-page="${id}"][data-act="${act}"]`);
    if (want.id) {
      // A move: stay on the same arrow, or the other one if this end of the list disables it.
      const el = q(want.id, want.act);
      const alt = q(want.id, want.act === 'left' ? 'right' : 'left');
      (el && !el.disabled ? el : alt && !alt.disabled ? alt : q(want.id, 'remove'))?.focus();
      return;
    }
    // A removal: the page that took its place, else the one before, else Add images.
    const list = pagesRef.current;
    const next = list[want.index] || list[want.index - 1];
    (next ? q(next.id, 'remove') : root.querySelector('.pdf-add'))?.focus();
  }, [pages, pagesRef]);

  const onMove = (i, dir) => {
    const page = pagesRef.current[i];
    if (!page) return;
    focusRef.current = { id: page.id, act: dir < 0 ? 'left' : 'right' };
    move(i, i + dir);
  };
  const onRemove = (i) => {
    const page = pagesRef.current[i];
    if (!page) return;
    focusRef.current = { index: i };
    remove(page.id);
  };

  // ---------- drag to reorder ----------
  const endDrag = () => {
    setDragId(null);
    setOverId(null);
  };
  const dragProps = (page, i) => ({
    onDragStart: (e) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData(PAGE_TYPE, page.id);
      e.dataTransfer.setData('text/plain', page.name); // Firefox needs some data to start a drag
      setDragId(page.id);
    },
    onDragOver: (e) => {
      if (!dragId) return;
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'move';
      if (overId !== page.id) setOverId(page.id);
    },
    onDragLeave: (e) => {
      if (overId === page.id && !e.currentTarget.contains(e.relatedTarget)) setOverId(null);
    },
    onDrop: (e) => {
      if (!dragId) return;
      e.preventDefault();
      e.stopPropagation();
      const from = pagesRef.current.findIndex((p) => p.id === dragId);
      endDrag();
      if (from >= 0 && from !== i) move(from, i);
    },
    onDragEnd: endDrag,
  });

  const first = pages.find((p) => p.status === 'ready') || pages[0];
  const firstSize = pageSize(first, opts);
  const count = `${pages.length} page${pages.length === 1 ? '' : 's'}`;

  return (
    <>
      <div className="pdf-bar">
        <p className="pdf-bar__count">
          {count} <span className="pdf-bar__size">{loadingCount ? `reading ${loadingCount}…` : fmt(totalSize)}</span>
        </p>
        <p className="pdf-bar__hint">Drag to reorder, or use the arrows</p>
        <button type="button" className="k-btn k-btn--ghost pdf-bar__clear" onClick={clear} disabled={!!busy}>
          <Icon name="delete_sweep" size={18} />
          Remove all
        </button>
      </div>

      <ol ref={listRef} className={`pdf-grid${dragId ? ' is-sorting' : ''}`}>
        {pages.map((page, i) => (
          <PageCard
            key={page.id}
            page={page}
            index={i}
            count={pages.length}
            opts={opts}
            busy={!!busy}
            dragging={dragId === page.id}
            over={!!dragId && overId === page.id && dragId !== page.id}
            dragProps={dragProps(page, i)}
            onMove={onMove}
            onRemove={onRemove}
          />
        ))}
        <li className="pdf-add-cell">
          <button
            type="button"
            className={`pdf-add${drag ? ' is-hot' : ''}`}
            style={{ aspectRatio: `${firstSize.pw} / ${firstSize.ph}` }}
            onClick={openPicker}
            disabled={!!busy}
          >
            <Icon name={drag ? 'download' : 'add'} size={32} />
            <span>{drag ? 'Let go to add' : 'Add images'}</span>
          </button>
          <span className="pdf-add-cell__spacer" aria-hidden="true" />
        </li>
      </ol>
    </>
  );
}
