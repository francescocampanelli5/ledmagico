// Configurazione pubblica del progetto Firebase di LedMagico.
// Questi valori NON sono segreti: Firebase è progettato per esporli lato client.
// La sicurezza reale è garantita dalle regole di Firestore (vedi firestore.rules)
// e da Firebase Authentication per l'accesso alla dashboard admin.
//
// Sostituisci i valori qui sotto con quelli del TUO progetto Firebase
// (Impostazioni progetto → Generali → Le tue app → Configurazione SDK).
// Istruzioni complete in SETUP.md.

export const firebaseConfig = {
  apiKey: 'AIzaSyAB0BYgoOSGs-wetjCZNh44N6NB_wyYXhc',
  authDomain: 'ledmagico-fe309.firebaseapp.com',
  projectId: 'ledmagico-fe309',
  storageBucket: 'ledmagico-fe309.firebasestorage.app',
  messagingSenderId: '403417384357',
  appId: '1:403417384357:web:15a5c2735dd7888e36d44c',
};

export const isFirebaseConfigured = () =>
  !Object.values(firebaseConfig).some((v) => String(v).startsWith('INSERISCI_'));
