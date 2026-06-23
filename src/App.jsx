import { useEffect, useMemo, useState } from 'react';
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
import { buildView } from './utils/forecast';
import { sourceLabel } from './services/openMeteo';
import styles from './App.module.css';

// Ville par défaut (fallback si géolocalisation refusée/indisponible).
const DEFAULT_CITY = {
  id: 0,
  name: 'Paris',
  country: 'France',
  countryCode: 'FR',
  admin1: 'Île-de-France',
  latitude: 48.8566,
  longitude: 2.3522,
};

const NOW_SELECTION = { kind: 'now' };

export default function App() {
  const [city, setCity] = useState(null); // ville sélectionnée
  const [unit, setUnit] = useState('C'); // 'C' | 'F'
  const [refreshing, setRefreshing] = useState(false);
  const [spinning, setSpinning] = useState(false);
  // Sélection pilotant la carte principale : maintenant / une heure / un jour.
  const [selection, setSelection] = useState(NOW_SELECTION);

  const { locate } = useGeolocation();
  const { favorites, isFavorite, toggleFavorite, removeFavorite } = useFavorites();
  const { data, loading, error, refetch } = useWeather(city);

  // Changer de ville réinitialise la sélection sur « Maintenant ».
  function selectCity(c) {
    setCity(c);
    setSelection(NOW_SELECTION);
  }

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

  // Vues d'affichage dérivées (recalculées si données / unité / sélection changent).
  const view = useMemo(
    () => (data ? buildView(data, unit, selection) : null),
    [data, unit, selection]
  );

  // Rafraîchissement manuel (bouton ↻ / pull-to-refresh) avec animation de rotation.
  async function handleRefresh() {
    setRefreshing(true);
    setSpinning(true);
    await refetch();
    setRefreshing(false);
    setTimeout(() => setSpinning(false), 600);
  }

  // --- Pull-to-refresh tactile basique ---
  useEffect(() => {
    let startY = 0;
    let pulling = false;

    function onTouchStart(e) {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        pulling = true;
      }
    }
    function onTouchEnd(e) {
      if (!pulling) return;
      const delta = e.changedTouches[0].clientY - startY;
      if (delta > 80) handleRefresh();
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

  return (
    <div className={styles.app}>
      {/* Halo lumineux décoratif (glow) */}
      <div className={styles.glow} aria-hidden="true" />

      {/* En-tête sticky : recherche + unité + favoris */}
      <header className={styles.header}>
        <div className={styles.topRow}>
          <SearchBar onSelect={selectCity} />
          <UnitToggle unit={unit} onChange={setUnit} />
        </div>
        <FavoritesList
          favorites={favorites}
          activeCity={city}
          onSelect={selectCity}
          onRemove={removeFavorite}
        />
      </header>

      <main className={styles.main}>
        {refreshing && <div className={styles.refreshing}>Actualisation…</div>}

        {!city && <EmptyState />}

        {city && loading && !data && <Skeleton />}

        {city && error && !loading && (
          <ErrorState message={error} onRetry={refetch} />
        )}

        {city && data && view && (
          <div className={styles.content}>
            <CurrentWeather
              hero={view.hero}
              city={city}
              isFavorite={isFavorite(city)}
              onToggleFavorite={() => toggleFavorite(city)}
              onReset={() => setSelection(NOW_SELECTION)}
            />
            <div className={styles.grid}>
              <HourlyForecast
                cells={view.hourlyCells}
                selectedIndex={selection.kind === 'hour' ? selection.index : null}
                onSelect={(index) => setSelection({ kind: 'hour', index })}
              />
              <DailyForecast
                rows={view.dailyRows}
                selectedIndex={selection.kind === 'day' ? selection.index : null}
                onSelect={(index) => setSelection({ kind: 'day', index })}
              />
            </div>
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
          <span
            className={styles.refreshIcon}
            style={{ transform: `rotate(${spinning ? 360 : 0}deg)` }}
          >
            ↻
          </span>{' '}
          Actualiser
        </button>
        <p className={styles.credit}>
          Données :{' '}
          {city
            ? sourceLabel(city.latitude, city.longitude, city.countryCode)
            : 'Open-Meteo'}
        </p>
      </footer>
    </div>
  );
}
