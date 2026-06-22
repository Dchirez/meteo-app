# 🌤️ Météo — App React + Open-Meteo

Application météo **mobile-first**, **installable (PWA)** et **responsive**, construite avec **React + Vite** et consommant l'API gratuite **[Open-Meteo](https://open-meteo.com/)** (aucune clé requise).

Projet personnel de portfolio (BUT Informatique).

---

## ✨ Fonctionnalités

- 🔍 **Recherche de ville avec autocomplétion** (API de géocodage Open-Meteo, débounce + annulation des requêtes obsolètes).
- 📍 **Géolocalisation** du navigateur au chargement, avec **fallback sur Paris**.
- 🌡️ **Météo actuelle** : température, ressenti, humidité, vent, icône + description (codes WMO → emoji + libellé FR).
- ⏱️ **Prévisions horaires 24 h** en scroll horizontal fluide.
- 📅 **Prévisions 7 jours** : min/max, icône, probabilité de pluie.
- ⭐ **Villes favorites** persistées dans `localStorage`.
- 🔁 **Bascule °C / °F** (conversion instantanée côté client).
- ⚙️ **Gestion des états** : chargement (skeleton), erreur (réseau / ville introuvable), vide.
- 📱 **PWA installable** (manifest + service worker, fonctionnement hors-ligne basique) avec un **bouton « Installer l'app »** intégré :
  - Android/Chrome/Edge → déclenche l'invite native d'ajout à l'écran d'accueil ;
  - iOS/Safari → affiche les instructions (Partager → « Sur l'écran d'accueil ») ;
  - le bouton se masque automatiquement si l'app est déjà installée.

---

## 📱 Mobile-first

- Conçu d'abord pour smartphone (~375 px), puis adapté tablette (768 px) et desktop (1280 px).
- Mise en page **une seule colonne** sur mobile, **cibles tactiles ≥ 44 px**.
- Scroll horizontal tactile + **pull-to-refresh** (tirer vers le bas en haut de page).
- Respect des **`safe-area-inset`** (encoches iPhone) et `viewport-fit=cover`.
- Installable sur l'écran d'accueil (`display: standalone`).

### Captures

> _À ajouter : `docs/mobile.png` (375 px) et `docs/desktop.png` (1280 px)._

```
docs/
├── mobile.png
└── desktop.png
```

---

## 🗂️ Architecture

```
src/
├── components/        # SearchBar, CurrentWeather, HourlyForecast, DailyForecast, FavoritesList, UnitToggle, states/
├── hooks/             # useWeather, useGeocoding, useFavorites, useGeolocation, useDebounce
├── services/          # openMeteo.js  (tous les appels API isolés)
├── utils/             # weatherCodes.js (mapping WMO), format.js (conversions/dates)
├── App.jsx            # orchestration + états
└── main.jsx           # bootstrap + enregistrement du service worker
public/
├── manifest.json      # PWA
├── sw.js              # service worker (cache app shell + réseau-d'abord pour l'API)
└── icons/             # icon.svg + maskable.svg
```

---

## 🚀 Lancer en local

Prérequis : **Node.js ≥ 18**.

```bash
npm install
npm run dev
```

L'app démarre sur `http://localhost:5173`.

> 💡 La géolocalisation et le service worker nécessitent un contexte sécurisé : `localhost` est accepté.

### Build de production

```bash
npm run build      # génère dist/
npm run preview    # prévisualise le build
```

---

## 🌍 Déploiement sur GitHub Pages

Le projet est configuré avec `base: './'` (chemins relatifs) → fonctionne dans un sous-dossier sans config supplémentaire.

1. Crée un dépôt GitHub et pousse le code.
2. Déploie via le package `gh-pages` (déjà en devDependency) :

```bash
npm run deploy
```

Cela construit l'app et publie le dossier `dist/` sur la branche `gh-pages`.

3. Dans **Settings → Pages** du dépôt, choisis la branche `gh-pages` (dossier `/root`).

L'app sera disponible sur `https://<utilisateur>.github.io/<nom-du-repo>/`.

> Alternative : un workflow GitHub Actions (`actions/deploy-pages`) peut automatiser le déploiement à chaque push sur `main`.

---

## 🔌 API utilisées (Open-Meteo, sans clé)

| Usage | Endpoint |
|-------|----------|
| Géocodage | `https://geocoding-api.open-meteo.com/v1/search?name={ville}&count=5&language=fr&format=json` |
| Prévisions | `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=...&hourly=...&daily=...&timezone=auto&forecast_days=7` |

Les **codes météo WMO** (`weather_code`) sont mappés vers une icône + un libellé français dans [`src/utils/weatherCodes.js`](src/utils/weatherCodes.js).

---

## 🛠️ Stack

React 18 · Vite 6 · CSS Modules · PWA (manifest + service worker) · Open-Meteo API.

---

## 📄 Licence

Projet personnel à but pédagogique. Données météo fournies par [Open-Meteo](https://open-meteo.com/) (licence CC-BY 4.0).
