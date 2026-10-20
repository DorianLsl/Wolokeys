import { TOUCHES, CHIFFRES, lireRaccourci } from '../../clavier/domain/touches.js';
import { etapePosture, toucheSuggeree, postureDe } from '../../posture/domain/posture.js';
import { ACTIONS } from '../../partie/domain/donnees.js';
import { etapeEnCours, reglages, conflit } from '../../partie/domain/partie.js';
import { groupesDe } from '../../groupes/domain/groupes.js';
import { sequenceDe } from '../../entrainement/domain/entrainement.js';
import { atteinte } from '../../suggestions/domain/effort.js';

// Le geste animé (V9) ; pour un groupe à créer, sa création d'abord.
export function geste(historique, suggestion, appuis) {
  const raccourci = raccourciMontre(historique, suggestion, appuis);
  return raccourci ? lireRaccourci(raccourci) : null;
}

function raccourciMontre(historique, suggestion, appuis) {
  if (etapePosture(historique)) return toucheSuggeree(historique);
  const sequence = sequenceDe(historique);
  if (sequence) return sequence[appuis.length];
  if (!suggestion) return null;
  const g = suggestion.groupe;
  return suggestion.raccourci || (g.creer ? `${g.maintenue} + ${g.chiffre}` : g.chiffre);
}

// V18 : les touches de l'action qui inspire la suggestion, ou le chiffre de son groupe.
export function touchesEntourees(historique, suggestion) {
  const action = suggestion && suggestion.logique.action;
  const r = action && reglages(historique)[action];
  if (!r) return [];
  if (r.chiffre) return [r.chiffre];
  const lu = lireRaccourci(r.raccourci);
  return [lu.maintenue, lu.touche].filter(Boolean);
}

// Manette : chaque doigt qui quitte sa touche de référence pour le geste, avec la touche visée.
export function deplacements(historique, g) {
  if (etapePosture(historique) || !g) return {};
  const posture = postureDe(historique);
  const references = Object.values(posture);
  return Object.fromEntries([g.maintenue, g.touche].filter((t) => t && !references.includes(t)).map((t) => [atteinte(posture, t).doigt, t]));
}

// Touches seules qu'une autre action tient déjà, ou chiffres d'un groupe qui ne contient pas la sélection de l'étape.
export function conflits(historique) {
  const etape = etapeEnCours(historique);
  if (!etape || etape.type !== 'action') return [];
  const a = ACTIONS[etape.action];
  const groupes = groupesDe(historique);
  const autreGroupe = (c) => a.rappelable && !!groupes[c] && groupes[c] !== a.selection;
  return TOUCHES.filter((t) => (CHIFFRES.includes(t.id) ? autreGroupe(t.id) : !t.grille && !t.reservee && conflit(historique, etape.action, t.id)))
    .map((t) => t.id);
}
