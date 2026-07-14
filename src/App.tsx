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

  useEffect(() => {
    // 1. Notification OTA : On signale à Capgo que l'interface a démarré avec succès.
    // Cela valide la mise à jour et empêche le rollback automatique.
    CapacitorUpdater.notifyAppReady();

    // 2. On attend que l'appareil soit prêt pour lancer OneSignal
    document.addEventListener('deviceready', initOneSignal, false);

    // Sécurité au cas où on est sur navigateur
    const timeout = setTimeout(() => {
      if (status === "Initialisation...") {
        setStatus("Application démarrée (hors appareil mobile)");
      }
    }, 3000);

    // Nettoyage propre du useEffect
    return () => clearTimeout(timeout);
  }, [status]);

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

      /* 
       * FUTURE ÉTAPE : Connexion Multi-utilisateurs
       * Quand ton utilisateur se connectera (avec un email ou un pseudo),
       * tu pourras lier son identité humaine à cet appareil comme ceci :
       * OneSignal.login("email_ou_pseudo_utilisateur");
       */

      // Écouteur en temps réel : dès que l'identifiant est généré ou change, on l'affiche
      OneSignal.User.pushSubscription.addEventListener("change", (state: any) => {
        const newId = state.current?.id;
        if (newId) {
          setUserId(newId);
          setStatus("Prêt à recevoir des notifications !");
        }
      });

      // Demande d'autorisation standard
      OneSignal.Notifications.requestPermission(true).then((accepted: boolean) => {
        if (accepted) {
          setStatus("Autorisé ! En attente de l'ID serveur...");
          
          // Essai de lecture immédiate au cas où il est déjà disponible
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
      <h1>Physis 🚀</h1>
      
      <div className="status-box">
        <p><strong>Statut :</strong> {status}</p>
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