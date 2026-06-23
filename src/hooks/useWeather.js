import { useCallback, useEffect, useState } from 'react';
import { getForecast } from '../services/openMeteo';

/**
 * Hook de récupération des prévisions pour une localisation.
 * @param {{latitude:number, longitude:number}|null} location
 * @returns {{ data, loading, error, refetch }}
 */
export function useWeather(location) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = useCallback(
    async (signal) => {
      if (!location) return;
      setLoading(true);
      setError(null);
      try {
        const result = await getForecast(
          location.latitude,
          location.longitude,
          signal,
          { countryCode: location.countryCode }
        );
        setData(result);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [location]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchWeather(controller.signal);
    return () => controller.abort();
  }, [fetchWeather]);

  // Rafraîchissement manuel (bouton ou pull-to-refresh).
  const refetch = useCallback(() => fetchWeather(), [fetchWeather]);

  return { data, loading, error, refetch };
}
