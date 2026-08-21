// Script opzionale: popola Firestore con il catalogo dimostrativo iniziale.
// Esegui UNA SOLA VOLTA in locale, dopo aver configurato assets/js/firebase-config.js
// e creato l'utente amministratore in Firebase Authentication.
//
// Uso:
//   npm install
//   ADMIN_EMAIL=ledmagicoshop@gmail.com ADMIN_PASSWORD='la-tua-password' node scripts/seed-products.mjs
//
// Le credenziali restano solo sul tuo computer: questo script non le invia altrove
// se non a Firebase, per autenticarsi come amministratore e poter scrivere i prodotti.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const __dirname = dirname(fileURLToPath(import.meta.url));
const configSource = readFileSync(join(__dirname, '../assets/js/firebase-config.js'), 'utf8');
const match = configSource.match(/firebaseConfig\s*=\s*(\{[\s\S]*?\});/);
if (!match) throw new Error('Impossibile leggere firebaseConfig da assets/js/firebase-config.js');
// eslint-disable-next-line no-eval
const firebaseConfig = eval('(' + match[1] + ')');

if (firebaseConfig.apiKey.startsWith('INSERISCI_')) {
  console.error('⚠️  Configura prima assets/js/firebase-config.js con i valori del tuo progetto Firebase.');
  process.exit(1);
}

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
if (!email || !password) {
  console.error('⚠️  Imposta ADMIN_EMAIL e ADMIN_PASSWORD come variabili d\'ambiente prima di eseguire lo script.');
  process.exit(1);
}

const PRODUCTS = [
  { id: 'eiffel', name: 'Torre Eiffel LED', category: 'monumenti', price: 49, shortDesc: 'La dama di ferro parigina, reinterpretata in legno e luce calda.', fullDesc: 'Una replica in scala della Torre Eiffel, intagliata a mano in legno chiaro e cablata con oltre 40 micro LED lungo la struttura reticolare. Un piccolo faro che trasforma una mensola in uno scorcio di Parigi al tramonto.', specs: ['Altezza 26 cm · base 12x12 cm', 'Legno di faggio e metallo verniciato', '40+ micro LED integrati', 'Alimentazione USB, cavo 1.5 m incluso'], iconKey: 'eiffel', sortOrder: 1 },
  { id: 'skyline', name: 'Skyline Milano LED', category: 'monumenti', price: 59, shortDesc: 'Il profilo della città che non dorme mai, acceso sulla tua libreria.', fullDesc: 'Uno skyline stilizzato dei grattacieli milanesi, in resina opaca con finestre luminose realizzate una a una. Ogni edificio ha un circuito indipendente per un effetto profondità realistico.', specs: ['Larghezza 34 cm · altezza 22 cm', 'Resina opaca antiriflesso', '60+ finestre LED indipendenti', 'Alimentazione USB, cavo incluso'], iconKey: 'skyline', sortOrder: 2 },
  { id: 'barca', name: 'Barca a Vela LED', category: 'barche', price: 39, shortDesc: 'Vele che catturano la luce come catturano il vento.', fullDesc: 'Uno scafo in legno di cedro con vele in tessuto naturale, illuminato da una striscia LED che corre lungo l\'alberatura.', specs: ['Altezza 18 cm · lunghezza 24 cm', 'Scafo in cedro, vele in cotone trattato', 'Base espositiva in legno inclusa'], iconKey: 'barca', sortOrder: 3 },
  { id: 'pirata', name: 'Nave Pirata LED', category: 'barche', price: 65, shortDesc: 'Due alberi, vele scure e una lanterna che non si spegne mai.', fullDesc: 'Un vascello corsaro dal dettaglio ricco: ponte in legno scuro, vele dipinte a mano e lanterne LED a bordo.', specs: ['Altezza 24 cm · lunghezza 30 cm', 'Legno scuro trattato a mano', 'Compatibile con telecomando RGB'], iconKey: 'pirata', sortOrder: 4 },
  { id: 'castello', name: 'Castello Incantato LED', category: 'fantasia', price: 72, shortDesc: 'Torri, bandiere e finestre che si accendono una a una.', fullDesc: 'Un castello da fiaba con cinque torri, ognuna con la propria finestra luminosa.', specs: ['Altezza 28 cm · base 20x20 cm', 'Resina a rilievo dipinta a mano', 'Alimentazione USB, timer integrato'], iconKey: 'castello', sortOrder: 5 },
  { id: 'presepe', name: 'Presepe LED con Acqua', category: 'presepi', price: 89, shortDesc: 'Il ruscello scorre davvero, la stella cometa non si spegne mai.', fullDesc: 'Una capanna in legno con un vero micro-circuito ad acqua che simula un ruscello, illuminato dal basso con LED blu.', specs: ['Altezza 20 cm · base 30x22 cm', 'Pompa ad acqua silenziosa inclusa', 'Stella cometa e faretti a LED caldo'], iconKey: 'presepe', sortOrder: 6 },
  { id: 'faro', name: 'Faro LED', category: 'barche', price: 35, shortDesc: 'Un raggio di luce rotante, come sulla costa vera.', fullDesc: 'Un faro marittimo in legno tornito a mano, con lanterna superiore dotata di LED rotante.', specs: ['Altezza 21 cm · base Ø 9 cm', 'Legno tornito, base in pietra ricomposta'], iconKey: 'faro', sortOrder: 7 },
  { id: 'mongolfiera', name: 'Mongolfiera LED', category: 'fantasia', price: 45, shortDesc: 'Sospesa in volo, illuminata dall\'interno come al mattino presto.', fullDesc: 'Una mongolfiera in tessuto rigido e cesto in vimini intrecciato a mano, con un LED interno che replica il bagliore del bruciatore.', specs: ['Altezza 19 cm · diametro pallone 14 cm', 'Cesto in vimini naturale intrecciato', 'Gancio per sospensione incluso'], iconKey: 'mongolfiera', sortOrder: 8 },
];

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

await signInWithEmailAndPassword(auth, email, password);
console.log(`Autenticato come ${email}. Scrittura di ${PRODUCTS.length} prodotti...`);

for (const p of PRODUCTS) {
  const { id, price, ...rest } = p;
  await setDoc(doc(db, 'products', id), {
    ...rest,
    priceCents: Math.round(price * 100),
    image: null,
    isCustom: false,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  console.log(`  ✓ ${p.name}`);
}

console.log('Fatto! Ricarica il sito per vedere i prodotti live da Firebase.');
process.exit(0);
