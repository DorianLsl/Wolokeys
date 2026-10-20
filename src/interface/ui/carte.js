import { lireRaccourci } from '../../clavier/domain/touches.js';
import { reglages } from '../../partie/domain/partie.js';
import { icone, touchesHtml, echapper, etoilesHtml } from './html.js';

const $ = (id) => document.getElementById(id);

export function afficherIcone(etape) {
  $('icone').innerHTML = icone(!etape ? 'landmark' : etape.type === 'posture' ? 'hand' : etape.enchainement || etape.action, 'grande');
}

const groupeHtml = (g) => `${icone('flag')}${g.creer ? `${touchesHtml(lireRaccourci(`${g.maintenue} + ${g.chiffre}`))}<b class="lien">→</b>` : ''}${touchesHtml(lireRaccourci(g.chiffre))}`;

// La logique visible, avec l'icône et le raccourci de l'action qui l'inspire (V18).
function logiqueHtml(logique, regles) {
  const r = logique.action && regles[logique.action];
  return `<span class="logique">${logique.action ? icone(logique.action) : ''}${echapper(logique.texte)}${r && r.raccourci ? ` : ${touchesHtml(lireRaccourci(r.raccourci))}` : ''}</span>`;
}

const CRITERES = { grille: 'Place de la grille', famille: 'Geste de la famille', doigts: 'Doigts immobiles', element: "Touche de l'élément" };

// Les quatre critères des étoiles (V9) : rempli, sans objet (compté comme rempli) ou manqué.
function criteresHtml(criteres) {
  const critere = (k) => (criteres[k] === false ? `<span class="manque" title="manque">✗ ${CRITERES[k]}</span>`
    : `<span class="${criteres[k] === null ? 'sans-objet' : ''}" title="${criteres[k] === null ? 'sans objet, compte comme rempli' : 'rempli'}">★ ${CRITERES[k]}</span>`);
  return `<span class="criteres">${Object.keys(CRITERES).map(critere).join('')}</span>`;
}

// La suggestion choisie en grande carte (V18), les autres en petit dessous ; un clic en choisit une (V12).
export function afficherCarte(historique, liste, choisie, surClic) {
  const regles = reglages(historique);
  const cartes = liste.map((s, i) => {
    const bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = i === choisie ? 'suggestion grande' : 'suggestion';
    bouton.setAttribute('aria-pressed', String(i === choisie));
    bouton.innerHTML = `<span class="touches">${s.raccourci ? touchesHtml(lireRaccourci(s.raccourci)) : groupeHtml(s.groupe)}`
      + `${etoilesHtml(s.etoiles)}</span>${logiqueHtml(s.logique, regles)}`
      + `${i === choisie ? criteresHtml(s.criteres) : ''}`;
    bouton.addEventListener('click', () => surClic(i));
    return bouton;
  });
  const autres = document.createElement('div');
  autres.className = 'autres';
  autres.append(...cartes.filter((c, i) => i !== choisie));
  $('suggestions').replaceChildren(...cartes.filter((c, i) => i === choisie), autres);
}
