import { ecouter } from './clavier/adapters/ecoute.js';
import { etapePosture, toucheSuggeree } from './posture/domain/posture.js';
import { afficherPosture } from './posture/ui/posture.js';
import { retour } from './partie/domain/historique.js';
import { etapeEnCours, choisir, plusTard, nePasUtiliser } from './partie/domain/partie.js';
import { afficherPartie } from './partie/ui/partie.js';
import { suggestions, accepter } from './suggestions/domain/suggestions.js';
import { afficherSuggestions } from './suggestions/ui/suggestions.js';

let historique = [];
let message = '';
// Un double appui remplace le choix de son premier appui seulement si celui-ci vient d'être accepté (V10).
let premierAccepte = false;
let liste = [];
let choisie = 0;

function appliquer(resultat, accepteUnAppui) {
  message = resultat.erreur || resultat.note || '';
  document.getElementById('message').classList.toggle('erreur', !!resultat.erreur);
  premierAccepte = accepteUnAppui && !!resultat.historique;
  if (resultat.historique) {
    historique = resultat.historique;
    choisie = 0;
  }
  afficher();
}

function afficher() {
  const etape = etapeEnCours(historique);
  document.body.dataset.etape = etape ? etape.type : 'fin';
  afficherPosture(historique);
  if (!etape || etape.type === 'action') afficherPartie(historique, etape);
  liste = suggestions(historique);
  afficherSuggestions(liste, choisie, (i) => {
    choisie = i;
    afficher();
  });
  document.getElementById('message').textContent = message;
}

const clic = (id, faire) => document.getElementById(id).addEventListener('click', () => appliquer(faire(historique), false));
clic('suivant', (h) => (etapePosture(h) ? choisir(h, toucheSuggeree(h)) : accepter(h, liste[choisie])));
clic('plus-tard', plusTard);
clic('ne-pas-utiliser', nePasUtiliser);
ecouter({
  surRaccourci: (raccourci) => appliquer(choisir(historique, raccourci, premierAccepte), true),
  surRetour: () => appliquer({ historique: retour(historique) }, false),
});
afficher();
