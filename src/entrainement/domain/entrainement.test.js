import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sequenceDe, appuyer, passer, estEntrainement } from './entrainement.js';
import { choisir, etapeEnCours, plusTard, nePasUtiliser, basculerEntrainement, entrainementActif, raccourcisRegles } from '../../partie/domain/partie.js';
import { groupesDe } from '../../groupes/domain/groupes.js';
import { ACTIONS, ENCHAINEMENTS } from '../../partie/domain/donnees.js';
import { suggestions, accepter } from '../../suggestions/domain/suggestions.js';

const poser = () => ['Q', 'S', 'D', 'F', 'Espace', 'Mouse 4'].reduce((h, t) => choisir(h, t).historique, []);
const avecEntrainement = () => basculerEntrainement(poser()).historique;
// Comme Suivant : la séquence faite à la place de l'utilisateur, sinon la suggestion pré-sélectionnée.
const suivant = (h) => (estEntrainement(h) ? passer(h) : accepter(h, suggestions(h)[0])).historique;
const jusqua = (h, cible) => {
  while (![etapeEnCours(h).action, etapeEnCours(h).enchainement].includes(cible)) h = suivant(h);
  return h;
};
const faits = (h) => h.filter((e) => e.fait).map((e) => e.action || e.enchainement);
const jouer = (h) => {
  while (etapeEnCours(h)) h = suivant(h);
  return h;
};

test('V14 : l interrupteur Entrainement, desactive par defaut, ajoute la grille et les enchainements', () => {
  assert.equal(entrainementActif(poser()), false);
  const h = jouer(avecEntrainement());
  assert.equal(faits(h).filter((a) => ACTIONS[a]).length, 16, 'grilles');
  assert.equal(faits(h).filter((a) => ENCHAINEMENTS[a]).length, 17, 'enchainements');
  assert.equal(faits(jouer(poser())).length, 0);
  assert.equal(entrainementActif(basculerEntrainement(avecEntrainement()).historique), false);
});

test('V4 : la grille se joue telle quelle ; une erreur fait recommencer ; Suivant la fait a ta place', () => {
  const surVillageois = jusqua(avecEntrainement(), 'villager');
  assert.deepEqual(etapeEnCours(surVillageois).type, 'grille');
  assert.deepEqual(sequenceDe(surVillageois), ['Maj + A']);
  const surMaison = jusqua(surVillageois, 'house');
  assert.deepEqual(sequenceDe(surMaison), ['A', 'A']);
  const unAppui = appuyer(surMaison, [], 'A');
  assert.deepEqual(unAppui, { appuis: ['A'] });
  assert.deepEqual(appuyer(surMaison, ['A'], 'G'), { appuis: [], erreur: 'Pas G : recommence.' });
  const fait = appuyer(surMaison, ['A'], 'A x2');
  assert.deepEqual([fait.appuis, faits(fait.historique).pop()], [[], 'house'], 'le second appui d un double compte');
  assert.deepEqual(faits(passer(surMaison).historique).pop(), 'house');
  assert.equal(plusTard(surMaison).erreur, 'Entrainement : pas de Plus tard.');
  assert.equal(nePasUtiliser(surMaison).erreur, 'Entrainement : pas de Plus tard.');
});

test('V7 : un aller-retour selectionne puis centre la camera ; par un groupe, deux appuis suffisent', () => {
  const parRaccourcis = jusqua(avecEntrainement(), 'goBase');
  assert.deepEqual(sequenceDe(parRaccourcis), ['Mouse 4 + F', 'Espace']);
  const carre = jusqua(choisir(jusqua(choisir(avecEntrainement(), '² x2').historique, 'camera'), 'B').historique, 'goBase');
  assert.deepEqual(sequenceDe(carre), ['²', '² x2', 'B']);
  const parGroupe = jusqua(choisir(choisir(avecEntrainement(), 'Ctrl + 5').historique, '5').historique, 'goBase');
  assert.deepEqual(sequenceDe(parGroupe), ['5', '5 x2']);
});

test('V13, V28 : Maj + touche d unite lance une file de 5 ; l archer et le moine sont sur A', () => {
  const h = avecEntrainement();
  assert.deepEqual(sequenceDe(jusqua(h, 'spearmen')), ['6', 'Maj + A']);
  assert.deepEqual(sequenceDe(jusqua(h, 'archers')), ['7', 'Maj + A']);
  assert.deepEqual(sequenceDe(jusqua(h, 'monks')), ['0', 'Maj + A']);
});

test('V5 : un enchainement qui depend d une action non utilisee est saute', () => {
  const sansCentreVille = jouer(nePasUtiliser(avecEntrainement()).historique);
  assert.equal(faits(sansCentreVille).filter((a) => ENCHAINEMENTS[a]).length, 14, '3 enchainements en moins');
  const sansCamera = jouer(nePasUtiliser(jusqua(avecEntrainement(), 'camera')).historique);
  assert.equal(faits(sansCamera).filter((a) => ENCHAINEMENTS[a]).length, 13, '4 allers-retours en moins');
});

test('V7 : touche maintenue + chiffre cree un groupe meme pendant un entrainement, sans perdre les appuis', () => {
  const surLanciers = jusqua(avecEntrainement(), 'spearmen');
  const cree = appuyer(surLanciers, ['6'], 'Ctrl + 9');
  assert.deepEqual(cree.appuis, ['6']);
  assert.equal(groupesDe(cree.historique)[9], 'casernes');
});

test('V10 : le double appui remplace le premier choix meme quand l etape suivante est un entrainement', () => {
  const surVillageois = choisir(avecEntrainement(), 'G').historique;
  assert.equal(etapeEnCours(surVillageois).action, 'villager');
  const double = appuyer(surVillageois, [], 'G x2', true);
  assert.equal(raccourcisRegles(double.historique).selectTc, 'G x2');
});

test('V4, V7 : pendant un entrainement, la selection est celle de la sequence', () => {
  const h = avecEntrainement();
  assert.equal(groupesDe(appuyer(jusqua(h, 'house'), [], 'Ctrl + 1').historique)[1], 'villageois', 'le villageois est selectionne');
  assert.equal(groupesDe(appuyer(jusqua(h, 'villager'), [], 'Ctrl + 5').historique)[5], 'centre-ville');
  const surRelance = jusqua(choisir(h, 'G').historique, 'tcLoop');
  assert.equal(groupesDe(appuyer(surRelance, ['G'], 'Ctrl + 5').historique)[5], 'centre-ville');
  const parGroupe = jusqua(choisir(choisir(h, 'Ctrl + 5').historique, '5').historique, 'goBase');
  const garde = appuyer(parGroupe, ['5'], 'Ctrl + 5');
  assert.deepEqual([groupesDe(garde.historique)[5], etapeEnCours(garde.historique).enchainement], ['centre-ville', 'goBase']);
  const surInactif = jusqua(h, 'idle');
  assert.equal(groupesDe(choisir(surInactif, 'Ctrl + 2').historique)[2], 'villageois', 'apres la grille du camp de mineurs');
});

test('V3, V10 : Echap puis la touche se jouent en deux appuis ; un double appui doit etre rapide', () => {
  const echap = jusqua(choisir(avecEntrainement(), 'Échap + A').historique, 'tcLoop');
  assert.deepEqual(sequenceDe(echap), ['Échap', 'A', 'Maj + A']);
  assert.deepEqual(appuyer(echap, [], 'Échap'), { appuis: ['Échap'] });
  const alerte = jusqua(avecEntrainement(), 'goAlert');
  assert.deepEqual(sequenceDe(alerte), ['Espace', 'Espace x2']);
  assert.deepEqual(appuyer(alerte, ['Espace'], 'Espace'), { appuis: [], erreur: 'Pas Espace : recommence.' }, 'deux appuis lents');
  assert.ok(appuyer(alerte, ['Espace'], 'Espace x2').historique);
  const parGroupe = jusqua(choisir(choisir(avecEntrainement(), 'Ctrl + 5').historique, '5').historique, 'goBase');
  assert.deepEqual(sequenceDe(parGroupe), ['5', '5 x2']);
  assert.ok(appuyer(jusqua(avecEntrainement(), 'house'), ['A'], 'A').historique, 'la grille A puis A, lente, reste juste');
});
