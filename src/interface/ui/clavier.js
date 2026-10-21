import { TOUCHES, CHIFFRES, lireRaccourci } from '../../clavier/domain/touches.js';
import { postureDe } from '../../posture/domain/posture.js';
import { raccourcisRegles } from '../../partie/domain/partie.js';
import { ACTIONS } from '../../partie/domain/donnees.js';
import { groupesDe } from '../../groupes/domain/groupes.js';
import { icone, iconeSelection, echapper } from './html.js';

const $ = (id) => document.getElementById(id);
export const ABREGES = { auriculaire: 'Au', annulaire: 'An', majeur: 'Ma', index: 'In', pouce: 'Po', 'pouce droit': 'PD' };
const touches = {};

// Le geste animé (V9) : la touche maintenue est tenue, l'autre tapée une ou deux fois.
export const classeDuGeste = (g, id) => (!g ? '' : g.maintenue === id ? 'tenue' : g.touche === id ? (g.double ? 'tape2' : 'tape') : '');

// Les actions réglées sur chaque touche, pour leurs icônes.
export function actionsSur(historique) {
  const regles = raccourcisRegles(historique);
  const sur = {};
  for (const action of Object.keys(regles)) (sur[lireRaccourci(regles[action]).touche] ||= []).push(action);
  return sur;
}

// Chaque touche est un bouton : un clic vaut un appui, avec les touches tenues au clavier.
export function installerClavier(surTouche) {
  for (const rangee of [0, 1, 2, 3, 4, 5, undefined]) {
    const ligne = document.createElement('div');
    ligne.className = rangee === undefined ? 'rangee souris' : 'rangee';
    for (const t of TOUCHES.filter((x) => x.rangee === rangee)) {
      touches[t.id] = document.createElement('button');
      touches[t.id].type = 'button';
      touches[t.id].dataset.touche = t.id;
      touches[t.id].style.setProperty('--largeur', t.largeur || (t.souris ? 2 : 1));
      ligne.append(touches[t.id]);
    }
    $('clavier').append(ligne);
  }
  $('clavier').addEventListener('click', (e) => {
    const bouton = e.target.closest('button[data-touche]');
    if (bouton) surTouche(bouton.dataset.touche, e);
  });
}

// Pendant la posture, seules les touches du doigt demandé restent ; sinon les réservées du jeu, sauf les chiffres d'un rappel de groupe.
function reserveeA(etape, t) {
  if (etape && etape.type === 'posture') return etape.doigt === 'pouce droit' ? !t.souris : !!t.souris || t.id === 'Échap' || t.id === 'Win';
  const rappel = etape && etape.type === 'action' && ACTIONS[etape.action].rappelable && CHIFFRES.includes(t.id);
  return !!t.reservee && !rappel;
}

// Vue main posée (V9) : touches de référence, grille, raccourcis réglés, conflits, groupe proposé, geste animé, touches entourées (V18).
export function afficherClavier(historique, etape, { g, entourees, enConflit, groupe, tenues }) {
  const doigts = Object.fromEntries(Object.entries(postureDe(historique)).map(([d, t]) => [t, d]));
  const regles = raccourcisRegles(historique);
  const groupes = groupesDe(historique);
  const sur = actionsSur(historique);
  for (const t of TOUCHES) {
    const actions = sur[t.id] || [];
    const doigt = doigts[t.id];
    const geste = classeDuGeste(g, t.id);
    const reservee = reserveeA(etape, t);
    const enGroupe = !geste && groupe.includes(t.id);
    touches[t.id].className = ['touche', t.id.length > 2 && 'longue', t.grille && 'grille', doigt && 'repos', reservee && !geste && !enGroupe && 'reservee',
      !geste && enConflit.includes(t.id) && 'conflit', geste && `geste ${geste}`, enGroupe && 'groupe', entourees.includes(t.id) && 'entouree']
      .filter(Boolean).join(' ');
    const icones = [...actions.slice(0, 2).map((a) => icone(a)), groupes[t.id] ? icone('flag') + iconeSelection(groupes[t.id]) : '',
      tenues.includes(t.id) ? '<b class="marque">+</b>' : ''].join('');
    touches[t.id].innerHTML = `<span>${echapper(t.id)}</span>${icones ? `<span class="icones">${icones}</span>` : ''}${doigt ? `<i class="doigt">${ABREGES[doigt]}</i>` : ''}`;
    const titre = [doigt, ...actions.map((a) => `${ACTIONS[a].court} : ${regles[a]}`), groupes[t.id] && `Groupe ${t.id} : ${groupes[t.id]}`,
      tenues.includes(t.id) && 'Touche maintenue', t.grille && 'Grille du jeu, fixe', reservee && t.reservee].filter(Boolean).join(' · ');
    touches[t.id].title = titre;
    touches[t.id].setAttribute('aria-label', [t.id, titre].filter(Boolean).join(', '));
  }
}

// Survol d'une suggestion : ses touches s'entourent sur le clavier dessiné.
export function apercu(ids) {
  for (const [id, bouton] of Object.entries(touches)) bouton.classList.toggle('apercu', ids.includes(id));
}
