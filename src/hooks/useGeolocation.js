import { useCallback, useState } from 'react';

/**
 * Hook de géolocalisation navigateur.
 * Expose une fonction `locate()` qui renvoie une Promise de coordonnées.
 * L'appelant gère le fallback (ex. Paris) en cas de refus / indisponibilité.
 */
export function useGeolocation() {
  const [loading, setLoading] = useState(false);

  const locate = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Géolocalisation non supportée par le navigateur.'));
        return;
      }
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLoading(false);
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => {
          setLoading(false);
          reject(err);
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
      );
    });
  }, []);

  return { locate, loading };
}
