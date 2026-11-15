import { useTheme } from '../../hooks/useTheme';
import Icon from '../ui/Icon';

export default function ThemeButton() {
  const { resolved, toggle } = useTheme();
  const dark = resolved === 'dark';
  return (
    <button
      type="button"
      className="k-iconbtn"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Icon name={dark ? 'light_mode' : 'dark_mode'} />
    </button>
  );
}