import styles from './states.module.css';

/** Affichage "vide" : aucune ville sélectionnée. */
export default function EmptyState() {
  return (
    <div className={styles.state}>
      <span className={styles.emoji}>🔍</span>
      <p className={styles.title}>Aucune ville sélectionnée</p>
      <p className={styles.text}>
        Recherchez une ville ci-dessus ou autorisez la géolocalisation pour voir
        la météo.
      </p>
    </div>
  );
}
