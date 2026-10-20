const $ = (id) => document.getElementById(id);

// Vue main posée ou manette, commutable d'un clic (V9), retenue par le navigateur quand il le permet.
export function installerVues() {
  let vue = 'main';
  try {
    if (localStorage.getItem('vue') === 'manette') vue = 'manette';
  } catch {
    // Stockage indisponible : la vue par défaut.
  }
  const montrer = (v) => {
    document.body.dataset.vue = v;
    $('vue-main').setAttribute('aria-pressed', String(v === 'main'));
    $('vue-manette').setAttribute('aria-pressed', String(v === 'manette'));
    try {
      localStorage.setItem('vue', v);
    } catch {
      // Stockage indisponible : la vue n'est pas retenue.
    }
  };
  $('vue-main').addEventListener('click', () => montrer('main'));
  $('vue-manette').addEventListener('click', () => montrer('manette'));
  montrer(vue);
}
