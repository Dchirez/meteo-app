import { useEffect, useState } from 'react';

/**
 * Retourne une version "retardée" d'une valeur.
 * Utile pour l'autocomplétion : on évite d'appeler l'API à chaque frappe.
 * @param {*} value - valeur à débouncer
 * @param {number} delay - délai en ms
 */
export function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id); // on annule si la valeur change avant la fin
  }, [value, delay]);

  return debounced;
}
