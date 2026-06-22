import styles from './states.module.css';

/**
 * Écran de chargement (skeleton) qui mime la mise en page réelle :
 * carte météo actuelle + bandeau horaire + lignes journalières.
 */
export default function Skeleton() {
  return (
    <div className={styles.wrap} aria-busy="true" aria-label="Chargement de la météo">
      <div className={`${styles.block} ${styles.current}`} />
      <div className={styles.row}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`${styles.block} ${styles.hour}`} />
        ))}
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={`${styles.block} ${styles.day}`} />
      ))}
    </div>
  );
}
