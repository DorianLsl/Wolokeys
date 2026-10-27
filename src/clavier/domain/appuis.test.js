import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lireAppui, AUCUN_APPUI } from './appuis.js';

// Rejoue des événements et rend les raccourcis envoyés ; temps en millisecondes, 1 seconde d'écart par défaut.
const lire = (evenements) => {
  let etat = AUCUN_APPUI;
  const envoyes = [];
  evenements.forEach((ev, i) => {
    const lu = lireAppui(etat, { maintenues: [], temps: i * 1000, ...ev });
    etat = lu.etat;
    if (lu.raccourci) envoyes.push(lu.raccourci);
  });
  return envoyes;
};
const appui = (touche, maintenues = []) => ({ type: 'appui', touche, maintenues });
const relache = (touche) => ({ type: 'relache', touche });
const bouton = (touche) => ({ type: 'bouton', touche });
const boutonRelache = (touche) => ({ type: 'boutonRelache', touche });

test('V10 : une touche du clavier tenue forme une combinaison ; seule, elle compte au relachement', () => {
  assert.deepEqual(lire([appui('Ctrl', ['Ctrl']), appui('A', ['Ctrl']), relache('Ctrl')]), ['Ctrl + A']);
  assert.deepEqual(lire([appui('Alt', ['Alt']), relache('Alt')]), ['Alt']);
  assert.deepEqual(lire([appui('G')]), ['G']);
});

test('un bouton lateral tenu avec une touche se lit en combinaison, que le domaine refuse (V10) ; seul, il compte au relachement', () => {
  assert.deepEqual(lire([bouton('Mouse 4'), appui('G'), boutonRelache('Mouse 4')]), ['Mouse 4 + G']);
  assert.deepEqual(lire([bouton('Mouse 4'), boutonRelache('Mouse 4')]), ['Mouse 4']);
  assert.deepEqual(lire([bouton('Mouse 4'), bouton('Mouse 5'), boutonRelache('Mouse 5'), boutonRelache('Mouse 4')]), ['Mouse 4 + Mouse 5']);
});

test('V10 : deux appuis en moins de 0,4 seconde forment un double appui', () => {
  const vite = (ev, temps) => ({ ...ev, temps });
  assert.deepEqual(lire([vite(appui('Espace'), 0), vite(appui('Espace'), 300), vite(appui('Espace'), 600)]), ['Espace', 'Espace x2', 'Espace']);
  assert.deepEqual(lire([vite(bouton('Mouse 5'), 0), vite(boutonRelache('Mouse 5'), 50), vite(bouton('Mouse 5'), 200), vite(boutonRelache('Mouse 5'), 250)]), ['Mouse 5', 'Mouse 5 x2']);
});

test('une touche hors du clavier dessine, tenue avec une autre, reste au navigateur', () => {
  assert.deepEqual(lire([appui('Equal', ['Ctrl'])]), []);
  assert.deepEqual(lire([appui('Insert')]), ['Insert']);
});

test('V6 : Retour arriere oublie la touche tenue et le dernier appui', () => {
  const retour = { type: 'retour' };
  assert.deepEqual(lire([appui('Alt', ['Alt']), retour, relache('Alt')]), []);
  assert.deepEqual(lire([bouton('Mouse 4'), retour, boutonRelache('Mouse 4')]), []);
  assert.deepEqual(lire([{ ...appui('Q'), temps: 0 }, retour, { ...appui('Q'), temps: 300 }]), ['Q', 'Q']);
});

test('V10 : la souris et le clavier se combinent dans les deux sens', () => {
  assert.deepEqual(lire([appui('Alt', ['Alt']), { ...bouton('Mouse 4'), maintenues: ['Alt'] }, boutonRelache('Mouse 4'), relache('Alt')]), ['Alt + Mouse 4']);
  assert.deepEqual(lire([bouton('Mouse 4'), appui('Alt', ['Alt']), relache('Alt'), boutonRelache('Mouse 4')]), ['Mouse 4 + Alt']);
  assert.deepEqual(lire([appui('Ctrl', ['Ctrl']), appui('Maj', ['Ctrl', 'Maj'])]), ['Ctrl + Maj']);
  assert.deepEqual(lire([bouton('Mouse 4'), appui('Insert'), boutonRelache('Mouse 4')]), ['Mouse 4 + Insert']);
});
