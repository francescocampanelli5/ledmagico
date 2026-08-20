/* ============ LedMagico — App logic (storefront) ============ */
import { ICONS, renderProductMedia, CATEGORY_LABEL, COLOR_LABEL, COLOR_VARS } from './icons.js';
import { configured, watchActiveProducts, createOrder, createQuoteRequest, genOrderId } from './firebase-app.js';

/* ---------- Dati di fallback (usati finché Firebase non è configurato) ---------- */
const FALLBACK_PRODUCTS = [
  { id: 'eiffel', name: 'Torre Eiffel LED', category: 'monumenti', price: 49, shortDesc: 'La dama di ferro parigina, reinterpretata in legno e luce calda.', fullDesc: 'Una replica in scala della Torre Eiffel, intagliata a mano in legno chiaro e cablata con oltre 40 micro LED lungo la struttura reticolare.', specs: ['Altezza 26 cm · base 12x12 cm', 'Legno di faggio e metallo verniciato', '40+ micro LED integrati', 'Alimentazione USB, cavo 1.5 m incluso'], iconKey: 'eiffel', isCustom: false },
  { id: 'skyline', name: 'Skyline Milano LED', category: 'monumenti', price: 59, shortDesc: 'Il profilo della città che non dorme mai, acceso sulla tua libreria.', fullDesc: 'Uno skyline stilizzato dei grattacieli milanesi, in resina opaca con finestre luminose realizzate una a una.', specs: ['Larghezza 34 cm · altezza 22 cm', 'Resina opaca antiriflesso', '60+ finestre LED indipendenti'], iconKey: 'skyline', isCustom: false },
  { id: 'barca', name: 'Barca a Vela LED', category: 'barche', price: 39, shortDesc: 'Vele che catturano la luce come catturano il vento.', fullDesc: 'Uno scafo in legno di cedro con vele in tessuto naturale, illuminato da una striscia LED lungo l\'alberatura.', specs: ['Altezza 18 cm · lunghezza 24 cm', 'Scafo in cedro, vele in cotone trattato'], iconKey: 'barca', isCustom: false },
  { id: 'pirata', name: 'Nave Pirata LED', category: 'barche', price: 65, shortDesc: 'Due alberi, vele scure e una lanterna che non si spegne mai.', fullDesc: 'Un vascello corsaro dal dettaglio ricco: ponte in legno scuro, vele dipinte a mano e lanterne LED a bordo.', specs: ['Altezza 24 cm · lunghezza 30 cm', 'Legno scuro trattato a mano'], iconKey: 'pirata', isCustom: false },
  { id: 'castello', name: 'Castello Incantato LED', category: 'fantasia', price: 72, shortDesc: 'Torri, bandiere e finestre che si accendono una a una.', fullDesc: 'Un castello da fiaba con cinque torri, ognuna con la propria finestra luminosa.', specs: ['Altezza 28 cm · base 20x20 cm', 'Resina a rilievo dipinta a mano'], iconKey: 'castello', isCustom: false },
  { id: 'presepe', name: 'Presepe LED con Acqua', category: 'presepi', price: 89, shortDesc: 'Il ruscello scorre davvero, la stella cometa non si spegne mai.', fullDesc: 'Una capanna in legno con un vero micro-circuito ad acqua che simula un ruscello, illuminato da LED blu.', specs: ['Altezza 20 cm · base 30x22 cm', 'Pompa ad acqua silenziosa inclusa'], iconKey: 'presepe', isCustom: false },
  { id: 'faro', name: 'Faro LED', category: 'barche', price: 35, shortDesc: 'Un raggio di luce rotante, come sulla costa vera.', fullDesc: 'Un faro marittimo in legno tornito a mano, con lanterna superiore dotata di LED rotante.', specs: ['Altezza 21 cm · base Ø 9 cm', 'Legno tornito, base in pietra ricomposta'], iconKey: 'faro', isCustom: false },
  { id: 'mongolfiera', name: 'Mongolfiera LED', category: 'fantasia', price: 45, shortDesc: 'Sospesa in volo, illuminata dall\'interno come al mattino presto.', fullDesc: 'Una mongolfiera in tessuto rigido e cesto in vimini intrecciato a mano, con un LED interno.', specs: ['Altezza 19 cm · diametro pallone 14 cm', 'Cesto in vimini naturale intrecciato'], iconKey: 'mongolfiera', isCustom: false },
].map((p) => ({ ...p, active: true, priceCents: Math.round(p.price * 100) }));

const fmtPrice = (n) => `€${n.toFixed(0)}`;

const state = {
  products: [],
};

/* ---------- Cart state ---------- */
const CART_KEY = 'ledmagico_cart_v1';
let cart = loadCart();

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch (e) { return []; }
}
function saveCart() { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

function findProduct(id) { return state.products.find((p) => p.id === id); }

function addToCart(productId, color, qty) {
  const existing = cart.find((l) => l.id === productId && l.color === color);
  if (existing) existing.qty += qty;
  else cart.push({ id: productId, color, qty });
  saveCart();
  renderCart();
  bumpBadge();
}
function updateQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  saveCart(); renderCart();
}
function removeLine(index) { cart.splice(index, 1); saveCart(); renderCart(); }
function cartCount() { return cart.reduce((s, l) => s + l.qty, 0); }
function cartSubtotal() {
  return cart.reduce((s, l) => {
    const p = findProduct(l.id);
    return s + (p ? p.price * l.qty : 0);
  }, 0);
}

function bumpBadge() {
  const badge = document.getElementById('cartBadge');
  badge.classList.remove('bump'); void badge.offsetWidth; badge.classList.add('bump');
}

/* ---------- Render: product grid ---------- */
const productGrid = document.getElementById('productGrid');
let currentFilter = 'tutti';

function renderGrid() {
  productGrid.innerHTML = '';
  const list = currentFilter === 'tutti' ? state.products : state.products.filter((p) => p.category === currentFilter);
  if (list.length === 0) {
    productGrid.innerHTML = `<p style="color:var(--text-faint);text-align:center;grid-column:1/-1;">Nessun modello disponibile in questa categoria al momento.</p>`;
    return;
  }
  list.forEach((p, i) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.style.transitionDelay = `${Math.min(i, 7) * 40}ms`;
    card.innerHTML = `
      <div class="product-media" data-open="${p.id}">
        <span class="product-tag">${CATEGORY_LABEL[p.category] || p.category}</span>
        ${renderProductMedia(p)}
      </div>
      <h3 class="product-name" data-open="${p.id}">${p.name}</h3>
      <p class="product-desc">${p.shortDesc || ''}</p>
      <div class="product-footer">
        <div class="product-price">${fmtPrice(p.price)}<small>IVA inclusa</small></div>
        <button class="btn btn-primary btn-sm" data-quickadd="${p.id}">Aggiungi</button>
      </div>`;
    productGrid.appendChild(card);
  });
  observeReveals();
}

productGrid.addEventListener('click', (e) => {
  const openId = e.target.closest('[data-open]')?.dataset.open;
  const addId = e.target.closest('[data-quickadd]')?.dataset.quickadd;
  if (openId) openModal(openId);
  else if (addId) {
    addToCart(addId, 'warm', 1);
    showToast(`${findProduct(addId)?.name || 'Prodotto'} aggiunta al carrello`);
  }
});

/* ---------- Filters ---------- */
const filterBar = document.getElementById('filterBar');
filterBar.addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-chip');
  if (!btn) return;
  filterBar.querySelectorAll('.filter-chip').forEach((b) => b.classList.remove('is-active'));
  btn.classList.add('is-active');
  currentFilter = btn.dataset.filter;
  renderGrid();
});

/* ---------- Product modal ---------- */
const modalOverlay = document.getElementById('modalOverlay');
const modalBody = document.getElementById('modalBody');
let modalState = { id: null, color: 'warm', qty: 1 };

function openModal(id) {
  const p = findProduct(id);
  if (!p) return;
  modalState = { id, color: 'warm', qty: 1 };
  renderModal(p);
  modalOverlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  modalOverlay.classList.remove('is-open');
  document.body.style.overflow = '';
}

function renderModal(p) {
  modalBody.innerHTML = `
    <div class="modal-media">${renderProductMedia(p)}</div>
    <div class="modal-info">
      <span class="modal-tag">${CATEGORY_LABEL[p.category] || p.category}${p.isCustom ? ' · Su misura' : ''}</span>
      <h2>${p.name}</h2>
      <div class="modal-price">${fmtPrice(p.price)} <small style="font-size:.7rem;color:var(--text-faint);font-family:var(--font-body);">IVA inclusa</small></div>
      <p class="modal-desc">${p.fullDesc || p.shortDesc || ''}</p>

      <div class="option-group">
        <span class="option-label">Colore LED — <span id="colorLabel">${COLOR_LABEL.warm}</span></span>
        <div class="color-options">
          <button class="color-swatch is-active" data-color="warm" aria-label="Bianco caldo"></button>
          <button class="color-swatch" data-color="blue" aria-label="Blu notte"></button>
          <button class="color-swatch" data-color="rgb" aria-label="RGB multicolore"></button>
        </div>
      </div>

      <div class="option-group">
        <span class="option-label">Quantità</span>
        <div class="qty-row">
          <button class="qty-btn" data-modalqty="-1">−</button>
          <span class="qty-value" id="modalQtyValue">1</span>
          <button class="qty-btn" data-modalqty="1">+</button>
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn btn-primary" id="modalAddBtn">Aggiungi al carrello · ${fmtPrice(p.price)}</button>
      </div>

      ${p.isCustom ? '<p class="checkout-payment-hint" style="text-align:left;margin-top:16px;">Questo pezzo è realizzato su misura ed è escluso dal diritto di recesso.</p>' : ''}

      <ul class="modal-specs">
        ${(p.specs || []).map((s) => `<li>${s}</li>`).join('')}
      </ul>
    </div>`;

  const mediaEl = modalBody.querySelector('.modal-media');
  modalBody.querySelectorAll('.color-swatch').forEach((sw) => {
    sw.addEventListener('click', () => {
      modalBody.querySelectorAll('.color-swatch').forEach((s) => s.classList.remove('is-active'));
      sw.classList.add('is-active');
      const c = sw.dataset.color;
      modalState.color = c;
      const svg = mediaEl.querySelector('svg');
      if (svg) {
        const [c1, c2] = COLOR_VARS[c];
        svg.style.setProperty('--icon-c1', c1);
        svg.style.setProperty('--icon-c2', c2);
      }
      modalBody.querySelector('#colorLabel').textContent = COLOR_LABEL[c];
    });
  });

  modalBody.querySelectorAll('[data-modalqty]').forEach((btn) => {
    btn.addEventListener('click', () => {
      modalState.qty = Math.max(1, modalState.qty + parseInt(btn.dataset.modalqty, 10));
      modalBody.querySelector('#modalQtyValue').textContent = modalState.qty;
    });
  });

  modalBody.querySelector('#modalAddBtn').addEventListener('click', () => {
    addToCart(p.id, modalState.color, modalState.qty);
    showToast(`${p.name} aggiunta al carrello`);
    closeModal();
    openCart();
  });
}

document.getElementById('modalClose').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

/* ---------- Cart drawer render ---------- */
const drawerItems = document.getElementById('drawerItems');
const cartDrawer = document.getElementById('cartDrawer');
const drawerOverlay = document.getElementById('drawerOverlay');
const cartBadge = document.getElementById('cartBadge');
const cartSubtotalEl = document.getElementById('cartSubtotal');

function renderCart() {
  cartBadge.textContent = cartCount();
  cartSubtotalEl.textContent = fmtPrice(cartSubtotal());

  if (cart.length === 0) {
    drawerItems.innerHTML = `<div class="drawer-empty">Il carrello è vuoto.<br>Scegli il tuo primo modellino illuminato.</div>`;
    return;
  }
  drawerItems.innerHTML = cart.map((line, i) => {
    const p = findProduct(line.id);
    if (!p) return '';
    return `
      <div class="cart-line">
        <div class="cart-line-media" data-icon-idx="${i}"></div>
        <div class="cart-line-info">
          <h5>${p.name}</h5>
          <div class="cart-line-meta">${COLOR_LABEL[line.color]}</div>
          <div class="cart-line-controls">
            <button class="qty-btn" data-qty="-1" data-idx="${i}">−</button>
            <span>${line.qty}</span>
            <button class="qty-btn" data-qty="1" data-idx="${i}">+</button>
            <button class="cart-line-remove" data-remove="${i}">Rimuovi</button>
          </div>
        </div>
        <div class="cart-line-price">${fmtPrice(p.price * line.qty)}</div>
      </div>`;
  }).join('');

  cart.forEach((line, i) => {
    const holder = drawerItems.querySelector(`[data-icon-idx="${i}"]`);
    const p = findProduct(line.id);
    if (!holder || !p) return;
    holder.innerHTML = renderProductMedia(p);
    const svg = holder.querySelector('svg');
    if (svg) {
      const [c1, c2] = COLOR_VARS[line.color];
      svg.style.setProperty('--icon-c1', c1);
      svg.style.setProperty('--icon-c2', c2);
    }
  });

  drawerItems.querySelectorAll('[data-qty]').forEach((btn) => {
    btn.addEventListener('click', () => updateQty(parseInt(btn.dataset.idx, 10), parseInt(btn.dataset.qty, 10)));
  });
  drawerItems.querySelectorAll('[data-remove]').forEach((btn) => {
    btn.addEventListener('click', () => removeLine(parseInt(btn.dataset.remove, 10)));
  });
}

function openCart() {
  cartDrawer.classList.add('is-open');
  drawerOverlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  cartDrawer.classList.remove('is-open');
  drawerOverlay.classList.remove('is-open');
  document.body.style.overflow = '';
}
document.getElementById('cartToggle').addEventListener('click', openCart);
document.getElementById('cartClose').addEventListener('click', closeCart);
drawerOverlay.addEventListener('click', closeCart);

/* ---------- Checkout modal ---------- */
const checkoutOverlay = document.getElementById('checkoutOverlay');
const checkoutForm = document.getElementById('checkoutForm');
const checkoutSummary = document.getElementById('checkoutSummary');
const checkoutAckRow = document.getElementById('checkoutAckRow');
const checkoutFormNote = document.getElementById('checkoutFormNote');
const checkoutSubmitBtn = document.getElementById('checkoutSubmitBtn');

document.getElementById('checkoutBtn').addEventListener('click', () => {
  if (cart.length === 0) { showToast('Il carrello è vuoto'); return; }
  openCheckout();
});
document.getElementById('checkoutModalClose').addEventListener('click', closeCheckout);
checkoutOverlay.addEventListener('click', (e) => { if (e.target === checkoutOverlay) closeCheckout(); });

function openCheckout() {
  const hasCustom = cart.some((l) => findProduct(l.id)?.isCustom);
  checkoutAckRow.hidden = !hasCustom;
  document.getElementById('co-ack').required = hasCustom;

  checkoutSummary.innerHTML = cart.map((l) => {
    const p = findProduct(l.id);
    if (!p) return '';
    return `<div class="checkout-summary-line"><span>${l.qty} × ${p.name} (${COLOR_LABEL[l.color]})</span><span>${fmtPrice(p.price * l.qty)}</span></div>`;
  }).join('') + `<div class="checkout-summary-total"><span>Totale</span><span>${fmtPrice(cartSubtotal())}</span></div>`;

  checkoutFormNote.textContent = '';
  checkoutFormNote.classList.remove('is-error');
  closeCart();
  checkoutOverlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}
function closeCheckout() {
  checkoutOverlay.classList.remove('is-open');
  document.body.style.overflow = '';
}

checkoutForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!checkoutForm.checkValidity()) {
    checkoutFormNote.textContent = 'Compila tutti i campi obbligatori.';
    checkoutFormNote.classList.add('is-error');
    return;
  }
  const hasCustom = !checkoutAckRow.hidden;
  if (hasCustom && !document.getElementById('co-ack').checked) {
    checkoutFormNote.textContent = 'Conferma di aver compreso le condizioni sul diritto di recesso per i pezzi su misura.';
    checkoutFormNote.classList.add('is-error');
    return;
  }

  const items = cart.map((l) => {
    const p = findProduct(l.id);
    return { id: p.id, name: p.name, color: l.color, colorLabel: COLOR_LABEL[l.color], qty: l.qty, priceCents: p.priceCents };
  });
  const subtotalCents = items.reduce((s, it) => s + it.priceCents * it.qty, 0);

  const orderData = {
    customerName: document.getElementById('co-name').value.trim(),
    customerEmail: document.getElementById('co-email').value.trim(),
    customerPhone: document.getElementById('co-phone').value.trim(),
    shippingAddress: document.getElementById('co-address').value.trim(),
    notes: document.getElementById('co-notes').value.trim(),
    items,
    subtotalCents,
    personalizationAck: hasCustom,
  };

  checkoutSubmitBtn.disabled = true;
  checkoutSubmitBtn.textContent = 'Invio in corso...';

  try {
    let orderId;
    if (configured) {
      orderId = await createOrder(orderData);
    } else {
      orderId = genOrderId();
      await new Promise((r) => setTimeout(r, 500));
    }
    cart = [];
    saveCart();
    renderCart();
    closeCheckout();
    checkoutForm.reset();

    document.getElementById('orderNumber').textContent = '#' + orderId;
    document.getElementById('successDetail').textContent = configured
      ? 'Ti contatteremo a breve via email con le istruzioni per il pagamento.'
      : 'Questo è un ambiente dimostrativo: Firebase non è ancora configurato, quindi l\'ordine non è stato salvato realmente.';
    document.getElementById('successOverlay').classList.add('is-open');
  } catch (err) {
    console.error(err);
    checkoutFormNote.textContent = 'Si è verificato un errore. Riprova tra poco.';
    checkoutFormNote.classList.add('is-error');
  } finally {
    checkoutSubmitBtn.disabled = false;
    checkoutSubmitBtn.textContent = 'Conferma ordine';
  }
});

document.getElementById('successClose').addEventListener('click', () => {
  document.getElementById('successOverlay').classList.remove('is-open');
  document.body.style.overflow = '';
});

/* ---------- FAQ accordion ---------- */
document.getElementById('faqList').addEventListener('click', (e) => {
  const btn = e.target.closest('.faq-question');
  if (!btn) return;
  const item = btn.closest('.faq-item');
  const answer = item.querySelector('.faq-answer');
  const isOpen = item.classList.contains('is-open');
  document.querySelectorAll('.faq-item.is-open').forEach((el) => {
    el.classList.remove('is-open');
    el.querySelector('.faq-answer').style.maxHeight = null;
  });
  if (!isOpen) {
    item.classList.add('is-open');
    answer.style.maxHeight = answer.scrollHeight + 'px';
  }
});

/* ---------- Custom quote form ---------- */
document.getElementById('customForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const note = document.getElementById('customFormNote');
  const form = e.target;
  if (!form.checkValidity()) {
    note.textContent = 'Compila tutti i campi e conferma di aver letto le condizioni per inviare la richiesta.';
    note.classList.add('is-error');
    return;
  }
  const data = {
    name: document.getElementById('cf-name').value.trim(),
    email: document.getElementById('cf-email').value.trim(),
    idea: document.getElementById('cf-idea').value.trim(),
  };
  try {
    if (configured) await createQuoteRequest(data);
    note.classList.remove('is-error');
    note.textContent = 'Richiesta inviata! Ti risponderemo entro 48 ore.';
    form.reset();
  } catch (err) {
    console.error(err);
    note.classList.add('is-error');
    note.textContent = 'Si è verificato un errore, riprova tra poco.';
  }
});

/* ---------- Newsletter form (client-side only, nessun invio reale) ---------- */
document.getElementById('newsletterForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const note = document.getElementById('newsletterNote');
  const input = document.getElementById('nl-email');
  if (!input.checkValidity()) {
    note.textContent = 'Inserisci un indirizzo email valido.';
    note.classList.add('is-error');
    return;
  }
  note.classList.remove('is-error');
  note.textContent = 'Iscrizione confermata, a presto!';
  input.value = '';
});

/* ---------- Toast ---------- */
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
}

/* ---------- Header scroll state ---------- */
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header.classList.toggle('is-scrolled', window.scrollY > 20);
}, { passive: true });

/* ---------- Mobile menu ---------- */
const mainNav = document.getElementById('mainNav');
const menuToggle = document.getElementById('menuToggle');
menuToggle.addEventListener('click', () => mainNav.classList.toggle('is-open'));
mainNav.addEventListener('click', (e) => { if (e.target.tagName === 'A') mainNav.classList.remove('is-open'); });

/* ---------- Scroll reveal ---------- */
function observeReveals() {
  const targets = document.querySelectorAll('.product-card:not(.is-visible), .reveal:not(.is-visible)');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  targets.forEach((t) => io.observe(t));
}
document.querySelectorAll('.step, .testimonial-card, .custom-copy, .custom-form, .section-head').forEach((el) => el.classList.add('reveal'));

/* ---------- Cursor glow (pointer devices only) ---------- */
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const glow = document.getElementById('glowCursor');
  window.addEventListener('mousemove', (e) => {
    glow.style.opacity = '1';
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  }, { passive: true });
  window.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
}

/* ---------- Init ---------- */
function applyProducts(list) {
  state.products = list;
  renderGrid();
  renderCart();
}

if (configured) {
  const footerNote = document.getElementById('footerNote');
  watchActiveProducts(
    (list) => applyProducts(list),
    (err) => {
      console.error('Errore nel caricamento prodotti da Firebase', err);
      applyProducts(FALLBACK_PRODUCTS);
      if (footerNote) footerNote.textContent = 'Errore di connessione al negozio — dati dimostrativi mostrati.';
    }
  );
} else {
  applyProducts(FALLBACK_PRODUCTS);
  const footerNote = document.getElementById('footerNote');
  if (footerNote) footerNote.textContent = 'Modalità dimostrativa: Firebase non ancora configurato (vedi SETUP.md).';
}

renderCart();
observeReveals();
