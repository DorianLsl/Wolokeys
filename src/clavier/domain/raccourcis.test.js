import { test } from 'node:test';
import assert from 'node:assert/strict';
import { refusRaccourci, seGenent, mecaniqueDe, estDouble } from './raccourcis.js';

test('V3 : la grille reste au jeu, sauf avec Alt, Ctrl ou apres Echap', () => {
  assert.equal(refusRaccourci('A'), 'A deja pris : grille.');
  assert.equal(refusRaccourci('T x2'), 'T x2 deja pris : grille.');
  assert.equal(refusRaccourci('Ctrl + A'), null, 'le jeu accepte Ctrl avec la grille');
  assert.equal(refusRaccourci('Maj + S'), 'Grille : pas avec Maj (file).');
  for (const permis of ['Alt + A', 'Échap + A', 'G', 'Ctrl + G']) assert.equal(refusRaccourci(permis), null, permis);
  assert.equal(refusRaccourci('Échap + G'), 'Echap : seulement avant la grille.');
});

test('V10 : seules Alt, Maj et Ctrl se maintiennent, devant une touche ordinaire', () => {
  assert.equal(refusRaccourci('Win + G'), 'Win + G : combinaison impossible.');
  assert.equal(refusRaccourci('Alt + Maj'), 'Alt + Maj : combinaison impossible.');
  assert.equal(refusRaccourci('Alt + 5'), 'Alt + 5 : combinaison impossible.');
  assert.equal(refusRaccourci('Alt + Échap'), 'Alt + Echap : combinaison impossible.');
  assert.equal(refusRaccourci('Inser'), 'Touche inconnue.');
  assert.equal(refusRaccourci('Alt + G x2'), 'Alt + G x2 : combinaison impossible.');
});

test('V10 : un bouton lateral se combine appuye en second, le jeu refuse de le tenir', () => {
  for (const r of ['Mouse 4 + G', 'Mouse 5 + A', 'Mouse 4 + Mouse 5']) assert.equal(refusRaccourci(r), 'Bouton lateral : seulement en second.', r);
  for (const permis of ['Mouse 4', 'Mouse 5 x2', 'Alt + Mouse 4', 'Ctrl + Mouse 5', 'Maj + Mouse 4']) assert.equal(refusRaccourci(permis), null, permis);
});

test('touches reservees au jeu ou au systeme, seules ou doublees', () => {
  assert.equal(refusRaccourci('Échap'), 'Echap : menu du jeu.');
  assert.equal(refusRaccourci('5'), 'Chiffres : groupes de controle.');
  assert.equal(refusRaccourci('5 x2'), 'Chiffres : groupes de controle.');
  assert.equal(refusRaccourci('Maj'), 'Maj seule : enchainer les ordres.');
  assert.equal(refusRaccourci('Ctrl'), 'Ctrl seul : en combinaison seulement.');
  assert.equal(refusRaccourci('Win'), 'Win : menu Windows.');
  assert.equal(refusRaccourci('Verr.Maj'), 'Verr.Maj : majuscules.');
  assert.equal(refusRaccourci('Tab'), 'Tab : sous-selection du jeu.');
  assert.equal(refusRaccourci('Ctrl + Tab'), 'Ctrl + Tab : combinaison impossible.');
  for (const permis of ['Alt', 'Mouse 4', '² x2', 'F1', 'Espace x2']) assert.equal(refusRaccourci(permis), null, permis);
});

test('V10 : deux raccourcis se genent en jeu', () => {
  assert.ok(seGenent('G', 'G'));
  assert.ok(seGenent('Alt + G', 'Alt + G'));
  assert.ok(seGenent('Alt', 'Alt + B'), 'seule et maintenue');
  assert.ok(seGenent('Alt + B', 'Alt'), 'maintenue et seule');
  assert.ok(seGenent('²', '² x2'), 'seule et double appui');
  assert.ok(seGenent('² x2', '²'), 'double appui et seule');
  assert.ok(!seGenent('Alt + G', 'Ctrl + G'), 'meme touche, autre maintenue');
  assert.ok(!seGenent('G', 'Alt + G'), 'touche seule et la meme en combinaison');
  assert.ok(!seGenent('Ctrl + G', 'Ctrl + B'), 'meme maintenue, autre touche');
  assert.ok(!seGenent('G x2', 'Alt + G'));
  assert.ok(seGenent('Alt x2', 'Alt + B'), 'double appui et maintenue');
});

test('mecanique : touche seule, double appui ou touche maintenue ; Echap puis une touche de la grille compte comme seule', () => {
  assert.deepEqual(['G', 'G x2', 'Alt + G', 'Ctrl + G', 'Mouse 4', 'Échap + A'].map(mecaniqueDe), ['seule', 'double', 'Alt', 'Ctrl', 'seule', 'seule']);
});

test('V10 : deux appuis sur la meme touche seule en moins de 0,4 seconde forment un double appui', () => {
  assert.ok(estDouble({ raccourci: 'Espace', temps: 1000 }, { raccourci: 'Espace', temps: 1399 }));
  assert.ok(!estDouble({ raccourci: 'Espace', temps: 1000 }, { raccourci: 'Espace', temps: 1400 }), '0,4 seconde pile');
  assert.ok(!estDouble({ raccourci: 'Échap', temps: 1000 }, { raccourci: 'Échap', temps: 1100 }), 'deux Echap rapides : deux Plus tard');
  assert.ok(estDouble({ raccourci: '5', temps: 1000 }, { raccourci: '5', temps: 1100 }), 'un groupe en double appui centre la camera');
  assert.ok(!estDouble({ raccourci: 'Espace', temps: 1000 }, { raccourci: 'G', temps: 1100 }), 'autre touche');
  assert.ok(!estDouble({ raccourci: 'Alt + G', temps: 1000 }, { raccourci: 'Alt + G', temps: 1100 }), 'combinaison');
  assert.ok(!estDouble(null, { raccourci: 'G', temps: 1100 }), 'premier appui');
});
