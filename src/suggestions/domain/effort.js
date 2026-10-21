import { POSITIONS, toucheDe, lireRaccourci } from '../../clavier/domain/touches.js';

const DOIGTS_DU_CLAVIER = ['auriculaire', 'annulaire', 'majeur', 'index'];

// Le pouce droit couvre la souris, le pouce la rangée du bas, les autres doigts la colonne la plus proche.
export function atteinte(posture, touche) {
  if (toucheDe(touche).souris) return { doigt: 'pouce droit', effort: posture['pouce droit'] === touche ? 0 : 1 };
  const p = POSITIONS[touche];
  const doigts = p.rangee === 5 ? ['pouce'] : DOIGTS_DU_CLAVIER;
  const distance = (d) => Math.abs(POSITIONS[posture[d]].x - p.x);
  const doigt = doigts.reduce((meilleur, d) => (distance(d) < distance(meilleur) ? d : meilleur));
  const reference = POSITIONS[posture[doigt]];
  return { doigt, effort: Math.abs(reference.x - p.x) + Math.abs(reference.rangee - p.rangee) };
}

// Somme des déplacements ; un doigt ne tient pas deux touches à la fois, mais Échap se relâche avant la touche suivante.
export function effortDe(posture, raccourci) {
  const lu = lireRaccourci(raccourci);
  const atteinteTouche = atteinte(posture, lu.touche);
  if (!lu.maintenue) return atteinteTouche.effort;
  const atteinteMaintenue = atteinte(posture, lu.maintenue);
  if (atteinteMaintenue.doigt === atteinteTouche.doigt && lu.maintenue !== 'Échap') return Infinity;
  return atteinteMaintenue.effort + atteinteTouche.effort;
}
