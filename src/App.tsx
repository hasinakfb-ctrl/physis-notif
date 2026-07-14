import { useState, useEffect } from 'react';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import './App.css';

// Déclaration pour éviter les erreurs TypeScript avec le plugin Cordova
declare global {
  interface Window {
    plugins?: {
      OneSignal?: any;
    };
  }
}

export default function App() {
  const [userId, setUserId] = useState<string>('');
  const [status, setStatus] = useState<string>("Initialisation...");
  const [error, setError] = useState<string>('');
  const [otaStatus, setOtaStatus] = useState<string>("En attente de connexion OTA...");

  useEffect(() => {
    // Variables pour stocker les références réelles des écouteurs Capacitor
    let downloadHandle: any;
    let updateAvailableHandle: any;
    let updateFailedHandle: any;

    // 1. BLOC OTA (CAPGO) - Totalement asynchrone et sécurisé
    const setupOta = async () => {
      try {
        await CapacitorUpdater.notifyAppReady();
        setOtaStatus("Prêt pour l'OTA");
      } catch (err: any) {
        setOtaStatus(`Erreur OTA : ${err.message}`);
      }

      // On "await" chaque écouteur pour récupérer le "Handle" et pouvoir le supprimer proprement
      downloadHandle = await CapacitorUpdater.addListener('download', (info: any) => {
        setOtaStatus(`Téléchargement OTA : ${info.percent}%`);
      });
      updateAvailableHandle = await CapacitorUpdater.addListener('updateAvailable', (info: any) => {
        setOtaStatus(`Mise à jour prête : ${info.version}`);
      });
      updateFailedHandle = await CapacitorUpdater.addListener('updateFailed', (info: any) => {
        setOtaStatus(`Échec OTA : ${info.message}`);
      });
    };

    setupOta();

    // 2. BLOC ONESIGNAL
    document.addEventListener('deviceready', initOneSignal, false);

    // Sécurité au cas où on est sur navigateur (utilise une mise à jour d'état fonctionnelle)
    const timeout = setTimeout(() => {
      setStatus((prevStatus) => {
        if (prevStatus === "Initialisation...") {
          return "Application démarrée (hors appareil mobile)";
        }
        return prevStatus;
      });
    }, 3000);

    // 3. NETTOYAGE PROPRE
    return () => {
      clearTimeout(timeout);
      document.removeEventListener('deviceready', initOneSignal, false);
      if (downloadHandle) downloadHandle.remove();
      if (updateAvailableHandle) updateAvailableHandle.remove();
      if (updateFailedHandle) updateFailedHandle.remove();
    };
  }, []); // <-- Le tableau vide garantit que ce code ne s'exécute qu'une seule fois au lancement !

  // Fonction d'origine pour OneSignal
  function initOneSignal() {
    try {
      const OneSignal = window.plugins?.OneSignal;
      if (!OneSignal) {
        setError("Le module natif de notification n'a pas pu être chargé.");
        setStatus("Erreur de chargement");
        return;
      }

      setStatus("Configuration des notifications...");

      // Initialisation avec ton ID OneSignal
      OneSignal.initialize("fa0ed4ae-dab4-4ef0-afd3-998a56673955");

      OneSignal.User.pushSubscription.addEventListener("change", (state: any) => {
        const newId = state.current?.id;
        if (newId) {
          setUserId(newId);
          setStatus("Prêt à recevoir des notifications !");
        }
      });

      OneSignal.Notifications.requestPermission(true).then((accepted: boolean) => {
        if (accepted) {
          setStatus("Autorisé ! En attente de l'ID serveur...");
          
          const immediateId = OneSignal.User.pushSubscription.id;
          if (immediateId) {
            setUserId(immediateId);
            setStatus("Prêt à recevoir des notifications !");
          }
        } else {
          setError("L'autorisation de notification a été refusée.");
          setStatus("Accès refusé");
        }
      });

    } catch (err: any) {
      setError(err.message || "Erreur critique d'initialisation.");
      setStatus("Échec");
    }
  }

  return (
    <div className="app-container">
      <h1>Physis Notif 🚀</h1>
      
      <div className="status-box">
        <p><strong>Statut :</strong> {status}</p>
        <p><strong>OTA :</strong> {otaStatus}</p>
        {error && <p className="error-text">⚠️ {error}</p>}
      </div>

      {userId && (
        <div className="token-box">
          <h2>Ton ID de Notification (OneSignal) :</h2>
          <textarea 
            readOnly 
            value={userId} 
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
          />
          <small>Reste appuyé pour tout copier</small>
        </div>
      )}
    </div>
  );
}