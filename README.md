# LedMagico

**Modellini artigianali illuminati a LED.** Sito e-commerce dimostrativo per un brand che trasforma modellini in legno e resina — torri, navi, castelli, presepi — in piccoli mondi che si illuminano.

Progetto front-end statico, pensato per mostrare copy, design e interazioni di un vero e-commerce: nessun pagamento reale viene processato.

## Anteprima

Sito live su GitHub Pages: **verrà aggiunto dopo la pubblicazione**

## Funzionalità

- **Catalogo prodotti** filtrabile per categoria (Monumenti, Barche & Mare, Presepi, Fantasia), con illustrazioni SVG originali disegnate a mano per ogni modellino
- **Quick view prodotto** con selezione del colore LED (bianco caldo / blu notte / RGB) che aggiorna l'illustrazione in tempo reale, selettore quantità e scheda tecnica
- **Carrello persistente** (localStorage) con drawer laterale, modifica quantità e subtotale live
- **Checkout simulato** con numero ordine generato e conferma visiva
- **Form "su misura"** per richieste di preventivo personalizzato, con validazione
- **FAQ ad accordion**, form newsletter, sezione recensioni, animazioni on-scroll
- **Design responsive** (mobile, tablet, desktop) con tema scuro, palette oro/ambra e tipografia Playfair Display + Inter

## Stack

HTML, CSS e JavaScript vanilla — nessuna dipendenza, nessun build step. Font caricati da Google Fonts.

```
index.html
assets/
  css/style.css
  js/script.js
```

## Sviluppo locale

Basta un qualsiasi server statico, ad esempio:

```bash
python -m http.server 5173
```

poi apri `http://localhost:5173`.

---

Progetto dimostrativo creato con Claude Code.
