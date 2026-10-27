import { test } from 'node:test';
import assert from 'node:assert/strict';
import { creerGroupe, groupesDe, toucheDeCreation, groupePropose } from './groupes.js';

const creer = (h, chiffre, selection, maintenue = 'Ctrl', raccourcis = []) => creerGroupe(h, chiffre, maintenue, selection, raccourcis);

test('V7 : touche maintenue + chiffre met la selection actuelle dans ce groupe, et remplace son contenu', () => {
  const h = creer([], '5', 'centre-ville').historique;
  assert.deepEqual(groupesDe(h), { 5: 'centre-ville' });
  assert.deepEqual(groupesDe(creer(h, '5', 'casernes').historique), { 5: 'casernes' });
  assert.equal(creer([], '5', null).erreur, 'Rien de selectionne.');
});

test('V10 : la touche de creation est celle du premier groupe ; elle ne sert pas seule a un raccourci', () => {
  const h = creer([], '1', 'infanterie', 'Alt').historique;
  assert.equal(toucheDeCreation(h), 'Alt');
  assert.equal(creer(h, '2', 'distance', 'Ctrl').erreur, 'Groupes : Alt + chiffre.');
  assert.equal(creer([], '1', 'infanterie', 'Alt', ['Alt']).erreur, 'Alt seul deja pris.');
  assert.equal(creer([], '1', 'infanterie', 'Alt', ['Alt x2']).erreur, 'Alt seul deja pris.');
  assert.ok(creer([], '1', 'infanterie', 'Alt', ['Alt + G']).historique, 'deja maintenue ailleurs : permis');
  assert.equal(creer([], '1', 'infanterie', 'Win').erreur, 'Win + 1 : combinaison impossible.');
  assert.equal(creer([], '1', 'infanterie', 'Mouse 4').erreur, 'Mouse 4 + 1 : combinaison impossible.', 'le jeu refuse de tenir un bouton lateral');
  assert.equal(toucheDeCreation([]), null);
});

test('V15 : sans groupe, chaque selection a son numero habituel des joueurs reconnus', () => {
  const numeros = ['infanterie', 'distance', 'cavalerie', 'siège', 'centre-ville', 'casernes', 'champs de tir', 'écuries', 'ateliers', 'monastères']
    .map((s) => groupePropose([], s).chiffre);
  assert.deepEqual(numeros, ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']);
  assert.deepEqual(groupePropose([], 'casernes'), { chiffre: '6', creer: true, maintenue: 'Ctrl' });
});

test('V19 : un groupe se propose au plus pres du dernier groupe de son bloc, au-dessus d abord', () => {
  const casernesSur4 = creer([], '4', 'casernes').historique;
  assert.deepEqual(groupePropose(casernesSur4, 'champs de tir'), { chiffre: '5', creer: true, maintenue: 'Ctrl' });
  const centreVilleSur5 = creer(casernesSur4, '5', 'centre-ville').historique;
  assert.equal(groupePropose(centreVilleSur5, 'champs de tir').chiffre, '6', 'le dernier groupe du bloc est le 5');
  assert.equal(groupePropose(creer([], '0', 'casernes').historique, 'champs de tir').chiffre, '9', 'rien au-dessus du 0 : en dessous');
  assert.equal(groupePropose(casernesSur4, 'infanterie').chiffre, '1', 'autre bloc : numero habituel');
  assert.deepEqual(groupePropose(casernesSur4, 'casernes'), { chiffre: '4', creer: false, maintenue: 'Ctrl' }, 'son propre groupe');
});
