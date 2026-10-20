import { TOUCHES, lireRaccourci } from '../../clavier/domain/touches.js';
import { postureDe } from '../../posture/domain/posture.js';
import { raccourcisRegles } from '../../partie/domain/partie.js';
import { ACTIONS } from '../../partie/domain/donnees.js';
import { groupesDe } from '../../groupes/domain/groupes.js';
import { icone, echapper } from './html.js';

const $ = (id) => document.getElementById(id);
export const ABREGES = { auriculaire: 'Au', annulaire: 'An', majeur: 'Ma', index: 'In', pouce: 'Po', 'pouce droit': 'PD' };
const touches = {};

// Le geste animé (V9) : la touche maintenue est tenue, l'autre tapée une ou deux fois.
export const classeDuGeste = (g, id) => (!g ? '' : g.maintenue === id ? 'tenue' : g.touche === id ? (g.double ? 'tape2' : 'tape') : '');

// Les actions réglées sur chaque touche, et les groupes de contrôle sur les chiffres.
export function actionsParTouche(historique) {
  const parTouche = {};
  for (const [action, raccourci] of Object.entries(raccourcisRegles(historique))) {
    (parTouche[lireRaccourci(raccourci).touche] ||= []).push({ icone: icone(action), titre: `${ACTIONS[action].court} : ${raccourci}` });
  }
  for (const [chiffre, selection] of Object.entries(groupesDe(historique))) {
    (parTouche[chiffre] ||= []).push({ icone: icone('flag'), titre: `Groupe ${chiffre} : ${selection}` });
  }
  return parTouche;
}

function construire() {
  for (const rangee of [0, 1, 2, 3, 4, 5, undefined]) {
    const ligne = document.createElement('div');
    ligne.className = 'rangee';
    for (const t of TOUCHES.filter((x) => x.rangee === rangee)) {
      touches[t.id] = document.createElement('div');
      touches[t.id].style.setProperty('--largeur', t.largeur || (t.souris ? 1.5 : 1));
      ligne.append(touches[t.id]);
    }
    $('clavier').append(ligne);
  }
}

// Vue main posée (V9) : touches de référence, grille du jeu, raccourcis réglés, geste animé, touches entourées (V18).
export function afficherClavier(historique, g, entourees) {
  if (!Object.keys(touches).length) construire();
  const doigts = Object.fromEntries(Object.entries(postureDe(historique)).map(([d, t]) => [t, d]));
  const parTouche = actionsParTouche(historique);
  for (const t of TOUCHES) {
    const sur = parTouche[t.id] || [];
    const doigt = doigts[t.id];
    touches[t.id].className = ['touche', t.id.length > 2 && 'longue', t.grille && 'grille', t.reservee && 'reservee', doigt && 'repos',
      classeDuGeste(g, t.id), entourees.includes(t.id) && 'entouree'].filter(Boolean).join(' ');
    touches[t.id].title = [doigt, ...sur.map((s) => s.titre), t.grille && 'Grille du jeu', t.reservee].filter(Boolean).join(' · ');
    touches[t.id].innerHTML = `<span>${echapper(t.id)}</span>${sur.length ? `<span class="icones">${sur.slice(0, 2).map((s) => s.icone).join('')}</span>` : ''}`
      + `${doigt ? `<i class="doigt">${ABREGES[doigt]}</i>` : ''}`;
  }
}
