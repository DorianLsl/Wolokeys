import { lireRaccourci, ascii, CHIFFRES } from '../../clavier/domain/touches.js';
import { ACTIONS, ENCHAINEMENTS } from '../../partie/domain/donnees.js';
import { etapeEnCours, reglages, choisir } from '../../partie/domain/partie.js';

const estEtapeDEntrainement = (etape) => !!etape && (etape.type === 'grille' || etape.type === 'enchainement');

export const estEntrainement = (historique) => estEtapeDEntrainement(etapeEnCours(historique));

// Un double appui se joue en deux appuis ; un groupe se sélectionne d'un appui, et deux centrent aussi la caméra (V7).
export function sequenceDe(historique) {
  const etape = etapeEnCours(historique);
  if (!estEtapeDEntrainement(etape)) return null;
  if (etape.type === 'grille') return ACTIONS[etape.action].grille;
  const e = ENCHAINEMENTS[etape.enchainement];
  const regles = reglages(historique);
  const appuis = (raccourci) => (lireRaccourci(raccourci).double ? [lireRaccourci(raccourci).touche, lireRaccourci(raccourci).touche] : [raccourci]);
  const selection = (r) => (r.chiffre ? (e.allerRetour ? [r.chiffre, r.chiffre] : [r.chiffre]) : appuis(r.raccourci));
  const parGroupes = e.besoins.every((a) => regles[a].chiffre);
  const camera = e.allerRetour && !parGroupes ? appuis(regles.camera.raccourci) : [];
  return [...e.besoins.flatMap((a) => selection(regles[a])), ...camera, ...(e.puis || [])];
}

// appuis : ceux déjà faits de la séquence ; une erreur fait recommencer (V4).
export function appuyer(historique, appuis, raccourci) {
  if (!estEntrainement(historique)) return { appuis: [], erreur: 'Pas d entrainement en cours.' };
  const lu = lireRaccourci(raccourci);
  // Touche maintenue + chiffre crée un groupe à toute étape (V7).
  if (lu.maintenue && CHIFFRES.includes(lu.touche)) return { ...choisir(historique, raccourci), appuis };
  // Le second appui d'un double appui arrive ainsi : le premier a déjà compté.
  const appui = lu.double && !lu.maintenue ? lu.touche : raccourci;
  const sequence = sequenceDe(historique);
  if (sequence[appuis.length] !== appui) return { appuis: [], erreur: ascii(`Pas ${appui} : recommence.`) };
  if (appuis.length + 1 < sequence.length) return { appuis: [...appuis, appui] };
  return { appuis: [], historique: passer(historique).historique };
}

// Suivant fait la séquence à la place de l'utilisateur (V4).
export function passer(historique) {
  const etape = etapeEnCours(historique);
  if (!estEtapeDEntrainement(etape)) return { erreur: 'Pas d entrainement en cours.' };
  const fait = { type: 'reponse', moment: etape.moment, action: etape.action, enchainement: etape.enchainement, raccourci: null, fait: true };
  return { historique: [...historique, fait] };
}
