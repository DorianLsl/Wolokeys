import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lireRaccourci, toucheDuCode, toucheDuBouton, raccourciDe } from './touches.js';

test('une touche inconnue est refusee avec un message', () => {
  assert.deepEqual(lireRaccourci('Inser'), { erreur: 'Touche inconnue.' });
  assert.deepEqual(lireRaccourci('Alt + Inser'), { erreur: 'Touche inconnue.' });
});

test('les touches physiques se lisent en AZERTY, les boutons lateraux en Mouse 4 et Mouse 5', () => {
  assert.deepEqual(['KeyQ', 'KeyA', 'KeyZ', 'KeyW', 'Semicolon', 'Space', 'Backquote'].map(toucheDuCode), ['A', 'Q', 'W', 'Z', 'Semicolon', 'Espace', '²']);
  assert.deepEqual([4, 3, 0].map(toucheDuBouton), ['Mouse 4', 'Mouse 5', null]);
});

test('une touche hors du clavier dessine est refusee, meme si elle porte le nom d une touche connue', () => {
  assert.deepEqual(lireRaccourci(toucheDuCode('Numpad1')), { erreur: 'Touche inconnue.' });
  assert.deepEqual(lireRaccourci(toucheDuCode('AltRight')), { erreur: 'Touche inconnue.' });
});

test('une touche appuyee pendant qu une autre est tenue forme une combinaison', () => {
  assert.equal(raccourciDe('A', []), 'A');
  assert.equal(raccourciDe('A', ['Ctrl']), 'Ctrl + A');
  assert.deepEqual(lireRaccourci(raccourciDe('A', ['Ctrl'])), { maintenue: 'Ctrl', touche: 'A', double: false });
  assert.deepEqual(lireRaccourci(raccourciDe('A', ['Ctrl', 'Maj'])), { erreur: 'Une seule touche maintenue.' });
});
