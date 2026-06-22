// Mapping des codes météo WMO (norme Open-Meteo) vers un libellé français et une icône (emoji).
// Référence : https://open-meteo.com/en/docs (section "Weather variable documentation")

const WMO = {
  0: { label: 'Ciel dégagé', day: '☀️', night: '🌙' },
  1: { label: 'Plutôt dégagé', day: '🌤️', night: '🌙' },
  2: { label: 'Partiellement nuageux', day: '⛅', night: '☁️' },
  3: { label: 'Couvert', day: '☁️', night: '☁️' },
  45: { label: 'Brouillard', day: '🌫️', night: '🌫️' },
  48: { label: 'Brouillard givrant', day: '🌫️', night: '🌫️' },
  51: { label: 'Bruine légère', day: '🌦️', night: '🌧️' },
  53: { label: 'Bruine modérée', day: '🌦️', night: '🌧️' },
  55: { label: 'Bruine dense', day: '🌧️', night: '🌧️' },
  56: { label: 'Bruine verglaçante légère', day: '🌧️', night: '🌧️' },
  57: { label: 'Bruine verglaçante dense', day: '🌧️', night: '🌧️' },
  61: { label: 'Pluie faible', day: '🌦️', night: '🌧️' },
  63: { label: 'Pluie modérée', day: '🌧️', night: '🌧️' },
  65: { label: 'Pluie forte', day: '🌧️', night: '🌧️' },
  66: { label: 'Pluie verglaçante faible', day: '🌧️', night: '🌧️' },
  67: { label: 'Pluie verglaçante forte', day: '🌧️', night: '🌧️' },
  71: { label: 'Neige faible', day: '🌨️', night: '🌨️' },
  73: { label: 'Neige modérée', day: '❄️', night: '❄️' },
  75: { label: 'Neige forte', day: '❄️', night: '❄️' },
  77: { label: 'Grains de neige', day: '🌨️', night: '🌨️' },
  80: { label: 'Averses faibles', day: '🌦️', night: '🌧️' },
  81: { label: 'Averses modérées', day: '🌧️', night: '🌧️' },
  82: { label: 'Averses violentes', day: '⛈️', night: '⛈️' },
  85: { label: 'Averses de neige faibles', day: '🌨️', night: '🌨️' },
  86: { label: 'Averses de neige fortes', day: '❄️', night: '❄️' },
  95: { label: 'Orage', day: '⛈️', night: '⛈️' },
  96: { label: 'Orage avec grêle', day: '⛈️', night: '⛈️' },
  99: { label: 'Orage violent avec grêle', day: '⛈️', night: '⛈️' },
};

const FALLBACK = { label: 'Inconnu', day: '❓', night: '❓' };

/**
 * Retourne le libellé français et l'icône correspondant à un code WMO.
 * @param {number} code - code météo WMO
 * @param {boolean} isDay - true = jour (icône soleil), false = nuit (icône lune)
 */
export function describeWeather(code, isDay = true) {
  const entry = WMO[code] ?? FALLBACK;
  return {
    label: entry.label,
    icon: isDay ? entry.day : entry.night,
  };
}
