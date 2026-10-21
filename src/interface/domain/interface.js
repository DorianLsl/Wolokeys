import { TOUCHES, CHIFFRES, lireRaccourci } from '../../clavier/domain/touches.js';
import { etapePosture, toucheSuggeree, postureDe } from '../../posture/domain/posture.js';
import { ACTIONS } from '../../partie/domain/donnees.js';
import { etapeEnCours, reglages, conflit, raccourcisRegles } from '../../partie/domain/partie.js';
import { groupesDe, touchePourCreer, toucheDeCreation } from '../../groupes/domain/groupes.js';
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
  return suggestion ? raccourciDe(suggestion) : null;
}

const raccourciDe = (s) => s.raccourci || (s.groupe.creer ? `${s.groupe.maintenue} + ${s.groupe.chiffre}` : s.groupe.chiffre);

// Les touches d'une suggestion : sa touche maintenue et sa touche, ou la création puis le chiffre d'un groupe.
export function touchesDe(suggestion) {
  if (!suggestion) return [];
  const lu = lireRaccourci(raccourciDe(suggestion));
  return [lu.maintenue, lu.touche].filter(Boolean);
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

// Manette : chaque doigt qui quitte sa touche de référence pour le geste, avec la ou les touches visées.
export function deplacements(historique, g) {
  if (etapePosture(historique) || !g) return {};
  const posture = postureDe(historique);
  const references = Object.values(posture);
  const vers = {};
  for (const t of [g.maintenue, g.touche].filter((x) => x && !references.includes(x))) {
    const { doigt } = atteinte(posture, t);
    vers[doigt] = vers[doigt] ? `${vers[doigt]} + ${t}` : t;
  }
  return vers;
}

// Touches seules qu'une autre action tient déjà, entraînements compris, ou chiffres d'un groupe qui ne contient pas la sélection de l'étape.
export function conflits(historique) {
  const etape = etapeEnCours(historique);
  if (!etape || etape.type === 'posture') return [];
  const a = ACTIONS[etape.action] || {};
  const groupes = groupesDe(historique);
  const autreGroupe = (c) => a.rappelable && !!groupes[c] && groupes[c] !== a.selection;
  return TOUCHES.filter((t) => (CHIFFRES.includes(t.id) ? autreGroupe(t.id) : !t.grille && !t.reservee && conflit(historique, etape.action, t.id)))
    .map((t) => t.id);
}

// V7 : la touche de création seule arme les groupes et le chiffre suivant crée le groupe, au cas où le navigateur garde Ctrl + chiffre.
export function armement(historique, arme, raccourci) {
  const creation = touchePourCreer(historique);
  if (raccourci === creation && !etapePosture(historique)) return { arme: !arme, raccourci: null };
  if (arme && CHIFFRES.includes(raccourci)) return { arme: false, raccourci: `${creation} + ${raccourci}` };
  return { arme: false, raccourci };
}

// Les touches maintenues en usage : celles des raccourcis réglés et la touche de création des groupes ; Échap se relâche avant la touche (V3).
export function touchesTenues(historique) {
  const maintenues = Object.values(raccourcisRegles(historique)).map((r) => lireRaccourci(r).maintenue);
  return [...new Set([toucheDeCreation(historique), ...maintenues])].filter((t) => t && t !== 'Échap');
}
