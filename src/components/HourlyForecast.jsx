import { describeWeather } from '../utils/weatherCodes';
import { formatTemp, formatHour, isCurrentHour } from '../utils/format';
import styles from './HourlyForecast.module.css';

/**
 * Prévisions horaires sur 24 h, en scroll horizontal.
 * @param {object} hourly - bloc `hourly` de l'API
 * @param {'C'|'F'} unit
 */
export default function HourlyForecast({ hourly, unit }) {
  if (!hourly?.time) return null;

  // On démarre à l'heure courante et on prend les 24 heures suivantes.
  const now = Date.now();
  const startIndex = Math.max(
    0,
    hourly.time.findIndex((t) => new Date(t).getTime() >= now - 3600000)
  );
  const indices = [];
  for (let i = startIndex; i < startIndex + 24 && i < hourly.time.length; i++) {
    indices.push(i);
  }

  return (
    <section className={styles.section} aria-label="Prévisions horaires (24 h)">
      <h2 className={styles.title}>Aujourd'hui</h2>
      <div className={`${styles.track} scroll-x`}>
        {indices.map((i) => {
          const time = hourly.time[i];
          const isDay = hourly.is_day ? hourly.is_day[i] === 1 : true;
          const { icon } = describeWeather(hourly.weather_code[i], isDay);
          const current = isCurrentHour(time);
          return (
            <div
              key={time}
              className={`${styles.cell} ${current ? styles.now : ''}`}
            >
              <span className={styles.hour}>
                {current ? "Maint." : formatHour(time)}
              </span>
              <span className={styles.icon} aria-hidden="true">{icon}</span>
              <span className={styles.temp}>
                {formatTemp(hourly.temperature_2m[i], unit)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
