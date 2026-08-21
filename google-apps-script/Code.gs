/**
 * LedMagico — Motore email automatico.
 *
 * Cosa fa: legge la "coda email" (collezione mail_outbox) scritta dal sito
 * e dalla dashboard su Firestore, e invia le email corrispondenti tramite
 * Gmail, direttamente dall'account Google a cui appartiene questo script
 * (deve essere ledmagicoshop@gmail.com). Nessun altro servizio esterno è
 * coinvolto: tutto resta sull'unico account Google del negozio, gratis.
 *
 * Non serve nessun deploy "Web App": basta eseguire runLedMagicoMailer una
 * volta manualmente (per autorizzare i permessi) e poi aggiungere un
 * trigger a tempo che la richiami ogni 10 minuti. Istruzioni complete in
 * SETUP.md, sezione "Email automatiche".
 */

// ========================= CONFIGURAZIONE =========================
// Sostituisci questi valori con quelli del tuo progetto Firebase e del sito.
const CONFIG = {
  FIREBASE_PROJECT_ID: 'ledmagico-fe309', // stesso projectId di assets/js/firebase-config.js
  SHOP_EMAIL: 'ledmagicoshop@gmail.com',
  SHOP_NAME: 'LedMagico',
  SITE_URL: 'https://francescocampanelli5.github.io/ledmagico', // URL pubblico del sito, senza slash finale
  FOLLOW_UP_AFTER_DAYS: 9, // giorni dopo la spedizione per l'email di assistenza/recensione
  BANK_IBAN: 'INSERISCI_IBAN',
  BANK_HOLDER: 'INSERISCI_INTESTATARIO',
  BANK_NAME: '', // opzionale, es. "Intesa Sanpaolo" — lascia vuoto se non vuoi mostrarlo
};
// =====================================================================

const FIRESTORE_BASE = () =>
  `https://firestore.googleapis.com/v1/projects/${CONFIG.FIREBASE_PROJECT_ID}/databases/(default)/documents`;

/**
 * Punto di ingresso unico: aggiungi QUESTA funzione come trigger a tempo
 * (Attivazioni → Aggiungi trigger → runLedMagicoMailer → basato sul tempo
 * → ogni 10 minuti).
 */
function runLedMagicoMailer() {
  try {
    scheduleFollowUps_();
  } catch (err) {
    console.error('scheduleFollowUps_ error: ' + err);
  }
  try {
    processOutbox_();
  } catch (err) {
    console.error('processOutbox_ error: ' + err);
  }
}

// ========================= CODA EMAIL =========================

function processOutbox_() {
  const items = firestoreRunQuery_({
    structuredQuery: {
      from: [{ collectionId: 'mail_outbox' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'sent' },
          op: 'EQUAL',
          value: { booleanValue: false },
        },
      },
      limit: 25,
    },
  });

  items.forEach((item) => {
    const id = idFromName_(item.name);
    const data = firestoreDecode_(item.fields);
    try {
      sendForOutboxItem_(data);
      firestorePatch_(`mail_outbox/${id}`, { sent: true, sentAt: nowIso_() });
    } catch (err) {
      console.error(`Errore invio mail_outbox/${id}: ${err}`);
      firestorePatch_(`mail_outbox/${id}`, { sent: true, error: String(err).slice(0, 500), sentAt: nowIso_() });
    }
  });
}

function sendForOutboxItem_(item) {
  switch (item.type) {
    case 'order_received':
      return sendOrderReceived_(item);
    case 'owner_new_order':
      return sendOwnerNewOrder_(item);
    case 'quote_received':
      return sendQuoteReceived_(item);
    case 'owner_new_quote':
      return sendOwnerNewQuote_(item);
    case 'order_status_changed':
      return sendOrderStatusChanged_(item);
    case 'order_followup':
      return sendOrderFollowUp_(item);
    case 'newsletter_welcome':
      return sendNewsletterWelcome_(item);
    case 'product_announcement':
      return sendProductAnnouncement_(item);
    default:
      console.warn('Tipo email sconosciuto: ' + item.type);
  }
}

// ========================= FOLLOW-UP AUTOMATICI (spedito → assistenza/recensione) =========================

function scheduleFollowUps_() {
  const orders = firestoreRunQuery_({
    structuredQuery: {
      from: [{ collectionId: 'orders' }],
      where: {
        compositeFilter: {
          op: 'AND',
          filters: [
            { fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: 'spedito' } } },
            { fieldFilter: { field: { fieldPath: 'followUpSent' }, op: 'EQUAL', value: { booleanValue: false } } },
          ],
        },
      },
      limit: 50,
    },
  });

  const now = new Date();
  orders.forEach((doc) => {
    const id = idFromName_(doc.name);
    const data = firestoreDecode_(doc.fields);
    const shippedAt = data.updatedAt ? new Date(data.updatedAt) : null;
    if (!shippedAt) return;
    const daysSince = (now - shippedAt) / (1000 * 60 * 60 * 24);
    if (daysSince >= CONFIG.FOLLOW_UP_AFTER_DAYS) {
      firestoreCreate_('mail_outbox', {
        type: 'order_followup',
        to: data.customerEmail || '',
        refCollection: 'orders',
        refId: id,
        meta: {},
        sent: false,
        createdAt: nowIso_(),
      });
      firestorePatch_(`orders/${id}`, { followUpSent: true });
    }
  });
}

// ========================= TEMPLATE + INVIO =========================

function bankConfigured_() {
  return !CONFIG.BANK_IBAN.startsWith('INSERISCI_') && !CONFIG.BANK_HOLDER.startsWith('INSERISCI_');
}

function bankInstructionsHtml_(order, orderId) {
  if (!bankConfigured_()) {
    return `<p>Ti contatteremo a breve a questo indirizzo con le istruzioni per completare il pagamento (bonifico bancario).</p>`;
  }
  const amount = ((order.subtotalCents || 0) / 100).toFixed(2);
  return `
    <div style="background:#0a0c16;border:1px solid rgba(244,201,120,0.25);border-radius:10px;padding:16px 18px;margin:16px 0;">
      <p style="margin:0 0 8px;font-weight:bold;color:#f4c064;">Come pagare</p>
      <p style="margin:0 0 4px;">Bonifico bancario a:</p>
      <p style="margin:0 0 4px;">IBAN: <strong>${escapeHtml_(CONFIG.BANK_IBAN)}</strong></p>
      <p style="margin:0 0 4px;">Intestatario: <strong>${escapeHtml_(CONFIG.BANK_HOLDER)}</strong></p>
      ${CONFIG.BANK_NAME ? `<p style="margin:0 0 4px;">Banca: ${escapeHtml_(CONFIG.BANK_NAME)}</p>` : ''}
      <p style="margin:0 0 4px;">Importo: <strong>€${amount}</strong></p>
      <p style="margin:0;">Causale: <strong>${escapeHtml_(orderId)}</strong> (indicala sempre, ci serve per riconoscere il tuo pagamento)</p>
    </div>
    <p>Appena il bonifico risulta arrivato confermiamo l'ordine e iniziamo la lavorazione — riceverai un'altra email.</p>`;
}

function sendOrderReceived_(item) {
  const order = firestoreGetDecoded_(`orders/${item.refId}`);
  if (!order) return;
  const itemsHtml = (order.items || [])
    .map((it) => `<li>${it.qty} × ${escapeHtml_(it.name)} (${escapeHtml_(it.colorLabel || it.color)})</li>`)
    .join('');
  const html = wrapEmail_(
    'Il tuo ordine è confermato',
    `<p>Ciao ${escapeHtml_(order.customerName)},</p>
     <p>Grazie per aver scelto ${CONFIG.SHOP_NAME}! Abbiamo ricevuto il tuo ordine <strong>${escapeHtml_(item.refId)}</strong>:</p>
     <ul>${itemsHtml}</ul>
     <p><strong>Totale: €${((order.subtotalCents || 0) / 100).toFixed(2)}</strong></p>
     <p>Il tuo pezzo verrà ora procurato e cablato su misura per te.</p>
     ${bankInstructionsHtml_(order, item.refId)}
     <p>Qualsiasi domanda, rispondi pure a questa email.</p>`
  );
  GmailApp.sendEmail(order.customerEmail, `Ordine ricevuto — ${item.refId}`, plainFallback_(html), {
    htmlBody: html,
    name: CONFIG.SHOP_NAME,
  });
}

function sendOwnerNewOrder_(item) {
  const order = firestoreGetDecoded_(`orders/${item.refId}`);
  if (!order) return;
  const itemsHtml = (order.items || []).map((it) => `<li>${it.qty} × ${escapeHtml_(it.name)} (${escapeHtml_(it.colorLabel || it.color)})</li>`).join('');
  const html = wrapEmail_(
    'Nuovo ordine ricevuto',
    `<p>Cliente: ${escapeHtml_(order.customerName)} — ${escapeHtml_(order.customerEmail)}</p>
     <p>Telefono: ${escapeHtml_(order.customerPhone || '—')}</p>
     <p>Indirizzo: ${escapeHtml_(order.shippingAddress)}</p>
     <ul>${itemsHtml}</ul>
     <p><strong>Totale: €${((order.subtotalCents || 0) / 100).toFixed(2)}</strong></p>
     ${order.notes ? `<p>Note: ${escapeHtml_(order.notes)}</p>` : ''}
     <p><a href="${CONFIG.SITE_URL}/admin/">Apri la dashboard</a></p>`
  );
  GmailApp.sendEmail(CONFIG.SHOP_EMAIL, `Nuovo ordine ${item.refId} — €${((order.subtotalCents || 0) / 100).toFixed(2)}`, plainFallback_(html), {
    htmlBody: html,
    name: CONFIG.SHOP_NAME,
  });
}

function sendQuoteReceived_(item) {
  const quote = firestoreGetDecoded_(`quotes/${item.refId}`);
  if (!quote) return;
  const html = wrapEmail_(
    'Abbiamo ricevuto la tua richiesta',
    `<p>Ciao ${escapeHtml_(quote.name)},</p>
     <p>Grazie per averci raccontato la tua idea. Ti risponderemo entro 48 ore con un preventivo su misura.</p>
     <p style="color:#a9aec4;font-style:italic;">"${escapeHtml_(quote.idea)}"</p>
     ${quote.productLink ? `<p>Link ricevuto: ${escapeHtml_(quote.productLink)}</p>` : ''}`
  );
  GmailApp.sendEmail(quote.email, 'Richiesta ricevuta — LedMagico', plainFallback_(html), { htmlBody: html, name: CONFIG.SHOP_NAME });
}

function sendOwnerNewQuote_(item) {
  const quote = firestoreGetDecoded_(`quotes/${item.refId}`);
  if (!quote) return;
  const html = wrapEmail_(
    'Nuova richiesta su misura',
    `<p>Da: ${escapeHtml_(quote.name)} — ${escapeHtml_(quote.email)}</p>
     <p>${escapeHtml_(quote.idea)}</p>
     ${quote.productLink ? `<p>Link: ${escapeHtml_(quote.productLink)}</p>` : ''}
     <p><a href="${CONFIG.SITE_URL}/admin/">Apri la dashboard</a></p>`
  );
  GmailApp.sendEmail(CONFIG.SHOP_EMAIL, `Nuova richiesta da ${quote.name}`, plainFallback_(html), { htmlBody: html, name: CONFIG.SHOP_NAME });
}

function sendOrderStatusChanged_(item) {
  const order = firestoreGetDecoded_(`orders/${item.refId}`);
  if (!order) return;
  const status = (item.meta && item.meta.status) || '';
  const copy = {
    confermato: {
      subject: `Pagamento confermato — ${item.refId}`,
      title: 'Pagamento confermato',
      body: `<p>Ciao ${escapeHtml_(order.customerName)},</p><p>Abbiamo confermato il pagamento del tuo ordine <strong>${escapeHtml_(item.refId)}</strong>. Il tuo pezzo è ora in lavorazione: lo prepariamo e cabliamo su misura per te.</p>`,
    },
    spedito: {
      subject: `Il tuo ordine è partito — ${item.refId}`,
      title: 'Il tuo modellino è in viaggio',
      body: `<p>Ciao ${escapeHtml_(order.customerName)},</p><p>Il tuo ordine <strong>${escapeHtml_(item.refId)}</strong> è stato spedito. Grazie per aver scelto ${CONFIG.SHOP_NAME}!</p>`,
    },
    annullato: {
      subject: `Ordine annullato — ${item.refId}`,
      title: 'Ordine annullato',
      body: `<p>Ciao ${escapeHtml_(order.customerName)},</p><p>Il tuo ordine <strong>${escapeHtml_(item.refId)}</strong> è stato annullato. Se pensi sia un errore o hai domande, rispondi pure a questa email.</p>`,
    },
  }[status];
  if (!copy) return;
  const html = wrapEmail_(copy.title, copy.body);
  GmailApp.sendEmail(order.customerEmail, copy.subject, plainFallback_(html), { htmlBody: html, name: CONFIG.SHOP_NAME });
}

function sendOrderFollowUp_(item) {
  const order = firestoreGetDecoded_(`orders/${item.refId}`);
  if (!order) return;
  const firstItem = (order.items || [])[0];
  const productName = firstItem ? firstItem.name : 'il tuo modellino';
  const html = wrapEmail_(
    'Com\'è andata?',
    `<p>Ciao ${escapeHtml_(order.customerName)},</p>
     <p>Il tuo ${escapeHtml_(productName)} dovrebbe essere arrivato da qualche giorno. Speriamo che si sia già acceso un angolo di casa tua! ✨</p>
     <p>Se qualcosa non va o hai bisogno di assistenza, rispondi pure a questa email: siamo qui per aiutarti.</p>
     <p>Se invece è tutto perfetto, una tua recensione ci aiuterebbe moltissimo a far conoscere ${CONFIG.SHOP_NAME} — bastano due minuti.</p>`
  );
  GmailApp.sendEmail(order.customerEmail, `Com'è andata con il tuo ordine ${item.refId}?`, plainFallback_(html), { htmlBody: html, name: CONFIG.SHOP_NAME });
}

function sendNewsletterWelcome_(item) {
  const sub = firestoreGetDecoded_(`subscribers/${item.refId}`);
  if (!sub) return;
  const unsubUrl = `${CONFIG.SITE_URL}/unsubscribe.html?id=${encodeURIComponent(item.refId)}`;
  const html = wrapEmail_(
    'Benvenuto/a!',
    `<p>Grazie per esserti iscritto/a agli aggiornamenti di ${CONFIG.SHOP_NAME}.</p>
     <p>Di tanto in tanto ti scriveremo per presentarti i nuovi modelli e qualche ispirazione — niente spam, promesso.</p>
     <p style="font-size:12px;color:#6d7290;">Puoi disiscriverti in qualsiasi momento: <a href="${unsubUrl}">clicca qui</a>.</p>`
  );
  GmailApp.sendEmail(sub.email, `Benvenuto/a in ${CONFIG.SHOP_NAME}`, plainFallback_(html), { htmlBody: html, name: CONFIG.SHOP_NAME });
}

function sendProductAnnouncement_(item) {
  const product = firestoreGetDecoded_(`products/${item.refId}`);
  if (!product) return;
  const subs = firestoreRunQuery_({
    structuredQuery: {
      from: [{ collectionId: 'subscribers' }],
      where: { fieldFilter: { field: { fieldPath: 'unsubscribed' }, op: 'EQUAL', value: { booleanValue: false } } },
      limit: 500,
    },
  });
  subs.forEach((doc) => {
    const subId = idFromName_(doc.name);
    const sub = firestoreDecode_(doc.fields);
    if (!sub.email) return;
    const unsubUrl = `${CONFIG.SITE_URL}/unsubscribe.html?id=${encodeURIComponent(subId)}`;
    const html = wrapEmail_(
      'Novità in collezione',
      `<p>Abbiamo aggiunto un nuovo modello: <strong>${escapeHtml_(product.name)}</strong>.</p>
       <p>${escapeHtml_(product.shortDesc || '')}</p>
       <p><a href="${CONFIG.SITE_URL}/#collezione" style="color:#f4c064;">Scoprilo sul sito →</a></p>
       <p style="font-size:12px;color:#6d7290;">Non vuoi più ricevere questi annunci? <a href="${unsubUrl}">Disiscriviti</a>.</p>`
    );
    GmailApp.sendEmail(sub.email, `Novità: ${product.name} è arrivato su ${CONFIG.SHOP_NAME}`, plainFallback_(html), { htmlBody: html, name: CONFIG.SHOP_NAME });
  });
}

// ========================= TEMPLATE HTML =========================

function wrapEmail_(title, bodyHtml) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#0a0c16;font-family:Georgia,serif;">
    <div style="max-width:520px;margin:0 auto;padding:32px 24px;color:#f3f1ea;">
      <div style="text-align:center;margin-bottom:24px;">
        <span style="font-size:22px;font-weight:700;color:#f3f1ea;">Led<span style="color:#f4c064;">Magico</span></span>
      </div>
      <div style="background:#12162a;border:1px solid rgba(244,201,120,0.2);border-radius:16px;padding:28px;">
        <h1 style="font-size:20px;margin:0 0 16px;color:#f4c064;">${escapeHtml_(title)}</h1>
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#d5d8e6;">${bodyHtml}</div>
      </div>
      <p style="text-align:center;font-size:11px;color:#6d7290;margin-top:20px;">${CONFIG.SHOP_NAME} — Modellini artigianali illuminati a LED</p>
    </div>
  </body></html>`;
}

function plainFallback_(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function escapeHtml_(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ========================= FIRESTORE REST HELPERS =========================
// Autenticazione: usa i permessi Google dell'account proprietario di questo
// script (lo stesso account del progetto Firebase), quindi bypassa le
// regole di sicurezza Firestore come farebbe un server admin fidato.

function firestoreGetDecoded_(path) {
  const res = UrlFetchApp.fetch(`${FIRESTORE_BASE()}/${path}`, {
    method: 'get',
    headers: { Authorization: `Bearer ${ScriptApp.getOAuthToken()}` },
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() === 404) return null;
  const json = JSON.parse(res.getContentText());
  if (json.error) {
    console.error(`Firestore GET ${path} error: ${JSON.stringify(json.error)}`);
    return null;
  }
  return firestoreDecode_(json.fields);
}

function firestoreRunQuery_(query) {
  const res = UrlFetchApp.fetch(`${FIRESTORE_BASE()}:runQuery`, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: `Bearer ${ScriptApp.getOAuthToken()}` },
    payload: JSON.stringify(query),
    muteHttpExceptions: true,
  });
  const json = JSON.parse(res.getContentText());
  if (!Array.isArray(json)) {
    console.error('Firestore runQuery error: ' + res.getContentText());
    return [];
  }
  return json.filter((r) => r.document).map((r) => r.document);
}

function firestorePatch_(path, updates) {
  const fields = firestoreEncode_(updates);
  const mask = Object.keys(updates).map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
  const res = UrlFetchApp.fetch(`${FIRESTORE_BASE()}/${path}?${mask}`, {
    method: 'patch',
    contentType: 'application/json',
    headers: { Authorization: `Bearer ${ScriptApp.getOAuthToken()}` },
    payload: JSON.stringify({ fields }),
    muteHttpExceptions: true,
  });
  const json = JSON.parse(res.getContentText());
  if (json.error) console.error(`Firestore PATCH ${path} error: ${JSON.stringify(json.error)}`);
}

function firestoreCreate_(collectionId, data) {
  const res = UrlFetchApp.fetch(`${FIRESTORE_BASE()}/${collectionId}`, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: `Bearer ${ScriptApp.getOAuthToken()}` },
    payload: JSON.stringify({ fields: firestoreEncode_(data) }),
    muteHttpExceptions: true,
  });
  const json = JSON.parse(res.getContentText());
  if (json.error) console.error(`Firestore CREATE ${collectionId} error: ${JSON.stringify(json.error)}`);
}

function idFromName_(name) {
  const parts = name.split('/');
  return parts[parts.length - 1];
}

function nowIso_() {
  return new Date().toISOString();
}

// Converte un valore JS semplice nel formato tipizzato richiesto da Firestore.
function firestoreEncode_(value) {
  if (value === null || value === undefined) return wrapValue_(null);
  if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
    const fields = {};
    Object.keys(value).forEach((k) => { fields[k] = encodeValue_(value[k]); });
    return fields;
  }
  return encodeValue_(value);
}

function encodeValue_(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === 'string') return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(encodeValue_) } };
  if (typeof v === 'object') {
    const fields = {};
    Object.keys(v).forEach((k) => { fields[k] = encodeValue_(v[k]); });
    return { mapValue: { fields } };
  }
  return { stringValue: String(v) };
}

function wrapValue_(v) { return encodeValue_(v); }

// Converte i "fields" tipizzati di Firestore in un normale oggetto JS.
function firestoreDecode_(fields) {
  const out = {};
  if (!fields) return out;
  Object.keys(fields).forEach((k) => { out[k] = decodeValue_(fields[k]); });
  return out;
}

function decodeValue_(v) {
  if (!v) return null;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return parseInt(v.integerValue, 10);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('timestampValue' in v) return v.timestampValue;
  if ('nullValue' in v) return null;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(decodeValue_);
  if ('mapValue' in v) return firestoreDecode_(v.mapValue.fields || {});
  return null;
}

// ========================= TEST MANUALE =========================
// Esegui questa funzione dall'editor Apps Script (▶) per verificare che
// tutto funzioni: invia una email di prova alla tua casella.
function testInvioEmail() {
  const html = wrapEmail_('Email di prova', '<p>Se leggi questa email, il motore email di LedMagico funziona correttamente! ✅</p>');
  GmailApp.sendEmail(CONFIG.SHOP_EMAIL, 'Test LedMagico Mailer', plainFallback_(html), { htmlBody: html, name: CONFIG.SHOP_NAME });
}
