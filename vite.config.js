import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuration Vite.
// `base` est en chemin relatif ('./') pour fonctionner aussi bien en local
// qu'une fois déployé dans un sous-dossier sur GitHub Pages
// (ex. https://user.github.io/meteo-app/) sans avoir à coder le nom du repo en dur.
export default defineConfig({
  plugins: [react()],
  base: './',
});
