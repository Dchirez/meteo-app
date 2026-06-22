import { describeWeather } from '../utils/weatherCodes';
import { formatTemp } from '../utils/format';
import styles from './CurrentWeather.module.css';

/**
 * Carte "météo actuelle".
 * @param {object} current - bloc `current` de l'API Open-Meteo
 * @param {object} city - ville sélectionnée (pour le titre)
 * @param {'C'|'F'} unit
 * @param {boolean} isFavorite
 * @param {() => void} onToggleFavorite
 */
export default function CurrentWeather({
  current,
  city,
  unit,
  isFavorite,
  onToggleFavorite,
}) {
  if (!current) return null;

  const isDay = current.is_day === 1;
  const { icon, label } = describeWeather(current.weather_code, isDay);

  const place = city?.name ?? 'Position actuelle';
  const region = [city?.admin1, city?.country].filter(Boolean).join(', ');

  return (
    <section className={styles.card} aria-label="Météo actuelle">
      <header className={styles.head}>
        <div className={styles.place}>
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

      <div className={styles.main}>
        <span className={styles.icon} aria-hidden="true">{icon}</span>
        <div className={styles.tempBlock}>
          <span className={styles.temp}>{formatTemp(current.temperature_2m, unit)}</span>
          <span className={styles.desc}>{label}</span>
        </div>
      </div>

      <dl className={styles.details}>
        <div className={styles.detail}>
          <dt>Ressenti</dt>
          <dd>{formatTemp(current.apparent_temperature, unit)}</dd>
        </div>
        <div className={styles.detail}>
          <dt>Humidité</dt>
          <dd>{current.relative_humidity_2m}%</dd>
        </div>
        <div className={styles.detail}>
          <dt>Vent</dt>
          <dd>{Math.round(current.wind_speed_10m)} km/h</dd>
        </div>
      </dl>
    </section>
  );
}
