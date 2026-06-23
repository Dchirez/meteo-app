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

  // France : températures Météo-France + proba de pluie best_match (en parallèle).
  const mfParams = new URLSearchParams(baseFields);
  mfParams.set('models', 'meteofrance_seamless');

  const rainParams = new URLSearchParams({
    latitude,
    longitude,
    daily: 'precipitation_probability_max',
    timezone: 'auto',
    forecast_days: '7',
  });

  const [data, rain] = await Promise.all([
    fetchForecast(mfParams, signal),
    // La proba de pluie est secondaire : si elle échoue, on garde le reste.
    fetchForecast(rainParams, signal).catch(() => null),
  ]);

  if (data?.daily && rain?.daily?.precipitation_probability_max) {
    data.daily.precipitation_probability_max =
      rain.daily.precipitation_probability_max;
  }
  return data;
}
