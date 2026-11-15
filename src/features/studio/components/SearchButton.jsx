/**
 * SearchButton
 * Path: src/features/studio/components/SearchButton.jsx
 *
 * "Search tools" button for the Studio top bar. Opens the command palette.
 * Icon only below 820px; the shortcut hint shows on desktop.
 */
import Icon from '../../../components/ui/Icon';
import { MOD_KEY } from '../studioUi';
import './Overlays.css';

export default function SearchButton({ onClick }) {
  return (
    <button
      type="button"
      className="studio-search"
      onClick={onClick}
      aria-label="Search tools and commands"
      aria-keyshortcuts={MOD_KEY === '⌘' ? 'Meta+K' : 'Control+K'}
    >
      <Icon name="search" />
      <span className="studio-search__label">Search tools</span>
      <kbd className="studio-search__kbd">{MOD_KEY} K</kbd>
    </button>
  );
}