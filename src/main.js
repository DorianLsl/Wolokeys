import { ecouter } from './clavier/adapters/ecoute.js';
import { ascii } from './clavier/domain/touches.js';
import { etapePosture, toucheSuggeree } from './posture/domain/posture.js';
import { retour } from './partie/domain/historique.js';
import { etapeEnCours, choisir, plusTard, nePasUtiliser, basculerEntrainement, entrainementActif, redemander } from './partie/domain/partie.js';
import { touchePourCreer } from './groupes/domain/groupes.js';
import { suggestions, accepter } from './suggestions/domain/suggestions.js';
import { appuyer, passer, estEntrainement } from './entrainement/domain/entrainement.js';
import { recapitulatif } from './recapitulatif/domain/recapitulatif.js';
import { geste, touchesEntourees, deplacements, conflits, armement, touchesTenues, touchesDe } from './interface/domain/interface.js';
import { afficherScene, afficherMessage, garderLeFocus } from './interface/ui/scene.js';
import { installerClavier, afficherClavier, apercu } from './interface/ui/clavier.js';
import { afficherManette } from './interface/ui/manette.js';
import { afficherRecapitulatif, afficherRetires } from './interface/ui/recapitulatif.js';
import { exporter } from './profil/domain/profil.js';
import { lireFichier, telecharger } from './profil/adapters/fichier.js';
import { installerVues } from './interface/ui/vues.js';

let historique = [];
let message = '';
let estNote = false;
// Un double appui remplace le choix de son premier appui seulement si celui-ci vient d'être accepté (V10).
let premierAccepte = false;
let liste = [];
let choisie = 0;
let appuis = [];
// La touche de création appuyée seule attend un chiffre (V7).
let arme = false;

function appliquer(resultat, accepteUnAppui) {
  message = resultat.erreur || resultat.note || '';
  estNote = !resultat.erreur && !!resultat.note;
  premierAccepte = accepteUnAppui && !!resultat.historique;
  arme = !!resultat.arme;
  appuis = resultat.appuis || [];
  if (resultat.historique) {
    historique = resultat.historique;
    choisie = 0;
  }
  afficher();
}

function afficher() {
  const etape = etapeEnCours(historique);
  document.getElementById('entrainement').checked = entrainementActif(historique);
  liste = suggestions(historique);
  const recap = recapitulatif(historique);
  const g = geste(historique, liste[choisie], appuis);
  const entourees = touchesEntourees(historique, liste[choisie]);
  const tenues = touchesTenues(historique);
  const groupe = [...touchesDe(liste.find((s) => s.groupe)), ...(arme ? [touchePourCreer(historique)] : [])];
  afficherScene(historique, etape, { liste, choisie, appuis, recap });
  afficherMessage(message, estNote);
  afficherClavier(historique, etape, { g, entourees, enConflit: conflits(historique), groupe, tenues });
  afficherManette(historique, etape, { g, entourees, mouvements: deplacements(historique, g), tenues });
  afficherRecapitulatif(historique, recap, (action) => appliquer(redemander(historique, action), false));
  garderLeFocus();
}

// Un appui au clavier, à la souris ou sur le clavier dessiné.
function taper(raccourci) {
  const a = armement(historique, arme, raccourci);
  if (!a.raccourci) return appliquer({ appuis, arme: a.arme, note: a.arme ? ascii(`${touchePourCreer(historique)} : choisis un chiffre.`) : '' }, false);
  if (estEntrainement(historique)) return appliquer(appuyer(historique, appuis, a.raccourci, premierAccepte), false);
  const resultat = choisir(historique, a.raccourci, premierAccepte);
  const double = resultat.historique && !resultat.note && / x2$/.test(a.raccourci);
  return appliquer(double ? { ...resultat, note: ascii(`Double appui : ${a.raccourci}.`) } : resultat, true);
}

// Retour arrière efface d'abord les appuis de la séquence en cours, sinon revient à l'étape précédente (V6).
const revenir = () => appliquer(appuis.length ? {} : { historique: retour(historique) }, false);

const FAIRE = {
  suivant: () => (etapePosture(historique) ? choisir(historique, toucheSuggeree(historique))
    : estEntrainement(historique) ? passer(historique) : accepter(historique, liste[choisie])),
  'plus-tard': () => plusTard(historique),
  'ne-pas-utiliser': () => nePasUtiliser(historique),
  recommencer: () => ({ historique: [] }),
};

const scene = document.getElementById('scene');
scene.addEventListener('click', (e) => {
  const bouton = e.target.closest('button');
  if (!bouton || bouton.disabled) return;
  if (bouton.dataset.choisir) {
    choisie = Number(bouton.dataset.choisir);
    afficher();
  } else if (bouton.dataset.faire === 'revenir') revenir();
  else appliquer(FAIRE[bouton.dataset.faire](), false);
});
scene.addEventListener('mouseover', (e) => {
  const carte = e.target.closest('.suggestion');
  apercu(carte ? carte.dataset.touches.split('|') : []);
});
scene.addEventListener('mouseleave', () => apercu([]));
document.getElementById('entrainement').addEventListener('change', () => appliquer(basculerEntrainement(historique), false));
const ecoute = ecouter({ surRaccourci: taper, surRetour: revenir, actif: () => !!etapeEnCours(historique) });
// Le profil choisi sert de base au nouveau, téléchargé à côté (V29, V30).
const profil = document.getElementById('profil');
document.getElementById('exporter').addEventListener('click', () => profil.click());
profil.addEventListener('change', async () => {
  const fichier = profil.files[0];
  profil.value = '';
  if (!fichier) return;
  const texte = await lireFichier(fichier);
  const resultat = texte === null ? { erreur: 'Fichier illisible.' } : exporter(texte, historique);
  if (resultat.erreur) return appliquer(resultat, false);
  const telecharge = await telecharger(resultat.nom, resultat.texte);
  if (telecharge.erreur) return appliquer(telecharge, false);
  afficherRetires(resultat.retires);
  const renommer = telecharge.fichier.endsWith('.txt') ? ', retire .txt du nom' : '';
  return appliquer({ note: ascii(`Profil cree : ${telecharge.fichier}${renommer}`) }, false);
});
installerClavier(ecoute.cliquer);
installerVues();
afficher();
