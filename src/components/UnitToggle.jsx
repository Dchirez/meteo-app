import styles from './UnitToggle.module.css';

/**
 * Bascule °C / °F.
 * @param {'C'|'F'} unit
 * @param {(u:'C'|'F') => void} onChange
 */
export default function UnitToggle({ unit, onChange }) {
  return (
    <div className={styles.toggle} role="group" aria-label="Unité de température">
      <button
        type="button"
        className={`${styles.btn} ${unit === 'C' ? styles.active : ''}`}
        onClick={() => onChange('C')}
        aria-pressed={unit === 'C'}
      >
        °C
      </button>
      <button
        type="button"
        className={`${styles.btn} ${unit === 'F' ? styles.active : ''}`}
        onClick={() => onChange('F')}
        aria-pressed={unit === 'F'}
      >
        °F
      </button>
    </div>
  );
}
