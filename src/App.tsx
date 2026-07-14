import React, { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [token, setToken] = useState<string>('');
  const [status, setStatus] = useState<string>("Attente d'autorisation...");
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // 1. On vérifie si le navigateur du téléphone supporte les notifications
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setError("Les notifications Web ne sont pas supportées sur cet appareil.");
      setStatus("Erreur de compatibilité");
      return;
    }

    // 2. Demande d'autorisation standard (Zéro plugin natif)
    Notification.requestPermission()
      .then((permission) => {
        if (permission === 'granted') {
          setStatus("Autorisé ! Activation du service...");
          setupServiceWorker();
        } else {
          setError("L'utilisateur a refusé les notifications.");
          setStatus("Accès refusé");
        }
      })
      .catch((err) => {
        setError(err.message || "Erreur lors de la demande.");
        setStatus("Échec");
      });
  }, []);

  // 3. Enregistrement du Service Worker pour générer le Token d'écoute
  async function setupServiceWorker() {
    try {
      let registration = await navigator.serviceWorker.getRegistration();
      
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw.js');
      }

      // On récupère ou crée l'abonnement push universel
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Clé publique factice pour l'initialisation de l'interface
        const dummyVapidKey = "BEl62Ohaywtts9nyduOJwKsCWY9Yfbe9YpAnv2_XzO1W60bEw89_R7AnM7SwD649aiG5zJgSbtpydvR5LhE4kG8";
        
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(dummyVapidKey)
        });
      }

      // On affiche la chaîne de caractères (Token/Endpoint) à l'écran
      setToken(JSON.stringify(subscription));
      setStatus("Application prête à recevoir !");

    } catch (err: any) {
      setError(`Erreur Service Worker: ${err.message || err}`);
      setStatus("Erreur d'initialisation");
    }
  }

  // Utilitaire pour convertir la clé de sécurité
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  return (
    <div className="app-container">
      <h1>Physis Notif 🚀</h1>
      
      <div className="status-box">
        <p><strong>Statut :</strong> {status}</p>
        {error && <p className="error-text">⚠️ {error}</p>}
      </div>

      {token && (
        <div className="token-box">
          <h2>Ton identifiant unique (Token) :</h2>
          <textarea 
            readOnly 
            value={token} 
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
          />
          <small>Reste appuyé pour tout copier</small>
        </div>
      )}
    </div>
  );
}