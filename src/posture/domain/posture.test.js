import { test } from 'node:test';
import assert from 'node:assert/strict';
import { etapePosture, toucheSuggeree, choisirTouche, postureDe } from './posture.js';

const poser = (touches) => touches.reduce((h, t) => choisirTouche(h, t).historique, []);

test('V2 : la posture suggeree est Q S D F Espace et Mouse 5, le bouton avant ou repose le pouce', () => {
  let h = [];
  const suggerees = [];
  while (etapePosture(h)) {
    suggerees.push(`${etapePosture(h)}=${toucheSuggeree(h)}`);
    h = choisirTouche(h, toucheSuggeree(h)).historique;
  }
  assert.deepEqual(suggerees, ['auriculaire=Q', 'annulaire=S', 'majeur=D', 'index=F', 'pouce=Espace', 'pouce droit=Mouse 5']);
  assert.deepEqual(postureDe(h), { auriculaire: 'Q', annulaire: 'S', majeur: 'D', index: 'F', pouce: 'Espace', 'pouce droit': 'Mouse 5' });
});

test('V2 : une touche seule par doigt, connue, au bon endroit, sans doublon', () => {
  const refus = (touches, touche) => choisirTouche(poser(touches), touche).erreur;
  assert.equal(refus([], 'Alt + Q'), 'Une touche seule par doigt.');
  assert.equal(refus([], 'Q x2'), 'Une touche seule par doigt.');
  assert.equal(refus([], 'Inser'), 'Touche inconnue.');
  assert.equal(refus([], 'Mouse 4'), 'Mouse 4 : pas pour la main gauche.');
  assert.equal(refus([], 'Échap'), 'Echap : pas pour la main gauche.');
  assert.equal(refus([], 'Win'), 'Win : pas pour la main gauche.');
  assert.equal(refus(['²'], '²'), 'carre deja pris par ton auriculaire.');
  assert.equal(refus(['Q', 'S', 'D', 'F', 'Espace'], 'G'), 'Pouce droit : Mouse 4 ou Mouse 5.');
  assert.equal(refus(['Q', 'S', 'D', 'F', 'Espace', 'Mouse 5'], 'Mouse 4'), 'Posture deja complete.');
});

test('V2 : Maj et Mouse 4 sont des touches de reference possibles', () => {
  assert.equal(postureDe(poser(['Maj', 'S', 'D', 'F', 'Alt', 'Mouse 4']))['pouce droit'], 'Mouse 4');
  assert.equal(postureDe(poser(['Maj']))['auriculaire'], 'Maj');
});

test('V2 : touche prise, la suggestion passe a la premiere libre a droite du doigt precedent, sinon a la premiere libre', () => {
  assert.equal(toucheSuggeree(poser(['S'])), 'D');
  assert.equal(toucheSuggeree(poser(['Q', 'F', 'Ctrl'])), 'Alt');
  assert.equal(toucheSuggeree(poser(['Q', 'S', 'D', 'Espace'])), 'F1');
  for (const touches of [['S'], ['Q', 'F', 'Ctrl'], ['Q', 'S', 'D', 'Espace'], ['D', 'G']]) {
    assert.ok(choisirTouche(poser(touches), toucheSuggeree(poser(touches))).historique, `suggestion refusee apres ${touches}`);
  }
});

test('posture complete : plus de suggestion', () => {
  assert.equal(toucheSuggeree(poser(['Q', 'S', 'D', 'F', 'Espace', 'Mouse 4'])), null);
});
