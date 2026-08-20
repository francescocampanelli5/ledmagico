# Guida all'attivazione di LedMagico

Il sito e la dashboard sono già scritti e funzionanti in modalità dimostrativa. Per renderli reali (ordini veri, prodotti modificabili, dashboard protetta) serve collegare un progetto Firebase gratuito, sul tuo account **ledmagicoshop@gmail.com**. Questo passaggio richiede il tuo login personale, quindi va fatto da te: qui sotto trovi ogni singolo click.

Tempo richiesto: ~10 minuti. Nessuna carta di credito necessaria.

---

## 1. Crea il progetto Firebase

1. Vai su **[console.firebase.google.com](https://console.firebase.google.com)** e accedi con **ledmagicoshop@gmail.com**.
2. Clicca **"Aggiungi progetto"**.
3. Nome progetto: `ledmagico` (o quello che preferisci).
4. Alla richiesta su Google Analytics, puoi **disattivarlo** (non serve).
5. Clicca **Crea progetto** e attendi il completamento.

## 2. Registra l'app web e copia la configurazione

1. Nella home del progetto, clicca l'icona **`</>`** ("Aggiungi app" → Web).
2. Nickname app: `LedMagico Web`.
3. **Non** selezionare "Configura anche Firebase Hosting" (il sito è già pubblicato su GitHub Pages).
4. Clicca **Registra app**: comparirà un blocco di codice con un oggetto `firebaseConfig`.
5. Copia i valori (`apiKey`, `authDomain`, `projectId`, ecc.) e incollali in [assets/js/firebase-config.js](assets/js/firebase-config.js), sostituendo tutti i valori `INSERISCI_...`.
6. Fai commit e push del file aggiornato (o chiedi a Claude di farlo per te).

## 3. Attiva Firestore Database

1. Nel menu laterale: **Build → Firestore Database → Crea database**.
2. Modalità: **Produzione** (le regole di sicurezza sono già pronte nel progetto).
3. Località: una regione europea, es. `eur3 (europe-west)`, per tenere i dati nell'UE.
4. Clicca **Abilita**.

## 4. Incolla le regole di sicurezza

1. Vai su **Firestore Database → Regole**.
2. Sostituisci tutto il contenuto con quello del file [firestore.rules](firestore.rules) di questo progetto.
3. Clicca **Pubblica**.

Queste regole permettono a chiunque di leggere i prodotti attivi e di inviare un ordine o una richiesta, ma **solo a te** (una volta autenticato) di leggerli, modificarli o gestire i prodotti.

## 5. Attiva l'accesso email/password

1. **Build → Authentication → Inizia**.
2. Scheda **Sign-in method → Email/Password → Abilita → Salva**.

## 6. Crea il tuo utente amministratore

1. **Authentication → Users → Add user**.
2. Email: `ledmagicoshop@gmail.com`
3. Password: scegli una password sicura — sarà quella per accedere a `/admin` sul sito.

Nota: questa password non passa mai da Claude — la scegli e la inserisci tu direttamente nella console Firebase.

## 7. Autorizza il dominio del sito

1. **Authentication → Settings → Authorized domains → Add domain**.
2. Aggiungi: `francescocampanelli5.github.io`
3. Se in futuro usi un dominio personalizzato, aggiungi anche quello.

Senza questo passaggio il login alla dashboard non funzionerà da GitHub Pages.

## 8. Popola i prodotti

Hai due opzioni:

**A. Manualmente (consigliato per iniziare):** apri `https://francescocampanelli5.github.io/ledmagico/admin/`, accedi con l'email e la password create al punto 6, e aggiungi i tuoi prodotti da **"+ Nuovo prodotto"**.

**B. Con lo script di importazione** (ricrea il catalogo dimostrativo dei modellini con un comando):

```bash
npm install
```

```bash
ADMIN_EMAIL=ledmagicoshop@gmail.com ADMIN_PASSWORD='la-tua-password' node scripts/seed-products.mjs
```

## 9. Verifica finale

- Ricarica il sito pubblico: la nota in fondo alla pagina non deve più dire "modalità dimostrativa".
- Fai un ordine di prova dal sito → controlla che compaia in `/admin` → **Ordini**.
- Invia una richiesta dal modulo "Su misura" → controlla `/admin` → **Richieste su misura**.
- Modifica un prezzo da `/admin` → controlla che si aggiorni sul sito pubblico (in tempo reale, senza bisogno di ripubblicare nulla).

---

## Prossimi passi facoltativi

- **Dati legali reali**: apri [legal/termini.html](legal/termini.html), [legal/privacy.html](legal/privacy.html) e [legal/recesso.html](legal/recesso.html) e sostituisci i campi `[TRA PARENTESI QUADRE]` con i dati reali della tua attività (ragione sociale, P.IVA, indirizzo). Fai verificare il testo finale da un commercialista o legale prima di iniziare a vendere davvero.
- **Pagamenti automatici online (Stripe) ed email automatiche**: al momento gli ordini vengono raccolti regolarmente nel database e li gestisci manualmente (contatti il cliente via email per il pagamento, es. bonifico). Automatizzare pagamenti ed email richiede un piccolo servizio aggiuntivo (Firebase da solo, sul piano gratuito, non può contattare servizi esterni come Stripe). Quando sei pronta/o, dimmelo: lo aggiungiamo senza toccare il resto.
