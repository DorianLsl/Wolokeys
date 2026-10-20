import { TOUCHES, lireRaccourci } from '../../clavier/domain/touches.js';
import { MAINTENABLES, MAINTENABLES_GRILLE, mecaniqueDe } from '../../clavier/domain/raccourcis.js';
import { postureDe } from '../../posture/domain/posture.js';
import { groupePropose, voisinDe } from '../../groupes/domain/groupes.js';
import { ACTIONS } from '../../partie/domain/donnees.js';
import { etapeEnCours, choisir, raccourcisRegles, reglages } from '../../partie/domain/partie.js';
import { atteinte, effortDe } from './effort.js';

// Départage, de la plus simple à la plus composée.
const MECANIQUES = ['seule', 'double', ...MAINTENABLES];
const DOIGTS = ['index', 'majeur', 'annulaire', 'auriculaire', 'pouce', 'pouce droit'];
// Les touches sous 1, 2, 3, 4, comme les groupes de l'armée chez les joueurs reconnus (V25).
const ROLES = { infanterie: 'A', distance: 'Z', cavalerie: 'E', 'siège': 'R' };
const VERBES = { prochain: 'prochain', tous: 'tous sur la carte', 'écran': "tous à l'écran" };
const DOMAINES = { 'économie': "de l'économie", militaire: 'du militaire' };

// Toutes calculées (V20), chacune avec ses familles (V11) et sa proposition, faite sans être imposée.
const LOGIQUES = {
  verbe: { famille: (a) => a.verbe, proposition: mecaniqueHabituelle },
  role: { famille: null, proposition: toucheDuRole },
  domaine: { famille: (a) => a.domaine, proposition: toucheReserveeAuDomaine },
};
const AVEC_FAMILLES = Object.keys(LOGIQUES).filter((l) => LOGIQUES[l].famille);
const familleDe = (l, id) => LOGIQUES[l].famille(ACTIONS[id]);

const elementDe = (id) => ACTIONS[id].role || ACTIONS[id].element || id;
const estCamera = (id) => ACTIONS[id].verbe === 'caméra';
const touche = (raccourci) => lireRaccourci(raccourci).touche;

export const etoiles = (c) => ['grille', 'famille', 'doigts', 'element'].filter((k) => c[k] !== false).length;

// Les touches F et Échap + touche ne servent qu'en cas de gros manque d'intuitivité (V26).
export const gardeDernierRecours = (candidats) => (candidats.some((c) => !c.dernierRecours && c.etoiles > 1)
  ? candidats.filter((c) => !c.dernierRecours) : candidats);

// La première est pré-sélectionnée (V12) ; le groupe passe d'abord pour l'armée et la production (V15).
export function suggestions(historique) {
  const etape = etapeEnCours(historique);
  if (!etape || etape.type !== 'action') return [];
  const a = ACTIONS[etape.action];
  const groupe = a.rappelable ? suggestionDeGroupe(historique, a.selection) : null;
  const avecGroupe = groupe ? [groupe] : [];
  if (a.seulementGroupe) return avecGroupe;
  const raccourcis = raccourcisProposes(historique, etape.action);
  return a.groupeDabord ? [...avecGroupe, ...raccourcis] : [...raccourcis, ...avecGroupe];
}

// La mécanique habituelle du verbe passe même devant la meilleure (V24).
function raccourcisProposes(historique, action) {
  const contexte = { historique, action, regles: raccourcisRegles(historique), logiques: logiquesPossibles(historique) };
  const tries = triees(notees(contexte));
  const noms = Object.keys(LOGIQUES);
  const [habituelle, ...autres] = noms.map((nom) => LOGIQUES[nom].proposition(contexte, tries));
  const premiersParMecanique = tries.filter((c, i) => tries.findIndex((d) => d.mecanique === c.mecanique) === i);
  const choisis = [...new Set([habituelle || tries[0], ...autres, ...premiersParMecanique].filter(Boolean))].slice(0, 3);
  const proposees = [habituelle, ...autres];
  return choisis.map((c) => {
    const avecLogiques = { ...c, logiques: noms.filter((nom, i) => proposees[i] === c) };
    return { ...avecLogiques, logique: logiqueDe(contexte, avecLogiques) };
  });
}

// V18 : la logique qui propose la suggestion, sinon ce qui la rend intuitive, avec l'action qui l'inspire.
function logiqueDe({ historique, action, regles, logiques }, c) {
  const a = ACTIONS[action];
  const sans = (texte) => ({ texte, action: null });
  const memeTouche = c.criteres.element && Object.keys(regles)
    .find((x) => x !== action && elementDe(x) === elementDe(action) && touche(regles[x]) === touche(c.raccourci));
  if (c.logiques.includes('role')) return sans(`Rôle ${a.role} sur ${touche(c.raccourci)}${c.logiques.includes('verbe') ? `, habitude ${c.mecanique}` : ''}`);
  if (c.logiques.includes('verbe') && !memeTouche) return sans(`Habitude : ${c.mecanique} pour « ${VERBES[a.verbe]} »`);
  if (c.logiques.includes('domaine')) return sans(`Touche ${DOMAINES[a.domaine]} : ${c.mecanique}`);
  if (memeTouche) return { texte: `Même touche que ${ACTIONS[memeTouche].court}`, action: memeTouche };
  const memeGeste = c.criteres.famille && modelesDe(regles, logiques, action, c.mecanique).find((t) => t && mecaniqueDe(regles[t]) === c.mecanique);
  if (memeGeste) return { texte: `Même geste que ${ACTIONS[memeGeste].court}`, action: memeGeste };
  if (c.criteres.grille) return sans(`Même place que dans la grille : ${a.place}`);
  return sans(mouvement(postureDe(historique), c));
}

// Le doigt qui bouge le plus dit l'effort.
function mouvement(posture, c) {
  if (c.effort === 0) return 'Aucun doigt ne bouge';
  const lu = lireRaccourci(c.raccourci);
  const { doigt } = [lu.maintenue, lu.touche].filter(Boolean).map((t) => atteinte(posture, t)).reduce((p, q) => (q.effort > p.effort ? q : p));
  return `${doigt[0].toUpperCase()}${doigt.slice(1)} ${c.effort <= 1.5 ? "bouge d'une touche" : "s'étire"}`;
}

// V19 : son groupe, à côté du dernier groupe de son bloc, ou au numéro habituel.
function logiqueDuGroupe(historique, selection, groupe) {
  if (!groupe.creer) return { texte: `Ton groupe ${groupe.chiffre}`, action: null };
  const voisin = voisinDe(historique, selection);
  if (!voisin) return { texte: 'Numéro habituel', action: null };
  const regles = reglages(historique);
  return { texte: `À côté de ton groupe ${voisin}`, action: Object.keys(regles).find((x) => regles[x].chiffre === voisin) || null };
}

// V24 : prochain sur la touche de référence du pouce droit, tous sur la carte sur l'autre bouton, tous à l'écran sur Alt.
function mecaniqueHabituelle({ historique, action, regles, logiques }, tries) {
  const pouceDroit = postureDe(historique)['pouce droit'];
  const verbe = ACTIONS[action].verbe;
  const habitude = { prochain: pouceDroit, tous: pouceDroit === 'Mouse 4' ? 'Mouse 5' : 'Mouse 4', 'écran': 'Alt' }[verbe];
  const premierDuVerbe = habitude && logiques.includes('verbe') && !modeleDe(regles, 'verbe', verbe) && !prisesAilleurs(regles, 'verbe', verbe).includes(habitude);
  return premierDuVerbe ? tries.find((c) => c.mecanique === habitude) : undefined;
}

function toucheDuRole({ action, regles }, tries) {
  const role = ACTIONS[action].role;
  const libre = role && !Object.keys(regles).some((x) => elementDe(x) === role);
  return libre ? tries.find((c) => touche(c.raccourci) === ROLES[role]) : undefined;
}

// V16, V21 : une touche maintenue qui se combine avec la grille, libre dans les autres domaines.
function toucheReserveeAuDomaine({ action, regles, logiques }, tries) {
  const domaine = ACTIONS[action].domaine;
  const premier = domaine && logiques.includes('domaine') && !Object.keys(regles).some((id) => ACTIONS[id].domaine === domaine);
  return premier ? tries.find((c) => MAINTENABLES_GRILLE.includes(c.mecanique) && !prisesAilleurs(regles, 'domaine', domaine).includes(c.mecanique)) : undefined;
}

function suggestionDeGroupe(historique, selection) {
  const groupe = groupePropose(historique, selection);
  if (!groupe) return null;
  const criteres = criteresDuGroupe(historique, groupe.chiffre);
  return { groupe, criteres, etoiles: etoiles(criteres), logique: logiqueDuGroupe(historique, selection, groupe) };
}

// Un groupe est noté comme un raccourci : seuls les doigts comptent, le reste est sans objet.
export const criteresDuGroupe = (historique, chiffre) => ({ grille: null, famille: null, doigts: effortDe(postureDe(historique), chiffre) === 0, element: null });

// Le double appui n'est suggéré qu'en dernier recours, sauf l'alerte sur la touche de la caméra (V7, V10).
function notees({ historique, action, regles, logiques }) {
  const libres = candidats(historique, action)
    .filter((c) => logiques.some((l) => !prisesAilleurs(regles, l, familleDe(l, action)).includes(c.mecanique)))
    .map((c) => {
      const crit = criteres(historique, action, c.raccourci, logiques);
      return { ...c, criteres: crit, etoiles: etoiles(crit) };
    });
  const sansDouble = libres.filter((c) => c.mecanique !== 'double' || (estCamera(action) && c.criteres.element));
  return gardeDernierRecours(sansDouble.length ? sansDouble : libres);
}

const triees = (candidats) => [...candidats].sort((p, q) => q.etoiles - p.etoiles || p.effort - q.effort
  || MECANIQUES.indexOf(p.mecanique) - MECANIQUES.indexOf(q.mecanique) || DOIGTS.indexOf(p.doigtTouche) - DOIGTS.indexOf(q.doigtTouche));

// La touche de référence du pouce reste à la caméra (V7) ; une touche maintenable ne se suggère pas seule (V11).
function candidats(historique, action) {
  const posture = postureDe(historique);
  const ordinaires = TOUCHES.filter((t) => !t.reservee && !MAINTENABLES.includes(t.id));
  const seules = ordinaires.filter((t) => !t.grille && (estCamera(action) || t.id !== posture.pouce)).flatMap((t) => [t.id, `${t.id} x2`]);
  const combinaisons = MAINTENABLES.flatMap((m) => ordinaires.map((t) => `${m} + ${t.id}`));
  const apresEchap = ordinaires.filter((t) => t.grille).map((t) => `Échap + ${t.id}`);
  return [...seules, ...combinaisons, ...apresEchap]
    .filter((r) => choisir(historique, r).historique)
    .map((r) => ({ raccourci: r, mecanique: mecaniqueDe(r), doigtTouche: atteinte(posture, touche(r)).doigt, effort: effortDe(posture, r),
      dernierRecours: lireRaccourci(r).maintenue === 'Échap' || /^F\d+$/.test(touche(r)) }))
    .filter((c) => c.effort < Infinity);
}

// Le premier choix qui les départage fixe la logique de l'utilisateur (V20) ; la touche seule reste commune.
export function logiquesPossibles(historique) {
  const regles = raccourcisRegles(historique);
  const tenus = Object.keys(regles).filter((id) => mecaniqueDe(regles[id]) !== 'seule');
  const tient = (l) => tenus.every((p) => tenus.every((q) => (familleDe(l, p) === familleDe(l, q)) === (mecaniqueDe(regles[p]) === mecaniqueDe(regles[q]))));
  const possibles = AVEC_FAMILLES.filter(tient);
  return possibles.length ? possibles : ['verbe'];
}

const modeleDe = (regles, l, famille) => Object.keys(regles).find((id) => familleDe(l, id) === famille);

const prisesAilleurs = (regles, l, famille) => Object.keys(regles)
  .filter((id) => familleDe(l, id) !== famille).map((id) => mecaniqueDe(regles[id])).filter((m) => m !== 'seule');

// Critères d'intuitivité (V9) : true, false, ou null quand le critère est sans objet.
export function criteres(historique, action, raccourci, logiques = logiquesPossibles(historique)) {
  const regles = raccourcisRegles(historique);
  const element = critereElement(regles, action, raccourci);
  const alerteSurCamera = estCamera(action) && mecaniqueDe(raccourci) === 'double' && element === true;
  return {
    grille: ACTIONS[action].place ? touche(raccourci) === ACTIONS[action].place : null,
    famille: critereFamille(regles, logiques, action, raccourci, alerteSurCamera),
    doigts: effortDe(postureDe(historique), raccourci) === 0,
    element,
  };
}

// Une touche par élément (V22), la touche d'un rôle à ce rôle (V25), la caméra garde la sienne (V7).
function critereElement(regles, action, raccourci) {
  const autres = Object.keys(regles).filter((x) => x !== action);
  const meme = autres.find((x) => elementDe(x) === elementDe(action));
  const t = touche(raccourci);
  if (estCamera(action)) return meme ? touche(regles[meme]) === t : null;
  if (meme) return touche(regles[meme]) === t;
  const roleDeLaTouche = Object.keys(ROLES).find((r) => ROLES[r] === t);
  if (roleDeLaTouche) return roleDeLaTouche === elementDe(action);
  return autres.some((x) => !estCamera(x) && touche(regles[x]) === t) ? false : null;
}

// L'alerte en double appui sur la touche de la caméra suit la famille caméra (V7).
function critereFamille(regles, logiques, action, raccourci, alerteSurCamera) {
  const m = mecaniqueDe(raccourci);
  const modeles = modelesDe(regles, logiques, action, m);
  if (modeles.some((t) => t && (mecaniqueDe(regles[t]) === m || alerteSurCamera))) return true;
  return modeles.some((t) => !t) ? null : false;
}

// Dans chaque logique où la mécanique est libre, l'action qui fixe celle de la famille ; undefined si aucune n'est réglée.
const modelesDe = (regles, logiques, action, m) => logiques.filter((l) => !prisesAilleurs(regles, l, familleDe(l, action)).includes(m))
  .map((l) => modeleDe(regles, l, familleDe(l, action)));

// Un groupe proposé se crée d'abord s'il n'existe pas, puis se rappelle par son chiffre.
export function accepter(historique, suggestion) {
  if (!etapeEnCours(historique)) return { erreur: 'Partie terminee.' };
  if (!suggestion) return { erreur: 'Aucune suggestion : tape un raccourci.' };
  if (suggestion.raccourci) return choisir(historique, suggestion.raccourci);
  const { chiffre, creer, maintenue } = suggestion.groupe;
  const cree = creer ? choisir(historique, `${maintenue} + ${chiffre}`) : { historique };
  return cree.erreur ? cree : choisir(cree.historique, chiffre);
}
