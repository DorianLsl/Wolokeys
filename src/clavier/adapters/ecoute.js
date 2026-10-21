import { toucheDe, toucheDuCode, toucheDuBouton } from '../domain/touches.js';
import { lireAppui, AUCUN_APPUI } from '../domain/appuis.js';

const MAINTENUES = { ctrlKey: 'Ctrl', shiftKey: 'Maj', altKey: 'Alt', metaKey: 'Win' };
const TYPES = { keydown: 'appui', keyup: 'relache', mousedown: 'bouton', mouseup: 'boutonRelache' };

// Traduit les événements du navigateur pour le domaine, qui forme les raccourcis.
// actif : la partie attend un appui ; sinon les touches restent au navigateur (Tab, raccourcis), sauf Retour arrière.
export function ecouter({ surRaccourci, surRetour, actif }) {
  let etat = AUCUN_APPUI;
  const lire = (ev) => {
    const lu = lireAppui(etat, ev);
    etat = lu.etat;
    if (lu.raccourci) surRaccourci(lu.raccourci);
  };
  const evenementDe = (e, touche) => ({
    type: TYPES[e.type], touche, temps: performance.now(), maintenues: Object.keys(MAINTENUES).filter((k) => e[k]).map((k) => MAINTENUES[k]),
  });

  for (const type of ['keydown', 'keyup']) {
    document.addEventListener(type, (e) => {
      if (e.code === 'Enter' || e.repeat) return;
      if (e.code === 'Backspace') {
        if (type === 'keydown') {
          lire({ type: 'retour' });
          surRetour();
        }
        e.preventDefault();
        return;
      }
      if (!actif()) return;
      const touche = toucheDuCode(e.code);
      // Une touche inconnue reste au navigateur : zoom, recherche, accessibilité.
      if (toucheDe(touche)) e.preventDefault();
      lire(evenementDe(e, touche));
    });
  }
  // Les boutons latéraux font aussi précédent et suivant dans le navigateur : on l'empêche.
  for (const type of ['mousedown', 'mouseup', 'auxclick']) {
    document.addEventListener(type, (e) => {
      const touche = toucheDuBouton(e.button);
      if (!touche) return;
      e.preventDefault();
      if (TYPES[type]) lire(evenementDe(e, touche));
    });
  }
  window.addEventListener('blur', () => lire({ type: 'perte' }));
  // Un clic sur le clavier dessiné vaut un appui puis un relâchement : touches tenues et double appui comptent comme au clavier.
  const cliquer = (touche, e) => ['keydown', 'keyup'].forEach((type) => lire(evenementDe({ type, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey }, touche)));
  return { cliquer };
}
