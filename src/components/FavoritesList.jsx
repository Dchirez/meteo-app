import styles from './FavoritesList.module.css';

/**
 * Liste horizontale des villes favorites (persistées en localStorage).
 * Puce active mise en avant. Le « ✕ » retire le favori.
 * @param {Array} favorites
 * @param {object|null} activeCity
 * @param {(city) => void} onSelect
 * @param {(city) => void} onRemove
 */
export default function FavoritesList({ favorites, activeCity, onSelect, onRemove }) {
  if (!favorites.length) return null;

  const isActive = (f) =>
    activeCity &&
    Math.abs(f.latitude - activeCity.latitude) < 0.01 &&
    Math.abs(f.longitude - activeCity.longitude) < 0.01;

  return (
    <div className={`${styles.track} scroll-x`} aria-label="Villes favorites">
      {favorites.map((f) => (
        <div
          key={`${f.latitude},${f.longitude}`}
          className={`${styles.chip} ${isActive(f) ? styles.active : ''}`}
        >
          <button
            type="button"
            className={styles.name}
            onClick={() => onSelect(f)}
          >
            {f.name}
          </button>
          <button
            type="button"
            className={styles.remove}
            onClick={() => onRemove(f)}
            aria-label={`Retirer ${f.name} des favoris`}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
