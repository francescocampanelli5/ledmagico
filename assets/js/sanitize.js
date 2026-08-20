// Piccola utility di sicurezza: sfugge l'HTML prima di inserire dati non fidati
// (nome cliente, indirizzo, note, idea del preventivo, ecc.) nel DOM tramite
// innerHTML, per prevenire attacchi XSS quando quei dati arrivano da un form
// pubblico e vengono poi visualizzati nella dashboard amministrativa.
// Restituisce l'URL solo se usa uno schema sicuro (http/https), altrimenti null.
// Da usare prima di inserire un URL fornito da un utente in un attributo href,
// per bloccare tentativi di XSS tipo "javascript:alert(1)".
export function safeUrl(value) {
  try {
    const url = new URL(String(value), window.location.href);
    if (url.protocol === 'http:' || url.protocol === 'https:') return url.href;
  } catch (e) { /* URL non valido */ }
  return null;
}

export function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
