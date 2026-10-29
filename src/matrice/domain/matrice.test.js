import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matriceParTouche, matriceParVerbe } from './matrice.js';
import { choisir } from '../../partie/domain/partie.js';

const poser = () => ['Q', 'S', 'D', 'F', 'Espace', 'Mouse 5'].reduce((h, t) => choisir(h, t).historique, []);
// Centre-ville, éclaireur, caméra, prochain inactif et tous les inactifs ; l'étape suivante est celle des casernes.
const cinq = () => ['Mouse 5', 'Échap + E', 'Espace', 'G', 'Ctrl + G'].reduce((h, r) => choisir(h, r).historique, poser());
// Chaque case en une ligne lisible : ses actions (* la suggestion), son état, ou · si elle est vide.
const lire = (m) => m.cases.map((ligne) => ligne.map((c) => (c.actions.length ? c.actions.map((a) => `${a.action}${a.suggeree ? '*' : ''}`).join('+') : c.vide || '·')).join(' | '));

test('V35 : par touche, une ligne par mecanique et une colonne par touche, qui apparaissent au fil des choix', () => {
  assert.deepEqual(matriceParTouche(poser(), null), { lignes: [], colonnes: [], cases: [] });
  const m = matriceParTouche(cinq(), null);
  assert.deepEqual(m.lignes, [{ id: 'seule', nom: 'prochain · caméra' }, { id: 'Ctrl', nom: 'tous sur la carte' }]);
  assert.deepEqual(m.colonnes, [{ id: 'E', nom: 'cavalerie' }, { id: 'G', nom: 'inactifs' }, { id: 'Espace', nom: 'caméra' }, { id: 'Mouse 5', nom: 'centre-ville' }]);
  assert.deepEqual(lire(m), ['scout | idle | camera | selectTc', '— | idleAll | libre | libre']);
});

test('V35 : par touche, la grille du jeu seule, et la suggestion marquee dans sa case', () => {
  const surInactifs = ['Mouse 5', 'Échap + E', 'Espace', 'G'].reduce((h, r) => choisir(h, r).historique, poser());
  const m = matriceParTouche(surInactifs, { raccourci: 'Alt + A' });
  assert.deepEqual(m.lignes.map((l) => l.id), ['seule', 'Alt']);
  assert.deepEqual(m.colonnes.map((c) => c.id), ['A', 'E', 'G', 'Espace', 'Mouse 5']);
  assert.deepEqual(lire(m), ['grille du jeu | scout | idle | camera | selectTc', 'idleAll* | libre | libre | libre | libre']);
  assert.deepEqual(matriceParTouche(cinq(), { groupe: { chiffre: '6' } }), matriceParTouche(cinq(), null), 'un groupe n a pas de touche');
});

test('V35 : par verbe, une ligne par verbe et une colonne par element, groupes compris', () => {
  const m = matriceParVerbe(cinq(), { groupe: { chiffre: '6', creer: true } });
  assert.deepEqual(m.lignes, [{ id: 'prochain', nom: 'prochain' }, { id: 'tous', nom: 'tous sur la carte' }, { id: 'caméra', nom: 'caméra' }]);
  assert.deepEqual(m.colonnes.map((c) => c.nom), ['centre-ville', 'cavalerie', 'caméra', 'inactifs', 'infanterie']);
  assert.deepEqual(lire(m), ['selectTc | scout | · | idle | ·', '· | · | · | idleAll | allBarracks*', '· | · | camera | · | ·']);
  assert.deepEqual(m.cases[1][4].actions[0], { action: 'allBarracks', raccourci: null, chiffre: '6', suggeree: true });
  assert.equal(m.cases[0][1].actions[0].raccourci, 'Échap + E');
});
