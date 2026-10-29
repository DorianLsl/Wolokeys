import { matriceParTouche, matriceParVerbe } from '../../matrice/domain/matrice.js';
import { ACTIONS } from '../../partie/domain/donnees.js';
import { icone, echapper, touchesHtml, groupeHtml } from './html.js';

const $ = (id) => document.getElementById(id);
const MECANIQUES = { seule: 'Seule', double: 'Double appui' };

// Liste ou matrices, commutables d'un clic comme les vues (V35).
export function installerAffichage() {
  const montrer = (a) => {
    document.querySelector('.recap').dataset.affichage = a;
    $('affichage-liste').setAttribute('aria-pressed', String(a === 'liste'));
    $('affichage-matrices').setAttribute('aria-pressed', String(a === 'matrices'));
  };
  $('affichage-liste').addEventListener('click', () => montrer('liste'));
  $('affichage-matrices').addEventListener('click', () => montrer('matrices'));
  montrer('liste');
}

// Un en-tête : la touche ou le verbe, et dessous ce que les choix y ont mis.
const titre = (principal, sous) => `${principal}${sous ? `<small>${echapper(sous)}</small>` : ''}`;

// Une case réglée se clique pour être redemandée (V27) ; la suggestion sélectionnée est marquée.
function caseHtml(c, contenu) {
  if (!c.actions.length) return `<td class="vide">${echapper(c.vide || '')}</td>`;
  const suggeree = c.actions.some((a) => a.suggeree) ? ' class="suggeree" title="Suggestion"' : '';
  return `<td${suggeree}>${c.actions.map((a) => (a.suggeree ? `<span>${contenu(a)}</span>`
    : `<button type="button" data-action="${a.action}" title="Revenir sur ce raccourci">${contenu(a)}</button>`)).join('')}</td>`;
}

function tableHtml(legende, m, titreDeLigne, titreDeColonne, contenu) {
  if (!m.lignes.length) return '';
  const tete = `<tr><td></td>${m.colonnes.map((c) => `<th scope="col">${titreDeColonne(c)}</th>`).join('')}</tr>`;
  const lignes = m.lignes.map((l, i) => `<tr><th scope="row">${titreDeLigne(l)}</th>${m.cases[i].map((c) => caseHtml(c, contenu)).join('')}</tr>`);
  return `<table class="matrice"><caption>${legende}</caption><thead>${tete}</thead><tbody>${lignes.join('')}</tbody></table>`;
}

export function afficherMatrices(historique, suggestion, surClic) {
  const parTouche = tableHtml('Par touche : touche maintenue = verbe, touche = élément', matriceParTouche(historique, suggestion),
    (l) => titre(MECANIQUES[l.id] || `<kbd>${l.id}</kbd>`, l.nom), (c) => titre(`<kbd>${echapper(c.id)}</kbd>`, c.nom),
    (a) => `${icone(a.action)}${echapper(ACTIONS[a.action].court)}`);
  const parVerbe = tableHtml('Par verbe : une ligne par verbe, une colonne par élément', matriceParVerbe(historique, suggestion),
    (l) => titre(echapper(l.nom)), (c) => titre(echapper(c.nom)),
    (a) => (a.raccourci ? touchesHtml(a.raccourci) : groupeHtml({ creer: false, chiffre: a.chiffre })));
  $('matrices').innerHTML = parTouche + parVerbe || '<p class="etat">Les matrices se remplissent avec tes choix.</p>';
  $('matrices').onclick = (e) => {
    const bouton = e.target.closest('button[data-action]');
    if (bouton) surClic(bouton.dataset.action);
  };
}
