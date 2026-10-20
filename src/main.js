import { ecouter } from './clavier/adapters/ecoute.js';
import { etapePosture, toucheSuggeree } from './posture/domain/posture.js';
import { afficherPosture } from './posture/ui/posture.js';
import { retour } from './partie/domain/historique.js';
import { etapeEnCours, choisir, plusTard, nePasUtiliser, basculerEntrainement, entrainementActif, redemander } from './partie/domain/partie.js';
import { afficherPartie } from './partie/ui/partie.js';
import { suggestions, accepter } from './suggestions/domain/suggestions.js';
import { sequenceDe, appuyer, passer, estEntrainement } from './entrainement/domain/entrainement.js';
import { afficherSequence } from './entrainement/ui/entrainement.js';
import { recapitulatif } from './recapitulatif/domain/recapitulatif.js';
import { afficherRecapitulatif } from './recapitulatif/ui/recapitulatif.js';
import { geste, touchesEntourees, deplacements, conflits } from './interface/domain/interface.js';
import { afficherIcone, afficherCarte } from './interface/ui/carte.js';
import { afficherClavier } from './interface/ui/clavier.js';
import { afficherManette } from './interface/ui/manette.js';
import { installerVues } from './interface/ui/vues.js';

let historique = [];
let message = '';
// Un double appui remplace le choix de son premier appui seulement si celui-ci vient d'être accepté (V10).
let premierAccepte = false;
let liste = [];
let choisie = 0;
let appuis = [];

function appliquer(resultat, accepteUnAppui) {
  message = resultat.erreur || resultat.note || '';
  document.getElementById('message').classList.toggle('erreur', !!resultat.erreur);
  premierAccepte = accepteUnAppui && !!resultat.historique;
  appuis = resultat.appuis || [];
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
  if (!etape || etape.type !== 'posture') afficherPartie(historique, etape);
  document.getElementById('entrainement').checked = entrainementActif(historique);
  afficherSequence(sequenceDe(historique), appuis);
  afficherRecapitulatif(recapitulatif(historique), (action) => appliquer(redemander(historique, action), false));
  liste = suggestions(historique);
  const g = geste(historique, liste[choisie], appuis);
  const entourees = touchesEntourees(historique, liste[choisie]);
  afficherIcone(etape);
  afficherCarte(historique, liste, choisie, (i) => {
    choisie = i;
    afficher();
  });
  afficherClavier(historique, g, entourees, conflits(historique));
  afficherManette(historique, g, entourees, deplacements(historique, g));
  document.getElementById('message').textContent = message;
}

const clic = (id, faire) => document.getElementById(id).addEventListener('click', () => appliquer(faire(historique), false));
clic('suivant', (h) => (etapePosture(h) ? choisir(h, toucheSuggeree(h)) : estEntrainement(h) ? passer(h) : accepter(h, liste[choisie])));
clic('plus-tard', plusTard);
clic('ne-pas-utiliser', nePasUtiliser);
document.getElementById('entrainement').addEventListener('change', () => appliquer(basculerEntrainement(historique), false));
ecouter({
  surRaccourci: (raccourci) => (estEntrainement(historique)
    ? appliquer(appuyer(historique, appuis, raccourci, premierAccepte), false)
    : appliquer(choisir(historique, raccourci, premierAccepte), true)),
  surRetour: () => appliquer({ historique: retour(historique) }, false),
});
installerVues();
afficher();
