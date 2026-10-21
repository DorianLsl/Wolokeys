import { postureDe } from '../../posture/domain/posture.js';
import { icone, echapper } from './html.js';
import { ABREGES, classeDuGeste, actionsSur } from './clavier.js';

const $ = (id) => document.getElementById(id);
// Centre de chaque bouton, en % de la manette : la main gauche en arc, le pouce droit sur la souris.
const PLACES = { auriculaire: [9, 52], annulaire: [23, 28], majeur: [39, 20], index: [54, 30], pouce: [63, 78], 'pouce droit': [86, 50] };

// Vue manette (V9) : un bouton par doigt sur sa touche de référence ; un doigt qui doit bouger annonce la touche visée.
export function afficherManette(historique, etape, { g, entourees, mouvements, tenues }) {
  const posture = postureDe(historique);
  const sur = actionsSur(historique);
  $('manette').innerHTML = '<div class="forme-souris" aria-hidden="true"></div>' + Object.entries(PLACES).map(([doigt, [x, y]]) => {
    const t = posture[doigt];
    const demande = etape && etape.type === 'posture' && etape.doigt === doigt;
    const geste = t && classeDuGeste(g, t);
    const classes = ['bouton', demande && 'demande', t && tenues.includes(t) && 'maintenue', geste && `geste ${geste}`, t && entourees.includes(t) && 'entouree']
      .filter(Boolean).join(' ');
    const icones = ((t && sur[t]) || []).map((a) => icone(a)).join('');
    return `<div class="place" style="left:${x}%;top:${y}%"><div class="${classes}" title="${echapper(`${doigt}${t ? ` : ${t}` : ''}`)}">`
      + `<small>${ABREGES[doigt]}</small><b>${t ? echapper(t) : '?'}</b>${icones ? `<span class="icones">${icones}</span>` : ''}</div>`
      + `${mouvements[doigt] ? `<span class="mouvement">${icone('arrow')}${echapper(mouvements[doigt])}</span>` : ''}</div>`;
  }).join('');
}
