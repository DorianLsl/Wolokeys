import { lireVue, retenirVue } from '../adapters/vue.js';

const $ = (id) => document.getElementById(id);

// Vue main posée ou manette, commutable d'un clic (V9) ; en vue manette, le tiroir ouvre le clavier dessiné.
export function installerVues() {
  const montrer = (v) => {
    document.body.dataset.vue = v;
    $('vue-main').setAttribute('aria-pressed', String(v === 'main'));
    $('vue-manette').setAttribute('aria-pressed', String(v === 'manette'));
    retenirVue(v);
  };
  $('vue-main').addEventListener('click', () => montrer('main'));
  $('vue-manette').addEventListener('click', () => montrer('manette'));
  $('tiroir').addEventListener('click', () => $('tiroir').setAttribute('aria-expanded', String($('defile-clavier').classList.toggle('ouvert'))));
  montrer(lireVue());
}
