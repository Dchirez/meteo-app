// Fonctions de formatage et de conversion d'unités.

/**
 * Convertit et formate une température.
 * L'API renvoie toujours des °C ; on convertit côté client pour un toggle instantané.
 * @param {number} celsius - température en °C
 * @param {'C'|'F'} unit - unité cible
 * @returns {string} ex. "21°"
 */
export function formatTemp(celsius, unit = 'C') {
  if (celsius == null || Number.isNaN(celsius)) return '—';
  const value = unit === 'F' ? celsius * 1.8 + 32 : celsius;
  return `${Math.round(value)}°`;
}

/** Symbole de l'unité courante. */
export function unitSymbol(unit = 'C') {
  return unit === 'F' ? '°F' : '°C';
}

/** Formate une heure ISO en "14 h" (locale FR). */
export function formatHour(isoString) {
  const d = new Date(isoString);
  return `${d.getHours()} h`;
}

/** Indique si une heure ISO correspond à l'heure courante (à l'heure près). */
export function isCurrentHour(isoString) {
  const d = new Date(isoString);
  const now = new Date();
  return d.getHours() === now.getHours() && d.getDate() === now.getDate();
}

/** Formate une date ISO (YYYY-MM-DD) en jour court : "Lun.", "Mar."… */
export function formatDayShort(isoDate) {
  const d = new Date(isoDate);
  const label = d.toLocaleDateString('fr-FR', { weekday: 'short' });
  // Première lettre en majuscule.
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Indique si une date ISO correspond à aujourd'hui. */
export function isToday(isoDate) {
  const d = new Date(isoDate);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}
