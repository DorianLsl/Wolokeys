import { touchePourCreer } from '../../groupes/domain/groupes.js';
import { icone, echapper, etoilesHtml, touchesHtml, groupeHtml } from './html.js';

const $ = (id) => document.getElementById(id);

const ETATS = {
  'plus tard': `${icone('hourglass')}plus tard`, 'a definir': 'à définir', 'a la fin': `${icone('ban')}à la fin`,
  'non utilise': `${icone('ban')}non utilisé`, 'a venir': '—',
};

function valeurHtml(l, creation) {
  if (!l.reglage) return `<span class="etat">${ETATS[l.etat]}</span>`;
  const touches = l.reglage.raccourci ? touchesHtml(l.reglage.raccourci) : groupeHtml({ creer: true, maintenue: creation, chiffre: l.reglage.chiffre });
  return `${touches}${etoilesHtml(l.etoiles)}`;
}

// Deux tableaux avec icônes, étoiles et score (V8, V9) ; un raccourci réglé se clique pour être redemandé (V27).
export function afficherRecapitulatif(historique, recap, surClic) {
  const creation = touchePourCreer(historique);
  const liste = (lignes) => lignes.map((l) => {
    const li = document.createElement('li');
    const contenu = document.createElement(l.reglage ? 'button' : 'div');
    contenu.className = 'ligne';
    if (l.reglage) {
      contenu.type = 'button';
      contenu.title = 'Revenir sur ce raccourci';
      contenu.addEventListener('click', () => surClic(l.action));
    }
    contenu.innerHTML = `${icone(l.action)}<span class="nom">${echapper(l.nom)}</span><span class="valeur">${valeurHtml(l, creation)}</span>`;
    li.append(contenu);
    return li;
  });
  $('score').innerHTML = `${icone('star', 'etoile pleine')}${recap.score.obtenu} / ${recap.score.max}`;
  $('optimisee').replaceChildren(...liste(recap.optimisee));
  $('extras').replaceChildren(...liste(recap.extras));
}

// V31 : ce que l'export a retiré à d'autres commandes du profil.
export function afficherRetires(retires) {
  $('retires').textContent = retires.length ? `Retiré du profil : ${retires.map((r) => `${r.commande} (${r.combo})`).join(', ')}.` : '';
}
