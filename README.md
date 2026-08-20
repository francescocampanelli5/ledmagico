# LedMagico

**Modellini artigianali illuminati a LED.** E-commerce completo per un brand che procura modellini e li personalizza a mano con impianti LED — torri, navi, castelli, presepi — realizzati su richiesta, anche a partire da un link fornito dal cliente.

🔗 Sito live: **[francescocampanelli5.github.io/ledmagico](https://francescocampanelli5.github.io/ledmagico/)**

## Stato del progetto

Il sito e la dashboard sono completi e funzionanti. Finché il progetto Firebase non è collegato, il sito gira in **modalità dimostrativa** (dati di esempio, ordini non salvati). Per attivarlo con dati reali ed email automatiche segui **[SETUP.md](SETUP.md)** — richiede solo il tuo account Google (ledmagicoshop@gmail.com), piani gratuiti, nessuna carta di credito.

## Funzionalità

**Negozio pubblico**
- Catalogo prodotti filtrabile, gestito interamente dalla dashboard (nessun redeploy necessario per aggiungere o modificare un prodotto — gli aggiornamenti sono in tempo reale)
- Quick view con selezione colore LED, carrello persistente, checkout con dati di spedizione
- Modulo "su misura" per richieste di preventivo personalizzato — anche a partire da un semplice link a un prodotto da personalizzare
- Pagine legali: Termini e Condizioni, Privacy Policy, Diritto di Recesso — tutti i prodotti sono realizzati su misura dopo l'ordine, quindi non soggetti a recesso "cambio idea" (art. 59 Codice del Consumo), con framing chiaro ma non invasivo in fase di acquisto e garanzia legale di 24 mesi sempre valida
- FAQ, recensioni, newsletter con iscrizione reale e disiscrizione con un click, design responsive con tema scuro oro/ambra

**Dashboard privata** (`/admin`, protetta da login — è anche il modo più semplice per consultare "il database")
- Gestione prodotti: aggiungi, modifica, nascondi o elimina, con upload foto (compressa automaticamente) o icona illustrata di fallback; un click per annunciare un nuovo prodotto agli iscritti
- Gestione ordini: stato (da confermare → confermato → spedito), dettagli cliente e spedizione — ogni cambio di stato invia in automatico l'email corrispondente al cliente
- Gestione richieste "su misura" (inclusi eventuali link prodotto allegati) e lista iscritti alla newsletter

**Email automatiche** (gratis, per sempre, inviate da ledmagicoshop@gmail.com)
- Conferma ordine, notifica al negozio, conferma richiesta preventivo, aggiornamenti di stato ordine
- Follow-up automatico ~9 giorni dopo la spedizione: messaggio unico che unisce assistenza post-vendita e richiesta di recensione (bassa pressione, alta conversione)
- Benvenuto all'iscrizione newsletter e annunci nuovi prodotti solo agli iscritti consenzienti (mai email di marketing non richieste)
- Motore: [Google Apps Script](https://script.google.com) collegato allo stesso account Google del negozio — nessun servizio terzo, nessuna carta di credito, vedi `google-apps-script/`

## Sicurezza

- Tutti i contenuti inseriti dagli utenti (nome, indirizzo, note, idea del preventivo) vengono sempre sfuggiti (`escapeHtml`) prima di finire nella dashboard, per prevenire XSS
- I link forniti dagli utenti vengono validati (solo http/https) prima di essere resi cliccabili
- Regole di sicurezza Firestore: i visitatori possono solo creare ordini/richieste/iscrizioni, mai leggere i dati di altri; solo l'amministratore autenticato può leggere, modificare o eliminare
- `Content-Security-Policy` e `Referrer-Policy` su ogni pagina; `/admin` e la pagina di disiscrizione sono escluse dall'indicizzazione (`noindex` + `robots.txt`)
- Nessun dato personale dei clienti è mai visibile pubblicamente: l'unico contatto esposto sul sito è l'email del negozio

## Stack

- **Frontend**: HTML, CSS, JavaScript vanilla (moduli ES nativi, nessun build step)
- **Backend**: [Firebase](https://firebase.google.com) — Firestore (database), Authentication (login dashboard), piano gratuito Spark
- **Email**: Google Apps Script (stesso account Google), piano gratuito
- **Hosting**: GitHub Pages (funziona con qualunque host statico)
- Pagamenti online (Stripe) non sono ancora collegati: gli ordini vengono raccolti regolarmente e gestiti manualmente (bonifico) finché non si attiva un servizio a pagamento dedicato (vedi fondo di `SETUP.md`)

```
index.html                   Homepage / negozio
unsubscribe.html              Pagina di disiscrizione newsletter (un click dal link nelle email)
admin/                       Dashboard privata (prodotti, ordini, richieste, iscritti)
legal/                       Termini, Privacy, Diritto di recesso
assets/css/                  Stili (storefront + dashboard)
assets/js/
  firebase-config.js         Configurazione del tuo progetto Firebase (da compilare)
  firebase-app.js            Livello dati condiviso (Firestore/Auth) + coda email
  icons.js                   Illustrazioni SVG dei prodotti
  sanitize.js                Utility di sicurezza (escaping HTML, validazione URL)
  script.js                  Logica dello storefront
firestore.rules              Regole di sicurezza del database
google-apps-script/          Motore email automatico (Code.gs + appsscript.json)
scripts/seed-products.mjs    Script opzionale per popolare il catalogo iniziale
SETUP.md                     Guida passo-passo all'attivazione (Firebase + email)
```

## Sviluppo locale

```bash
python -m http.server 5173
```

poi apri `http://localhost:5173`.
