import { lireRaccourci } from '../../clavier/domain/touches.js';
import { icone, touchesHtml, echapper, etoilesHtml } from './html.js';

const $ = (id) => document.getElementById(id);

const ETATS = { 'plus tard': 'plus tard', 'a definir': 'à définir', 'a la fin': 'à la fin', 'non utilise': 'non utilisé', 'a venir': '—' };

function valeurHtml(l) {
  if (!l.reglage) return `<span class="etat">${ETATS[l.etat]}</span>`;
  const touches = l.reglage.raccourci ? touchesHtml(lireRaccourci(l.reglage.raccourci)) : `${icone('flag')}${touchesHtml(lireRaccourci(l.reglage.chiffre))}`;
  return `${touches}${etoilesHtml(l.etoiles)}`;
}

// Deux tableaux avec icônes, étoiles et score (V8, V9) ; un raccourci réglé se clique pour être redemandé (V27).
export function afficherRecapitulatif(recap, surClic) {
  const liste = (lignes) => lignes.map((l) => {
    const li = document.createElement('li');
    const contenu = document.createElement(l.reglage ? 'button' : 'span');
    if (l.reglage) {
      contenu.type = 'button';
      contenu.title = 'Revenir sur ce raccourci';
      contenu.addEventListener('click', () => surClic(l.action));
    }
    contenu.innerHTML = `${icone(l.action)}<span>${echapper(l.nom)}</span><span class="valeur">${valeurHtml(l)}</span>`;
    li.append(contenu);
    return li;
  });
  $('score').textContent = `★ ${recap.score.obtenu} / ${recap.score.max}`;
  $('optimisee').replaceChildren(...liste(recap.optimisee));
  $('extras').replaceChildren(...liste(recap.extras));
}
