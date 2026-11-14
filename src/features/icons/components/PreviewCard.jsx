/**
 * PreviewCard
 * Path: src/features/icons/components/PreviewCard.jsx
 *
 * Every generated icon on a light and a dark tile (real size up to 64 px), plus a browser
 * tab in both themes and a home-screen tile.
 */
import Icon from '../../../components/ui/Icon';
import { DEFAULT_META, SPECS } from '../iconConstants';

const REAL_MAX = 64;

function Tile({ icon, dark, loading, shape }) {
  const big = icon.size > REAL_MAX;
  const style = big ? undefined : { width: icon.size, height: icon.size };
  return (
    <td className={`icons-tile icons-tile--${dark ? 'dark' : 'light'}`}>
      {icon.url ? (
        <img src={icon.url} alt={dark ? '' : `${icon.file} preview`} className={big ? 'is-big' : undefined} style={style} />
      ) : (
        <span
          className={`icons-tile__ph icons-tile__ph--${shape}${big ? ' is-big' : ''}${loading ? ' k-skeleton' : ''}`}
          style={style}
        />
      )}
    </td>
  );
}

export default function PreviewCard({ ip }) {
  const { src, icons, loading, meta, opts } = ip;
  const list = src && icons.length ? icons : SPECS;
  const tabIcon = src && icons.find((i) => i.id === 'fav32')?.url;
  const homeIcon = src && icons.find((i) => i.id === 'apple')?.url;
  const name = meta.name.trim() || DEFAULT_META.name;
  const short = meta.short.trim() || name;

  return (
    <section className="k-card k-card--flush" aria-labelledby="icons-preview-title">
      <div className="icons-card-head">
        <h2 id="icons-preview-title" className="icons-card-head__title">Every size, light and dark</h2>
        <span className="icons-card-head__aside">shown at real size up to 64 px</span>
      </div>

      <table className="icons-table">
        <caption className="icons-sr">Generated icons on light and dark backgrounds</caption>
        <thead className="icons-sr">
          <tr>
            <th scope="col">Icon</th>
            <th scope="col">On light</th>
            <th scope="col">On dark</th>
          </tr>
        </thead>
        <tbody>
          {list.map((icon) => (
            <tr key={icon.id}>
              <th scope="row" className="icons-table__use">
                <span className="icons-table__name">{icon.use}</span>
                <span className="icons-table__file">
                  {icon.file} · {icon.size}×{icon.size}
                </span>
              </th>
              <Tile icon={icon} loading={loading} shape={icon.solid ? 'square' : opts.shape} />
              <Tile icon={icon} loading={loading} shape={icon.solid ? 'square' : opts.shape} dark />
            </tr>
          ))}
        </tbody>
      </table>

      <div className="icons-mocks" role="group" aria-label="Browser tab and home screen">
        <div className="icons-tab icons-tab--light">
          {tabIcon ? <img src={tabIcon} alt="" width={16} height={16} /> : <span className="icons-tab__ph" />}
          <span className="icons-tab__name">{name}</span>
          <Icon name="close" size={16} />
        </div>
        <div className="icons-tab icons-tab--dark">
          {tabIcon ? <img src={tabIcon} alt="" width={16} height={16} /> : <span className="icons-tab__ph" />}
          <span className="icons-tab__name">{name}</span>
          <Icon name="close" size={16} />
        </div>
        <div className="icons-home">
          {homeIcon ? <img src={homeIcon} alt="" width={60} height={60} /> : <span className="icons-home__ph" />}
          <span className="icons-home__name">{short}</span>
        </div>
      </div>
    </section>
  );
}
