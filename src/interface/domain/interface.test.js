import { test } from 'node:test';
import assert from 'node:assert/strict';
import { geste, touchesEntourees, deplacements, conflits } from './interface.js';
import { choisir, etapeEnCours, basculerEntrainement } from '../../partie/domain/partie.js';
import { suggestions, accepter } from '../../suggestions/domain/suggestions.js';

const poser = () => ['Q', 'S', 'D', 'F', 'Espace', 'Mouse 4'].reduce((h, t) => choisir(h, t).historique, []);
const suivant = (h) => accepter(h, suggestions(h)[0]).historique;
const jusqua = (h, action) => {
  while (etapeEnCours(h).action !== action) h = suivant(h);
  return h;
};
const touche = (t, maintenue = null, double = false) => ({ maintenue, touche: t, double });

test('V9 : le geste anime montre la touche du doigt, la suggestion choisie ou l appui suivant de la sequence', () => {
  assert.deepEqual(geste([], null, []), touche('Q'));
  const h = poser();
  const [premiere, , , groupe] = suggestions(h);
  assert.deepEqual(geste(h, premiere, []), touche('F', 'Mouse 4'));
  assert.deepEqual(geste(h, groupe, []), touche('5', 'Ctrl'), 'un groupe a creer : sa creation d abord');
  const groupe5 = choisir(h, 'Ctrl + 5').historique;
  assert.deepEqual(geste(groupe5, suggestions(groupe5)[3], []), touche('5'));
  const surVillageois = basculerEntrainement(jusqua(h, 'scout')).historique;
  assert.deepEqual(geste(surVillageois, null, []), touche('A', 'Maj'));
  assert.equal(geste(jouee(h), null, []), null, 'partie finie');
});

test('V18 : les touches de l action qui inspire la suggestion sont entourees, ou le chiffre de son groupe', () => {
  const h = poser();
  assert.deepEqual(touchesEntourees(h, suggestions(h)[0]), []);
  const surEclaireur = jusqua(choisir(h, 'Mouse 4 + F').historique, 'scout');
  assert.deepEqual(touchesEntourees(surEclaireur, suggestions(surEclaireur)[0]), ['Mouse 4', 'F']);
  const surCasernes = jusqua(accepter(h, suggestions(h)[3]).historique, 'allBarracks');
  assert.deepEqual(touchesEntourees(surCasernes, suggestions(surCasernes)[0]), ['5']);
});

test('V9 : sur la manette, le doigt qui quitte sa touche de reference annonce la touche visee', () => {
  const h = poser();
  assert.deepEqual(deplacements(h, touche('F', 'Mouse 4')), {});
  assert.deepEqual(deplacements(h, touche('G')), { index: 'G' });
  assert.deepEqual(deplacements(h, touche('F', 'Mouse 5')), { 'pouce droit': 'Mouse 5' });
  assert.deepEqual(deplacements([], touche('Q')), {}, 'pendant la posture');
});

test('P1 v2 : les touches qu une autre action tient deja, ou un groupe d une autre selection, sont en conflit', () => {
  const h = poser();
  assert.deepEqual(conflits([]), [], 'pendant la posture');
  assert.deepEqual(conflits(jusqua(choisir(h, 'Mouse 4 + F').historique, 'scout')), ['Mouse 4']);
  const surCasernes = conflits(jusqua(accepter(h, suggestions(h)[3]).historique, 'allBarracks'));
  assert.ok(surCasernes.includes('5') && !surCasernes.includes('6'), surCasernes.join());
});

function jouee(h) {
  while (etapeEnCours(h)) h = suivant(h);
  return h;
}
