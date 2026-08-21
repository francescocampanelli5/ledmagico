// Livello dati condiviso: inizializza Firebase e offre funzioni pronte
// per lo storefront (assets/js/script.js) e per la dashboard (admin/admin.js).
import { firebaseConfig, isFirebaseConfigured } from './firebase-config.js?v=2';

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

export const configured = isFirebaseConfigured();

let app = null;
let db = null;
let auth = null;

if (configured) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
}

export { db, auth };

const PRODUCTS_COL = 'products';
const ORDERS_COL = 'orders';
const QUOTES_COL = 'quotes';
const SUBSCRIBERS_COL = 'subscribers';
const MAIL_OUTBOX_COL = 'mail_outbox';

function slugify(text) {
  return text
    .toString()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function genOrderId() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `LM-${rand}`;
}

/* ---------------- Products ---------------- */

export function watchActiveProducts(onChange, onError) {
  // Nota: ordiniamo lato client (invece di orderBy in query) per evitare di
  // dover creare un indice composito Firestore su (active, sortOrder).
  const q = query(collection(db, PRODUCTS_COL), where('active', '==', true));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      onChange(list);
    },
    onError
  );
}

export function watchAllProducts(onChange, onError) {
  const q = query(collection(db, PRODUCTS_COL), orderBy('sortOrder', 'asc'));
  return onSnapshot(q, (snap) => onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), onError);
}

export async function getProductsByIds(ids) {
  const results = await Promise.all(ids.map((id) => getDoc(doc(db, PRODUCTS_COL, id))));
  return results.filter((d) => d.exists()).map((d) => ({ id: d.id, ...d.data() }));
}

export async function createProduct(data) {
  let id = slugify(data.name);
  const existing = await getDoc(doc(db, PRODUCTS_COL, id));
  if (existing.exists()) id = `${id}-${Math.random().toString(36).slice(2, 6)}`;

  const allSnap = await getDocs(collection(db, PRODUCTS_COL));
  const maxSort = allSnap.docs.reduce((m, d) => Math.max(m, d.data().sortOrder || 0), 0);

  await setDoc(doc(db, PRODUCTS_COL, id), {
    ...data,
    sortOrder: maxSort + 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return id;
}

export async function updateProduct(id, data) {
  await updateDoc(doc(db, PRODUCTS_COL, id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteProduct(id) {
  await deleteDoc(doc(db, PRODUCTS_COL, id));
}

/* ---------------- Orders ---------------- */

export async function createOrder(orderData) {
  const id = genOrderId();
  await setDoc(doc(db, ORDERS_COL, id), {
    ...orderData,
    status: 'da_confermare',
    followUpSent: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await enqueueMail('order_received', orderData.customerEmail, ORDERS_COL, id);
  await enqueueMail('owner_new_order', 'shop', ORDERS_COL, id);
  return id;
}

export function watchOrders(onChange, onError) {
  const q = query(collection(db, ORDERS_COL), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), onError);
}

export async function updateOrderStatus(id, status, customerEmail) {
  await updateDoc(doc(db, ORDERS_COL, id), { status, updatedAt: serverTimestamp() });
  if (['confermato', 'spedito', 'annullato'].includes(status) && customerEmail) {
    await enqueueMail('order_status_changed', customerEmail, ORDERS_COL, id, { status });
  }
}

/* ---------------- Quote requests ("su misura") ---------------- */

export async function createQuoteRequest(data) {
  const ref = await addDoc(collection(db, QUOTES_COL), {
    ...data,
    status: 'nuova',
    createdAt: serverTimestamp(),
  });
  await enqueueMail('quote_received', data.email, QUOTES_COL, ref.id);
  await enqueueMail('owner_new_quote', 'shop', QUOTES_COL, ref.id);
  return ref.id;
}

export function watchQuotes(onChange, onError) {
  const q = query(collection(db, QUOTES_COL), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), onError);
}

export async function updateQuoteStatus(id, status) {
  await updateDoc(doc(db, QUOTES_COL, id), { status });
}

/* ---------------- Newsletter ---------------- */

export async function subscribeNewsletter(email) {
  const id = email.trim().toLowerCase().replace(/[^a-z0-9@._-]/g, '_');
  await setDoc(doc(db, SUBSCRIBERS_COL, id), {
    email: email.trim(),
    unsubscribed: false,
    createdAt: serverTimestamp(),
  }, { merge: true });
  await enqueueMail('newsletter_welcome', email.trim(), SUBSCRIBERS_COL, id);
  return id;
}

export function watchSubscribers(onChange, onError) {
  const q = query(collection(db, SUBSCRIBERS_COL), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), onError);
}

export async function unsubscribeSelf(id) {
  await updateDoc(doc(db, SUBSCRIBERS_COL, id), { unsubscribed: true, unsubscribedAt: serverTimestamp() });
}

/* ---------------- Coda email (mail_outbox) ---------------- */
// Ogni riga qui accodata viene letta e inviata da Google Apps Script
// (vedi google-apps-script/Code.gs) entro pochi minuti, usando Gmail
// dell'account ledmagicoshop@gmail.com. Il sito non invia email
// direttamente: si limita a "prenotare" un invio con un riferimento al
// documento reale (ordine/preventivo/prodotto), mai con contenuto libero,
// per evitare che la coda possa essere usata per inviare email arbitrarie.

export async function enqueueMail(type, to, refCollection, refId, meta = {}) {
  await addDoc(collection(db, MAIL_OUTBOX_COL), {
    type,
    to,
    refCollection: refCollection || null,
    refId: refId || null,
    meta,
    sent: false,
    createdAt: serverTimestamp(),
  });
}

/* ---------------- Impostazioni negozio (es. dati bonifico) ---------------- */
// Salvate in Firestore (non nel codice) apposta: modificabili dalla dashboard
// senza mai comparire nel repository pubblico su GitHub.

export async function getPaymentSettings() {
  const snap = await getDoc(doc(db, 'settings', 'payment'));
  return snap.exists() ? snap.data() : null;
}

export async function savePaymentSettings(data) {
  await setDoc(doc(db, 'settings', 'payment'), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export async function announceProduct(productId) {
  await enqueueMail('product_announcement', 'subscribers', PRODUCTS_COL, productId);
}

/* ---------------- Auth ---------------- */

export function watchAuth(cb) {
  return onAuthStateChanged(auth, cb);
}

export async function login(email, password) {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  await signOut(auth);
}

/* ---------------- Image helper ---------------- */

export function compressImageToDataUri(file, maxDim = 900, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
