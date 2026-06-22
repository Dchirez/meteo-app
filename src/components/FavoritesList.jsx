import styles from './FavoritesList.module.css';

/**
 * Liste horizontale des villes favorites (persistées en localStorage).
 * @param {Array} favorites
 * @param {object|null} activeCity - ville actuellement affichée
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
    <section className={styles.section} aria-label="Villes favorites">
      <h2 className={styles.title}>Favoris</h2>
      <div className={`${styles.track} scroll-x`}>
        {favorites.map((f) => (
          <div
            key={`${f.latitude},${f.longitude}`}
            className={`${styles.chip} ${isActive(f) ? styles.active : ''}`}
          >
            <button
              type="button"
              className={styles.chipName}
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
    </section>
  );
}
