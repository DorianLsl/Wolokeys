import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recapitulatif } from './recapitulatif.js';
import { choisir, etapeEnCours, plusTard, nePasUtiliser } from '../../partie/domain/partie.js';
import { suggestions, accepter } from '../../suggestions/domain/suggestions.js';

const poser = () => ['Q', 'S', 'D', 'F', 'Espace', 'Mouse 4'].reduce((h, t) => choisir(h, t).historique, []);
const suivant = (h) => accepter(h, suggestions(h)[0]).historique;
const jusqua = (h, action) => {
  while (etapeEnCours(h).action !== action) h = suivant(h);
  return h;
};
const jouer = (h) => {
  while (etapeEnCours(h)) h = suivant(h);
  return h;
};
const ligne = (h, action) => [...recapitulatif(h).optimisee, ...recapitulatif(h).extras].find((l) => l.action === action);

test('V8 : le recapitulatif a deux tableaux, partie optimisee et extras', () => {
  const r = recapitulatif(jouer(poser()));
  assert.deepEqual(r.extras.map((l) => l.action), ['idle', 'idleAll', 'idleMil']);
  assert.equal(r.optimisee.length, 21);
  assert.ok(recapitulatif(nePasUtiliser(poser()).historique).extras.some((l) => l.action === 'selectTc'), 'non utilisee : en extra');
  assert.deepEqual(ligne(jouer(poser()), 'selectTc').reglage, { raccourci: 'Mouse 4 + F' });
});

test('V5 : une action en Plus tard apparait a definir une fois son age fini', () => {
  assert.equal(ligne(plusTard(poser()).historique, 'selectTc').etat, 'plus tard');
  const surMoine = jusqua(poser(), 'monk');
  assert.equal(ligne(jouer(plusTard(surMoine).historique), 'monk').etat, 'a definir', 'partie finie');
  assert.equal(ligne(poser(), 'monk').etat, 'a venir');
  const surInactif = jusqua(poser(), 'idle');
  assert.equal(ligne(jusqua(plusTard(surInactif).historique, 'allBarracks'), 'idle').etat, 'a definir', 'age I fini');
  const sansCentreVille = nePasUtiliser(poser()).historique;
  assert.equal(ligne(sansCentreVille, 'selectTc').etat, 'a la fin');
  const deuxFois = nePasUtiliser(jusqua(sansCentreVille, 'selectTc')).historique;
  assert.equal(ligne(deuxFois, 'selectTc').etat, 'non utilise');
});

test('V9 : chaque raccourci regle a ses etoiles, et le score les additionne sur 4 par raccourci', () => {
  const fin = jouer(poser());
  assert.deepEqual([ligne(fin, 'selectTc').etoiles, ligne(fin, 'allBarracks').etoiles, ligne(poser(), 'selectTc').etoiles], [4, 3, null]);
  const r = recapitulatif(fin);
  const lignes = [...r.optimisee, ...r.extras];
  assert.deepEqual(r.score, { obtenu: lignes.reduce((total, l) => total + l.etoiles, 0), max: 96 });
  assert.deepEqual(recapitulatif(poser()).score, { obtenu: 0, max: 96 });
});
