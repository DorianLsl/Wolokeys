import { test } from 'node:test';
import assert from 'node:assert/strict';
import { suggestions, criteres, etoiles, gardeDernierRecours, accepter, logiquesPossibles } from './suggestions.js';
import { choisir, etapeEnCours, raccourcisRegles, reglages } from '../../partie/domain/partie.js';

const poser = (touches = ['Q', 'S', 'D', 'F', 'Espace', 'Mouse 4']) => touches.reduce((h, t) => choisir(h, t).historique, []);
const raccourcis = (h) => suggestions(h).filter((s) => s.raccourci);
const noms = (h) => raccourcis(h).map((s) => s.raccourci).join();
// Comme Suivant : la suggestion pré-sélectionnée (V12).
const suivant = (h) => accepter(h, suggestions(h)[0]).historique;
const jusqua = (h, action) => {
  while (etapeEnCours(h).action !== action) h = suivant(h);
  return h;
};
const parGroupe = (h) => accepter(h, suggestions(h).find((s) => s.groupe)).historique;
const partie = (h) => Object.entries(reglages(h)).map(([a, r]) => `${a}=${r.raccourci || `groupe ${r.chiffre}`}`).join(' ');
const jouer = (h, auxGroupes = suivant) => {
  while (etapeEnCours(h)) h = suggestions(h).some((s) => s.groupe) ? auxGroupes(h) : suivant(h);
  return h;
};

test('V9, V12 : la meilleure suggestion a le plus d etoiles, puis une par mecanique, sans double appui', () => {
  assert.equal(noms(poser()), 'Mouse 4 + F,G,Mouse 5 + F');
  assert.equal(suggestions(poser())[0].etoiles, 4);
});

test('V9 : une etoile par critere rempli, sans objet compte comme rempli', () => {
  assert.equal(etoiles({ grille: false, famille: false, doigts: false, element: false }), 0);
  assert.equal(etoiles({ grille: null, famille: null, doigts: true, element: null }), 4);
});

test('V11 : une famille garde la mecanique de son premier raccourci', () => {
  const surEclaireur = jusqua(choisir(poser(), 'Mouse 4 + F').historique, 'scout');
  const premiere = suggestions(surEclaireur)[0];
  assert.equal(premiere.raccourci, 'Mouse 4 + D');
  assert.equal(premiere.criteres.famille, true);
});

test('V11 : une touche maintenue n appartient qu a une famille ; une touche maintenable n est jamais suggeree seule', () => {
  const surInactifs = jusqua(choisir(poser(), 'Mouse 4 + F').historique, 'idleAll');
  assert.ok(!raccourcis(surInactifs).some((s) => s.raccourci.startsWith('Mouse 4 +')), noms(surInactifs));
  const tous = [poser(), surInactifs, jusqua(poser(), 'cancelUnit')].flatMap((h) => raccourcis(h).map((s) => s.raccourci));
  assert.ok(!tous.some((r) => ['Alt', 'Maj', 'Ctrl', 'Mouse 4', 'Mouse 5', 'Espace'].includes(r)), tous.join());
});

test('V7 : la camera prend le repos du pouce ; l alerte, la meme touche en double appui', () => {
  assert.equal(suggestions(jusqua(poser(), 'camera'))[0].raccourci, 'Espace');
  const surAlerte = jusqua(poser(), 'alert');
  assert.equal(raccourcisRegles(surAlerte).camera, 'Espace');
  assert.equal(suggestions(surAlerte)[0].raccourci, 'Espace x2');
});

test('V10 : un double appui n est suggere qu en dernier recours', () => {
  for (const action of ['selectTc', 'scout', 'idle', 'cancelUnit', 'monk']) {
    assert.ok(!noms(jusqua(poser(), action)).includes(' x2'), `${action} : ${noms(jusqua(poser(), action))}`);
  }
});

test('V22 : une touche par element ; la touche d un autre element manque le critere', () => {
  const regles = raccourcisRegles(jusqua(choisir(poser(), 'Mouse 4 + F').historique, 'militaryBuildings'));
  assert.equal(regles.selectTc, 'Mouse 4 + F');
  const h = jusqua(choisir(poser(), 'Mouse 4 + F').historique, 'militaryBuildings');
  assert.equal(criteres(h, 'militaryBuildings', 'Mouse 5 + F').element, false);
  assert.equal(criteres(jusqua(choisir(poser(), 'Mouse 4 + F').historique, 'allTc'), 'allTc', 'Mouse 5 + F').element, true);
});

test('V26 : les touches F et Echap + touche seulement en cas de gros manque d intuitivite', () => {
  assert.ok(!/(^|,)(F\d|Échap)/.test(noms(poser())), noms(poser()));
  assert.equal(gardeDernierRecours([{ etoiles: 1 }, { etoiles: 3, dernierRecours: true }]).length, 2);
  assert.equal(gardeDernierRecours([{ etoiles: 2 }, { etoiles: 3, dernierRecours: true }]).length, 1);
});

test('V15 : l armee seulement par son groupe, la production par un groupe d abord', () => {
  const surInfanterie = suggestions(jusqua(poser(), 'infantry'));
  assert.deepEqual(surInfanterie.map((s) => s.groupe && s.groupe.chiffre), ['1']);
  const surCasernes = suggestions(jusqua(poser(), 'allBarracks'));
  assert.deepEqual([surCasernes[0].groupe.chiffre, surCasernes[0].etoiles], ['6', 3]);
  assert.ok(suggestions(poser())[0].raccourci && suggestions(poser())[3].groupe, 'le centre-ville : groupe en second choix');
});

test('V12 : Suivant seul joue toute la partie, et chaque suggestion est acceptee', () => {
  let h = poser();
  while (etapeEnCours(h)) {
    for (const s of raccourcis(h)) assert.ok(choisir(h, s.raccourci).historique, `${etapeEnCours(h).action} : ${s.raccourci}`);
    h = suivant(h);
  }
  assert.equal(Object.keys(reglages(h)).length, 25, 'les raccourcis obtenus sont figes dans logiques.test.js');
});

test('V12 : la meilleure suggestion passe en premier, le groupe avant les raccourcis quand il passe d abord', () => {
  assert.deepEqual(suggestions(poser()).map((p) => p.raccourci || `groupe ${p.groupe.chiffre}`), ['Mouse 4 + F', 'G', 'Mouse 5 + F', 'groupe 5']);
  assert.deepEqual(suggestions(jusqua(poser(), 'allBarracks')).map((p) => p.raccourci || `groupe ${p.groupe.chiffre}`)[0], 'groupe 6');
  const groupeCree = accepter(jusqua(poser(), 'allBarracks'), suggestions(jusqua(poser(), 'allBarracks'))[0]).historique;
  assert.deepEqual(reglages(groupeCree).allBarracks, { chiffre: '6' });
});

test('Suivant sans suggestion, ou apres la fin, rend un message et non une exception', () => {
  let h = poser();
  while (etapeEnCours(h)) h = suivant(h);
  assert.equal(accepter(h, suggestions(h)[0]).erreur, 'Partie terminee.');
  const dixGroupes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].reduce((acc, c) => choisir(acc, `Ctrl + ${c}`).historique, poser());
  const surInfanterie = jusqua(choisir(dixGroupes, '5').historique, 'infantry');
  assert.deepEqual(suggestions(surInfanterie), []);
  assert.equal(accepter(surInfanterie, suggestions(surInfanterie)[0]).erreur, 'Aucune suggestion : tape un raccourci.');
});

// Logiques : l'auto-test du prototype P1 v14, validé par le porteur, sert d'oracle ; le prochain militaire inactif s'y est ajouté (V8).
test('V20 : la partie entiere, logiques comprises, donne les raccourcis du prototype et le prochain militaire inactif', () => {
  assert.equal(partie(jouer(poser())), 'selectTc=Mouse 4 + F scout=Mouse 4 + D camera=Espace idle=Mouse 4 + S idleAll=Mouse 5 + S '
    + 'allBarracks=groupe 6 allRanges=groupe 7 infantryScreen=Alt + Q infantry=groupe 1 rangedScreen=Alt + G ranged=groupe 2 '
    + 'militaryBuildings=Mouse 5 + Espace idleMilNext=Mouse 4 + Q idleMil=Mouse 5 + Q cancelUnit=< allStables=groupe 8 cavalryScreen=Alt + D '
    + 'cavalry=groupe 3 allTc=Mouse 5 + F allWorkshops=groupe 9 siegeScreen=Alt + R siege=groupe 4 alert=Espace x2 monasteries=groupe 0 '
    + 'monk=Mouse 4 + Espace');
  assert.ok(partie(jouer(poser(), parGroupe)).startsWith('selectTc=groupe 5 scout=Mouse 4 + F camera=Espace idle=Mouse 4 + D idleAll=Mouse 5 + D'));
});

test('V24 : la mecanique habituelle du verbe passe d abord : prochain sur la touche de reference du pouce droit', () => {
  const pouceSurAlt = poser(['Maj', 'S', 'D', 'F', 'Alt', 'Mouse 5']);
  assert.ok(noms(pouceSurAlt).startsWith('Mouse 5 + F,Alt + F'), noms(pouceSurAlt));
  assert.equal(raccourcis(pouceSurAlt)[0].etoiles, 4);
  const surEcran = jusqua(poser(), 'infantryScreen');
  assert.ok(raccourcis(surEcran)[0].raccourci.startsWith('Alt + ') && raccourcis(surEcran)[0].logiques.includes('verbe'), noms(surEcran));
  const ecranSurG = choisir(surEcran, 'G').historique;
  assert.ok(!raccourcis(jusqua(ecranSurG, 'rangedScreen')).some((s) => s.logiques.includes('verbe')), 'plus proposee apres G');
});

test('V16, V20 : au premier raccourci militaire, une touche maintenue reservee au militaire ; le choix fixe la logique', () => {
  const surEclaireur = jusqua(choisir(poser(), 'Mouse 4 + F').historique, 'scout');
  assert.equal(noms(surEclaireur), 'Mouse 4 + D,Mouse 4 + E,Mouse 5 + D');
  assert.deepEqual(raccourcis(surEclaireur)[2].logiques, ['domaine']);
  assert.deepEqual(logiquesPossibles(surEclaireur), ['verbe', 'domaine']);
  const parDomaine = choisir(surEclaireur, 'Mouse 5 + D').historique;
  assert.deepEqual(logiquesPossibles(parDomaine), ['domaine']);
  assert.deepEqual(logiquesPossibles(choisir(surEclaireur, 'Mouse 4 + D').historique), ['verbe']);
  assert.ok(raccourcis(jusqua(parDomaine, 'allBarracks'))[0].raccourci.startsWith('Mouse 5 + '), 'militaire sur Mouse 5');
  assert.ok(raccourcis(jusqua(parDomaine, 'idleAll'))[0].raccourci.startsWith('Mouse 4 + '), 'economie sur Mouse 4');
  const casernes = raccourcis(jusqua(parDomaine, 'allBarracks'))[0];
  assert.deepEqual([casernes.raccourci, casernes.etoiles], ['Mouse 5 + S', 2]);
});

test('V21 : la touche reservee a l economie est proposee sans etre imposee, puis plus proposee', () => {
  const militaireDabord = jusqua(choisir(jusqua(parGroupe(poser()), 'scout'), 'Mouse 4 + F').historique, 'idle');
  const economie = raccourcis(militaireDabord).find((s) => s.logiques.includes('domaine'));
  assert.ok(economie && economie.raccourci.startsWith('Mouse 5 + ') && raccourcis(militaireDabord)[0] !== economie, noms(militaireDabord));
  assert.equal(economie.logique.texte, "Touche de l'économie : Mouse 5");
  assert.ok(!raccourcis(jusqua(suivant(militaireDabord), 'idleAll')).some((s) => s.logiques.includes('domaine')));
});

test('V25 : A, Z, E, R portent les roles sous 1, 2, 3, 4 ; Espace porte la base', () => {
  const azer = poser(['A', 'Z', 'E', 'R', 'Espace', 'Mouse 4']);
  assert.equal(raccourcis(azer)[0].raccourci, 'Mouse 4 + Espace');
  const surEcran = jusqua(azer, 'infantryScreen');
  assert.deepEqual([raccourcis(surEcran)[0].raccourci, raccourcis(surEcran)[0].logiques], ['Alt + A', ['verbe', 'role']]);
  assert.equal(raccourcis(surEcran)[0].logique.texte, 'Rôle infanterie sur A, habitude Alt');
  assert.equal(criteres(surEcran, 'militaryBuildings', 'Mouse 5 + Z').element, false, 'Z reservee a la distance');
});

test('V22 : la touche propre de l element passe avant la reservation des roles', () => {
  const centreVilleSurA = jusqua(choisir(poser(), 'Mouse 4 + A').historique, 'allTc');
  assert.equal(criteres(centreVilleSurA, 'allTc', 'Mouse 5 + A').element, true);
});

test('V20 : si aucune logique ne tient, la logique par verbe reste, et les suggestions aussi', () => {
  const aucune = ['Mouse 4 + F', 'Mouse 5 + D'].reduce((h, r) => choisir(jusqua(h, etapeEnCours(h).action), r).historique, poser());
  const surInactif = choisir(jusqua(aucune, 'idle'), 'Mouse 5 + S').historique;
  assert.deepEqual(logiquesPossibles(surInactif), ['verbe']);
  assert.ok(raccourcis(jusqua(surInactif, 'idleAll')).length > 0);
});

test('V18 : chaque suggestion dit sa logique en une ligne, avec l action qui l inspire', () => {
  const logiques = (h) => suggestions(h).map((s) => [s.raccourci || `groupe ${s.groupe.chiffre}`, s.logique.texte, s.logique.action]);
  assert.deepEqual(logiques(poser()), [
    ['Mouse 4 + F', 'Habitude : Mouse 4 pour « prochain »', null],
    ['G', "Index bouge d'une touche", null],
    ['Mouse 5 + F', "Pouce droit bouge d'une touche", null],
    ['groupe 5', 'Numéro habituel des bâtiments', null],
  ]);
  const centreVille = choisir(poser(), 'Mouse 4 + F').historique;
  assert.deepEqual(logiques(jusqua(centreVille, 'scout')), [
    ['Mouse 4 + D', 'Même geste que Centre-ville', 'selectTc'],
    ['Mouse 4 + E', 'Rôle cavalerie sur E', null],
    ['Mouse 5 + D', 'Touche du militaire : Mouse 5', null],
  ]);
  const surInactifs = jusqua(centreVille, 'idleAll');
  assert.deepEqual(logiques(surInactifs)[0], ['Mouse 5 + S', 'Même touche que Inactif', 'idle']);
  assert.deepEqual(logiques(jusqua(parGroupe(poser()), 'allBarracks'))[0], ['groupe 6', 'À côté de ton groupe 5', 'selectTc']);
  assert.deepEqual(logiques(choisir(poser(), 'Ctrl + 5').historique)[3], ['groupe 5', 'Ton groupe 5', null]);
  assert.deepEqual(logiques(jusqua(poser(), 'infantry')), [['groupe 1', "Numéro habituel de l'armée", null]]);
  assert.deepEqual(logiques(jusqua(poser(), 'camera')), [
    ['Espace', 'Aucun doigt ne bouge', null],
    ['Mouse 5 + F', "Pouce droit bouge d'une touche", null],
    ['Alt + F', "Pouce s'étire", null],
  ]);
  assert.deepEqual(logiques(jusqua(poser(), 'allRanges'))[3], ['Alt + Q', 'Même place que dans la grille : Q', null]);
});

test('V9 : le groupe propose a ses criteres, seuls les doigts comptent', () => {
  const surCasernes = suggestions(jusqua(parGroupe(poser()), 'allBarracks'))[0];
  assert.deepEqual(surCasernes.criteres, { grille: null, famille: null, doigts: false, element: null });
});

test('V26 : prochain et tous les militaires inactifs partagent une touche', () => {
  const surTous = suivant(jusqua(poser(), 'idleMilNext'));
  const prochain = raccourcisRegles(surTous).idleMilNext;
  const [meilleure] = raccourcis(surTous);
  assert.equal(etapeEnCours(surTous).action, 'idleMil');
  assert.equal(meilleure.raccourci.split(' + ').pop(), prochain.split(' + ').pop(), `${prochain} puis ${meilleure.raccourci}`);
  assert.deepEqual(meilleure.logique, { texte: 'Même touche que Militaire inactif', action: 'idleMilNext' });
});
