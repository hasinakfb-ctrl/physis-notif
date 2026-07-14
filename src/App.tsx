import { useEffect, useState } from 'react';
import { PushNotifications, Token } from '@capacitor/push-notifications';

function App() {
  const [token, setToken] = useState<string>('Pas encore de token');
  const [status, setStatus] = useState<string>("En attente d'autorisation...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fonction pour initialiser les notifications push
    const initPush = async () => {
      try {
        // 1. Demander la permission à l'utilisateur
        let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== 'granted') {
          setStatus("Permission refusée par l'utilisateur.");
          return;
        }

        setStatus("Permission accordée ! Enregistrement auprès de Google/Apple...");

        // 2. S'enregistrer auprès du service de notifications (FCM/APNs)
        await PushNotifications.register();

        // 3. Écouter l'événement de succès de l'enregistrement (Récupération du Token)
        PushNotifications.addListener('registration', (registrationToken: Token) => {
          setToken(registrationToken.value);
          setStatus("Appareil enregistré avec succès ! Ready.");
          console.log('Push token:', registrationToken.value);
        });

        // 4. Écouter les erreurs d'enregistrement
        PushNotifications.addListener('registrationError', (err: any) => {
          setError(`Erreur d'enregistrement : ${JSON.stringify(err)}`);
        });

        // 5. Optionnel : Écouter la notification quand l'app est ouverte au premier plan
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          alert(`Notification reçue en direct : ${notification.title} - ${notification.body}`);
        });

      } catch (e: any) {
        setError(`Erreur système : ${e.message || e}`);
      }
    };

    initPush();
  }, []);

  return (
    <div style={{
      padding: '24px',
      fontFamily: 'sans-serif',
      backgroundColor: '#121212',
      color: '#ffffff',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center'
    }}>
      <h1 style={{ color: '#4CAF50', marginBottom: '8px' }}>Physis Node Link</h1>
      <p style={{ color: '#aaa', fontSize: '14px' }}>Statut : <strong>{status}</strong></p>
      
      {error && (
        <div style={{ backgroundColor: '#ff5252', padding: '12px', borderRadius: '6px', margin: '16px 0', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <div style={{
        marginTop: '24px',
        padding: '16px',
        backgroundColor: '#1e1e1e',
        borderRadius: '8px',
        border: '1px solid #333',
        maxWidth: '90%',
        wordBreak: 'break-all'
      }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Device Push Token
        </p>
        <code style={{ fontSize: '14px', color: '#00E676', fontFamily: 'monospace' }}>
          {token}
        </code>
      </div>
      <p style={{ marginTop: '16px', fontSize: '12px', color: '#666' }}>
        Copie ce token pour l'envoyer depuis ton script admin backend.
      </p>
    </div>
  );
}

export default App;