import { lireRaccourci, ascii, CHIFFRES } from '../../clavier/domain/touches.js';
import { refusRaccourci, seGenent } from '../../clavier/domain/raccourcis.js';
import { etapePosture, choisirTouche } from '../../posture/domain/posture.js';
import { ACTIONS, ENCHAINEMENTS, MOMENTS } from './donnees.js';
import { retour } from './historique.js';
import { creerGroupe, groupesDe, toucheDeCreation, touchePourCreer } from '../../groupes/domain/groupes.js';

const reponses = (historique) => historique.filter((e) => e.type === 'reponse');

// Une action est réglée par un raccourci ou par le chiffre d'un groupe qui contient encore sa sélection (V7) ;
// un raccourci redemandé s'efface jusqu'à la réponse suivante (V27).
export function reglages(historique) {
  const groupes = groupesDe(historique);
  const valable = (e) => e.raccourci || (e.chiffre && groupes[e.chiffre] === ACTIONS[e.action].selection);
  const regles = {};
  for (const e of historique) {
    if (e.type === 'redemande') delete regles[e.action];
    if (e.type === 'reponse' && valable(e)) regles[e.action] = e.raccourci ? { raccourci: e.raccourci } : { chiffre: e.chiffre };
  }
  return regles;
}

// Le moment en cours est noté : la partie y reprend une fois le raccourci redemandé réglé ou remis à plus tard.
export function redemander(historique, action) {
  if (etapePosture(historique)) return { erreur: 'Avant la partie : une touche par doigt.' };
  if (!reglages(historique)[action]) return { erreur: 'Rien a redemander.' };
  const etape = etapeEnCours(historique);
  return { historique: [...historique, { type: 'redemande', action, moment: etape ? etape.moment : MOMENTS.length - 1 }] };
}

// La réponse à un raccourci redemandé porte la marque redemande : elle ne fait pas avancer la partie.
function redemandeEnCours(historique) {
  const i = historique.map((e) => e.type).lastIndexOf('redemande');
  return i >= 0 && !historique.slice(i).some((e) => e.type === 'reponse' && e.redemande) ? historique[i] : null;
}

export function raccourcisRegles(historique) {
  return Object.fromEntries(Object.entries(reglages(historique)).filter(([, r]) => r.raccourci).map(([a, r]) => [a, r.raccourci]));
}

// Pendant l'étape d'une action rappelable, ou d'un entraînement (V4), sa sélection est déjà faite, pour créer le groupe.
function selectionActuelle(historique) {
  const etape = etapeEnCours(historique);
  if (etape && etape.type === 'posture') return null;
  const pendant = etape && (etape.type === 'enchainement' ? ENCHAINEMENTS[etape.enchainement].selection
    : etape.type === 'grille' || ACTIONS[etape.action].rappelable ? ACTIONS[etape.action].selection : null);
  if (pendant) return pendant;
  const apres = (e) => (e.enchainement ? ENCHAINEMENTS[e.enchainement].selection : (e.raccourci || e.chiffre || e.fait) && ACTIONS[e.action].selection);
  const derniere = reponses(historique).filter(apres).pop();
  return derniere ? apres(derniere) : null;
}

// Ne pas utiliser pendant la partie : l'action ne revient qu'au rattrapage (V5).
function actionsNonUtilisees(historique) {
  return new Set(reponses(historique).filter((e) => e.nePasUtiliser && !MOMENTS[e.moment].rattrapage).map((e) => e.action));
}

export const entrainementActif = (historique) => (historique.filter((e) => e.type === 'mode').pop() || {}).entrainement === true;

export const basculerEntrainement = (historique) => ({ historique: [...historique, { type: 'mode', entrainement: !entrainementActif(historique) }] });

export const ageA = (moment) => MOMENTS.slice(0, moment + 1).reverse().find((m) => m.age).age;

export const estExtra = (historique, action) => !!ACTIONS[action].extra || actionsNonUtilisees(historique).has(action);

export function etapeEnCours(historique) {
  const doigt = etapePosture(historique);
  if (doigt) return { type: 'posture', doigt };
  const regles = reglages(historique);
  const repere = [...historique].reverse().find((e) => (e.type === 'reponse' && !e.redemande) || e.type === 'redemande');
  const redemandee = redemandeEnCours(historique);
  if (redemandee) return { type: 'action', moment: redemandee.moment, action: redemandee.action, redemande: true };
  const perdue = actionPerdue(historique);
  if (perdue) return { type: 'action', moment: repere.moment, action: perdue };
  for (let moment = premierMoment(repere); moment < MOMENTS.length; moment++) {
    const etape = etapeA(historique, regles, moment);
    if (etape) return { ...etape, moment };
  }
  return null;
}

// Une action réglée par un groupe remplacé depuis est redemandée tout de suite (V7), sauf si elle a été repoussée.
function actionPerdue(historique) {
  const groupes = groupesDe(historique);
  const dernieres = Object.fromEntries(reponses(historique).map((e) => [e.action, e]));
  const perdue = Object.values(dernieres).find((e) => e.chiffre && groupes[e.chiffre] !== ACTIONS[e.action].selection);
  return perdue ? perdue.action : null;
}

// Un enchaînement reste au même moment tant qu'il lui manque un raccourci ; le rattrapage, tant qu'il reste une action ;
// après un raccourci redemandé, la partie reprend au moment noté.
function premierMoment(derniere) {
  if (!derniere) return 0;
  if (derniere.type === 'redemande') return derniere.moment;
  const m = MOMENTS[derniere.moment];
  return m.rattrapage || (m.enchainement && (derniere.raccourci || derniere.chiffre)) ? derniere.moment : derniere.moment + 1;
}

// Sans entraînement, la grille et les enchaînements se passent, mais un enchaînement demande ses raccourcis manquants (V14).
function etapeA(historique, regles, moment) {
  const m = MOMENTS[moment];
  const nonUtilisees = actionsNonUtilisees(historique);
  const action = (a) => (a ? { type: 'action', action: a } : null);
  if (m.rattrapage) {
    const dejaVues = new Set(reponses(historique).filter((e) => e.moment === moment).map((e) => e.action));
    return action([...nonUtilisees].find((a) => !regles[a] && !dejaVues.has(a)));
  }
  if (m.enchainement) {
    const e = ENCHAINEMENTS[m.enchainement];
    const besoins = e.allerRetour ? [...e.besoins, 'camera'] : e.besoins;
    if (besoins.some((a) => nonUtilisees.has(a))) return null;
    const manquant = besoins.find((a) => !regles[a]);
    if (manquant) return action(manquant);
    return entrainementActif(historique) ? { type: 'enchainement', enchainement: m.enchainement } : null;
  }
  if (ACTIONS[m.action].grille) return entrainementActif(historique) ? { type: 'grille', action: m.action } : null;
  return regles[m.action] || nonUtilisees.has(m.action) ? null : action(m.action);
}

// premierAccepte : le premier appui de ce double appui vient d'être accepté ; le double remplace alors ce choix (V10).
export function choisir(historique, raccourci, premierAccepte = false) {
  const base = premierAccepte && lireRaccourci(raccourci).double ? retour(historique) : historique;
  const etape = etapeEnCours(base);
  if (!etape) return { erreur: 'Partie terminee.' };
  if (etape.type === 'posture') return choisirTouche(base, raccourci);
  if (raccourci === 'Échap') return plusTard(base);
  const lu = lireRaccourci(raccourci);
  if (CHIFFRES.includes(lu.touche) && !lu.double && lu.maintenue) return creer(base, lu.touche, lu.maintenue);
  if (etape.type !== 'action') return { erreur: 'Entrainement : suis la sequence.' };
  if (CHIFFRES.includes(lu.touche) && !lu.double && ACTIONS[etape.action].rappelable) return rappeler(base, etape, lu.touche);
  const refus = refusRaccourci(raccourci) || conflit(base, etape.action, raccourci);
  if (refus) return { erreur: refus };
  return { historique: [...base, { type: 'reponse', moment: etape.moment, action: etape.action, raccourci, ...marqueDe(etape) }] };
}

function conflit(historique, action, raccourci) {
  const regles = raccourcisRegles(historique);
  const creation = toucheDeCreation(historique);
  if (creation && seGenent(`${creation} + 1`, raccourci)) return ascii(`${raccourci} deja pris : groupes.`);
  // L'alerte sur la touche de la caméra en double appui est la seule exception au conflit (V7).
  const alerteSurCamera = (autre) => action === 'alert' && autre === 'camera' && raccourci === `${regles.camera} x2`;
  const tenant = Object.keys(regles).find((a) => a !== action && seGenent(regles[a], raccourci) && !alerteSurCamera(a));
  return tenant ? ascii(`${raccourci} deja pris : ${ACTIONS[tenant].court}.`) : null;
}

function creer(historique, chiffre, maintenue) {
  const selection = selectionActuelle(historique);
  const cree = creerGroupe(historique, chiffre, maintenue, selection, Object.values(raccourcisRegles(historique)));
  if (cree.erreur) return cree;
  return { historique: cree.historique, note: ascii(noteDeGroupe(historique, cree.historique, chiffre, maintenue, selection)) };
}

function noteDeGroupe(avant, apres, chiffre, maintenue, selection) {
  const perdue = Object.keys(reglages(avant)).find((a) => !reglages(apres)[a]);
  const etape = etapeEnCours(avant);
  const aRappeler = etape && etape.type === 'action' && ACTIONS[etape.action].selection === selection && ACTIONS[etape.action].rappelable;
  const note = perdue ? `Groupe ${chiffre} remplace : ${ACTIONS[perdue].court} a refaire.`
    : `Groupe ${chiffre} = ${selection}.${aRappeler ? ` Appuie ${chiffre}.` : ''}`;
  return toucheDeCreation(avant) ? note : `${note} ${maintenue} cree les groupes.`;
}

function rappeler(historique, etape, chiffre) {
  const selection = ACTIONS[etape.action].selection;
  const dedans = groupesDe(historique)[chiffre];
  if (dedans === selection) return { historique: [...historique, { type: 'reponse', moment: etape.moment, action: etape.action, raccourci: null, chiffre, ...marqueDe(etape) }] };
  // Le groupe proposé reste affiché à l'étape : le refus dit seulement ce qui ne va pas.
  return { erreur: ascii(dedans ? `Groupe ${chiffre} = ${dedans}.` : `Groupe ${chiffre} vide : ${touchePourCreer(historique)} + ${chiffre} avant.`) };
}

export function plusTard(historique) {
  return reponseVide(historique, {});
}

export function nePasUtiliser(historique) {
  return reponseVide(historique, { nePasUtiliser: true });
}

function reponseVide(historique, marque) {
  const etape = etapeEnCours(historique);
  if (!etape) return { erreur: 'Partie terminee.' };
  if (etape.type === 'posture') return { erreur: 'Avant la partie : une touche par doigt.' };
  if (etape.type !== 'action') return { erreur: 'Entrainement : Suivant ou la sequence.' };
  return { historique: [...historique, { type: 'reponse', moment: etape.moment, action: etape.action, raccourci: null, ...marque, ...marqueDe(etape) }] };
}

const marqueDe = (etape) => (etape.redemande ? { redemande: true } : {});
