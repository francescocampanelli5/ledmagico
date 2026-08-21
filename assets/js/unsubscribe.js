import { configured, unsubscribeSelf } from './firebase-app.js?v=3';

const params = new URLSearchParams(location.search);
const id = params.get('id');
const titleEl = document.getElementById('title');
const msgEl = document.getElementById('message');

async function run() {
  if (!id) {
    titleEl.textContent = 'Link non valido';
    msgEl.textContent = 'Il link di disiscrizione non è completo. Scrivici a ledmagicoshop@gmail.com se hai bisogno di aiuto.';
    return;
  }
  if (!configured) {
    titleEl.textContent = 'Servizio non disponibile';
    msgEl.textContent = 'Riprova più tardi o scrivici a ledmagicoshop@gmail.com.';
    return;
  }
  try {
    await unsubscribeSelf(id);
    titleEl.textContent = 'Fatto!';
    msgEl.textContent = 'Non riceverai più le nostre email di aggiornamento. Puoi iscriverti di nuovo in qualsiasi momento dal sito.';
  } catch (err) {
    console.error(err);
    titleEl.textContent = 'Qualcosa non ha funzionato';
    msgEl.textContent = 'Scrivici a ledmagicoshop@gmail.com e ti disiscriviamo manualmente.';
  }
}
run();
