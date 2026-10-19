const $ = (id) => document.getElementById(id);

const libelle = (s) => (s.raccourci || (s.groupe.creer ? `${s.groupe.maintenue} + ${s.groupe.chiffre}, puis ${s.groupe.chiffre}` : `Groupe ${s.groupe.chiffre}`));

// Un clic sélectionne une suggestion, Suivant la valide (V12).
export function afficherSuggestions(liste, choisie, surClic) {
  $('suggestions').replaceChildren(...liste.map((s, i) => {
    const bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'suggestion';
    bouton.setAttribute('aria-pressed', String(i === choisie));
    bouton.innerHTML = '<span class="libelle"></span> <span class="etoiles"></span>';
    bouton.querySelector('.libelle').textContent = libelle(s);
    bouton.querySelector('.etoiles').textContent = '★'.repeat(s.etoiles) + '☆'.repeat(4 - s.etoiles);
    bouton.querySelector('.etoiles').setAttribute('aria-label', `${s.etoiles} sur 4`);
    bouton.addEventListener('click', () => surClic(i));
    return bouton;
  }));
}
