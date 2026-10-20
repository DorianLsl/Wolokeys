const $ = (id) => document.getElementById(id);

const ETATS = { 'plus tard': 'plus tard', 'a definir': 'à définir', 'a la fin': 'à la fin', 'non utilise': 'non utilisé', 'a venir': '—' };
const valeur = (l) => (l.reglage ? l.reglage.raccourci || `Groupe ${l.reglage.chiffre}` : ETATS[l.etat]);

// Un raccourci réglé se clique pour être redemandé (V27).
export function afficherRecapitulatif(recap, surClic) {
  const liste = (lignes) => lignes.map((l) => {
    const li = document.createElement('li');
    const contenu = document.createElement(l.reglage ? 'button' : 'span');
    if (l.reglage) {
      contenu.type = 'button';
      contenu.title = 'Revenir sur ce raccourci';
      contenu.addEventListener('click', () => surClic(l.action));
    }
    contenu.textContent = `${l.nom} : ${valeur(l)}`;
    li.append(contenu);
    return li;
  });
  $('optimisee').replaceChildren(...liste(recap.optimisee));
  $('extras').replaceChildren(...liste(recap.extras));
}
