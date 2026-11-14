/**
 * PageEmpty
 * Path: src/features/pdf/components/PageEmpty.jsx
 *
 * No pages yet: the white halo dropzone with a Browse button. Lights up while files are
 * dragged anywhere over the main area.
 */
import Icon from '../../../components/ui/Icon';
import { MOD_KEY } from '../../studio/studioUi';
import { COPY } from '../pdfConstants';

export default function PageEmpty({ drag, openPicker }) {
  return (
    <div className="pdf-empty">
      <div className={`k-sticker pdf-drop${drag ? ' is-hot' : ''}`}>
        <span className="pdf-drop__badge">
          <Icon name={drag ? 'download' : 'note_stack_add'} size={32} />
        </span>
        <p className="pdf-drop__title">{drag ? 'Let go to add the pages' : 'Drop images to make pages'}</p>
        <p className="pdf-drop__hint">{COPY.formats}</p>
        <button type="button" className="k-btn pdf-drop__btn" onClick={openPicker}>
          <Icon name="folder_open" />
          Browse images
        </button>
        <p className="pdf-drop__paste">
          or paste with <span className="k-kbd">{MOD_KEY}</span> <span className="k-kbd">V</span>
        </p>
      </div>
    </div>
  );
}
