import { useState, useEffect } from 'react';
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
    // On attend que l'appareil soit prêt pour lancer OneSignal (méthode 100% native stable)
    document.addEventListener('deviceready', initOneSignal, false);

    // Sécurité au cas où on est sur navigateur
    setTimeout(() => {
      if (status === "Initialisation...") {
        setStatus("Application démarrée (hors appareil mobile)");
      }
    }, 3000);
  }, []);

  function initOneSignal() {
    try {
      const OneSignal = window.plugins?.OneSignal;
      if (!OneSignal) {
        setError("Le module natif de notification n'a pas pu être chargé.");
        setStatus("Erreur de chargement");
        return;
      }

      setStatus("Configuration des notifications...");

      // REMPLACE cette clé par ton identifiant OneSignal plus tard si tu veux, 
      // pour l'instant on initialise l'application avec une clé de test sécurisée.
      OneSignal.initialize("fa0ed4ae-dab4-4ef0-afd3-998a56673955");

      // Demande d'autorisation native (la vraie petite fenêtre Android standard)
      OneSignal.Notifications.requestPermission(true).then((accepted: boolean) => {
        if (accepted) {
          setStatus("Autorisé ! Récupération de l'identifiant...");
          
          // Récupération de l'ID unique de l'appareil
          const deviceState = OneSignal.User.pushSubscription.getid();
          if (deviceState) {
            setUserId(deviceState);
            setStatus("Prêt à recevoir des notifications !");
          } else {
            // Parfois l'ID met quelques secondes à être généré par les serveurs
            setTimeout(() => {
              const retryId = OneSignal.User.pushSubscription.getid();
              if (retryId) {
                setUserId(retryId);
                setStatus("Prêt à recevoir des notifications !");
              } else {
                setStatus("Connecté (Attente de l'ID du serveur)");
              }
            }, 2000);
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