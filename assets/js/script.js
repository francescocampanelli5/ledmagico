/* ============ LedMagico — App logic ============ */
(() => {
  'use strict';

  /* ---------- Icon library (hand-drawn line-art, gradient + glow via CSS vars) ---------- */
  let iconUid = 0;
  function iconShell(key, inner){
    iconUid += 1;
    const g = `g-${key}-${iconUid}`;
    const f = `f-${key}-${iconUid}`;
    return `
    <svg viewBox="0 0 200 200" class="icon-${key}" style="--icon-c1:#ffe3a3;--icon-c2:#f4c064;">
      <defs>
        <linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--icon-c1)"/>
          <stop offset="100%" stop-color="var(--icon-c2)"/>
        </linearGradient>
        <filter id="${f}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.6" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <g fill="none" stroke="url(#${g})" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" filter="url(#${f})">
        ${inner}
      </g>
    </svg>`;
  }

  const ICONS = {
    eiffel: () => iconShell('eiffel', `
      <path d="M100 16 L80 178 M100 16 L120 178"/>
      <path d="M72 178 L128 178"/>
      <path d="M78 136 L122 136"/>
      <path d="M82 178 L100 136 L118 178"/>
      <path d="M86 98 L114 98"/>
      <path d="M90 60 L110 60"/>
      <path d="M82 178 L100 60 L118 178"/>
      <path d="M94 34 L106 34"/>
      <circle cx="100" cy="16" r="3" fill="var(--icon-c1)" stroke="none"/>
      <circle cx="86" cy="98" r="2.2" fill="var(--icon-c1)" stroke="none"/>
      <circle cx="114" cy="98" r="2.2" fill="var(--icon-c1)" stroke="none"/>
      <circle cx="78" cy="136" r="2.2" fill="var(--icon-c1)" stroke="none"/>
      <circle cx="122" cy="136" r="2.2" fill="var(--icon-c1)" stroke="none"/>
    `),
    barca: () => iconShell('barca', `
      <path d="M38 148 Q100 172 162 148 L146 166 Q100 180 54 166 Z"/>
      <path d="M100 148 L100 26"/>
      <path d="M103 32 L100 130 L152 122 Z"/>
      <path d="M97 55 L97 128 L52 118 Z"/>
      <path d="M100 26 L114 22 L100 34 Z" fill="var(--icon-c1)" stroke="none"/>
      <path d="M20 168 q15 -9 30 0 q15 9 30 0 q15 -9 30 0 q15 9 30 0 q15 -9 30 0" stroke-width="2"/>
    `),
    pirata: () => iconShell('pirata', `
      <path d="M28 148 L172 148 L154 176 L46 176 Z"/>
      <path d="M70 148 L70 26"/>
      <path d="M130 148 L130 34"/>
      <path d="M53 44 L87 44 L82 100 L58 100 Z"/>
      <path d="M113 52 L147 52 L142 100 L118 100 Z"/>
      <path d="M130 26 L156 34 L130 42 Z"/>
      <path d="M120 32 L142 32 M131 22 L131 42" stroke-width="2.2"/>
      <path d="M30 148 Q100 160 170 148" stroke-width="2"/>
    `),
    castello: () => iconShell('castello', `
      <path d="M40 178 L40 108 L54 108 L54 92 L68 92 L68 108 L88 108 L88 74 L112 74 L112 108 L132 108 L132 92 L146 92 L146 108 L160 108 L160 178 Z"/>
      <path d="M100 74 L100 40 M92 46 L108 46"/>
      <path d="M92 46 L100 30 L108 46 Z" fill="var(--icon-c1)" stroke="none"/>
      <path d="M61 92 L61 78 M54 82 L68 82"/>
      <path d="M139 92 L139 78 M132 82 L146 82"/>
      <rect x="93" y="140" width="14" height="38" rx="2"/>
      <path d="M60 130 L64 130 M136 130 L140 130 M60 150 L64 150 M136 150 L140 150"/>
    `),
    presepe: () => iconShell('presepe', `
      <path d="M30 108 L100 58 L170 108"/>
      <path d="M42 116 L42 176 M158 116 L158 176"/>
      <path d="M42 176 L158 176"/>
      <path d="M70 176 L70 128 L100 112 L130 128 L130 176"/>
      <path d="M100 40 L104 50 L115 50 L106 57 L109 68 L100 61 L91 68 L94 57 L85 50 L96 50 Z" fill="var(--icon-c1)" stroke="none" stroke-width="1"/>
      <circle cx="100" cy="150" r="14" fill="var(--icon-c1)" opacity="0.35" stroke="none"/>
    `),
    faro: () => iconShell('faro', `
      <path d="M86 178 L94 56 L106 56 L114 178 Z"/>
      <path d="M89 150 L111 150 M91 122 L109 122 M93 94 L107 94"/>
      <rect x="88" y="40" width="24" height="16"/>
      <path d="M88 40 L100 20 L112 40 Z"/>
      <path d="M86 46 L26 24 M114 46 L174 24" stroke-width="2" stroke-dasharray="2 6"/>
      <path d="M50 178 Q100 190 150 178" stroke-width="2"/>
      <circle cx="100" cy="14" r="2.4" fill="var(--icon-c1)" stroke="none"/>
    `),
    mongolfiera: () => iconShell('mongolfiera', `
      <path d="M100 18 C58 18 42 70 53 112 C64 144 136 144 147 112 C158 70 142 18 100 18 Z"/>
      <path d="M100 18 C88 50 88 100 100 140 M100 18 C112 50 112 100 100 140 M62 55 C80 75 120 75 138 55"/>
      <path d="M78 144 L86 160 L114 160 L122 144" />
      <rect x="84" y="160" width="32" height="20" rx="3"/>
      <circle cx="100" cy="70" r="2.4" fill="var(--icon-c1)" stroke="none"/>
    `),
    skyline: () => iconShell('skyline', `
      <rect x="18" y="112" width="24" height="66"/>
      <rect x="48" y="70" width="28" height="108"/>
      <rect x="82" y="128" width="20" height="50"/>
      <rect x="108" y="48" width="24" height="130"/>
      <rect x="138" y="92" width="22" height="86"/>
      <path d="M120 48 L120 26"/>
      <circle cx="120" cy="22" r="3" fill="var(--icon-c1)" stroke="none"/>
      <path d="M55 88 L69 88 M55 104 L69 104 M115 66 L125 66 M115 86 L125 86 M115 106 L125 106"/>
    `),
  };

  /* ---------- Product catalog ---------- */
  const PRODUCTS = [
    { id:'eiffel', name:'Torre Eiffel LED', cat:'monumenti', price:49, desc:'La dama di ferro parigina, reinterpretata in legno e luce calda.', full:'Una replica in scala della Torre Eiffel, intagliata a mano in legno chiaro e cablata con oltre 40 micro LED lungo la struttura reticolare. Un piccolo faro che trasforma una mensola in uno scorcio di Parigi al tramonto.', h:26, specs:['Altezza 26 cm · base 12x12 cm','Legno di faggio e metallo verniciato','40+ micro LED integrati','Alimentazione USB, cavo 1.5 m incluso'] },
    { id:'skyline', name:'Skyline Milano LED', cat:'monumenti', price:59, desc:'Il profilo della città che non dorme mai, acceso sulla tua libreria.', full:'Uno skyline stilizzato dei grattacieli milanesi, in resina opaca con finestre luminose realizzate una a una. Ogni edificio ha un circuito indipendente per un effetto profondità realistico.', h:22, specs:['Larghezza 34 cm · altezza 22 cm','Resina opaca antiriflesso','60+ finestre LED indipendenti','Alimentazione USB o power bank'] },
    { id:'barca', name:'Barca a Vela LED', cat:'barche', price:39, desc:'Vele che catturano la luce come catturano il vento.', full:'Uno scafo in legno di cedro con vele in tessuto naturale, illuminato da una striscia LED che corre lungo l\'alberatura. Perfetta su una mensola vicino alla finestra, come se fosse appena rientrata in porto.', h:18, specs:['Altezza 18 cm · lunghezza 24 cm','Scafo in cedro, vele in cotone trattato','Striscia LED lungo l\'albero maestro','Base espositiva in legno inclusa'] },
    { id:'pirata', name:'Nave Pirata LED', cat:'barche', price:65, desc:'Due alberi, vele scure e una lanterna che non si spegne mai.', full:'Un vascello corsaro dal dettaglio ricco: ponte in legno scuro, vele dipinte a mano e lanterne LED a bordo che si accendono in bianco caldo o RGB. Il pezzo preferito da chi ama le storie di mare.', h:24, specs:['Altezza 24 cm · lunghezza 30 cm','Legno scuro trattato a mano','12 punti luce distribuiti sul ponte','Compatibile con telecomando RGB'] },
    { id:'castello', name:'Castello Incantato LED', cat:'fantasia', price:72, desc:'Torri, bandiere e finestre che si accendono una a una.', full:'Un castello da fiaba con cinque torri, ognuna con la propria finestra luminosa. Il mattone è riprodotto a rilievo in resina e dipinto a mano per un effetto materico che cattura la luce dei LED interni.', h:28, specs:['Altezza 28 cm · base 20x20 cm','Resina a rilievo dipinta a mano','18 punti luce, 5 circuiti indipendenti','Alimentazione USB, timer integrato'] },
    { id:'presepe', name:'Presepe LED con Acqua', cat:'presepi', price:89, desc:'Il ruscello scorre davvero, la stella cometa non si spegne mai.', full:'Il nostro pezzo più amato: una capanna in legno con un vero micro-circuito ad acqua che simula un ruscello, illuminato dal basso con LED blu. La stella cometa in alto brilla di bianco caldo per tutta la notte.', h:20, specs:['Altezza 20 cm · base 30x22 cm','Legno naturale e resina trasparente','Pompa ad acqua silenziosa inclusa','Stella cometa e faretti a LED caldo'] },
    { id:'faro', name:'Faro LED', cat:'barche', price:35, desc:'Un raggio di luce rotante, come sulla costa vera.', full:'Un faro marittimo in legno tornito a mano, con lanterna superiore dotata di LED rotante che simula il raggio di luce reale. Le strisce rosse sono dipinte a mano, una per una.', h:21, specs:['Altezza 21 cm · base Ø 9 cm','Legno tornito, base in pietra ricomposta','LED rotante nella lanterna superiore','Alimentazione USB'] },
    { id:'mongolfiera', name:'Mongolfiera LED', cat:'fantasia', price:45, desc:'Sospesa in volo, illuminata dall\'interno come al mattino presto.', full:'Una mongolfiera in tessuto rigido e cesto in vimini intrecciato a mano, con un LED interno che replica il bagliore del bruciatore. Da appendere o appoggiare, regala movimento a qualsiasi stanza.', h:19, specs:['Altezza 19 cm · diametro pallone 14 cm','Tessuto rigido dipinto a mano','Cesto in vimini naturale intrecciato','Gancio per sospensione incluso'] },
  ];

  const CATEGORY_LABEL = { monumenti:'Monumenti', barche:'Barche & Mare', presepi:'Presepi', fantasia:'Fantasia' };
  const COLOR_LABEL = { warm:'Bianco caldo', blue:'Blu notte', rgb:'RGB multicolore' };
  const COLOR_VARS = { warm:['#ffe3a3','#f4c064'], blue:['#cfe0ff','#6f8cff'], rgb:['#ffb4e6','#7fd8ff'] };

  const fmtPrice = (n) => `€${n.toFixed(0)}`;

  /* ---------- Cart state ---------- */
  const CART_KEY = 'ledmagico_cart_v1';
  let cart = loadCart();

  function loadCart(){
    try{ return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch(e){ return []; }
  }
  function saveCart(){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

  function addToCart(productId, color, qty){
    const existing = cart.find(l => l.id === productId && l.color === color);
    if(existing){ existing.qty += qty; }
    else{ cart.push({ id: productId, color, qty }); }
    saveCart();
    renderCart();
    bumpBadge();
  }
  function updateQty(index, delta){
    cart[index].qty += delta;
    if(cart[index].qty <= 0) cart.splice(index,1);
    saveCart(); renderCart();
  }
  function removeLine(index){ cart.splice(index,1); saveCart(); renderCart(); }
  function cartCount(){ return cart.reduce((s,l)=>s+l.qty,0); }
  function cartSubtotal(){
    return cart.reduce((s,l)=>{
      const p = PRODUCTS.find(p=>p.id===l.id);
      return s + (p ? p.price*l.qty : 0);
    },0);
  }

  function bumpBadge(){
    const badge = document.getElementById('cartBadge');
    badge.classList.remove('bump'); void badge.offsetWidth; badge.classList.add('bump');
  }

  /* ---------- Render: product grid ---------- */
  const productGrid = document.getElementById('productGrid');

  function renderGrid(filter='tutti'){
    productGrid.innerHTML = '';
    const list = filter==='tutti' ? PRODUCTS : PRODUCTS.filter(p=>p.cat===filter);
    list.forEach((p, i) => {
      const card = document.createElement('article');
      card.className = 'product-card';
      card.style.transitionDelay = `${Math.min(i,7)*40}ms`;
      card.innerHTML = `
        <div class="product-media" data-open="${p.id}">
          <span class="product-tag">${CATEGORY_LABEL[p.cat]}</span>
          ${ICONS[p.id]()}
        </div>
        <h3 class="product-name" data-open="${p.id}">${p.name}</h3>
        <p class="product-desc">${p.desc}</p>
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
    if(openId){ openModal(openId); }
    else if(addId){ addToCart(addId, 'warm', 1); showToast(`${PRODUCTS.find(p=>p.id===addId).name} aggiunta al carrello`); }
  });

  /* ---------- Filters ---------- */
  const filterBar = document.getElementById('filterBar');
  filterBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-chip');
    if(!btn) return;
    filterBar.querySelectorAll('.filter-chip').forEach(b=>b.classList.remove('is-active'));
    btn.classList.add('is-active');
    renderGrid(btn.dataset.filter);
  });

  /* ---------- Product modal ---------- */
  const modalOverlay = document.getElementById('modalOverlay');
  const modalBody = document.getElementById('modalBody');
  let modalState = { id:null, color:'warm', qty:1 };

  function openModal(id){
    const p = PRODUCTS.find(p=>p.id===id);
    if(!p) return;
    modalState = { id, color:'warm', qty:1 };
    renderModal(p);
    modalOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    modalOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function renderModal(p){
    modalBody.innerHTML = `
      <div class="modal-media">${ICONS[p.id]()}</div>
      <div class="modal-info">
        <span class="modal-tag">${CATEGORY_LABEL[p.cat]}</span>
        <h2>${p.name}</h2>
        <div class="modal-price">${fmtPrice(p.price)} <small style="font-size:.7rem;color:var(--text-faint);font-family:var(--font-body);">IVA inclusa</small></div>
        <p class="modal-desc">${p.full}</p>

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

        <ul class="modal-specs">
          ${p.specs.map(s=>`<li>${s}</li>`).join('')}
        </ul>
      </div>`;

    const svg = modalBody.querySelector('.modal-media svg');
    modalBody.querySelectorAll('.color-swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        modalBody.querySelectorAll('.color-swatch').forEach(s=>s.classList.remove('is-active'));
        sw.classList.add('is-active');
        const c = sw.dataset.color;
        modalState.color = c;
        const [c1,c2] = COLOR_VARS[c];
        svg.style.setProperty('--icon-c1', c1);
        svg.style.setProperty('--icon-c2', c2);
        modalBody.querySelector('#colorLabel').textContent = COLOR_LABEL[c];
      });
    });

    modalBody.querySelectorAll('[data-modalqty]').forEach(btn=>{
      btn.addEventListener('click', () => {
        modalState.qty = Math.max(1, modalState.qty + parseInt(btn.dataset.modalqty,10));
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
  modalOverlay.addEventListener('click', (e) => { if(e.target === modalOverlay) closeModal(); });

  /* ---------- Cart drawer render ---------- */
  const drawerItems = document.getElementById('drawerItems');
  const cartDrawer = document.getElementById('cartDrawer');
  const drawerOverlay = document.getElementById('drawerOverlay');
  const cartBadge = document.getElementById('cartBadge');
  const cartSubtotalEl = document.getElementById('cartSubtotal');

  function renderCart(){
    cartBadge.textContent = cartCount();
    cartSubtotalEl.textContent = fmtPrice(cartSubtotal());

    if(cart.length === 0){
      drawerItems.innerHTML = `<div class="drawer-empty">Il carrello è vuoto.<br>Scegli il tuo primo modellino illuminato.</div>`;
      return;
    }
    drawerItems.innerHTML = cart.map((line, i) => {
      const p = PRODUCTS.find(p=>p.id===line.id);
      if(!p) return '';
      const [c1,c2] = COLOR_VARS[line.color];
      return `
        <div class="cart-line">
          <div class="cart-line-media"><span style="display:contents" data-icon="${p.id}"></span></div>
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
          <div class="cart-line-price">${fmtPrice(p.price*line.qty)}</div>
        </div>`;
    }).join('');

    // inject icons with correct color
    cart.forEach((line, i) => {
      const holder = drawerItems.querySelectorAll('[data-icon]')[i];
      if(!holder) return;
      holder.innerHTML = ICONS[line.id]();
      const [c1,c2] = COLOR_VARS[line.color];
      const svg = holder.querySelector('svg');
      svg.style.setProperty('--icon-c1', c1);
      svg.style.setProperty('--icon-c2', c2);
    });

    drawerItems.querySelectorAll('[data-qty]').forEach(btn=>{
      btn.addEventListener('click', () => updateQty(parseInt(btn.dataset.idx,10), parseInt(btn.dataset.qty,10)));
    });
    drawerItems.querySelectorAll('[data-remove]').forEach(btn=>{
      btn.addEventListener('click', () => removeLine(parseInt(btn.dataset.remove,10)));
    });
  }

  function openCart(){
    cartDrawer.classList.add('is-open');
    drawerOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeCart(){
    cartDrawer.classList.remove('is-open');
    drawerOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  document.getElementById('cartToggle').addEventListener('click', openCart);
  document.getElementById('cartClose').addEventListener('click', closeCart);
  drawerOverlay.addEventListener('click', closeCart);

  /* ---------- Checkout (simulated) ---------- */
  document.getElementById('checkoutBtn').addEventListener('click', () => {
    if(cart.length === 0){ showToast('Il carrello è vuoto'); return; }
    const orderNum = 'LM-' + Math.floor(1000 + Math.random()*9000);
    document.getElementById('orderNumber').textContent = '#' + orderNum;
    cart = []; saveCart(); renderCart();
    closeCart();
    document.getElementById('successOverlay').classList.add('is-open');
  });
  document.getElementById('successClose').addEventListener('click', () => {
    document.getElementById('successOverlay').classList.remove('is-open');
    document.body.style.overflow = '';
  });

  /* ---------- FAQ accordion ---------- */
  document.getElementById('faqList').addEventListener('click', (e) => {
    const btn = e.target.closest('.faq-question');
    if(!btn) return;
    const item = btn.closest('.faq-item');
    const answer = item.querySelector('.faq-answer');
    const isOpen = item.classList.contains('is-open');
    document.querySelectorAll('.faq-item.is-open').forEach(el=>{
      el.classList.remove('is-open');
      el.querySelector('.faq-answer').style.maxHeight = null;
    });
    if(!isOpen){
      item.classList.add('is-open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });

  /* ---------- Custom quote form (simulated submit) ---------- */
  document.getElementById('customForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const note = document.getElementById('customFormNote');
    const form = e.target;
    if(!form.checkValidity()){
      note.textContent = 'Compila tutti i campi per inviare la richiesta.';
      note.classList.add('is-error');
      return;
    }
    note.classList.remove('is-error');
    note.textContent = 'Richiesta inviata! Ti risponderemo entro 48 ore.';
    form.reset();
  });

  /* ---------- Newsletter form (simulated submit) ---------- */
  document.getElementById('newsletterForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const note = document.getElementById('newsletterNote');
    const input = document.getElementById('nl-email');
    if(!input.checkValidity()){
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
  function showToast(msg){
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>toast.classList.remove('is-visible'), 2600);
  }

  /* ---------- Header scroll state ---------- */
  const header = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => {
    header.classList.toggle('is-scrolled', window.scrollY > 20);
  }, { passive:true });

  /* ---------- Mobile menu ---------- */
  const mainNav = document.getElementById('mainNav');
  const menuToggle = document.getElementById('menuToggle');
  menuToggle.addEventListener('click', () => mainNav.classList.toggle('is-open'));
  mainNav.addEventListener('click', (e) => { if(e.target.tagName === 'A') mainNav.classList.remove('is-open'); });

  /* ---------- Scroll reveal ---------- */
  function observeReveals(){
    const targets = document.querySelectorAll('.product-card:not(.is-visible), .reveal:not(.is-visible)');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    targets.forEach(t => io.observe(t));
  }

  document.querySelectorAll('.step, .testimonial-card, .custom-copy, .custom-form, .section-head').forEach(el => el.classList.add('reveal'));

  /* ---------- Cursor glow (pointer devices only) ---------- */
  if(window.matchMedia('(hover: hover) and (pointer: fine)').matches){
    const glow = document.getElementById('glowCursor');
    window.addEventListener('mousemove', (e) => {
      glow.style.opacity = '1';
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    }, { passive:true });
    window.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
  }

  /* ---------- Init ---------- */
  renderGrid('tutti');
  renderCart();
  observeReveals();
})();
