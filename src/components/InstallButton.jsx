import { useState } from 'react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import styles from './InstallButton.module.css';

/**
 * Bouton "Installer l'app" (PWA, ajout à l'écran d'accueil).
 * - Android/Chrome/Edge : déclenche l'invite native.
 * - iOS : ouvre une petite aide (Safari ne supporte pas l'invite automatique).
 * Le bouton se masque tout seul si l'app est déjà installée.
 */
export default function InstallButton() {
  const { canInstall, isIOS, promptInstall } = useInstallPrompt();
  const [showIosHelp, setShowIosHelp] = useState(false);

  if (!canInstall) return null;

  function handleClick() {
    if (isIOS) setShowIosHelp((v) => !v);
    else promptInstall();
  }

  return (
    <div className={styles.wrap}>
      <button type="button" className={styles.btn} onClick={handleClick}>
        <span aria-hidden="true">⬇️</span> Installer l'app
      </button>

      {isIOS && showIosHelp && (
        <p className={styles.iosHelp}>
          Sur iPhone : appuie sur <strong>Partager</strong> (carré avec flèche),
          puis <strong>« Sur l'écran d'accueil »</strong>.
        </p>
      )}
    </div>
  );
}
