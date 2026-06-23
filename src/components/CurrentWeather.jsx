import styles from './CurrentWeather.module.css';

/**
 * Carte météo principale (« héros »).
 * Reflète la sélection courante (maintenant / une heure / un jour) via `hero`.
 * @param {object} hero - vue formatée (icon, label, tempStr, feelsStr, humidityStr,
 *                        windStr, hiStr, loStr, context, isNow)
 * @param {object} city - ville affichée (nom + région)
 * @param {boolean} isFavorite
 * @param {() => void} onToggleFavorite
 * @param {() => void} onReset - revient à « Maintenant »
 */
export default function CurrentWeather({
  hero,
  city,
  isFavorite,
  onToggleFavorite,
  onReset,
}) {
  if (!hero) return null;

  const place = city?.name ?? 'Position actuelle';
  const region = [city?.admin1, city?.country].filter(Boolean).join(', ');

  return (
    <section className={styles.card} aria-label="Météo">
      <div className={styles.innerGlow} aria-hidden="true" />

      <header className={styles.head}>
        <div>
          <h1 className={styles.city}>{place}</h1>
          {region && <p className={styles.region}>{region}</p>}
        </div>
        <button
          type="button"
          className={styles.fav}
          onClick={onToggleFavorite}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          {isFavorite ? '★' : '☆'}
        </button>
      </header>

      {/* Puce de contexte + bouton de retour à « Maintenant » */}
      <div className={styles.ctxRow}>
        <span className={styles.ctxChip}>{hero.context}</span>
        {!hero.isNow && (
          <button type="button" className={styles.reset} onClick={onReset}>
            ↺ Maintenant
          </button>
        )}
      </div>

      <div className={styles.main}>
        <span className={styles.icon} aria-hidden="true">
          {hero.icon}
        </span>
        <div className={styles.tempBlock}>
          <span className={styles.temp}>{hero.tempStr}</span>
          <span className={styles.label}>{hero.label}</span>
          <span className={styles.hilo}>
            ↑ {hero.hiStr}&nbsp;&nbsp;↓ {hero.loStr}
          </span>
        </div>
      </div>

      <dl className={styles.details}>
        <div className={styles.detail}>
          <dt>Ressenti</dt>
          <dd>{hero.feelsStr}</dd>
        </div>
        <div className={styles.detail}>
          <dt>Humidité</dt>
          <dd>{hero.humidityStr}</dd>
        </div>
        <div className={styles.detail}>
          <dt>Vent</dt>
          <dd>{hero.windStr}</dd>
        </div>
      </dl>
    </section>
  );
}
