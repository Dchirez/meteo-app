import { describeWeather } from '../utils/weatherCodes';
import { formatTemp, formatDayShort, isToday } from '../utils/format';
import styles from './DailyForecast.module.css';

/**
 * Prévisions sur 7 jours : icône, min/max, probabilité de pluie.
 * @param {object} daily - bloc `daily` de l'API
 * @param {'C'|'F'} unit
 */
export default function DailyForecast({ daily, unit }) {
  if (!daily?.time) return null;

  return (
    <section className={styles.section} aria-label="Prévisions sur 7 jours">
      <h2 className={styles.title}>7 prochains jours</h2>
      <ul className={styles.list}>
        {daily.time.map((date, i) => {
          const { icon, label } = describeWeather(daily.weather_code[i], true);
          const rain = daily.precipitation_probability_max?.[i];
          return (
            <li key={date} className={styles.row}>
              <span className={styles.day}>
                {isToday(date) ? "Auj." : formatDayShort(date)}
              </span>
              <span className={styles.icon} aria-hidden="true" title={label}>
                {icon}
              </span>
              <span className={styles.rain}>
                {rain != null ? `💧 ${rain}%` : ''}
              </span>
              <span className={styles.temps}>
                <span className={styles.max}>
                  {formatTemp(daily.temperature_2m_max[i], unit)}
                </span>
                <span className={styles.min}>
                  {formatTemp(daily.temperature_2m_min[i], unit)}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
