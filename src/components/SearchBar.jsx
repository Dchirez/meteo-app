import { useEffect, useRef, useState } from 'react';
import { useGeocoding } from '../hooks/useGeocoding';
import styles from './SearchBar.module.css';

/**
 * Barre de recherche de ville avec autocomplétion.
 * @param {(city) => void} onSelect - appelé quand une ville est choisie
 */
export default function SearchBar({ onSelect }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1); // navigation clavier
  const containerRef = useRef(null);

  const { results, loading, error } = useGeocoding(query);

  // Ouvre la liste dès qu'on a des résultats ou un état (chargement/erreur).
  useEffect(() => {
    if (query.trim().length >= 2) setOpen(true);
  }, [query, results]);

  // Ferme la liste si on clique en dehors.
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, []);

  function choose(city) {
    onSelect(city);
    setQuery('');
    setOpen(false);
    setActiveIndex(-1);
  }

  // Gestion clavier : flèches + Entrée + Échap.
  function handleKeyDown(e) {
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      choose(results[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  // Construit la ligne secondaire : "Région, Pays".
  const subtitle = (c) => [c.admin1, c.country].filter(Boolean).join(', ');

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.inputWrap}>
        <span className={styles.icon} aria-hidden="true">🔍</span>
        <input
          type="search"
          className={styles.input}
          placeholder="Rechercher une ville…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(-1);
          }}
          onFocus={() => query.trim().length >= 2 && setOpen(true)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={open}
          aria-controls="search-results"
          aria-autocomplete="list"
          autoComplete="off"
        />
      </div>

      {open && (
        <ul className={styles.results} id="search-results" role="listbox">
          {loading && <li className={styles.info}>Recherche…</li>}
          {error && <li className={styles.info}>{error}</li>}
          {!loading && !error && results.length === 0 && (
            <li className={styles.info}>Aucune ville trouvée.</li>
          )}
          {results.map((city, i) => (
            <li key={city.id} role="option" aria-selected={i === activeIndex}>
              <button
                type="button"
                className={`${styles.option} ${i === activeIndex ? styles.active : ''}`}
                onClick={() => choose(city)}
                onMouseEnter={() => setActiveIndex(i)}
              >
                <span className={styles.cityName}>{city.name}</span>
                <span className={styles.citySub}>{subtitle(city)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
