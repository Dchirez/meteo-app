// Module isolant tous les appels à l'API Open-Meteo (gratuite, sans clé).
// Aucun composant ne fait de fetch directement : tout passe par ici.

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

/** Erreur métier personnalisée pour distinguer réseau / données. */
export class ApiError extends Error {
  constructor(message, { kind = 'network' } = {}) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind; // 'network' | 'notfound'
  }
}

/**
 * Recherche de villes (géocodage).
 * @param {string} name - nom de la ville saisi
 * @param {AbortSignal} [signal] - pour annuler les requêtes obsolètes (autocomplétion)
 * @returns {Promise<Array>} liste de résultats normalisés
 */
export async function searchCity(name, signal) {
  const query = name.trim();
  if (!query) return [];

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(
    query
  )}&count=5&language=fr&format=json`;

  let res;
  try {
    res = await fetch(url, { signal });
  } catch (err) {
    if (err.name === 'AbortError') throw err; // remontée pour ignorer en amont
    throw new ApiError('Impossible de joindre le service de recherche.');
  }

  if (!res.ok) throw new ApiError('Erreur lors de la recherche de ville.');

  const data = await res.json();
  const results = data.results ?? [];

  // On normalise pour ne garder que ce dont l'UI a besoin.
  return results.map((r) => ({
    id: r.id,
    name: r.name,
    country: r.country,
    countryCode: r.country_code,
    admin1: r.admin1, // région / département
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

/**
 * Détermine si une localisation est en France (métropolitaine).
 * On privilégie le code pays (issu du géocodage) ; à défaut (géolocalisation
 * sans pays connu), on retombe sur une boîte englobante de la France.
 */
export function isFranceLocation(latitude, longitude, countryCode) {
  if (countryCode) return countryCode.toUpperCase() === 'FR';
  return (
    latitude >= 42.3 &&
    latitude <= 51.1 &&
    longitude >= -5.0 &&
    longitude <= 8.3
  );
}

/** Libellé de la source de données affiché à l'utilisateur. */
export function sourceLabel(latitude, longitude, countryCode) {
  return isFranceLocation(latitude, longitude, countryCode)
    ? 'Open-Meteo · modèle Météo-France'
    : 'Open-Meteo';
}

/** Petit utilitaire fetch + parse JSON, avec gestion d'erreur cohérente. */
async function fetchForecast(params, signal) {
  let res;
  try {
    res = await fetch(`${FORECAST_URL}?${params.toString()}`, { signal });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('Impossible de récupérer la météo (réseau).');
  }
  if (!res.ok) throw new ApiError('Erreur lors de la récupération des prévisions.');
  return res.json();
}

/** Comble les champs nuls d'un objet (ex. `current`) avec ceux d'un fallback. */
function fillNullFields(primary, fallback) {
  if (!primary || !fallback) return;
  for (const key of Object.keys(fallback)) {
    if (primary[key] == null) primary[key] = fallback[key];
  }
}

/** Comble, index par index, les valeurs nulles des tableaux (hourly/daily). */
function fillNullArrays(primary, fallback) {
  if (!primary || !fallback) return;
  for (const key of Object.keys(fallback)) {
    if (key === 'time') continue;
    const fb = fallback[key];
    if (!Array.isArray(fb)) continue;
    if (!Array.isArray(primary[key])) {
      primary[key] = fb.slice();
      continue;
    }
    for (let i = 0; i < fb.length; i++) {
      if (primary[key][i] == null) primary[key][i] = fb[i];
    }
  }
}

/**
 * Fusionne deux prévisions : `primary` (Météo-France, précis mais ~4 jours)
 * complété par `fallback` (best_match, 7 jours) pour tous les trous (jours 5-7,
 * heures non couvertes, et la probabilité de pluie que Météo-France ne fournit pas).
 */
function mergeForecast(primary, fallback) {
  if (!primary) return fallback;
  if (!fallback) return primary;
  fillNullFields(primary.current, fallback.current);
  fillNullArrays(primary.hourly, fallback.hourly);
  fillNullArrays(primary.daily, fallback.daily);
  return primary;
}

/**
 * Récupère les prévisions (actuel + horaire + 7 jours) pour des coordonnées.
 *
 * Affinage précision : en France, on force le modèle officiel **Météo-France**
 * (AROME haute résolution 1,3 km) — plus fidèle aux prévisions françaises.
 * Comme ce modèle ne fournit PAS la probabilité de précipitation, on la
 * récupère en parallèle depuis `best_match` et on la fusionne.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @param {AbortSignal} [signal]
 * @param {{countryCode?: string}} [opts]
 */
export async function getForecast(latitude, longitude, signal, opts = {}) {
  const baseFields = {
    latitude,
    longitude,
    current:
      'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day',
    // Champs horaires enrichis : carte principale pour n'importe quelle heure.
    hourly:
      'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day',
    // Champs quotidiens enrichis : ressenti max et vent max pour la sélection d'un jour.
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,wind_speed_10m_max,precipitation_probability_max',
    timezone: 'auto',
    forecast_days: '7',
  };

  // Hors France : un seul appel best_match (sélection auto du meilleur modèle régional).
  if (!isFranceLocation(latitude, longitude, opts.countryCode)) {
    return fetchForecast(new URLSearchParams(baseFields), signal);
  }

  // France : Météo-France (précis, ~4 jours) + best_match (couverture 7 jours
  // + proba de pluie) en parallèle, puis fusion pour combler tous les trous.
  const mfParams = new URLSearchParams(baseFields);
  mfParams.set('models', 'meteofrance_seamless');

  const [primary, fallback] = await Promise.all([
    fetchForecast(mfParams, signal),
    // Le fallback est best-effort : s'il échoue, on garde Météo-France seul.
    fetchForecast(new URLSearchParams(baseFields), signal).catch(() => null),
  ]);

  return mergeForecast(primary, fallback);
}
