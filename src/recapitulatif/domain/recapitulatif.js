import { ACTIONS, MOMENTS } from '../../partie/domain/donnees.js';
import { etapeEnCours, reglages, estExtra, ageA } from '../../partie/domain/partie.js';
import { criteres, criteresDuGroupe, etoiles } from '../../suggestions/domain/suggestions.js';

const AGES = ['I', 'II', 'III', 'IV'];
// Les raccourcis à régler : la grille du jeu est fixe, elle n'y entre pas (V4).
const RACCOURCIS = Object.keys(ACTIONS).filter((id) => !ACTIONS[id].grille);

// Deux tableaux, partie optimisée et extras (V8) ; chaque ligne dit son réglage et ses étoiles (V9), ou pourquoi elle n'en a pas.
export function recapitulatif(historique) {
  const regles = reglages(historique);
  const lignes = RACCOURCIS.map((action) => ({ action, nom: ACTIONS[action].nom, reglage: regles[action], etat: etatDe(historique, regles, action),
    etoiles: etoilesDe(historique, action, regles[action]) }));
  return {
    optimisee: lignes.filter((l) => !estExtra(historique, l.action)),
    extras: lignes.filter((l) => estExtra(historique, l.action)),
    score: { obtenu: lignes.reduce((total, l) => total + (l.etoiles || 0), 0), max: RACCOURCIS.length * 4 },
  };
}

function etoilesDe(historique, action, reglage) {
  if (!reglage) return null;
  return etoiles(reglage.raccourci ? criteres(historique, action, reglage.raccourci) : criteresDuGroupe(historique, reglage.chiffre));
}

// V5 : une action encore en Plus tard à la fin de son âge est à définir ; une action non utilisée revient à la fin.
function etatDe(historique, regles, action) {
  if (regles[action]) return 'regle';
  const reponses = historique.filter((e) => e.type === 'reponse' && e.action === action);
  const etape = etapeEnCours(historique);
  const ageEnCours = etape && etape.type !== 'posture' ? ageA(etape.moment) : 'fin';
  const derniere = reponses[reponses.length - 1];
  if (derniere && derniere.nePasUtiliser) return MOMENTS[derniere.moment].rattrapage || !etape ? 'non utilise' : 'a la fin';
  if (!derniere) return 'a venir';
  return AGES.indexOf(ageEnCours) > AGES.indexOf(ageA(derniere.moment)) || !etape ? 'a definir' : 'plus tard';
}
