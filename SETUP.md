# Guida all'attivazione di LedMagico

Il sito e la dashboard sono già scritti e funzionanti in modalità dimostrativa. Per renderli reali (ordini veri, prodotti modificabili, dashboard protetta) serve collegare un progetto Firebase gratuito, sul tuo account **ledmagicoshop@gmail.com**. Questo passaggio richiede il tuo login personale, quindi va fatto da te: qui sotto trovi ogni singolo click.

Tempo richiesto: ~10 minuti (+ 5 minuti per le email automatiche, punto 10). Nessuna carta di credito necessaria.

> **Hai già seguito questa guida in precedenza?** Le regole di sicurezza del database sono cambiate di nuovo (nuova collezione `reviews` per le recensioni): torna al **punto 4** e incolla di nuovo il contenuto aggiornato di `firestore.rules`. Non serve rifare gli altri passaggi.

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
3. Aggiungi anche: `www.ledmagico.it` (il tuo dominio personalizzato — vedi punto 11 più sotto).

Senza questo passaggio il login alla dashboard non funzionerà.

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

**Novità aggiunte in dashboard → Impostazioni:**
- **Link social**: inserisci gli URL di Instagram, Facebook, TikTok, Pinterest, YouTube e WhatsApp — compaiono in automatico nel footer del sito, e il link WhatsApp attiva anche un pulsante flottante per contatto rapido.
- **Recensioni** (nuova scheda): i clienti possono inviarne una dal sito (pulsante "Lascia la tua recensione" sotto la sezione Recensioni); restano "In attesa" finché non le pubblichi tu da dashboard. Puoi modificarne testo, voto, foto o video in qualsiasi momento.
- **Tracciamento ordini**: apri i dettagli di un ordine in **Ordini** per inserire corriere, codice e link di tracciamento — verranno inclusi automaticamente nell'email "Il tuo ordine è partito".

---

## 10. Attiva le email automatiche (gratis, da ledmagicoshop@gmail.com)

Le email (conferma ordine, aggiornamenti di stato, richiesta assistenza/recensione post-consegna, benvenuto newsletter, annunci nuovi prodotti) partono da un piccolo script gratuito collegato **allo stesso account Google** — non serve nessun altro servizio o account esterno.

1. Vai su **[script.google.com](https://script.google.com)**, accedi con **ledmagicoshop@gmail.com**, e crea un **Nuovo progetto**. Chiamalo `LedMagico Mailer`.
2. Cancella il contenuto del file `Codice.gs` di default e incolla al suo posto tutto il contenuto di [google-apps-script/Code.gs](google-apps-script/Code.gs) di questo progetto.
3. In alto a sinistra, clicca l'icona ⚙️ **Impostazioni progetto** → spunta **"Mostra file manifest appsscript.json nell'editor"**.
4. Torna nell'editor, apri il file `appsscript.json` che è comparso, e sostituisci tutto il contenuto con quello di [google-apps-script/appsscript.json](google-apps-script/appsscript.json) di questo progetto.
5. Il blocco `CONFIG` in cima al file è già precompilato con il tuo Project ID e l'URL del sito. Se mi hai già dato i dati del bonifico, anche `BANK_IBAN` e `BANK_HOLDER` sono già compilati — l'email di conferma ordine mostrerà automaticamente IBAN, intestatario e causale (il numero d'ordine). Se non li hai ancora dati, l'email userà un messaggio generico ("ti contatteremo con le istruzioni") finché non li aggiungi.
6. Salva (icona 💾).
7. Nella barra in alto, scegli la funzione **`testInvioEmail`** dal menu a tendina e clicca **▶ Esegui**.
8. Google ti chiederà di autorizzare lo script (**Autorizza accesso** → scegli ledmagicoshop@gmail.com → **Avanzate** → **Vai a LedMagico Mailer (non sicuro)** → **Consenti**). È normale: è il tuo stesso script, su cui hai pieno controllo.
9. Controlla la casella ledmagicoshop@gmail.com: dovresti aver ricevuto l'email di prova. Se sì, tutto funziona.
10. Ora rendilo automatico: menu laterale **Attivazioni** (icona a orologio) → **+ Aggiungi trigger** →
    - Funzione da eseguire: `runLedMagicoMailer`
    - Origine evento: **Basato sul tempo**
    - Tipo: **Timer minuti** → **Ogni 10 minuti**
    - Salva.

Da questo momento, ogni ordine, richiesta o cambio di stato genera automaticamente l'email corrispondente entro ~10 minuti, inviata da ledmagicoshop@gmail.com. Le email "di assistenza/recensione" partono da sole 9 giorni dopo che segni un ordine come "Spedito" in dashboard.

**Costo:** zero, per sempre — Google Apps Script è gratuito senza limiti di piano per un volume come questo (quota gratuita: 20.000 chiamate/giorno, invio email nei limiti giornalieri del tuo Gmail).

---

## 11. Collega il dominio www.ledmagico.it

Ho già preparato il sito lato codice (file `CNAME` nel repository, che dice a GitHub Pages "servi questo sito anche su www.ledmagico.it"). Restano solo due cose da fare **da te**, perché richiedono l'accesso al pannello del tuo dominio, che io non ho:

1. Vai dal fornitore da cui hai comprato `ledmagico.it` (es. Aruba, Register.it, ecc.) → gestione DNS del dominio.
2. Crea questo record:
   - **Tipo:** CNAME
   - **Nome/host:** `www`
   - **Valore/punta a:** `francescocampanelli5.github.io`
3. **Opzionale ma consigliato** — per far funzionare anche `ledmagico.it` senza `www` (spesso il fornitore lo chiama "redirect" o "forwarding" del dominio principale): imposta un redirect da `ledmagico.it` a `https://www.ledmagico.it`. Se il tuo fornitore non offre il forwarding, in alternativa crea 4 record **A** sul nome nudo (`@` o vuoto) che puntano a:
   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```
4. La propagazione DNS può richiedere da pochi minuti fino a 24-48 ore.
5. Una volta propagato, vai su **[github.com/francescocampanelli5/ledmagico/settings/pages](https://github.com/francescocampanelli5/ledmagico/settings/pages)**: GitHub rileverà il dominio e, dopo la verifica, comparirà l'opzione **"Enforce HTTPS"** — spuntala per avere il lucchetto verde.
6. Fammi sapere quando è tutto verificato: a quel punto aggiorno i link nelle email automatiche e nel codice dal vecchio indirizzo `francescocampanelli5.github.io/ledmagico` al nuovo `www.ledmagico.it`.

---

## Il "database": dove vedere davvero i tuoi dati

Hai due modi per vedere i dati del negozio, entrambi protetti da credenziali tue e solo tue:

1. **`/admin` sul tuo sito** ([francescocampanelli5.github.io/ledmagico/admin/](https://francescocampanelli5.github.io/ledmagico/admin/)) — l'interfaccia pensata per l'uso quotidiano: prodotti, ordini, richieste, iscritti, tutto leggibile e modificabile con pochi click. Login: l'email/password create al punto 6.
2. **Firebase Console → Firestore Database** ([console.firebase.google.com](https://console.firebase.google.com), progetto → Firestore Database → scheda Dati) — la vista "grezza" del database vero e proprio, utile se un giorno vuoi controllare o correggere qualcosa a basso livello. Accesso: il tuo login Google (ledmagicoshop@gmail.com).

Per il lavoro di tutti i giorni ti consiglio `/admin`: è quella costruita apposta per essere semplice.

---

## Prossimi passi facoltativi

- **Dati legali reali**: apri [legal/termini.html](legal/termini.html), [legal/privacy.html](legal/privacy.html) e [legal/recesso.html](legal/recesso.html) e sostituisci i campi `[TRA PARENTESI QUADRE]` con i dati reali della tua attività (ragione sociale, P.IVA, indirizzo). Fai verificare il testo finale da un commercialista o legale prima di iniziare a vendere davvero.
- **Pagamenti automatici online (Stripe)**: al momento gli ordini vengono raccolti regolarmente nel database e li gestisci manualmente (contatti il cliente via email per il pagamento, es. bonifico — l'email parte già in automatico). Attivare pagamenti automatici richiede un piccolo servizio aggiuntivo. Quando sei pronta/o, dimmelo: lo aggiungiamo senza toccare il resto.
