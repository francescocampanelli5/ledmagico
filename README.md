# LedMagico

**Modellini artigianali illuminati a LED.** E-commerce completo per un brand che trasforma modellini in legno e resina — torri, navi, castelli, presepi — in piccoli mondi che si illuminano, sia di catalogo sia realizzati su misura.

🔗 Sito live: **[francescocampanelli5.github.io/ledmagico](https://francescocampanelli5.github.io/ledmagico/)**

## Stato del progetto

Il sito e la dashboard sono completi e funzionanti. Finché il progetto Firebase non è collegato, il sito gira in **modalità dimostrativa** (dati di esempio, ordini non salvati). Per attivarlo con dati reali segui **[SETUP.md](SETUP.md)** — richiede solo un account Firebase gratuito (piano Spark, nessuna carta di credito) sul tuo indirizzo email.

## Funzionalità

**Negozio pubblico**
- Catalogo prodotti filtrabile, gestito interamente dalla dashboard (nessun redeploy necessario per aggiungere o modificare un prodotto — gli aggiornamenti sono in tempo reale)
- Quick view con selezione colore LED, carrello persistente, checkout con dati di spedizione
- Modulo "su misura" per richieste di preventivo personalizzato
- Pagine legali: Termini e Condizioni, Privacy Policy, Diritto di Recesso (con la distinzione corretta tra prodotti di catalogo, per cui vale il recesso di 14 giorni, e pezzi su misura, esclusi per legge — vedi nota in `legal/recesso.html`)
- FAQ, recensioni, newsletter, design responsive con tema scuro oro/ambra

**Dashboard privata** (`/admin`, protetta da login)
- Gestione prodotti: aggiungi, modifica, nascondi o elimina, con upload foto (compressa automaticamente) o icona illustrata di fallback
- Gestione ordini: stato (da confermare → confermato → spedito), dettagli cliente e spedizione
- Gestione richieste "su misura"

## Stack

- **Frontend**: HTML, CSS, JavaScript vanilla (moduli ES nativi, nessun build step)
- **Backend**: [Firebase](https://firebase.google.com) — Firestore (database), Authentication (login dashboard), piano gratuito Spark
- **Hosting**: GitHub Pages (funziona con qualunque host statico)
- Pagamenti ed email automatiche non sono ancora collegati: gli ordini vengono raccolti regolarmente e gestiti manualmente finché non si attiva un servizio a pagamento dedicato (vedi fondo di `SETUP.md`)

```
index.html                   Homepage / negozio
admin/                       Dashboard privata (prodotti, ordini, richieste)
legal/                       Termini, Privacy, Diritto di recesso
assets/css/                  Stili (storefront + dashboard)
assets/js/
  firebase-config.js         Configurazione del tuo progetto Firebase (da compilare)
  firebase-app.js            Livello dati condiviso (Firestore/Auth)
  icons.js                   Illustrazioni SVG dei prodotti
  script.js                  Logica dello storefront
firestore.rules              Regole di sicurezza del database
scripts/seed-products.mjs    Script opzionale per popolare il catalogo iniziale
SETUP.md                     Guida passo-passo all'attivazione
```

## Sviluppo locale

```bash
python -m http.server 5173
```

poi apri `http://localhost:5173`.
