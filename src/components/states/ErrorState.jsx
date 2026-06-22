import styles from './states.module.css';

/**
 * Affichage d'erreur (ville introuvable, réseau…) avec action de réessai.
 * @param {string} message
 * @param {() => void} [onRetry]
 */
export default function ErrorState({ message, onRetry }) {
  return (
    <div className={styles.state} role="alert">
      <span className={styles.emoji}>⚠️</span>
      <p className={styles.title}>Oups…</p>
      <p className={styles.text}>{message || 'Une erreur est survenue.'}</p>
      {onRetry && (
        <button type="button" className={styles.retry} onClick={onRetry}>
          Réessayer
        </button>
      )}
    </div>
  );
}
