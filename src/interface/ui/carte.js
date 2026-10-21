import { reglages } from '../../partie/domain/partie.js';
import { touchesDe } from '../domain/interface.js';
import { icone, echapper, etoilesHtml, touchesHtml, groupeHtml } from './html.js';

const CRITERES = { grille: 'Place de la grille', famille: 'Geste de la famille', doigts: 'Doigts immobiles', element: "Touche de l'élément" };

// La logique visible, avec l'icône et le raccourci de l'action qui l'inspire (V18).
function logiqueHtml(logique, regles) {
  const r = logique.action && regles[logique.action];
  return `<span class="logique">${logique.action ? icone(logique.action) : ''}${echapper(logique.texte)}${r && r.raccourci ? ` : ${touchesHtml(r.raccourci)}` : ''}</span>`;
}

// Les quatre critères des étoiles (V9) : rempli, sans objet (compté comme rempli) ou manqué.
function criteresHtml(criteres) {
  const critere = (k) => (criteres[k] === false ? `<span class="manque" title="manque">${icone('ban')}${CRITERES[k]}</span>`
    : `<span class="${criteres[k] === null ? 'sans-objet' : 'rempli'}" title="${criteres[k] === null ? 'sans objet, compte comme rempli' : 'rempli'}">`
      + `${icone('star', 'etoile pleine')}${CRITERES[k]}</span>`);
  return `<span class="criteres">${Object.keys(CRITERES).map(critere).join('')}</span>`;
}

// La suggestion choisie en grande carte (V18), les autres en petit dessous ; un clic en choisit une (V12).
export function cartesHtml(historique, liste, choisie) {
  const regles = reglages(historique);
  const cartes = liste.map((s, i) => {
    const grande = i === choisie;
    const nom = s.raccourci || `Groupe ${s.groupe.chiffre}`;
    return `<button type="button" class="suggestion${grande ? ' grande' : ''}${s.groupe ? ' groupe' : ''}" data-choisir="${i}"`
      + ` data-touches="${echapper(touchesDe(s).join('|'))}" aria-pressed="${grande}" aria-label="${echapper(`${nom}. ${s.logique.texte}`)}">`
      + `<span class="touches">${s.raccourci ? touchesHtml(s.raccourci) : groupeHtml(s.groupe)}${etoilesHtml(s.etoiles)}</span>`
      + `${logiqueHtml(s.logique, regles)}${grande ? criteresHtml(s.criteres) : ''}</button>`;
  });
  const autres = cartes.filter((c, i) => i !== choisie).join('');
  return `<div class="suggestions">${cartes[choisie] || ''}${autres ? `<div class="autres">${autres}</div>` : ''}</div>`;
}
