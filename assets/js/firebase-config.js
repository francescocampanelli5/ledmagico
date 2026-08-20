// Configurazione pubblica del progetto Firebase di LedMagico.
// Questi valori NON sono segreti: Firebase è progettato per esporli lato client.
// La sicurezza reale è garantita dalle regole di Firestore (vedi firestore.rules)
// e da Firebase Authentication per l'accesso alla dashboard admin.
//
// Sostituisci i valori qui sotto con quelli del TUO progetto Firebase
// (Impostazioni progetto → Generali → Le tue app → Configurazione SDK).
// Istruzioni complete in SETUP.md.

export const firebaseConfig = {
  apiKey: 'INSERISCI_API_KEY',
  authDomain: 'INSERISCI_PROJECT_ID.firebaseapp.com',
  projectId: 'INSERISCI_PROJECT_ID',
  storageBucket: 'INSERISCI_PROJECT_ID.appspot.com',
  messagingSenderId: 'INSERISCI_SENDER_ID',
  appId: 'INSERISCI_APP_ID',
};

export const isFirebaseConfigured = () =>
  !Object.values(firebaseConfig).some((v) => String(v).startsWith('INSERISCI_'));
