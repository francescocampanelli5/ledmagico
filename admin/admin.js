/* ============ LedMagico — Admin dashboard logic ============ */
import { ICONS, CATEGORY_LABEL } from '../assets/js/icons.js?v=2';
import { escapeHtml, safeUrl } from '../assets/js/sanitize.js';
import {
  configured, watchAuth, login, logout,
  watchAllProducts, createProduct, updateProduct, deleteProduct, announceProduct,
  watchOrders, updateOrderStatus, deleteOrder, updateOrderTracking,
  watchQuotes, updateQuoteStatus, deleteQuote,
  watchSubscribers,
  watchAllReviews, updateReview, deleteReview,
  getPaymentSettings, savePaymentSettings,
  getGeneralSettings, saveGeneralSettings,
  getHeroSettings, saveHeroSettings,
  getSocialSettings, saveSocialSettings,
  compressImageToDataUri,
} from '../assets/js/firebase-app.js?v=7';

const ORDER_STATUSES = {
  da_confermare: 'Da confermare',
  confermato: 'Confermato',
  in_lavorazione: 'In lavorazione',
  spedito: 'Spedito',
  annullato: 'Annullato',
};
const QUOTE_STATUSES = { nuova: 'Nuova', risposta: 'Risposto', rifiutata: 'Non accettata' };

const DEMO_PRODUCTS = [
  { name: 'Torre Eiffel LED', category: 'monumenti', price: 49, shortDesc: 'La dama di ferro parigina, reinterpretata in legno e luce calda.', fullDesc: 'Una replica in scala della Torre Eiffel, intagliata a mano in legno chiaro e cablata con oltre 40 micro LED lungo la struttura reticolare. Un piccolo faro che trasforma una mensola in uno scorcio di Parigi al tramonto.', specs: ['Altezza 26 cm · base 12x12 cm', 'Legno di faggio e metallo verniciato', '40+ micro LED integrati', 'Alimentazione USB, cavo 1.5 m incluso'], iconKey: 'eiffel' },
  { name: 'Skyline Milano LED', category: 'monumenti', price: 59, shortDesc: 'Il profilo della città che non dorme mai, acceso sulla tua libreria.', fullDesc: 'Uno skyline stilizzato dei grattacieli milanesi, in resina opaca con finestre luminose realizzate una a una. Ogni edificio ha un circuito indipendente per un effetto profondità realistico.', specs: ['Larghezza 34 cm · altezza 22 cm', 'Resina opaca antiriflesso', '60+ finestre LED indipendenti', 'Alimentazione USB, cavo incluso'], iconKey: 'skyline' },
  { name: 'Barca a Vela LED', category: 'barche', price: 39, shortDesc: 'Vele che catturano la luce come catturano il vento.', fullDesc: 'Uno scafo in legno di cedro con vele in tessuto naturale, illuminato da una striscia LED che corre lungo l\'alberatura. Perfetta su una mensola vicino alla finestra, come se fosse appena rientrata in porto.', specs: ['Altezza 18 cm · lunghezza 24 cm', 'Scafo in cedro, vele in cotone trattato', 'Striscia LED lungo l\'albero maestro', 'Base espositiva in legno inclusa'], iconKey: 'barca' },
  { name: 'Nave Pirata LED', category: 'barche', price: 65, shortDesc: 'Due alberi, vele scure e una lanterna che non si spegne mai.', fullDesc: 'Un vascello corsaro dal dettaglio ricco: ponte in legno scuro, vele dipinte a mano e lanterne LED a bordo che si accendono in bianco caldo o RGB. Il pezzo preferito da chi ama le storie di mare.', specs: ['Altezza 24 cm · lunghezza 30 cm', 'Legno scuro trattato a mano', '12 punti luce distribuiti sul ponte', 'Compatibile con telecomando RGB'], iconKey: 'pirata' },
  { name: 'Castello Incantato LED', category: 'fantasia', price: 72, shortDesc: 'Torri, bandiere e finestre che si accendono una a una.', fullDesc: 'Un castello da fiaba con cinque torri, ognuna con la propria finestra luminosa. Il mattone è riprodotto a rilievo in resina e dipinto a mano per un effetto materico che cattura la luce dei LED interni.', specs: ['Altezza 28 cm · base 20x20 cm', 'Resina a rilievo dipinta a mano', '18 punti luce, 5 circuiti indipendenti', 'Alimentazione USB, timer integrato'], iconKey: 'castello' },
  { name: 'Presepe LED con Acqua', category: 'presepi', price: 89, shortDesc: 'Il ruscello scorre davvero, la stella cometa non si spegne mai.', fullDesc: 'Il nostro pezzo più amato: una capanna in legno con un vero micro-circuito ad acqua che simula un ruscello, illuminato dal basso con LED blu. La stella cometa in alto brilla di bianco caldo per tutta la notte.', specs: ['Altezza 20 cm · base 30x22 cm', 'Legno naturale e resina trasparente', 'Pompa ad acqua silenziosa inclusa', 'Stella cometa e faretti a LED caldo'], iconKey: 'presepe' },
  { name: 'Faro LED', category: 'barche', price: 35, shortDesc: 'Un raggio di luce rotante, come sulla costa vera.', fullDesc: 'Un faro marittimo in legno tornito a mano, con lanterna superiore dotata di LED rotante che simula il raggio di luce reale. Le strisce rosse sono dipinte a mano, una per una.', specs: ['Altezza 21 cm · base Ø 9 cm', 'Legno tornito, base in pietra ricomposta', 'LED rotante nella lanterna superiore', 'Alimentazione USB'], iconKey: 'faro' },
  { name: 'Mongolfiera LED', category: 'fantasia', price: 45, shortDesc: 'Sospesa in volo, illuminata dall\'interno come al mattino presto.', fullDesc: 'Una mongolfiera in tessuto rigido e cesto in vimini intrecciato a mano, con un LED interno che replica il bagliore del bruciatore. Da appendere o appoggiare, regala movimento a qualsiasi stanza.', specs: ['Altezza 19 cm · diametro pallone 14 cm', 'Tessuto rigido dipinto a mano', 'Cesto in vimini naturale intrecciato', 'Gancio per sospensione incluso'], iconKey: 'mongolfiera' },
].map((p) => ({ ...p, isCustom: true, active: true, image: null }));

const fmtPrice = (cents) => `€${((cents || 0) / 100).toFixed(2)}`;
const fmtDate = (ts) => {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

/* ---------- Setup / auth gate ---------- */
const setupNotice = document.getElementById('setupNotice');
const loginScreen = document.getElementById('loginScreen');
const dashboard = document.getElementById('dashboard');

if (!configured) {
  setupNotice.hidden = false;
} else {
  watchAuth((user) => {
    if (user) {
      loginScreen.hidden = true;
      dashboard.hidden = false;
      initDashboard();
    } else {
      dashboard.hidden = true;
      loginScreen.hidden = false;
    }
  });

  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const note = document.getElementById('loginNote');
    note.textContent = '';
    try {
      await login(document.getElementById('login-email').value.trim(), document.getElementById('login-password').value);
    } catch (err) {
      note.textContent = 'Accesso non riuscito: controlla email e password.';
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', () => logout());
}

/* ---------- Tabs ---------- */
document.querySelectorAll('.admin-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach((t) => t.classList.remove('is-active'));
    document.querySelectorAll('.admin-panel').forEach((p) => p.classList.remove('is-active'));
    tab.classList.add('is-active');
    document.getElementById(`panel-${tab.dataset.tab}`).classList.add('is-active');
  });
});

let dashboardInitialized = false;
function initDashboard() {
  if (dashboardInitialized) return;
  dashboardInitialized = true;
  initProducts();
  initOrders();
  initQuotes();
  initReviews();
  initSubscribers();
  initSettings();
}

/* ================= PRODOTTI ================= */
let allProducts = [];

function initProducts() {
  watchAllProducts(
    (list) => { allProducts = list; renderProductsTable(list); },
    (err) => console.error('Errore prodotti', err)
  );

  document.getElementById('newProductBtn').addEventListener('click', () => openProductForm(null));
  document.getElementById('productEditClose').addEventListener('click', closeProductForm);
  document.getElementById('productEditOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'productEditOverlay') closeProductForm();
  });

  document.getElementById('pf-photo').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const preview = document.getElementById('pfPhotoPreview');
    preview.innerHTML = '<span style="font-size:.7rem;color:var(--text-faint);">Elaborazione...</span>';
    try {
      const dataUri = await compressImageToDataUri(file);
      preview.innerHTML = `<img src="${dataUri}" alt="Anteprima">`;
      preview.dataset.value = dataUri;
    } catch (err) {
      preview.innerHTML = '<span style="font-size:.7rem;color:#ff8f8f;">Errore immagine</span>';
    }
  });

  document.getElementById('productForm').addEventListener('submit', onSaveProduct);
  document.getElementById('productDeleteBtn').addEventListener('click', onDeleteProduct);

  document.getElementById('importDemoBtn').addEventListener('click', onImportDemoProducts);
  document.getElementById('repairPricesBtn').addEventListener('click', onRepairPrices);
}

async function onRepairPrices() {
  const toFix = allProducts.filter((p) => p.priceCents === undefined || p.priceCents === null);
  if (toFix.length === 0) return;
  const btn = document.getElementById('repairPricesBtn');
  btn.disabled = true;
  let done = 0;
  for (const p of toFix) {
    try {
      await updateProduct(p.id, { price: p.price });
      done += 1;
    } catch (err) {
      console.error('Errore riparando', p.name, err);
    }
  }
  btn.disabled = false;
  showToast(`${done} prezzi corretti`);
}

async function onImportDemoProducts() {
  if (!confirm(`Importare ${DEMO_PRODUCTS.length} modelli dimostrativi nel catalogo? Potrai poi modificarli o eliminarli liberamente.`)) return;
  const btn = document.getElementById('importDemoBtn');
  btn.disabled = true;
  let done = 0;
  for (const product of DEMO_PRODUCTS) {
    btn.textContent = `Importazione... (${done + 1}/${DEMO_PRODUCTS.length})`;
    try {
      await createProduct(product);
      done += 1;
    } catch (err) {
      console.error('Errore importando', product.name, err);
    }
  }
  btn.disabled = false;
  btn.textContent = 'Importa gli 8 modelli dimostrativi';
  showToast(`${done} prodotti importati`);
}

function renderProductsTable(list) {
  const tbody = document.getElementById('productsTbody');
  const empty = document.getElementById('productsEmpty');
  const importBtn = document.getElementById('importDemoBtn');
  importBtn.hidden = list.length > 0;

  const repairBtn = document.getElementById('repairPricesBtn');
  const needsRepair = list.filter((p) => p.priceCents === undefined || p.priceCents === null);
  repairBtn.hidden = needsRepair.length === 0;
  repairBtn.dataset.count = needsRepair.length;

  if (list.length === 0) {
    tbody.innerHTML = '';
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  tbody.innerHTML = list.map((p) => `
    <tr>
      <td><div class="admin-thumb">${p.image ? `<img src="${p.image}" alt="">` : (ICONS[p.iconKey] || ICONS.eiffel)()}</div></td>
      <td><strong>${escapeHtml(p.name)}</strong>${p.videoUrl ? ' 🎬' : ''}</td>
      <td>${escapeHtml(CATEGORY_LABEL[p.category] || p.category)}</td>
      <td>${fmtPrice(p.priceCents)}</td>
      <td><span class="status-pill ${p.active ? 'active' : 'inactive'}">${p.active ? 'Visibile' : 'Nascosto'}</span></td>
      <td>
        <div class="row-actions">
          <button data-edit="${p.id}">Modifica</button>
          <button data-announce="${p.id}" title="Invia un'email agli iscritti alla newsletter per presentare questo prodotto">📣 Annuncia</button>
        </div>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', () => openProductForm(btn.dataset.edit));
  });
  tbody.querySelectorAll('[data-announce]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Inviare un\'email di annuncio a tutti gli iscritti alla newsletter per questo prodotto?')) return;
      try {
        await announceProduct(btn.dataset.announce);
        showToast('Annuncio in coda: partirà entro pochi minuti');
      } catch (err) {
        console.error(err);
        alert('Errore durante l\'invio dell\'annuncio.');
      }
    });
  });
}

let editingProductId = null;

function openProductForm(id) {
  editingProductId = id;
  const form = document.getElementById('productForm');
  form.reset();
  document.getElementById('pfPhotoPreview').innerHTML = '';
  document.getElementById('pfPhotoPreview').dataset.value = '';
  document.getElementById('productFormNote').textContent = '';
  document.getElementById('productDeleteBtn').hidden = !id;

  if (id) {
    const p = allProducts.find((x) => x.id === id);
    document.getElementById('productFormTitle').textContent = 'Modifica prodotto';
    document.getElementById('pf-name').value = p.name || '';
    document.getElementById('pf-category').value = p.category || 'monumenti';
    document.getElementById('pf-price').value = ((p.priceCents || 0) / 100).toFixed(2);
    document.getElementById('pf-icon').value = p.iconKey || 'eiffel';
    document.getElementById('pf-shortdesc').value = p.shortDesc || '';
    document.getElementById('pf-fulldesc').value = p.fullDesc || '';
    document.getElementById('pf-specs').value = (p.specs || []).join('\n');
    document.getElementById('pf-video').value = p.videoUrl || '';
    document.getElementById('pf-custom').checked = !!p.isCustom;
    document.getElementById('pf-active').checked = !!p.active;
    if (p.image) {
      document.getElementById('pfPhotoPreview').innerHTML = `<img src="${p.image}" alt="">`;
      document.getElementById('pfPhotoPreview').dataset.value = p.image;
    }
  } else {
    document.getElementById('productFormTitle').textContent = 'Nuovo prodotto';
    document.getElementById('pf-active').checked = true;
    document.getElementById('pf-custom').checked = true;
  }

  document.getElementById('productEditOverlay').classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeProductForm() {
  document.getElementById('productEditOverlay').classList.remove('is-open');
  document.body.style.overflow = '';
}

async function onSaveProduct(e) {
  e.preventDefault();
  const note = document.getElementById('productFormNote');
  const saveBtn = document.getElementById('productSaveBtn');
  const specs = document.getElementById('pf-specs').value.split('\n').map((s) => s.trim()).filter(Boolean);
  const photoPreview = document.getElementById('pfPhotoPreview');

  const data = {
    name: document.getElementById('pf-name').value.trim(),
    category: document.getElementById('pf-category').value,
    price: parseFloat(document.getElementById('pf-price').value),
    iconKey: document.getElementById('pf-icon').value,
    shortDesc: document.getElementById('pf-shortdesc').value.trim(),
    fullDesc: document.getElementById('pf-fulldesc').value.trim(),
    specs,
    isCustom: document.getElementById('pf-custom').checked,
    active: document.getElementById('pf-active').checked,
    image: photoPreview.dataset.value || null,
    videoUrl: document.getElementById('pf-video').value.trim() || null,
  };

  if (!data.name || !data.category || !data.price || data.price <= 0) {
    note.textContent = 'Nome, categoria e prezzo sono obbligatori.';
    note.classList.add('is-error');
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = 'Salvataggio...';
  try {
    if (editingProductId) await updateProduct(editingProductId, data);
    else await createProduct(data);
    closeProductForm();
    showToast('Prodotto salvato');
  } catch (err) {
    console.error(err);
    note.classList.add('is-error');
    note.textContent = 'Errore durante il salvataggio. Riprova.';
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Salva prodotto';
  }
}

async function onDeleteProduct() {
  if (!editingProductId) return;
  if (!confirm('Eliminare definitivamente questo prodotto?')) return;
  try {
    await deleteProduct(editingProductId);
    closeProductForm();
    showToast('Prodotto eliminato');
  } catch (err) {
    console.error(err);
    alert('Errore durante l\'eliminazione.');
  }
}

/* ================= ORDINI ================= */
function initOrders() {
  watchOrders(
    (list) => renderOrdersTable(list),
    (err) => console.error('Errore ordini', err)
  );
}

function renderOrdersTable(list) {
  const tbody = document.getElementById('ordersTbody');
  const empty = document.getElementById('ordersEmpty');
  const badge = document.getElementById('ordersBadge');
  const pending = list.filter((o) => o.status === 'da_confermare').length;
  badge.hidden = pending === 0;
  badge.textContent = pending;

  if (list.length === 0) {
    tbody.innerHTML = '';
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  tbody.innerHTML = list.map((o) => {
    const itemsSummary = (o.items || []).map((it) => `${it.qty}× ${escapeHtml(it.name)}`).join(', ');
    return `
    <tr>
      <td><strong>${escapeHtml(o.id)}</strong></td>
      <td>${escapeHtml(o.customerName || '')}<br><span style="color:var(--text-faint);font-size:.78rem;">${escapeHtml(o.customerEmail || '')}</span></td>
      <td>${itemsSummary}</td>
      <td>${fmtPrice(o.subtotalCents || 0)}</td>
      <td>
        <select class="status-select" data-order="${o.id}" data-email="${escapeHtml(o.customerEmail || '')}">
          ${Object.entries(ORDER_STATUSES).map(([k, v]) => `<option value="${k}" ${o.status === k ? 'selected' : ''}>${v}</option>`).join('')}
        </select>
      </td>
      <td>${fmtDate(o.createdAt)}</td>
      <td>
        <div class="row-actions">
          <button class="order-toggle" data-toggle="${o.id}">Dettagli</button>
          <button data-delete-order="${o.id}" title="Elimina definitivamente questo ordine">🗑 Elimina</button>
        </div>
      </td>
    </tr>
    <tr class="order-details-row" id="details-${o.id}" hidden>
      <td colspan="7">
        <strong>Indirizzo:</strong> ${escapeHtml(o.shippingAddress || '—')}<br>
        <strong>Telefono:</strong> ${escapeHtml(o.customerPhone || '—')}<br>
        <strong>Note:</strong> ${escapeHtml(o.notes || '—')}<br>
        <strong>Articoli:</strong> ${(o.items || []).map((it) => `${it.qty}× ${escapeHtml(it.name)} (${escapeHtml(it.colorLabel || it.color)})`).join(', ')}
        <div class="admin-tracking-row">
          <strong>Tracciamento spedizione:</strong>
          <input type="text" class="tr-carrier" data-tr-carrier="${o.id}" placeholder="Corriere (es. BRT, GLS)" value="${escapeHtml(o.trackingCarrier || '')}">
          <input type="text" class="tr-code" data-tr-code="${o.id}" placeholder="Codice tracciamento" value="${escapeHtml(o.trackingCode || '')}">
          <input type="url" class="tr-url" data-tr-url="${o.id}" placeholder="Link tracciamento (opzionale)" value="${escapeHtml(o.trackingUrl || '')}">
          <button type="button" class="btn btn-ghost btn-sm" data-save-tracking="${o.id}">Salva tracciamento</button>
        </div>
      </td>
    </tr>`;
  }).join('');

  tbody.querySelectorAll('[data-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const row = document.getElementById(`details-${btn.dataset.toggle}`);
      row.hidden = !row.hidden;
    });
  });
  tbody.querySelectorAll('[data-order]').forEach((sel) => {
    sel.addEventListener('change', async () => {
      try {
        await updateOrderStatus(sel.dataset.order, sel.value, sel.dataset.email);
        showToast('Stato ordine aggiornato');
      } catch (err) {
        console.error(err);
        alert('Errore durante l\'aggiornamento dello stato.');
      }
    });
  });
  tbody.querySelectorAll('[data-delete-order]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm(`Eliminare definitivamente l'ordine ${btn.dataset.deleteOrder}? L'azione non è reversibile.`)) return;
      try {
        await deleteOrder(btn.dataset.deleteOrder);
        showToast('Ordine eliminato');
      } catch (err) {
        console.error(err);
        alert('Errore durante l\'eliminazione.');
      }
    });
  });
  tbody.querySelectorAll('[data-save-tracking]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.saveTracking;
      const row = document.getElementById(`details-${id}`);
      try {
        await updateOrderTracking(id, {
          trackingCarrier: row.querySelector('.tr-carrier').value.trim(),
          trackingCode: row.querySelector('.tr-code').value.trim(),
          trackingUrl: row.querySelector('.tr-url').value.trim(),
        });
        showToast('Tracciamento salvato — sarà incluso nell\'email di spedizione');
      } catch (err) {
        console.error(err);
        alert('Errore durante il salvataggio del tracciamento.');
      }
    });
  });
}

/* ================= RICHIESTE SU MISURA ================= */
function initQuotes() {
  watchQuotes(
    (list) => renderQuotesTable(list),
    (err) => console.error('Errore richieste', err)
  );
}

function renderQuotesTable(list) {
  const tbody = document.getElementById('quotesTbody');
  const empty = document.getElementById('quotesEmpty');
  const badge = document.getElementById('quotesBadge');
  const pending = list.filter((q) => q.status === 'nuova').length;
  badge.hidden = pending === 0;
  badge.textContent = pending;

  if (list.length === 0) {
    tbody.innerHTML = '';
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  tbody.innerHTML = list.map((q) => `
    <tr>
      <td>${escapeHtml(q.name)}</td>
      <td><a href="mailto:${escapeHtml(q.email)}" style="color:var(--gold-soft);">${escapeHtml(q.email)}</a></td>
      <td style="max-width:320px;">${escapeHtml(q.idea)}${safeUrl(q.productLink) ? `<br><a href="${escapeHtml(safeUrl(q.productLink))}" target="_blank" rel="noopener noreferrer" style="color:var(--gold-soft);font-size:.78rem;">🔗 link prodotto</a>` : ''}</td>
      <td>${fmtDate(q.createdAt)}</td>
      <td>
        <select class="status-select" data-quote="${q.id}">
          ${Object.entries(QUOTE_STATUSES).map(([k, v]) => `<option value="${k}" ${q.status === k ? 'selected' : ''}>${v}</option>`).join('')}
        </select>
      </td>
      <td><button data-delete-quote="${q.id}" title="Elimina definitivamente questa richiesta">🗑 Elimina</button></td>
    </tr>
  `).join('');

  tbody.querySelectorAll('[data-quote]').forEach((sel) => {
    sel.addEventListener('change', async () => {
      try {
        await updateQuoteStatus(sel.dataset.quote, sel.value);
        showToast('Stato richiesta aggiornato');
      } catch (err) {
        console.error(err);
        alert('Errore durante l\'aggiornamento.');
      }
    });
  });
  tbody.querySelectorAll('[data-delete-quote]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Eliminare definitivamente questa richiesta?')) return;
      try {
        await deleteQuote(btn.dataset.deleteQuote);
        showToast('Richiesta eliminata');
      } catch (err) {
        console.error(err);
        alert('Errore durante l\'eliminazione.');
      }
    });
  });
}

/* ================= RECENSIONI ================= */
let allReviews = [];
const STARS = (n) => '★★★★★☆☆☆☆☆'.slice(5 - n, 10 - n);

function initReviews() {
  watchAllReviews(
    (list) => { allReviews = list; renderReviewsTable(list); },
    (err) => console.error('Errore recensioni', err)
  );

  document.getElementById('reviewEditClose').addEventListener('click', closeReviewForm);
  document.getElementById('reviewEditOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'reviewEditOverlay') closeReviewForm();
  });
  document.getElementById('rf-photo').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const preview = document.getElementById('rfPhotoPreview');
    preview.innerHTML = '<span style="font-size:.7rem;color:var(--text-faint);">Elaborazione...</span>';
    try {
      const dataUri = await compressImageToDataUri(file, 700, 0.75);
      preview.innerHTML = `<img src="${dataUri}" alt="Anteprima">`;
      preview.dataset.value = dataUri;
    } catch (err) {
      preview.innerHTML = '<span style="font-size:.7rem;color:#ff8f8f;">Errore immagine</span>';
    }
  });
  document.getElementById('reviewForm').addEventListener('submit', onSaveReview);
  document.getElementById('reviewDeleteBtn').addEventListener('click', onDeleteReview);
}

function renderReviewsTable(list) {
  const tbody = document.getElementById('reviewsTbody');
  const empty = document.getElementById('reviewsEmpty');
  const badge = document.getElementById('reviewsBadge');
  const pending = list.filter((r) => !r.approved).length;
  badge.hidden = pending === 0;
  badge.textContent = pending;

  if (list.length === 0) {
    tbody.innerHTML = '';
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  tbody.innerHTML = list.map((r) => `
    <tr>
      <td><div class="admin-thumb">${r.photo ? `<img src="${r.photo}" alt="">` : '—'}</div></td>
      <td><strong>${escapeHtml(r.name)}</strong>${r.videoUrl ? ' 🎬' : ''}</td>
      <td style="color:var(--gold-soft);">${STARS(r.rating || 5)}</td>
      <td style="max-width:280px;">${escapeHtml((r.content || '').slice(0, 90))}${(r.content || '').length > 90 ? '…' : ''}</td>
      <td><span class="status-pill ${r.approved ? 'active' : 'inactive'}">${r.approved ? 'Pubblicata' : 'In attesa'}</span></td>
      <td>
        <div class="row-actions">
          ${r.approved
            ? `<button data-toggle-approve="${r.id}" data-next="false">Nascondi</button>`
            : `<button data-toggle-approve="${r.id}" data-next="true">Pubblica</button>`}
          <button data-edit-review="${r.id}">Modifica</button>
        </div>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('[data-toggle-approve]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await updateReview(btn.dataset.toggleApprove, { approved: btn.dataset.next === 'true' });
        showToast(btn.dataset.next === 'true' ? 'Recensione pubblicata' : 'Recensione nascosta');
      } catch (err) {
        console.error(err);
        alert('Errore durante l\'aggiornamento.');
      }
    });
  });
  tbody.querySelectorAll('[data-edit-review]').forEach((btn) => {
    btn.addEventListener('click', () => openReviewForm(btn.dataset.editReview));
  });
}

let editingReviewId = null;

function openReviewForm(id) {
  editingReviewId = id;
  const r = allReviews.find((x) => x.id === id);
  if (!r) return;
  const preview = document.getElementById('rfPhotoPreview');
  preview.innerHTML = r.photo ? `<img src="${r.photo}" alt="">` : '';
  preview.dataset.value = r.photo || '';
  document.getElementById('reviewFormNote').textContent = '';
  document.getElementById('rf-name').value = r.name || '';
  document.getElementById('rf-city').value = r.city || '';
  document.getElementById('rf-rating').value = String(r.rating || 5);
  document.getElementById('rf-content').value = r.content || '';
  document.getElementById('rf-video').value = r.videoUrl || '';
  document.getElementById('rf-approved').checked = !!r.approved;

  document.getElementById('reviewEditOverlay').classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeReviewForm() {
  document.getElementById('reviewEditOverlay').classList.remove('is-open');
  document.body.style.overflow = '';
}

async function onSaveReview(e) {
  e.preventDefault();
  if (!editingReviewId) return;
  const note = document.getElementById('reviewFormNote');
  const saveBtn = document.getElementById('reviewSaveBtn');
  const photoPreview = document.getElementById('rfPhotoPreview');

  const data = {
    name: document.getElementById('rf-name').value.trim(),
    city: document.getElementById('rf-city').value.trim() || null,
    rating: parseInt(document.getElementById('rf-rating').value, 10),
    content: document.getElementById('rf-content').value.trim(),
    photo: photoPreview.dataset.value || null,
    videoUrl: document.getElementById('rf-video').value.trim() || null,
    approved: document.getElementById('rf-approved').checked,
  };
  if (!data.name || !data.content) {
    note.textContent = 'Nome e testo della recensione sono obbligatori.';
    note.classList.add('is-error');
    return;
  }

  saveBtn.disabled = true;
  try {
    await updateReview(editingReviewId, data);
    closeReviewForm();
    showToast('Recensione salvata');
  } catch (err) {
    console.error(err);
    note.classList.add('is-error');
    note.textContent = 'Errore durante il salvataggio.';
  } finally {
    saveBtn.disabled = false;
  }
}

async function onDeleteReview() {
  if (!editingReviewId) return;
  if (!confirm('Eliminare definitivamente questa recensione?')) return;
  try {
    await deleteReview(editingReviewId);
    closeReviewForm();
    showToast('Recensione eliminata');
  } catch (err) {
    console.error(err);
    alert('Errore durante l\'eliminazione.');
  }
}

/* ================= ISCRITTI NEWSLETTER ================= */
function initSubscribers() {
  watchSubscribers(
    (list) => renderSubscribersTable(list),
    (err) => console.error('Errore iscritti', err)
  );
}

function renderSubscribersTable(list) {
  const tbody = document.getElementById('subscribersTbody');
  const empty = document.getElementById('subscribersEmpty');
  const countEl = document.getElementById('subscribersCount');
  const active = list.filter((s) => !s.unsubscribed);
  if (countEl) countEl.textContent = `${active.length} iscritti attivi`;

  if (list.length === 0) {
    tbody.innerHTML = '';
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  tbody.innerHTML = list.map((s) => `
    <tr>
      <td>${escapeHtml(s.email)}</td>
      <td>${fmtDate(s.createdAt)}</td>
      <td><span class="status-pill ${s.unsubscribed ? 'inactive' : 'active'}">${s.unsubscribed ? 'Disiscritto' : 'Iscritto'}</span></td>
    </tr>
  `).join('');
}

/* ================= IMPOSTAZIONI ================= */
function initSettings() {
  initContactSettings();

  getPaymentSettings().then((data) => {
    if (!data) return;
    document.getElementById('set-iban').value = data.iban || '';
    document.getElementById('set-holder').value = data.holder || '';
    document.getElementById('set-bankname').value = data.bankName || '';
  }).catch((err) => console.error('Errore impostazioni', err));

  document.getElementById('settingsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const note = document.getElementById('settingsNote');
    const btn = document.getElementById('settingsSaveBtn');
    btn.disabled = true;
    try {
      await savePaymentSettings({
        iban: document.getElementById('set-iban').value.trim(),
        holder: document.getElementById('set-holder').value.trim(),
        bankName: document.getElementById('set-bankname').value.trim(),
      });
      note.classList.remove('is-error');
      note.textContent = 'Impostazioni salvate.';
      showToast('Impostazioni salvate');
    } catch (err) {
      console.error(err);
      note.classList.add('is-error');
      note.textContent = 'Errore durante il salvataggio.';
    } finally {
      btn.disabled = false;
    }
  });

  initHeroSettings();
  initSocialSettings();
}

function initSocialSettings() {
  const fields = ['instagram', 'facebook', 'tiktok', 'pinterest', 'youtube', 'whatsapp'];
  getSocialSettings().then((data) => {
    if (!data) return;
    fields.forEach((f) => {
      const el = document.getElementById(`social-${f}`);
      if (el && data[f]) el.value = data[f];
    });
  }).catch((err) => console.error('Errore social', err));

  document.getElementById('socialForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const note = document.getElementById('socialNote');
    const btn = document.getElementById('socialSaveBtn');
    btn.disabled = true;
    try {
      const payload = {};
      fields.forEach((f) => { payload[f] = document.getElementById(`social-${f}`).value.trim() || null; });
      await saveSocialSettings(payload);
      note.classList.remove('is-error');
      note.textContent = 'Link social salvati.';
      showToast('Link social salvati');
    } catch (err) {
      console.error(err);
      note.classList.add('is-error');
      note.textContent = 'Errore durante il salvataggio.';
    } finally {
      btn.disabled = false;
    }
  });
}

function initContactSettings() {
  getGeneralSettings().then((data) => {
    if (data && data.contactEmail) document.getElementById('contact-email').value = data.contactEmail;
  }).catch((err) => console.error('Errore contatti', err));

  document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const note = document.getElementById('contactNote');
    const btn = document.getElementById('contactSaveBtn');
    const email = document.getElementById('contact-email').value.trim();
    btn.disabled = true;
    try {
      await saveGeneralSettings({ contactEmail: email });
      note.classList.remove('is-error');
      note.textContent = 'Email salvata.';
      showToast('Email di contatto salvata');
    } catch (err) {
      console.error(err);
      note.classList.add('is-error');
      note.textContent = 'Errore durante il salvataggio.';
    } finally {
      btn.disabled = false;
    }
  });
}

function initHeroSettings() {
  const preview = document.getElementById('heroPhotoPreview');

  getHeroSettings().then((data) => {
    if (!data) return;
    if (data.type === 'video' && data.videoUrl) {
      document.getElementById('hero-video').value = data.videoUrl;
    } else if (data.type === 'image' && data.imageData) {
      preview.innerHTML = `<img src="${data.imageData}" alt="">`;
      preview.dataset.value = data.imageData;
    }
    document.getElementById('hero-caption').value = data.caption || '';
  }).catch((err) => console.error('Errore vetrina', err));

  document.getElementById('hero-photo').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    preview.innerHTML = '<span style="font-size:.7rem;color:var(--text-faint);">Elaborazione...</span>';
    try {
      const dataUri = await compressImageToDataUri(file, 1200, 0.78);
      preview.innerHTML = `<img src="${dataUri}" alt="Anteprima">`;
      preview.dataset.value = dataUri;
    } catch (err) {
      preview.innerHTML = '<span style="font-size:.7rem;color:#ff8f8f;">Errore immagine</span>';
    }
  });

  document.getElementById('heroForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const note = document.getElementById('heroNote');
    const btn = document.getElementById('heroSaveBtn');
    const videoUrl = document.getElementById('hero-video').value.trim();
    btn.disabled = true;
    try {
      let payload;
      if (videoUrl) {
        payload = { type: 'video', videoUrl, imageData: null, caption: document.getElementById('hero-caption').value.trim() };
      } else if (preview.dataset.value) {
        payload = { type: 'image', videoUrl: null, imageData: preview.dataset.value, caption: document.getElementById('hero-caption').value.trim() };
      } else {
        payload = { type: 'default', videoUrl: null, imageData: null, caption: document.getElementById('hero-caption').value.trim() };
      }
      await saveHeroSettings(payload);
      note.classList.remove('is-error');
      note.textContent = 'Vetrina salvata.';
      showToast('Vetrina salvata');
    } catch (err) {
      console.error(err);
      note.classList.add('is-error');
      note.textContent = 'Errore durante il salvataggio.';
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById('heroResetBtn').addEventListener('click', async () => {
    if (!confirm('Ripristinare l\'illustrazione predefinita della home?')) return;
    preview.innerHTML = '';
    preview.dataset.value = '';
    document.getElementById('hero-video').value = '';
    document.getElementById('hero-caption').value = '';
    try {
      await saveHeroSettings({ type: 'default', videoUrl: null, imageData: null, caption: '' });
      showToast('Illustrazione predefinita ripristinata');
    } catch (err) {
      console.error(err);
      alert('Errore durante il ripristino.');
    }
  });
}

/* ---------- Toast ---------- */
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2400);
}
