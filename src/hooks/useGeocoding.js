import { useEffect, useState } from 'react';
import { searchCity } from '../services/openMeteo';
import { useDebounce } from './useDebounce';

/**
 * Hook d'autocomplétion de villes.
 * Débounce la saisie, annule les requêtes obsolètes (AbortController),
 * et expose résultats / chargement / erreur.
 * @param {string} query - texte saisi par l'utilisateur
 */
export function useGeocoding(query) {
  const debouncedQuery = useDebounce(query, 350);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // En dessous de 2 caractères, on ne cherche pas.
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    searchCity(debouncedQuery, controller.signal)
      .then((list) => {
        setResults(list);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return; // requête remplacée, on ignore
        setError(err.message);
        setLoading(false);
      });

    // Nettoyage : on annule la requête en cours si la query change.
    return () => controller.abort();
  }, [debouncedQuery]);

  return { results, loading, error };
}
