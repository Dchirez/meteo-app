// Construction des vues d'affichage à partir des données brutes Open-Meteo.
// Centralise toute la logique : carte principale (« héros ») selon la sélection
// (maintenant / une heure / un jour), cellules horaires, lignes quotidiennes.

import { describeWeather } from './weatherCodes';
import { formatTemp } from './format';

const FULL_DAYS = [
  'Dimanche',
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
];
const SHORT_DAYS = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];

/** Date locale au format YYYY-MM-DD (cohérent avec les `time` d'Open-Meteo). */
function localDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parse une date locale "YYYY-MM-DD" sans décalage de fuseau. */
function parseLocalDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`);
}

/** Index de la 1re heure >= maintenant (début du défilé horaire). */
function hourlyStartIndex(hourly) {
  const now = Date.now();
  const idx = hourly.time.findIndex(
    (t) => new Date(t).getTime() >= now - 3600_000
  );
  return idx < 0 ? 0 : idx;
}

/** Humidité moyenne (réelle) d'une journée, calculée depuis les heures de cette date. */
function avgHumidityForDate(hourly, dateStr) {
  let sum = 0;
  let count = 0;
  for (let i = 0; i < hourly.time.length; i++) {
    if (hourly.time[i].startsWith(dateStr) && hourly.relative_humidity_2m?.[i] != null) {
      sum += hourly.relative_humidity_2m[i];
      count += 1;
    }
  }
  return count ? Math.round(sum / count) : null;
}

/**
 * Construit toutes les vues d'affichage.
 * @param {object} data - réponse Open-Meteo (current/hourly/daily)
 * @param {'C'|'F'} unit
 * @param {{kind:'now'}|{kind:'hour',index:number}|{kind:'day',index:number}} selection
 */
export function buildView(data, unit, selection) {
  const { current, hourly, daily } = data;
  const T = (c) => formatTemp(c, unit); // -> "21°"
  const maxArr = daily.temperature_2m_max;
  const minArr = daily.temperature_2m_min;

  // --- Cellules horaires (24 h à partir de maintenant) ---
  const start = hourlyStartIndex(hourly);
  const hourlyCells = [];
  for (let k = 0; k < 24 && start + k < hourly.time.length; k++) {
    const i = start + k;
    const d = new Date(hourly.time[i]);
    const isDay = hourly.is_day
      ? hourly.is_day[i] === 1
      : d.getHours() >= 7 && d.getHours() < 21;
    const { icon } = describeWeather(hourly.weather_code[i], isDay);
    const isNow = k === 0;
    hourlyCells.push({
      index: i,
      hourLabel: isNow ? 'Maint.' : `${d.getHours()}h`,
      icon,
      tempStr: T(hourly.temperature_2m[i]),
      isNow,
    });
  }

  // --- Lignes quotidiennes (barre de plage relative au min/max de la semaine) ---
  const gMax = Math.max(...maxArr);
  const gMin = Math.min(...minArr);
  const span = gMax - gMin || 1;
  const dailyRows = daily.time.map((date, i) => {
    const { icon } = describeWeather(daily.weather_code[i], true);
    const hi = maxArr[i];
    const lo = minArr[i];
    const rain = daily.precipitation_probability_max?.[i];
    return {
      index: i,
      dayLabel: i === 0 ? 'Auj.' : SHORT_DAYS[parseLocalDate(date).getDay()],
      icon,
      rainStr: rain != null && rain >= 20 ? `💧 ${rain}%` : '',
      hiStr: T(hi),
      loStr: T(lo),
      barLeft: ((lo - gMin) / span) * 100,
      barWidth: ((hi - lo) / span) * 100,
    };
  });

  // --- Carte principale (« héros ») selon la sélection ---
  const hero = buildHero();

  return { hero, hourlyCells, dailyRows };

  // ------------------------------------------------------------------

  function formatHero(h) {
    return {
      icon: h.icon,
      label: h.label,
      tempStr: T(h.tempC),
      feelsStr: T(h.feelsC),
      humidityStr: h.humidity != null ? `${Math.round(h.humidity)}%` : '—',
      windStr: h.wind != null ? `${Math.round(h.wind)} km/h` : '—',
      hiStr: T(h.hiC),
      loStr: T(h.loC),
      context: h.context,
      isNow: h.isNow,
    };
  }

  function hourContext(date, dateStr) {
    const today = localDateStr(new Date());
    const tomorrow = localDateStr(new Date(Date.now() + 86_400_000));
    const hh = `${String(date.getHours()).padStart(2, '0')}h00`;
    let day;
    if (dateStr === today) day = "Aujourd'hui";
    else if (dateStr === tomorrow) day = 'Demain';
    else day = FULL_DAYS[date.getDay()];
    return `${day} · ${hh}`;
  }

  function buildHero() {
    // Heure sélectionnée
    if (selection.kind === 'hour') {
      const i = selection.index;
      const d = new Date(hourly.time[i]);
      const dateStr = hourly.time[i].slice(0, 10);
      const isDay = hourly.is_day
        ? hourly.is_day[i] === 1
        : d.getHours() >= 7 && d.getHours() < 21;
      const { icon, label } = describeWeather(hourly.weather_code[i], isDay);
      const di = daily.time.indexOf(dateStr);
      const dd = di >= 0 ? di : 0;
      return formatHero({
        icon,
        label,
        tempC: hourly.temperature_2m[i],
        feelsC: hourly.apparent_temperature?.[i] ?? hourly.temperature_2m[i],
        humidity: hourly.relative_humidity_2m?.[i],
        wind: hourly.wind_speed_10m?.[i],
        hiC: maxArr[dd],
        loC: minArr[dd],
        context: hourContext(d, dateStr),
        isNow: false,
      });
    }

    // Jour sélectionné
    if (selection.kind === 'day') {
      const i = selection.index;
      const dateStr = daily.time[i];
      const { icon, label } = describeWeather(daily.weather_code[i], true);
      return formatHero({
        icon,
        label,
        tempC: maxArr[i],
        feelsC: daily.apparent_temperature_max?.[i] ?? maxArr[i],
        humidity: avgHumidityForDate(hourly, dateStr),
        wind: daily.wind_speed_10m_max?.[i],
        hiC: maxArr[i],
        loC: minArr[i],
        context: i === 0 ? "Aujourd'hui" : FULL_DAYS[parseLocalDate(dateStr).getDay()],
        isNow: false,
      });
    }

    // Maintenant (par défaut)
    const isDay = current.is_day === 1;
    const { icon, label } = describeWeather(current.weather_code, isDay);
    return formatHero({
      icon,
      label,
      tempC: current.temperature_2m,
      feelsC: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      wind: current.wind_speed_10m,
      hiC: maxArr[0],
      loC: minArr[0],
      context: 'Maintenant',
      isNow: true,
    });
  }
}
