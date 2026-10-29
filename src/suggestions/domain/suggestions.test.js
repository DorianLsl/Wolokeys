import { test } from 'node:test';
import assert from 'node:assert/strict';
import { suggestions, criteres, etoiles, gardeDernierRecours, accepter, logiquesPossibles, mouvement } from './suggestions.js';
import { postureDe } from '../../posture/domain/posture.js';
import { choisir, etapeEnCours, raccourcisRegles, reglages } from '../../partie/domain/partie.js';

const poser = (touches = ['Q', 'S', 'D', 'F', 'Espace', 'Mouse 5']) => touches.reduce((h, t) => choisir(h, t).historique, []);
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
  assert.equal(noms(poser()), 'Mouse 5,Ctrl + F,Alt + F');
  assert.equal(suggestions(poser())[0].etoiles, 4);
});

test('V10 : le double appui sur la touche de l element est parmi les suggestions, sans etre pre-selectionne', () => {
  const surTous = jusqua(poser(), 'idleAll');
  assert.equal(raccourcisRegles(surTous).idle, 'G');
  assert.equal(noms(surTous), 'Ctrl + G,Alt + G,G x2');
  assert.ok(!/x2/.test(noms(jusqua(poser(), 'scout'))), 'ailleurs, en dernier recours seulement');
  assert.equal(raccourcis(jusqua(poser(), 'alert'))[0].raccourci, 'Espace x2', 'l alerte reste pre-selectionnee');
});

test('V36 : la case de la matrice d abord, ligne de la famille et colonne du role, avant les doigts immobiles', () => {
  const surInfanterie = jusqua(poser(), 'infantryScreen');
  assert.equal(suggestions(surInfanterie)[0].raccourci, 'Alt + A');
  const surDistance = jusqua(choisir(surInfanterie, 'Alt + A').historique, 'rangedScreen');
  assert.equal(suggestions(surDistance)[0].raccourci, 'Alt + Z');
});

test('V9 : une etoile par critere rempli, sans objet compte comme rempli', () => {
  assert.equal(etoiles({ grille: false, famille: false, doigts: false, element: false }), 0);
  assert.equal(etoiles({ grille: null, famille: null, doigts: true, element: null }), 4);
});

test('V11 : une famille garde la mecanique de son premier raccourci', () => {
  const surEclaireur = jusqua(choisir(poser(), 'Mouse 5').historique, 'scout');
  const premiere = suggestions(surEclaireur)[0];
  assert.equal(premiere.raccourci, 'Échap + E');
  assert.equal(premiere.criteres.famille, true);
});

test('V11 : une touche maintenue n appartient qu a une famille ; une touche maintenable n est jamais suggeree seule', () => {
  const surBatiments = jusqua(choisir(poser(), 'Alt + F').historique, 'militaryBuildings');
  assert.ok(!raccourcis(surBatiments).some((s) => s.raccourci.startsWith('Alt +')), noms(surBatiments));
  const tous = [poser(), surBatiments, jusqua(poser(), 'cancelUnit')].flatMap((h) => raccourcis(h).map((s) => s.raccourci));
  assert.ok(!tous.some((r) => ['Alt', 'Maj', 'Ctrl', 'Espace'].includes(r)), tous.join());
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
  const h = jusqua(choisir(poser(), 'Alt + G').historique, 'militaryBuildings');
  assert.equal(raccourcisRegles(h).selectTc, 'Alt + G');
  assert.equal(criteres(h, 'militaryBuildings', 'Ctrl + G').element, false);
  assert.equal(criteres(jusqua(choisir(poser(), 'Alt + G').historique, 'allTc'), 'allTc', 'Ctrl + G').element, true);
});

test('V26 : les touches F et Echap + touche seulement en cas de gros manque d intuitivite', () => {
  assert.ok(!/(^|,)(F\d|Échap)/.test(noms(poser())), noms(poser()));
  assert.equal(gardeDernierRecours([{ etoiles: 1 }, { etoiles: 3, dernierRecours: true }]).length, 2);
  assert.equal(gardeDernierRecours([{ etoiles: 2 }, { etoiles: 3, dernierRecours: true }]).length, 1);
  assert.ok(!raccourcis(jusqua(poser(), 'allStables')).some((s) => s.raccourci.startsWith('Échap')), 'tous : Ctrl + E passe devant Echap + S');
});

test('V24, V26 : sur une touche de la grille, prochain passe par Echap + touche, hors dernier recours', () => {
  const surEclaireur = raccourcis(jusqua(poser(), 'scout'))[0];
  assert.deepEqual([surEclaireur.raccourci, surEclaireur.dernierRecours], ['Échap + E', false]);
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
    for (const s of raccourcis(h)) {
      assert.ok(choisir(h, s.raccourci).historique, `${etapeEnCours(h).action} : ${s.raccourci}`);
      assert.ok(!/Mouse \d \+/.test(s.raccourci), `V10, bouton lateral tenu : ${s.raccourci}`);
    }
    h = suivant(h);
  }
  assert.equal(Object.keys(reglages(h)).length, 25, 'les raccourcis obtenus sont figes dans logiques.test.js');
});

test('V12 : la meilleure suggestion passe en premier, le groupe avant les raccourcis quand il passe d abord', () => {
  assert.deepEqual(suggestions(poser()).map((p) => p.raccourci || `groupe ${p.groupe.chiffre}`), ['Mouse 5', 'Ctrl + F', 'Alt + F', 'groupe 5']);
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

// Les raccourcis obtenus sont figés : ceux du prototype P1 v14 ont changé quand le jeu a refusé de tenir les boutons latéraux (V10, V24),
// puis quand la case de la matrice est passée d'abord (V36).
test('V20 : la partie entiere, logiques comprises, donne des raccourcis figes', () => {
  assert.equal(partie(jouer(poser())), 'selectTc=Mouse 5 scout=Échap + E camera=Espace idle=G idleAll=Ctrl + G '
    + 'allBarracks=groupe 6 allRanges=groupe 7 infantryScreen=Alt + A infantry=groupe 1 rangedScreen=Alt + Z ranged=groupe 2 '
    + 'militaryBuildings=Ctrl + F idleMilNext=Mouse 4 idleMil=Ctrl + Mouse 4 cancelUnit=< allStables=groupe 8 cavalryScreen=Alt + E '
    + 'cavalry=groupe 3 allTc=Ctrl + Mouse 5 allWorkshops=groupe 9 siegeScreen=Alt + R siege=groupe 4 alert=Espace x2 monasteries=groupe 0 '
    + 'monk=B');
  assert.ok(partie(jouer(poser(), parGroupe)).startsWith('selectTc=groupe 5 scout=Échap + E camera=Espace idle=Mouse 5 idleAll=Ctrl + Mouse 5'));
});

test('V24 : la mecanique habituelle du verbe passe d abord : prochain seule, tous sur la carte Ctrl, a l ecran Alt', () => {
  const premiere = raccourcis(poser())[0];
  assert.deepEqual([premiere.mecanique, premiere.logiques.includes('verbe')], ['seule', true], noms(poser()));
  const surTous = jusqua(poser(), 'idleAll');
  assert.ok(raccourcis(surTous)[0].raccourci.startsWith('Ctrl + ') && raccourcis(surTous)[0].logiques.includes('verbe'), noms(surTous));
  const surEcran = jusqua(poser(), 'infantryScreen');
  assert.ok(raccourcis(surEcran)[0].raccourci.startsWith('Alt + ') && raccourcis(surEcran)[0].logiques.includes('verbe'), noms(surEcran));
  const ecranSurB = choisir(surEcran, 'B').historique;
  assert.ok(!raccourcis(jusqua(ecranSurB, 'rangedScreen')).some((s) => s.logiques.includes('verbe')), 'plus proposee apres B');
});

test('V16, V20 : au premier raccourci militaire, Alt reservee au militaire ; le choix fixe la logique', () => {
  const surEclaireur = jusqua(choisir(poser(), 'Ctrl + G').historique, 'scout');
  assert.equal(noms(surEclaireur), 'Ctrl + E,Alt + E,Échap + E');
  assert.deepEqual([raccourcis(surEclaireur)[1].logiques, raccourcis(surEclaireur)[1].logique.texte], [['domaine'], 'Touche du militaire : Alt']);
  assert.deepEqual(logiquesPossibles(surEclaireur), ['verbe', 'domaine']);
  const parDomaine = choisir(surEclaireur, 'Alt + F').historique;
  assert.deepEqual(logiquesPossibles(parDomaine), ['domaine']);
  assert.deepEqual(logiquesPossibles(choisir(surEclaireur, 'Ctrl + B').historique), ['verbe']);
  const casernes = raccourcis(jusqua(parDomaine, 'allBarracks'))[0];
  assert.deepEqual([casernes.raccourci, casernes.etoiles], ['Alt + A', 2], 'militaire sur Alt');
  assert.ok(raccourcis(jusqua(parDomaine, 'cancelUnit'))[0].raccourci.startsWith('Ctrl + '), 'economie sur Ctrl');
});

test('V21 : la touche reservee a l economie est proposee sans etre imposee, puis plus proposee', () => {
  const militaireDabord = jusqua(choisir(jusqua(parGroupe(poser()), 'scout'), 'G').historique, 'idle');
  const economie = raccourcis(militaireDabord).find((s) => s.logiques.includes('domaine'));
  assert.ok(economie && economie.raccourci.startsWith('Ctrl + ') && raccourcis(militaireDabord)[0] !== economie, noms(militaireDabord));
  assert.equal(economie.logique.texte, "Touche de l'économie : Ctrl");
  assert.ok(!raccourcis(jusqua(suivant(militaireDabord), 'idleAll')).some((s) => s.logiques.includes('domaine')));
});

test('V25 : A, Z, E, R portent les roles sous 1, 2, 3, 4', () => {
  const azer = poser(['A', 'Z', 'E', 'R', 'Espace', 'Mouse 5']);
  const surEcran = jusqua(azer, 'infantryScreen');
  assert.deepEqual([raccourcis(surEcran)[0].raccourci, raccourcis(surEcran)[0].logiques], ['Alt + A', ['verbe', 'role']]);
  assert.equal(raccourcis(surEcran)[0].logique.texte, 'Rôle infanterie sur A, habitude Alt');
  assert.equal(criteres(surEcran, 'militaryBuildings', 'Alt + Z').element, false, 'Z reservee a la distance');
});

test('V22 : la touche propre de l element passe avant la reservation des roles', () => {
  const centreVilleSurA = jusqua(choisir(poser(), 'Alt + A').historique, 'allTc');
  assert.equal(criteres(centreVilleSurA, 'allTc', 'Échap + A').element, true);
});

test('V20 : si aucune logique ne tient, la logique par verbe reste, et les suggestions aussi', () => {
  const aucune = ['Ctrl + G', 'Alt + F'].reduce((h, r) => choisir(jusqua(h, etapeEnCours(h).action), r).historique, poser());
  const surInactif = choisir(jusqua(aucune, 'idle'), 'Alt + D').historique;
  assert.deepEqual(logiquesPossibles(surInactif), ['verbe']);
  assert.ok(raccourcis(jusqua(surInactif, 'idleAll')).length > 0);
});

test('V18 : chaque suggestion dit sa logique en une ligne, avec l action qui l inspire', () => {
  const logiques = (h) => suggestions(h).map((s) => [s.raccourci || `groupe ${s.groupe.chiffre}`, s.logique.texte, s.logique.action]);
  assert.deepEqual(logiques(poser()), [
    ['Mouse 5', 'Habitude : seule pour « prochain »', null],
    ['Ctrl + F', "Touche de l'économie : Ctrl", null],
    ['Alt + F', "Pouce s'étire", null],
    ['groupe 5', 'Numéro habituel des bâtiments', null],
  ]);
  const centreVille = choisir(poser(), 'Mouse 5').historique;
  assert.deepEqual(logiques(jusqua(centreVille, 'scout')), [
    ['Échap + E', 'Rôle cavalerie sur E', null],
    ['Alt + E', 'Touche du militaire : Alt', null],
    ['Ctrl + E', "Pouce s'étire", null],
  ]);
  assert.deepEqual(logiques(jusqua(centreVille, 'idle'))[0], ['G', 'Même geste que Centre-ville', 'selectTc']);
  const surInactifs = jusqua(centreVille, 'idleAll');
  assert.deepEqual(logiques(surInactifs)[0], ['Ctrl + G', 'Même touche que Inactif', 'idle']);
  assert.deepEqual(logiques(jusqua(parGroupe(poser()), 'allBarracks'))[0], ['groupe 6', 'À côté de ton groupe 5', 'selectTc']);
  assert.deepEqual(logiques(choisir(poser(), 'Ctrl + 5').historique)[3], ['groupe 5', 'Ton groupe 5', null]);
  assert.deepEqual(logiques(jusqua(poser(), 'infantry')), [['groupe 1', "Numéro habituel de l'armée", null]]);
  assert.deepEqual(logiques(jusqua(poser(), 'camera')), [
    ['Espace', 'Aucun doigt ne bouge', null],
    ['Alt + F', "Pouce s'étire", null],
    ['Maj + Espace', "Auriculaire s'étire", null],
  ]);
  assert.deepEqual(logiques(jusqua(poser(['A', 'Z', 'E', 'R', 'Espace', 'Mouse 4']), 'idle'))[1], ['Alt + A', 'Même place que dans la grille : A', null]);
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

test('V18 : l effort se dit pour le doigt qui bouge le plus, pas pour la somme des doigts', () => {
  const posture = postureDe(poser());
  assert.equal(mouvement(posture, 'Mouse 5'), 'Aucun doigt ne bouge');
  assert.equal(mouvement(posture, 'Mouse 4'), "Pouce droit bouge d'une touche");
  assert.equal(mouvement(postureDe(poser(['<', 'S', 'D', 'F', 'Espace', 'Mouse 5'])), 'Maj + G'), "Auriculaire bouge d'une touche", 'deux doigts bougent chacun d une touche');
  assert.equal(mouvement(posture, 'Alt + F'), "Pouce s'étire");
});
