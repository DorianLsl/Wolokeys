import { lireRaccourci, ascii, CHIFFRES } from '../../clavier/domain/touches.js';
import { ACTIONS, ENCHAINEMENTS } from '../../partie/domain/donnees.js';
import { etapeEnCours, reglages, choisir } from '../../partie/domain/partie.js';

const estEtapeDEntrainement = (etape) => !!etape && (etape.type === 'grille' || etape.type === 'enchainement');

export const estEntrainement = (historique) => estEtapeDEntrainement(etapeEnCours(historique));

// Échap puis une touche fait deux appuis (V3), un double appui aussi (V10) ; un double appui sur un groupe centre la caméra (V7).
export function sequenceDe(historique) {
  const etape = etapeEnCours(historique);
  if (!estEtapeDEntrainement(etape)) return null;
  if (etape.type === 'grille') return ACTIONS[etape.action].grille;
  const e = ENCHAINEMENTS[etape.enchainement];
  const regles = reglages(historique);
  const appuisDe = (raccourci) => {
    const lu = lireRaccourci(raccourci);
    if (lu.maintenue === 'Échap') return ['Échap', lu.touche];
    return lu.double ? [lu.touche, raccourci] : [raccourci];
  };
  const selection = (r) => (r.chiffre ? (e.allerRetour ? [r.chiffre, `${r.chiffre} x2`] : [r.chiffre]) : appuisDe(r.raccourci));
  const parGroupes = e.besoins.every((a) => regles[a].chiffre);
  const camera = e.allerRetour && !parGroupes ? appuisDe(regles.camera.raccourci) : [];
  return [...e.besoins.flatMap((a) => selection(regles[a])), ...camera, ...(e.puis || [])];
}

// appuis : ceux déjà faits de la séquence ; une erreur fait recommencer (V4).
// premierAccepte : comme pour choisir, le double appui remplace alors le choix de son premier appui (V10).
export function appuyer(historique, appuis, raccourci, premierAccepte = false) {
  const lu = lireRaccourci(raccourci);
  if (premierAccepte && lu.double) return { ...choisir(historique, raccourci, true), appuis: [] };
  if (!estEntrainement(historique)) return { appuis: [], erreur: 'Pas d entrainement en cours.' };
  // Touche maintenue + chiffre crée un groupe à toute étape (V7).
  if (lu.maintenue && CHIFFRES.includes(lu.touche)) return { ...choisir(historique, raccourci), appuis };
  const attendu = sequenceDe(historique)[appuis.length];
  // Deux appuis rapides sur une touche attendue deux fois, comme A puis A dans la grille, restent justes.
  const juste = raccourci === attendu || (lu.double && !lu.maintenue && lu.touche === attendu);
  if (!juste) return { appuis: [], erreur: ascii(`Pas ${raccourci} : recommence.`) };
  if (appuis.length + 1 < sequenceDe(historique).length) return { appuis: [...appuis, attendu] };
  return { appuis: [], historique: passer(historique).historique };
}

// Suivant fait la séquence à la place de l'utilisateur (V4).
export function passer(historique) {
  const etape = etapeEnCours(historique);
  if (!estEtapeDEntrainement(etape)) return { erreur: 'Pas d entrainement en cours.' };
  const fait = { type: 'reponse', moment: etape.moment, action: etape.action, enchainement: etape.enchainement, raccourci: null, fait: true };
  return { historique: [...historique, fait] };
}
