/* ============ LedMagico — Admin dashboard logic ============ */
import { ICONS, CATEGORY_LABEL } from '../assets/js/icons.js';
import {
  configured, watchAuth, login, logout,
  watchAllProducts, createProduct, updateProduct, deleteProduct,
  watchOrders, updateOrderStatus,
  watchQuotes, updateQuoteStatus,
  compressImageToDataUri,
} from '../assets/js/firebase-app.js';

const ORDER_STATUSES = {
  da_confermare: 'Da confermare',
  confermato: 'Confermato',
  in_lavorazione: 'In lavorazione',
  spedito: 'Spedito',
  annullato: 'Annullato',
};
const QUOTE_STATUSES = { nuova: 'Nuova', risposta: 'Risposto' };

const fmtPrice = (cents) => `€${(cents / 100).toFixed(2)}`;
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
}

function renderProductsTable(list) {
  const tbody = document.getElementById('productsTbody');
  const empty = document.getElementById('productsEmpty');
  if (list.length === 0) {
    tbody.innerHTML = '';
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  tbody.innerHTML = list.map((p) => `
    <tr>
      <td><div class="admin-thumb">${p.image ? `<img src="${p.image}" alt="">` : (ICONS[p.iconKey] || ICONS.eiffel)()}</div></td>
      <td><strong>${p.name}</strong>${p.isCustom ? ' <span class="status-pill">su misura</span>' : ''}</td>
      <td>${CATEGORY_LABEL[p.category] || p.category}</td>
      <td>${fmtPrice(p.priceCents)}</td>
      <td><span class="status-pill ${p.active ? 'active' : 'inactive'}">${p.active ? 'Visibile' : 'Nascosto'}</span></td>
      <td>
        <div class="row-actions">
          <button data-edit="${p.id}">Modifica</button>
        </div>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', () => openProductForm(btn.dataset.edit));
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
    document.getElementById('pf-price').value = (p.priceCents / 100).toFixed(2);
    document.getElementById('pf-icon').value = p.iconKey || 'eiffel';
    document.getElementById('pf-shortdesc').value = p.shortDesc || '';
    document.getElementById('pf-fulldesc').value = p.fullDesc || '';
    document.getElementById('pf-specs').value = (p.specs || []).join('\n');
    document.getElementById('pf-custom').checked = !!p.isCustom;
    document.getElementById('pf-active').checked = !!p.active;
    if (p.image) {
      document.getElementById('pfPhotoPreview').innerHTML = `<img src="${p.image}" alt="">`;
      document.getElementById('pfPhotoPreview').dataset.value = p.image;
    }
  } else {
    document.getElementById('productFormTitle').textContent = 'Nuovo prodotto';
    document.getElementById('pf-active').checked = true;
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
    const itemsSummary = (o.items || []).map((it) => `${it.qty}× ${it.name}`).join(', ');
    return `
    <tr>
      <td><strong>${o.id}</strong>${o.personalizationAck ? ' <span class="status-pill">su misura</span>' : ''}</td>
      <td>${o.customerName || ''}<br><span style="color:var(--text-faint);font-size:.78rem;">${o.customerEmail || ''}</span></td>
      <td>${itemsSummary}</td>
      <td>${fmtPrice(o.subtotalCents || 0)}</td>
      <td>
        <select class="status-select" data-order="${o.id}">
          ${Object.entries(ORDER_STATUSES).map(([k, v]) => `<option value="${k}" ${o.status === k ? 'selected' : ''}>${v}</option>`).join('')}
        </select>
      </td>
      <td>${fmtDate(o.createdAt)}</td>
      <td><button class="order-toggle" data-toggle="${o.id}">Dettagli</button></td>
    </tr>
    <tr class="order-details-row" id="details-${o.id}" hidden>
      <td colspan="7">
        <strong>Indirizzo:</strong> ${o.shippingAddress || '—'}<br>
        <strong>Telefono:</strong> ${o.customerPhone || '—'}<br>
        <strong>Note:</strong> ${o.notes || '—'}<br>
        <strong>Articoli:</strong> ${(o.items || []).map((it) => `${it.qty}× ${it.name} (${it.colorLabel || it.color})`).join(', ')}
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
        await updateOrderStatus(sel.dataset.order, sel.value);
        showToast('Stato ordine aggiornato');
      } catch (err) {
        console.error(err);
        alert('Errore durante l\'aggiornamento dello stato.');
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
      <td>${q.name}</td>
      <td><a href="mailto:${q.email}" style="color:var(--gold-soft);">${q.email}</a></td>
      <td style="max-width:320px;">${q.idea}</td>
      <td>${fmtDate(q.createdAt)}</td>
      <td>
        <select class="status-select" data-quote="${q.id}">
          ${Object.entries(QUOTE_STATUSES).map(([k, v]) => `<option value="${k}" ${q.status === k ? 'selected' : ''}>${v}</option>`).join('')}
        </select>
      </td>
      <td></td>
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
