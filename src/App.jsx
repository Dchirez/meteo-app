import { useEffect, useState } from 'react';
import SearchBar from './components/SearchBar';
import UnitToggle from './components/UnitToggle';
import CurrentWeather from './components/CurrentWeather';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import FavoritesList from './components/FavoritesList';
import InstallButton from './components/InstallButton';
import Skeleton from './components/states/Skeleton';
import ErrorState from './components/states/ErrorState';
import EmptyState from './components/states/EmptyState';
import { useWeather } from './hooks/useWeather';
import { useFavorites } from './hooks/useFavorites';
import { useGeolocation } from './hooks/useGeolocation';
import styles from './App.module.css';

// Ville par défaut (fallback si géolocalisation refusée/indisponible).
const DEFAULT_CITY = {
  id: 0,
  name: 'Paris',
  country: 'France',
  admin1: 'Île-de-France',
  latitude: 48.8566,
  longitude: 2.3522,
};

export default function App() {
  const [city, setCity] = useState(null); // ville sélectionnée
  const [unit, setUnit] = useState('C'); // 'C' | 'F'
  const [refreshing, setRefreshing] = useState(false);

  const { locate } = useGeolocation();
  const { favorites, isFavorite, toggleFavorite, removeFavorite } = useFavorites();
  const { data, loading, error, refetch } = useWeather(city);

  // Sélection de la ville initiale, au montage uniquement (deps vides) :
  // on ne dépend PAS de `favorites` pour ne pas réinitialiser la ville à chaque
  // ajout/retrait de favori. On lit les favoris présents au chargement.
  useEffect(() => {
    let cancelled = false;

    // 1) Priorité aux favoris : on affiche le 1er favori (= le dernier ajouté).
    if (favorites.length > 0) {
      setCity(favorites[0]);
      return;
    }

    // 2) Sinon : géolocalisation, avec fallback Paris.
    locate()
      .then((coords) => {
        if (cancelled) return;
        setCity({ ...coords, name: 'Ma position', admin1: '', country: '' });
      })
      .catch(() => {
        if (!cancelled) setCity(DEFAULT_CITY);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rafraîchissement manuel (bouton ↻ / pull-to-refresh).
  async function handleRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  // --- Pull-to-refresh tactile basique ---
  useEffect(() => {
    let startY = 0;
    let pulling = false;

    function onTouchStart(e) {
      // Uniquement si on est tout en haut de la page.
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        pulling = true;
      }
    }
    function onTouchEnd(e) {
      if (!pulling) return;
      const delta = e.changedTouches[0].clientY - startY;
      if (delta > 80) handleRefresh(); // tiré vers le bas > 80px
      pulling = false;
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetch]);

  const current = data?.current;

  return (
    <div className={styles.app}>
      {/* En-tête sticky : recherche + unité */}
      <header className={styles.header}>
        <div className={styles.topRow}>
          <SearchBar onSelect={setCity} />
          <UnitToggle unit={unit} onChange={setUnit} />
        </div>
        <FavoritesList
          favorites={favorites}
          activeCity={city}
          onSelect={setCity}
          onRemove={removeFavorite}
        />
      </header>

      <main className={styles.main}>
        {/* Indicateur de rafraîchissement */}
        {refreshing && <div className={styles.refreshing}>Actualisation…</div>}

        {/* Gestion des états : vide / chargement / erreur / données */}
        {!city && <EmptyState />}

        {city && loading && !data && <Skeleton />}

        {city && error && !loading && (
          <ErrorState message={error} onRetry={refetch} />
        )}

        {city && data && (
          <div className={styles.content}>
            <CurrentWeather
              current={current}
              city={city}
              unit={unit}
              isFavorite={isFavorite(city)}
              onToggleFavorite={() => toggleFavorite(city)}
            />
            <HourlyForecast hourly={data.hourly} unit={unit} />
            <DailyForecast daily={data.daily} unit={unit} />
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        {/* Bouton d'installation PWA (se masque si déjà installée / non supportée) */}
        <InstallButton />
        <button
          type="button"
          className={styles.refreshBtn}
          onClick={handleRefresh}
          aria-label="Actualiser"
        >
          ↻ Actualiser
        </button>
        <p className={styles.credit}>Données : Open-Meteo</p>
      </footer>
    </div>
  );
}
