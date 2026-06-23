import styles from './DailyForecast.module.css';

/**
 * Prévisions sur 7 jours : icône, probabilité de pluie, barre de plage min↔max.
 * Chaque ligne est cliquable et met à jour la carte principale.
 * @param {Array} rows - {index, dayLabel, icon, rainStr, hiStr, loStr, barLeft, barWidth}
 * @param {number|null} selectedIndex
 * @param {(index:number) => void} onSelect
 */
export default function DailyForecast({ rows, selectedIndex, onSelect }) {
  if (!rows?.length) return null;

  return (
    <section className={styles.section} aria-label="Prévisions sur 7 jours">
      <h2 className={styles.title}>7 prochains jours</h2>
      <ul className={styles.list}>
        {rows.map((d) => {
          const selected = d.index === selectedIndex;
          return (
            <li key={d.index}>
              <button
                type="button"
                onClick={() => onSelect(d.index)}
                className={`${styles.row} ${selected ? styles.selected : ''}`}
                aria-pressed={selected}
              >
                <span className={styles.day}>{d.dayLabel}</span>
                <span className={styles.icon} aria-hidden="true">
                  {d.icon}
                </span>
                <span className={styles.temps}>
                  {d.rainStr && <span className={styles.rain}>{d.rainStr}</span>}
                  <span className={styles.lo}>{d.loStr}</span>
                  <span className={styles.bar}>
                    <span
                      className={styles.barFill}
                      style={{ left: `${d.barLeft}%`, width: `${d.barWidth}%` }}
                    />
                  </span>
                  <span className={styles.hi}>{d.hiStr}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
