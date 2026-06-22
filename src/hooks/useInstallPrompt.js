import { useEffect, useState } from 'react';

/**
 * Hook qui gère l'installation de la PWA ("Ajouter à l'écran d'accueil").
 *
 * - Sur Android/Chrome/Edge : capture l'événement `beforeinstallprompt`,
 *   ce qui permet d'afficher un bouton perso et de déclencher l'invite native.
 * - Sur iOS/Safari : pas d'événement → on renvoie `iosHint` pour afficher
 *   les instructions manuelles (Partager → Sur l'écran d'accueil).
 *
 * @returns {{ canInstall, isInstalled, isIOS, promptInstall }}
 */
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Détection iOS (Safari ne supporte pas beforeinstallprompt).
  const isIOS =
    typeof navigator !== 'undefined' &&
    /iphone|ipad|ipod/i.test(navigator.userAgent);

  // Détecte si l'app tourne déjà en mode "installé" (standalone).
  const isStandalone =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true);

  useEffect(() => {
    if (isStandalone) setIsInstalled(true);

    function onBeforeInstall(e) {
      // On empêche l'invite automatique pour la déclencher via notre bouton.
      e.preventDefault();
      setDeferredPrompt(e);
    }
    function onInstalled() {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [isStandalone]);

  // Déclenche l'invite native d'installation.
  async function promptInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice; // 'accepted' | 'dismissed'
    setDeferredPrompt(null);
  }

  return {
    // Bouton affichable si l'invite est dispo, ou sur iOS (instructions), tant que pas installé.
    canInstall: !isInstalled && (Boolean(deferredPrompt) || isIOS),
    isInstalled,
    isIOS,
    promptInstall,
  };
}
