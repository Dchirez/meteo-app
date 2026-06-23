import styles from './HourlyForecast.module.css';

/**
 * Prévisions horaires (24 h) en scroll horizontal.
 * Chaque cellule est cliquable et met à jour la carte principale.
 * @param {Array} cells - {index, hourLabel, icon, tempStr, isNow}
 * @param {number|null} selectedIndex - index horaire sélectionné (ou null)
 * @param {(index:number) => void} onSelect
 */
export default function HourlyForecast({ cells, selectedIndex, onSelect }) {
  if (!cells?.length) return null;

  return (
    <section className={styles.section} aria-label="Prévisions horaires (24 h)">
      <h2 className={styles.title}>Aujourd'hui</h2>
      <div className={`${styles.track} scroll-x`}>
        {cells.map((c) => {
          const selected = c.index === selectedIndex;
          return (
            <button
              key={c.index}
              type="button"
              onClick={() => onSelect(c.index)}
              className={`${styles.cell} ${c.isNow ? styles.now : ''} ${
                selected ? styles.selected : ''
              }`}
              aria-pressed={selected}
            >
              <span className={styles.hour}>{c.hourLabel}</span>
              <span className={styles.icon} aria-hidden="true">
                {c.icon}
              </span>
              <span className={styles.temp}>{c.tempStr}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
