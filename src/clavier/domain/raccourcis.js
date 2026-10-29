import { toucheDe, lireRaccourci, ascii, CHIFFRES } from './touches.js';

// Le menu du jeu refuse de tenir un bouton latéral, qui se combine seulement appuyé en second (V10).
export const MAINTENABLES = ['Alt', 'Maj', 'Ctrl'];
// Maj garde son sens sur la grille du jeu, la file d'ordres : Alt et Ctrl s'y combinent (V3).
export const MAINTENABLES_GRILLE = ['Alt', 'Ctrl'];

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
  if (toucheDe(lu.maintenue).souris) return 'Bouton lateral : seulement en second.';
  if (lu.double || !MAINTENABLES.includes(lu.maintenue) || MAINTENABLES.includes(lu.touche) || touche.reservee) return `${raccourci} : combinaison impossible.`;
  return touche.grille && !MAINTENABLES_GRILLE.includes(lu.maintenue) ? 'Grille : pas avec Maj (file).' : null;
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
  // Une touche réservée seule (Échap, Ctrl...) ne forme pas de double appui, sauf les chiffres des groupes (V7).
  const reservee = toucheDe(lu.touche).reservee && !CHIFFRES.includes(lu.touche);
  return !lu.maintenue && !lu.double && !reservee && second.temps - premier.temps < DOUBLE_APPUI_MS;
}
