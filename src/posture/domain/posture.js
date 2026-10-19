import { TOUCHES, POSITIONS, toucheDe, lireRaccourci, ascii } from '../../clavier/domain/touches.js';

// L'ordre suit la main de gauche à droite, pour que la suggestion d'un doigt parte de la touche du précédent (V2).
const DOIGTS = { auriculaire: 'Q', annulaire: 'S', majeur: 'D', index: 'F', pouce: 'Espace', 'pouce droit': 'Mouse 4' };
const ORDRE = Object.keys(DOIGTS);

export function postureDe(historique) {
  const choix = historique.filter((e) => e.type === 'posture');
  return Object.fromEntries(choix.map((e) => [e.doigt, e.touche]));
}

export const etapePosture = (historique) => ORDRE.find((doigt) => !postureDe(historique)[doigt]) || null;

export function toucheSuggeree(historique) {
  const doigt = etapePosture(historique);
  if (!doigt) return null;
  const acceptee = (id) => !refusPosture(historique, doigt, id);
  if (acceptee(DOIGTS[doigt])) return DOIGTS[doigt];
  const doigtPrecedent = ORDRE[ORDRE.indexOf(doigt) - 1];
  const precedent = POSITIONS[postureDe(historique)[doigtPrecedent]];
  const libres = TOUCHES.filter((t) => POSITIONS[t.id] && acceptee(t.id));
  const aDroiteDuPrecedent = (t) => precedent && POSITIONS[t.id].rangee === precedent.rangee && POSITIONS[t.id].x > precedent.x;
  return (libres.find(aDroiteDuPrecedent) || libres[0]).id;
}

export function choisirTouche(historique, touche) {
  const doigt = etapePosture(historique);
  const erreur = refusPosture(historique, doigt, touche);
  if (erreur) return { erreur: ascii(erreur) };
  return { historique: [...historique, { type: 'posture', doigt, touche }] };
}

function refusPosture(historique, doigt, touche) {
  if (!doigt) return 'Posture deja complete.';
  const lu = lireRaccourci(touche);
  if (lu.erreur) return lu.erreur;
  if (lu.maintenue || lu.double) return 'Une touche seule par doigt.';
  if (doigt === 'pouce droit') return toucheDe(touche).souris ? null : 'Pouce droit : Mouse 4 ou Mouse 5.';
  // Échap sert à Plus tard et Win ouvre le menu du système : ni l'un ni l'autre ne peut porter un doigt.
  if (toucheDe(touche).souris || touche === 'Échap' || touche === 'Win') return `${touche} : pas pour la main gauche.`;
  const autre = ORDRE.find((d) => postureDe(historique)[d] === touche);
  return autre ? `${touche} deja pris par ton ${autre}.` : null;
}
