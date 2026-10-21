import { test } from 'node:test';
import assert from 'node:assert/strict';
import { etapeEnCours, choisir, plusTard, nePasUtiliser, raccourcisRegles, reglages, estExtra, ageA, redemander, plusTardA } from './partie.js';
import { groupePropose, groupesDe } from '../../groupes/domain/groupes.js';
import { ACTIONS, MOMENTS } from './donnees.js';

const poser = () => ['Q', 'S', 'D', 'F', 'Espace', 'Mouse 4'].reduce((h, t) => choisir(h, t).historique, []);
// Raccourcis libres essayés dans l'ordre : le premier accepté est choisi.
const LIBRES = ['G', 'B', 'Tab', '<', 'Espace', ...Array.from({ length: 12 }, (_, i) => `F${i + 1}`),
  ...['G', 'B', 'A', 'Z', 'E', 'R', 'Q', 'S', 'D', 'F'].flatMap((t) => [`Alt + ${t}`, `Mouse 5 + ${t}`])];
const premierLibre = (h) => LIBRES.map((r) => choisir(h, r)).find((r) => r.historique).historique;
const jouer = (h, coup = premierLibre) => {
  const demandes = [];
  while (etapeEnCours(h)) {
    demandes.push(etapeEnCours(h).action);
    h = coup(h);
  }
  return { h, demandes };
};
const jusqua = (h, action) => {
  while (etapeEnCours(h).action !== action) h = premierLibre(h);
  return h;
};
const quand = (h) => MOMENTS[etapeEnCours(h).moment].heure;
const reponsesA = (h, action) => h.filter((e) => e.type === 'reponse' && e.action === action).length;
const reglagesSauf = (h, action) => Object.fromEntries(Object.entries(reglages(h)).filter(([a]) => a !== action));

test('V13, V17 : apres la posture, la partie demande chaque raccourci a son moment, jusqu a l age IV', () => {
  const debut = poser();
  assert.deepEqual(etapeEnCours(debut), { type: 'action', moment: 0, action: 'selectTc' });
  const { h, demandes } = jouer(debut);
  assert.deepEqual(demandes, ['selectTc', 'scout', 'camera', 'idle', 'idleAll', 'allBarracks', 'allRanges', 'infantryScreen', 'infantry',
    'rangedScreen', 'ranged', 'militaryBuildings', 'idleMilNext', 'idleMil', 'cancelUnit', 'allStables', 'cavalryScreen', 'cavalry', 'allTc', 'allWorkshops',
    'siegeScreen', 'siege', 'alert', 'monasteries', 'monk']);
  assert.equal(Object.keys(raccourcisRegles(h)).length, 25);
});

test('V10 : un raccourci deja pris, ou qui gene en jeu, est refuse avec l action qui le tient', () => {
  const h = choisir(poser(), 'G').historique;
  assert.equal(choisir(h, 'G').erreur, 'G deja pris : Centre-ville.');
  const carre = choisir(poser(), '²').historique;
  assert.equal(choisir(carre, '² x2').erreur, 'carre x2 deja pris : Centre-ville.');
  const tenue = choisir(poser(), 'Mouse 5 + B').historique;
  assert.equal(choisir(tenue, 'Mouse 5').erreur, 'Mouse 5 deja pris : Centre-ville.');
  assert.equal(choisir(h, 'A').erreur, 'A deja pris : grille.');
  assert.equal(choisir(h, 'Inser').erreur, 'Touche inconnue.');
});

test('V7 : l alerte prend la touche de la camera en double appui, seule exception', () => {
  const surAlerte = jusqua(choisir(jusqua(poser(), 'camera'), 'Espace').historique, 'alert');
  assert.equal(raccourcisRegles(choisir(surAlerte, 'Espace x2').historique).alert, 'Espace x2');
  assert.equal(choisir(surAlerte, 'Espace').erreur, 'Espace deja pris : Camera.');
  const surIdle = jusqua(choisir(jusqua(poser(), 'camera'), 'Espace').historique, 'idle');
  assert.equal(choisir(surIdle, 'Espace x2').erreur, 'Espace x2 deja pris : Camera.');
  const cameraDouble = jusqua(choisir(jusqua(poser(), 'camera'), 'Espace x2').historique, 'alert');
  assert.equal(choisir(cameraDouble, 'Espace').erreur, 'Espace deja pris : Camera.', 'seulement l alerte sur le double appui');
});

test('V7, V27 : la camera redemandee reprend sa touche, l alerte restant en double appui', () => {
  const surAlerte = jusqua(choisir(jusqua(poser(), 'camera'), 'Espace').historique, 'alert');
  const camera = redemander(choisir(surAlerte, 'Espace x2').historique, 'camera').historique;
  assert.equal(raccourcisRegles(choisir(camera, 'Espace').historique).camera, 'Espace');
});

test('V10 : le second appui d un double appui remplace le choix du premier', () => {
  const surCamera = jusqua(poser(), 'camera');
  const premier = choisir(surCamera, 'Espace').historique;
  assert.notEqual(etapeEnCours(premier).action, 'camera');
  const double = choisir(premier, 'Espace x2', true).historique;
  assert.equal(raccourcisRegles(double).camera, 'Espace x2');
  assert.deepEqual(etapeEnCours(double), etapeEnCours(premier));
  assert.equal(choisir(premier, 'Espace x2').erreur, 'Espace x2 deja pris : Camera.', 'premier appui refuse : le double vise l etape en cours');
});

test('V5 : Plus tard (Echap) laisse l action sans raccourci ; elle revient au prochain moment qui en a besoin', () => {
  const surCamera = jusqua(poser(), 'camera');
  assert.equal(quand(surCamera), '0:30');
  const plusTardCamera = plusTard(surCamera).historique;
  assert.equal(etapeEnCours(plusTardCamera).action, 'idle');
  assert.equal(quand(jusqua(plusTardCamera, 'camera')), '1:20');
  assert.deepEqual(choisir(surCamera, 'Échap'), plusTard(surCamera));
  assert.equal(quand(jusqua(plusTard(poser()).historique, 'selectTc')), '0:30');
});

test('V5, V8 : Ne pas utiliser saute l action et ses enchainements ; elle revient en extra au rattrapage, puis reste sans raccourci', () => {
  const sansCentreVille = nePasUtiliser(poser()).historique;
  const { demandes } = jouer(sansCentreVille);
  assert.deepEqual(demandes.filter((a) => a === 'selectTc'), ['selectTc']);
  assert.equal(demandes[demandes.length - 1], 'selectTc');
  const auRattrapage = jusqua(sansCentreVille, 'monk');
  const fin = premierLibre(auRattrapage);
  assert.deepEqual([quand(fin), etapeEnCours(fin).action, estExtra(fin, 'selectTc')], ['Fin', 'selectTc', true]);
  assert.equal(etapeEnCours(nePasUtiliser(fin).historique), null);
  assert.equal(raccourcisRegles(nePasUtiliser(fin).historique).selectTc, undefined);
  assert.equal(raccourcisRegles(premierLibre(fin)).selectTc !== undefined, true);
  assert.equal(etapeEnCours(premierLibre(fin)), null);
});

test('V8 : les villageois inactifs sont des extras, le reste fait la partie optimisee', () => {
  assert.deepEqual(['idle', 'idleAll', 'idleMilNext', 'idleMil', 'selectTc', 'camera'].map((a) => estExtra(poser(), a)), [true, true, true, true, false, false]);
});

test('avant la partie et apres la fin, les choix sont refuses avec un message', () => {
  assert.equal(plusTard([]).erreur, 'Avant la partie : une touche par doigt.');
  const { h } = jouer(poser());
  assert.equal(choisir(h, 'G').erreur, 'Partie terminee.');
  assert.equal(nePasUtiliser(h).erreur, 'Partie terminee.');
});

test('V13 : chaque moment appartient a un age, de I a IV', () => {
  const indice = (action) => MOMENTS.findIndex((m) => m.action === action);
  assert.deepEqual([0, indice('allBarracks'), indice('allTc'), MOMENTS.length - 1].map(ageA), ['I', 'II', 'III', 'IV']);
});

test('V5 : partie entiere avec un Plus tard et un Ne pas utiliser', () => {
  const coup = (h) => {
    const { action } = etapeEnCours(h);
    const premiereFois = !reponsesA(h, action);
    if (action === 'camera' && premiereFois) return plusTard(h).historique;
    if (action === 'scout' && premiereFois) return nePasUtiliser(h).historique;
    return premierLibre(h);
  };
  const momentsDe = [];
  const suivre = (h) => {
    momentsDe.push(`${etapeEnCours(h).action}@${quand(h)}`);
    return coup(h);
  };
  const { h } = jouer(poser(), suivre);
  assert.deepEqual(momentsDe.filter((m) => /^(camera|scout)@/.test(m)), ['scout@0:05', 'camera@0:30', 'camera@8:00', 'scout@Fin']);
  assert.equal(Object.keys(raccourcisRegles(h)).length, 25);
  assert.ok(estExtra(h, 'scout') && !estExtra(h, 'camera'));
});

test('V7 : touche maintenue + chiffre, a toute etape, met la selection actuelle dans ce groupe', () => {
  const surEclaireur = choisir(poser(), 'G').historique;
  const cree = choisir(surEclaireur, 'Ctrl + 5');
  assert.equal(cree.note, 'Groupe 5 = centre-ville. Ctrl cree les groupes.');
  assert.equal(etapeEnCours(cree.historique).action, 'scout');
  assert.equal(choisir(poser().slice(0, 3), 'Ctrl + 5').erreur, 'Une touche seule par doigt.', 'avant la partie');
});

test('V23 : selection a l ecran sans souris, puis touche maintenue + chiffre ; l infanterie va dans le groupe 1', () => {
  const surInfanterie = jusqua(poser(), 'infantry');
  assert.deepEqual(groupePropose(surInfanterie, 'infanterie'), { chiffre: '1', creer: true, maintenue: 'Ctrl' });
  const cree = choisir(surInfanterie, 'Ctrl + 1');
  assert.equal(cree.note, 'Groupe 1 = infanterie. Appuie 1. Ctrl cree les groupes.');
  const rappele = choisir(cree.historique, '1').historique;
  assert.deepEqual(reglages(rappele).infantry, { chiffre: '1' });
  assert.equal(choisir(surInfanterie, '1').erreur, 'Groupe 1 vide : Ctrl + 1 avant.');
});

test('V7 : un groupe qui ne contient pas la selection est refuse avec ce qu il contient', () => {
  const surCasernes = jusqua(choisir(choisir(poser(), 'Ctrl + 5').historique, '5').historique, 'allBarracks');
  assert.equal(choisir(surCasernes, '5').erreur, 'Groupe 5 = centre-ville.');
});

test('V7 : remplacer un groupe redemande l action qui l utilisait', () => {
  const centreVilleEn5 = choisir(choisir(poser(), 'Ctrl + 5').historique, '5').historique;
  const surCasernes = jusqua(centreVilleEn5, 'allBarracks');
  const remplace = choisir(surCasernes, 'Ctrl + 5');
  assert.equal(remplace.note, 'Groupe 5 remplace : Centre-ville a refaire.');
  assert.equal(reglages(remplace.historique).selectTc, undefined);
  assert.equal(etapeEnCours(remplace.historique).action, 'selectTc', 'tout de suite');
  const refait = premierLibre(remplace.historique);
  assert.equal(etapeEnCours(refait).action, 'allBarracks', 'puis la partie reprend');
});

test('V7 : une action perdue par un groupe remplace revient meme si plus aucun moment n en a besoin', () => {
  const parGroupe = (h) => {
    const { action } = etapeEnCours(h);
    if (!ACTIONS[action].rappelable) return premierLibre(h);
    const p = groupePropose(h, ACTIONS[action].selection);
    return choisir(p.creer ? choisir(h, `${p.maintenue} + ${p.chiffre}`).historique : h, p.chiffre).historique;
  };
  let h = poser();
  while (etapeEnCours(h).action !== 'monk') h = parGroupe(h);
  const remplace = choisir(h, 'Ctrl + 6').historique;
  assert.equal(etapeEnCours(remplace).action, 'allBarracks');
});

test('V10 : la touche de creation des groupes ne sert pas seule a un raccourci', () => {
  const groupesSurMouse5 = choisir(choisir(poser(), 'Mouse 5 + 5').historique, '5').historique;
  assert.equal(choisir(groupesSurMouse5, 'Mouse 5').erreur, 'Mouse 5 deja pris : groupes.');
  assert.ok(choisir(groupesSurMouse5, 'Mouse 5 + G').historique);
});

test('V15 : la partie entiere par les groupes proposes range l armee en 1 a 4 et les batiments en 5 a 0', () => {
  const parGroupe = (h) => {
    const { action } = etapeEnCours(h);
    if (!ACTIONS[action].rappelable) return premierLibre(h);
    const p = groupePropose(h, ACTIONS[action].selection);
    const avecGroupe = p.creer ? choisir(h, `${p.maintenue} + ${p.chiffre}`).historique : h;
    return choisir(avecGroupe, p.chiffre).historique;
  };
  const { h } = jouer(poser(), parGroupe);
  assert.equal(Object.keys(reglages(h)).length, 25);
  assert.deepEqual(groupesDe(h), { 1: 'infanterie', 2: 'distance', 3: 'cavalerie', 4: 'siège', 5: 'centre-ville', 6: 'casernes', 7: 'champs de tir', 8: 'écuries', 9: 'ateliers', 0: 'monastères' });
});

test('les refus sont en ASCII simple, en 8 mots au plus', () => {
  const groupe5 = choisir(choisir(poser(), 'Ctrl + 5').historique, '5').historique;
  const surEcuries = jusqua(groupe5, 'allBarracks');
  const surChampsDeTir = jusqua(choisir(choisir(poser(), 'Mouse 5 + 5').historique, '5').historique, 'allRanges');
  const champsDeTirEn7 = choisir(choisir(surChampsDeTir, 'Mouse 5 + 7').historique, '7').historique;
  const refus = [
    choisir(surEcuries, '5').erreur, choisir(jusqua(groupe5, 'allRanges'), '9').erreur,
    choisir(jusqua(champsDeTirEn7, 'allStables'), '7').erreur, choisir(jusqua(champsDeTirEn7, 'allStables'), '9').erreur,
    choisir(groupe5, 'Alt + Maj').erreur, choisir(groupe5, 'Ctrl + A').erreur, choisir(groupe5, 'Verr.Maj').erreur,
    choisir(jusqua(groupe5, 'militaryBuildings'), 'Espace x2').erreur, plusTard([]).erreur,
  ];
  for (const r of refus) {
    assert.ok(typeof r === 'string' && /^[\x20-\x7e]+$/.test(r), `refus attendu en ASCII : ${r}`);
    assert.ok(r.split(' ').filter((m) => /[A-Za-z0-9]/.test(m)).length <= 8, `trop long : ${r}`);
  }
});

test('V27 : un clic sur un raccourci le redemande tout de suite, sans perdre le reste de la partie', () => {
  const fin = jouer(poser()).h;
  const redemande = redemander(fin, 'scout').historique;
  assert.deepEqual([etapeEnCours(redemande).action, etapeEnCours(redemande).redemande], ['scout', true]);
  assert.equal(reglages(redemande).scout, undefined);
  const change = choisir(redemande, 'Mouse 4 + G').historique;
  assert.deepEqual([reglages(change).scout, etapeEnCours(change)], [{ raccourci: 'Mouse 4 + G' }, null]);
  assert.deepEqual(reglagesSauf(change, 'scout'), reglagesSauf(fin, 'scout'));
  const surInactif = jusqua(poser(), 'idle');
  const enCours = redemander(surInactif, 'selectTc').historique;
  assert.equal(etapeEnCours(enCours).action, 'selectTc');
  assert.equal(etapeEnCours(choisir(enCours, 'G').historique).action, 'idle');
  const vide = plusTard(enCours).historique;
  assert.deepEqual([reglages(vide).selectTc, etapeEnCours(vide).action], [undefined, 'idle'], 'Plus tard le laisse vide');
  assert.deepEqual(reglagesSauf(vide, 'selectTc'), reglagesSauf(surInactif, 'selectTc'));
});

test('V27 : on ne redemande qu un raccourci regle, apres la posture', () => {
  assert.equal(redemander(poser(), 'monk').erreur, 'Rien a redemander.');
  assert.equal(redemander([], 'selectTc').erreur, 'Avant la partie : une touche par doigt.');
});

test('V27 : cliquer un autre raccourci pendant une redemande laisse le premier comme il etait', () => {
  const fin = jouer(poser()).h;
  const autre = redemander(redemander(fin, 'scout').historique, 'monk').historique;
  assert.deepEqual([etapeEnCours(autre).action, reglages(autre).scout], ['monk', reglages(fin).scout]);
});

test('V9 : chaque situation fait 8 mots au plus', () => {
  for (const { situation } of MOMENTS) {
    assert.ok(situation.split(' ').filter((m) => /[\p{L}\p{N}]/u.test(m)).length <= 8, `trop long : ${situation}`);
  }
});

test('V5 : les heures ou une action a ete remise a plus tard', () => {
  const une = plusTard(poser()).historique;
  assert.deepEqual(plusTardA(une, 'selectTc'), ['0:00']);
  const deux = plusTard(jusqua(une, 'selectTc')).historique;
  assert.deepEqual(plusTardA(deux, 'selectTc'), ['0:00', MOMENTS[etapeEnCours(jusqua(une, 'selectTc')).moment].heure]);
  assert.deepEqual(plusTardA(nePasUtiliser(poser()).historique, 'selectTc'), [], 'Ne pas utiliser n est pas Plus tard');
});
