import { TOUCHES, lireRaccourci } from '../../clavier/domain/touches.js';
import { mecaniqueDe, refusRaccourci } from '../../clavier/domain/raccourcis.js';
import { ACTIONS, elementDe } from '../../partie/domain/donnees.js';
import { etapeEnCours, reglages } from '../../partie/domain/partie.js';
import { MECANIQUES, VERBES } from '../../suggestions/domain/suggestions.js';

// V35 : la grammaire « touche maintenue = verbe, touche = élément », remplie par les choix de l'utilisateur.
const nomDeLElement = (id) => ACTIONS[id].role || ACTIONS[id].element || ACTIONS[id].court;
const ORDRE_DES_VERBES = Object.keys(VERBES);
const ORDRE_DES_ELEMENTS = [...new Set(Object.keys(ACTIONS).map(elementDe))];
const ORDRE_DES_TOUCHES = TOUCHES.map((t) => t.id);

// Les réglages de la partie, plus la suggestion sélectionnée pour l'action de l'étape en cours.
function entreesDe(historique, suggestion) {
  const entrees = Object.entries(reglages(historique)).map(([action, r]) => ({ action, raccourci: r.raccourci || null, chiffre: r.chiffre || null, suggeree: false }));
  const etape = etapeEnCours(historique);
  if (!suggestion || !etape || etape.type !== 'action') return entrees;
  const suggeree = { action: etape.action, raccourci: suggestion.raccourci || null, chiffre: suggestion.raccourci ? null : suggestion.groupe.chiffre, suggeree: true };
  return [...entrees.filter((e) => e.action !== etape.action), suggeree];
}

// Une ligne ou une colonne par valeur présente, dans l'ordre donné, nommée par ce que ses entrées ont en commun.
const axe = (entrees, cle, ordre, nom) => [...new Set(entrees.map(cle))].sort((a, b) => ordre.indexOf(a) - ordre.indexOf(b))
  .map((id) => ({ id, nom: [...new Set(entrees.filter((e) => cle(e) === id).map(nom))].join(' · ') }));

function tableau(entrees, ligneDe, colonneDe, ordres, noms, vide) {
  const lignes = axe(entrees, ligneDe, ordres[0], noms[0]);
  const colonnes = axe(entrees, colonneDe, ordres[1], noms[1]);
  const cases = lignes.map((l) => colonnes.map((c) => {
    const actions = entrees.filter((e) => ligneDe(e) === l.id && colonneDe(e) === c.id);
    return { actions, vide: actions.length ? null : vide(l.id, c.id) };
  }));
  return { lignes, colonnes, cases };
}

const raccourciDeLaCase = (mecanique, touche) => ({ seule: touche, double: `${touche} x2` }[mecanique] || `${mecanique} + ${touche}`);

// Une case vide dit si le jeu l'accepte : la grille garde ses touches seules (V3).
function etatDeLaCase(mecanique, touche) {
  const raccourci = raccourciDeLaCase(mecanique, touche);
  if (mecanique === 'seule' && TOUCHES.find((t) => t.id === touche).grille) return 'grille du jeu';
  return refusRaccourci(raccourci) ? '—' : 'libre';
}

// Lignes : mécaniques nommées par leurs verbes ; colonnes : touches, Mouse 4 et Mouse 5 compris, nommées par leurs éléments.
export function matriceParTouche(historique, suggestion) {
  const entrees = entreesDe(historique, suggestion).filter((e) => e.raccourci);
  const mecanique = (e) => mecaniqueDe(e.raccourci);
  const touche = (e) => lireRaccourci(e.raccourci).touche;
  return tableau(entrees, mecanique, touche, [MECANIQUES, ORDRE_DES_TOUCHES],
    [(e) => VERBES[ACTIONS[e.action].verbe], (e) => nomDeLElement(e.action)], etatDeLaCase);
}

// Lignes : verbes ; colonnes : éléments ; chaque case garde le raccourci ou le groupe.
export function matriceParVerbe(historique, suggestion) {
  const entrees = entreesDe(historique, suggestion);
  const verbe = (e) => ACTIONS[e.action].verbe;
  const element = (e) => elementDe(e.action);
  return tableau(entrees, verbe, element, [ORDRE_DES_VERBES, ORDRE_DES_ELEMENTS],
    [(e) => VERBES[verbe(e)], (e) => nomDeLElement(e.action)], () => null);
}
