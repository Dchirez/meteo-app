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
 * Récupère les prévisions (actuel + horaire + 7 jours) pour des coordonnées.
 * @param {number} latitude
 * @param {number} longitude
 * @param {AbortSignal} [signal]
 */
export async function getForecast(latitude, longitude, signal) {
  const params = new URLSearchParams({
    latitude,
    longitude,
    current:
      'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day',
    hourly: 'temperature_2m,weather_code,is_day',
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'auto',
    forecast_days: '7',
  });

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
