import { postureDe } from '../../posture/domain/posture.js';
import { echapper } from './html.js';
import { ABREGES, classeDuGeste, actionsParTouche } from './clavier.js';

const $ = (id) => document.getElementById(id);
// Centre de chaque bouton, en % de la manette : la main gauche en arc, le pouce droit sur la souris.
const PLACES = { auriculaire: [9, 52], annulaire: [23, 28], majeur: [39, 20], index: [54, 30], pouce: [63, 78], 'pouce droit': [86, 50] };

// Vue manette (V9) : un bouton par doigt sur sa touche de référence ; un doigt qui doit bouger annonce la touche visée.
export function afficherManette(historique, g, entourees, mouvements) {
  const posture = postureDe(historique);
  const parTouche = actionsParTouche(historique);
  $('manette').innerHTML = '<div class="souris" aria-hidden="true"></div>' + Object.entries(PLACES).map(([doigt, [x, y]]) => {
    const t = posture[doigt];
    const classes = ['bouton', t && classeDuGeste(g, t), t && entourees.includes(t) && 'entouree'].filter(Boolean).join(' ');
    const sur = (t && parTouche[t]) || [];
    return `<div class="place" style="left:${x}%;top:${y}%"><div class="${classes}" title="${echapper(`${doigt}${t ? ` : ${t}` : ''}`)}">`
      + `<small>${ABREGES[doigt]}</small><b>${t ? echapper(t) : '?'}</b>${sur.length ? `<span class="icones">${sur.map((s) => s.icone).join('')}</span>` : ''}</div>`
      + `${mouvements[doigt] ? `<span class="mouvement">→ ${echapper(mouvements[doigt])}</span>` : ''}</div>`;
  }).join('');
}
