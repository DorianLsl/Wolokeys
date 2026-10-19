import { toucheDe, lireRaccourci, ascii } from './touches.js';

export const MAINTENABLES = ['Alt', 'Maj', 'Ctrl', 'Mouse 4', 'Mouse 5'];
// Ctrl et Maj gardent leur sens sur la grille du jeu (groupes, file d'ordres) : seules ces trois-là s'y combinent (V3).
export const MAINTENABLES_GRILLE = ['Alt', 'Mouse 4', 'Mouse 5'];

// Refus d'un raccourci pris isolément (V3, V10), avant de le comparer aux raccourcis déjà réglés.
export function refusRaccourci(raccourci) {
  const lu = lireRaccourci(raccourci);
  if (lu.erreur) return lu.erreur;
  const touche = toucheDe(lu.touche);
  const refus = lu.maintenue ? refusAvecMaintenue(raccourci, lu, touche) : refusSansMaintenue(raccourci, lu, touche);
  return refus ? ascii(refus) : null;
}

function refusAvecMaintenue(raccourci, lu, touche) {
  if (lu.maintenue === 'Échap') return touche.grille && !lu.double ? null : 'Echap : seulement avant la grille.';
  if (lu.double || !MAINTENABLES.includes(lu.maintenue) || MAINTENABLES.includes(lu.touche) || touche.reservee) return `${raccourci} : combinaison impossible.`;
  return touche.grille && !MAINTENABLES_GRILLE.includes(lu.maintenue) ? 'Grille : avec Alt, Mouse 4 ou 5.' : null;
}

function refusSansMaintenue(raccourci, lu, touche) {
  if (touche.reservee) return touche.reservee;
  return touche.grille ? `${raccourci} deja pris : grille.` : null;
}

// En jeu, une touche seule partirait aussi au premier appui d'un double appui, ou en tenant la touche d'une combinaison (V10).
export function seGenent(a, b) {
  const [x, y] = [lireRaccourci(a), lireRaccourci(b)];
  if (a === b) return true;
  if (!x.maintenue && !y.maintenue) return x.touche === y.touche && x.double !== y.double;
  return (!x.maintenue && x.touche === y.maintenue) || (!y.maintenue && y.touche === x.maintenue);
}

// Échap puis une touche de la grille désélectionne puis appuie la touche seule (V3).
export function mecaniqueDe(raccourci) {
  const lu = lireRaccourci(raccourci);
  if (lu.maintenue && lu.maintenue !== 'Échap') return lu.maintenue;
  return lu.double ? 'double' : 'seule';
}

const DOUBLE_APPUI_MS = 400;

export function estDouble(premier, second) {
  if (!premier || premier.raccourci !== second.raccourci) return false;
  const lu = lireRaccourci(second.raccourci);
  return !lu.maintenue && !lu.double && second.temps - premier.temps < DOUBLE_APPUI_MS;
}
