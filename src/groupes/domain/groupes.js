import { ascii, CHIFFRES } from '../../clavier/domain/touches.js';
import { MAINTENABLES, seGenent } from '../../clavier/domain/raccourcis.js';

// Numéros des joueurs reconnus (V15) : l'armée par rôle sur les plus proches, puis le siège, les centres-villes et la production.
const NUMEROS = { infanterie: '1', distance: '2', cavalerie: '3', 'siège': '4', 'centre-ville': '5', casernes: '6', 'champs de tir': '7', 'écuries': '8', ateliers: '9', 'monastères': '0' };
const BLOCS = [['infanterie', 'distance', 'cavalerie', 'siège'], ['centre-ville', 'casernes', 'champs de tir', 'écuries', 'ateliers', 'monastères']];

const evenements = (historique) => historique.filter((e) => e.type === 'groupe');

export const groupesDe = (historique) => Object.fromEntries(evenements(historique).map((e) => [e.chiffre, e.selection]));

export function toucheDeCreation(historique) {
  const premier = evenements(historique)[0];
  return premier ? premier.maintenue : null;
}

// Avant le premier groupe, Ctrl, comme dans le jeu.
export const touchePourCreer = (historique) => toucheDeCreation(historique) || 'Ctrl';

// raccourcis : ceux déjà réglés, pour qu'une touche seule ne devienne pas aussi la touche des groupes (V10).
export function creerGroupe(historique, chiffre, maintenue, selection, raccourcis) {
  const refus = refusCreation(historique, chiffre, maintenue, selection, raccourcis);
  if (refus) return { erreur: ascii(refus) };
  return { historique: [...historique, { type: 'groupe', chiffre, selection, maintenue }] };
}

function refusCreation(historique, chiffre, maintenue, selection, raccourcis) {
  if (!MAINTENABLES.includes(maintenue)) return `${maintenue} + ${chiffre} : combinaison impossible.`;
  if (!selection) return 'Rien de selectionne.';
  const creation = toucheDeCreation(historique);
  if (creation && maintenue !== creation) return `Groupes : ${creation} + chiffre.`;
  const gene = raccourcis.some((r) => seGenent(r, `${maintenue} + ${chiffre}`));
  return !creation && gene ? `${maintenue} seul deja pris.` : null;
}

// Un nouveau groupe se range près du dernier de son bloc, sinon à son numéro habituel (V19).
export function groupePropose(historique, selection) {
  const groupes = groupesDe(historique);
  const maintenue = touchePourCreer(historique);
  const sien = CHIFFRES.find((c) => groupes[c] === selection);
  if (sien) return { chiffre: sien, creer: false, maintenue };
  const libre = chiffreLibreLePlusProche(groupes, voisinDe(historique, selection) || NUMEROS[selection]);
  return libre ? { chiffre: libre, creer: true, maintenue } : null;
}

// Le dernier groupe du bloc qui contient encore sa sélection ; null si le bloc est vide.
export function voisinDe(historique, selection) {
  const groupes = groupesDe(historique);
  const bloc = BLOCS.find((b) => b.includes(selection));
  const voisin = evenements(historique).reverse().find((e) => bloc.includes(e.selection) && groupes[e.chiffre] === e.selection);
  return voisin ? voisin.chiffre : null;
}

// À égale distance, le chiffre au-dessus d'abord.
function chiffreLibreLePlusProche(groupes, ancre) {
  const ecart = (c) => Math.abs(CHIFFRES.indexOf(c) - CHIFFRES.indexOf(ancre));
  const libres = CHIFFRES.filter((c) => !groupes[c]);
  return libres.sort((p, q) => ecart(p) - ecart(q) || CHIFFRES.indexOf(q) - CHIFFRES.indexOf(p))[0];
}
