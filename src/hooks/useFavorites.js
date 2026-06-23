import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'meteo:favorites';

/** Lecture initiale du localStorage (robuste si JSON corrompu). */
function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Hook de gestion des villes favorites, persistées dans localStorage.
 * Chaque favori = { id, name, country, admin1, latitude, longitude }.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState(readStorage);

  // Synchronisation vers le localStorage à chaque changement.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      /* quota dépassé ou mode privé : on ignore silencieusement */
    }
  }, [favorites]);

  // Identité d'une ville : on se base sur les coordonnées arrondies.
  const sameCity = (a, b) =>
    Math.abs(a.latitude - b.latitude) < 0.01 &&
    Math.abs(a.longitude - b.longitude) < 0.01;

  const isFavorite = useCallback(
    (city) => city && favorites.some((f) => sameCity(f, city)),
    [favorites]
  );

  // Nouveau favori ajouté EN TÊTE : il devient la ville par défaut au chargement.
  const addFavorite = useCallback((city) => {
    setFavorites((prev) =>
      prev.some((f) => sameCity(f, city)) ? prev : [city, ...prev]
    );
  }, []);

  const removeFavorite = useCallback((city) => {
    setFavorites((prev) => prev.filter((f) => !sameCity(f, city)));
  }, []);

  // Ajoute ou retire selon l'état courant.
  const toggleFavorite = useCallback(
    (city) => {
      if (!city) return;
      setFavorites((prev) =>
        prev.some((f) => sameCity(f, city))
          ? prev.filter((f) => !sameCity(f, city))
          : [city, ...prev]
      );
    },
    []
  );

  return { favorites, isFavorite, addFavorite, removeFavorite, toggleFavorite };
}
