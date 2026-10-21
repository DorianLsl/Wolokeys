import { ACTIONS, ENCHAINEMENTS, MOMENTS } from '../../partie/domain/donnees.js';
import { ageA, estExtra, plusTardA, selectionActuelle } from '../../partie/domain/partie.js';
import { toucheSuggeree } from '../../posture/domain/posture.js';
import { sequenceDe } from '../../entrainement/domain/entrainement.js';
import { icone, iconeSelection, echapper, touchesHtml } from './html.js';
import { cartesHtml } from './carte.js';

const $ = (id) => document.getElementById(id);
let dernierHtml = '';

const majuscule = (texte) => `${texte[0].toUpperCase()}${texte.slice(1)}`;

// La scène : ligne du haut, action et situation, puis la suggestion, la séquence ou la fin, et les outils.
export function afficherScene(historique, etape, { liste, choisie, appuis, recap }) {
  const html = etape ? `${hautHtml(historique, etape, recap)}${acteHtml(etape)}${corpsHtml(historique, etape, liste, choisie, appuis)}`
    : finHtml(recap);
  // Réécrite seulement si elle change, pour que les lecteurs d'écran ne la répètent pas à chaque touche.
  if (html !== dernierHtml) $('scene').innerHTML = dernierHtml = html;
}

function etiquette(historique, etape) {
  if (etape.type === 'posture') return ['hand', 'Avant la partie'];
  if (etape.redemande) return ['undo', 'Raccourci redemandé depuis la liste'];
  if (etape.type === 'grille') return ['lock', 'Grille du jeu, fixe dans cette version'];
  if (etape.type === 'enchainement') return ['swap', ENCHAINEMENTS[etape.enchainement].allerRetour ? 'Aller-retour' : 'Entraînement'];
  return estExtra(historique, etape.action) ? ['bolt', 'Extra'] : ['crown', 'Partie optimisée'];
}

function pastillesHtml(recap) {
  // Dans l'ordre de la partie, extras compris, comme dans le prototype.
  const ordre = Object.keys(ACTIONS);
  const lignes = [...recap.optimisee, ...recap.extras].sort((p, q) => ordre.indexOf(p.action) - ordre.indexOf(q.action));
  const regles = lignes.filter((l) => l.reglage).length;
  return `<span class="pastilles" title="${regles} raccourcis sur ${lignes.length}">${lignes.map((l) => `<i${l.reglage ? ' class="regle"' : ''}></i>`).join('')}</span>`;
}

// Heure et âge, étiquette, heures où l'action a été remise à plus tard (V5), sélection en cours, progression.
function hautHtml(historique, etape, recap) {
  const [symbole, texte] = etiquette(historique, etape);
  const heure = etape.type === 'posture' ? '' : `<span class="heure">Âge ${ageA(etape.moment)} · ${MOMENTS[etape.moment].heure}</span>`;
  const tard = etape.type === 'action' ? plusTardA(historique, etape.action) : [];
  const selection = etape.type !== 'posture' && selectionActuelle(historique);
  return `<div class="haut">${heure}<span class="etiquette" title="${texte}">${icone(symbole)}<span class="sr">${texte}</span></span>`
    + `${tard.length ? `<span class="tard" title="Remise à plus tard à ${tard.join(', ')}">${icone('hourglass')}${tard.join(', ')}</span>` : ''}`
    + `${selection ? `<span class="selection" title="Sélection : ${selection}">${iconeSelection(selection)}<span class="sr">Sélection : ${selection}</span></span>` : ''}`
    + `${pastillesHtml(recap)}</div>`;
}

function acteHtml(etape) {
  const posture = etape.type === 'posture';
  const nom = posture ? majuscule(etape.doigt) : etape.enchainement ? ENCHAINEMENTS[etape.enchainement].nom : ACTIONS[etape.action].nom;
  const situation = posture ? (etape.doigt === 'pouce droit' ? 'Main sur la souris : quel bouton latéral ?' : `Main gauche posée : où repose ton ${etape.doigt} ?`)
    : etape.redemande ? 'Change ce raccourci.' : MOMENTS[etape.moment].situation;
  return `<div class="acte">${icone(posture ? 'hand' : etape.enchainement || etape.action, 'grande')}`
    + `<div><p class="action">${echapper(nom)}</p><p class="situation">${echapper(situation)}</p></div></div>`;
}

const boutonSuivant = (actif) => `<button type="button" class="suivant" data-faire="suivant" title="Valider et passer à la suite"${actif ? '' : ' disabled'}>`
  + `Suivant${icone('arrow')}</button>`;
const boutonRevenir = (actif) => `<button type="button" class="fantome" data-faire="revenir" title="Revenir (Retour arrière)" aria-label="Revenir"${actif ? '' : ' disabled'}>`
  + `${icone('undo')}<kbd>⌫</kbd></button>`;

function corpsHtml(historique, etape, liste, choisie, appuis) {
  const revenir = boutonRevenir(historique.length > 0 || appuis.length > 0);
  if (etape.type === 'posture') {
    const touche = toucheSuggeree(historique);
    const repere = etape.doigt === 'pouce droit' ? 'Le pouce droit repose sur un bouton latéral.' : "Repère : le relief de F sous l'index.";
    return `<div class="suggestions"><button type="button" class="suggestion grande" data-choisir="0" data-touches="${echapper(touche)}" aria-pressed="true">`
      + `<span class="touches">${touchesHtml(touche)}</span><span class="logique">${repere}</span></button></div>`
      + `<div class="outils">${boutonSuivant(true)}${revenir}</div>`;
  }
  const sequence = sequenceDe(historique);
  if (sequence) {
    const appui = (a, i) => `<span class="appui${i < appuis.length ? ' fait' : i === appuis.length ? ' attendu' : ''}">${touchesHtml(a)}</span>`;
    return `<div class="sequence" aria-label="${echapper(sequence.join(' puis '))}">${sequence.map(appui).join(icone('arrow'))}</div>`
      + `<div class="outils">${boutonSuivant(true)}${revenir}</div>`;
  }
  // Au rattrapage, il n'y a plus de moment plus tard : Ne pas utiliser seul (V5).
  const rattrapage = MOMENTS[etape.moment].rattrapage && !etape.redemande;
  const plusTard = rattrapage ? '' : `<button type="button" class="fantome" data-faire="plus-tard" title="Revient au prochain moment utile (Échap)">`
    + `${icone('hourglass')}Plus tard<kbd>Échap</kbd></button>`;
  const nePasUtiliser = `<button type="button" class="fantome" data-faire="ne-pas-utiliser" title="${rattrapage ? 'Aucun raccourci pour cette action'
    : 'Aucun raccourci maintenant ; revient en extra à la fin'}">${icone('ban')}Ne pas utiliser</button>`;
  return `${cartesHtml(historique, liste, choisie)}<div class="outils">${boutonSuivant(liste.length > 0)}${plusTard}${nePasUtiliser}${revenir}</div>`;
}

function finHtml(recap) {
  return `<div class="haut"><span class="heure">Âge IV</span>${pastillesHtml(recap)}</div>`
    + `<div class="acte">${icone('landmark', 'grande')}<div><p class="action">Partie terminée</p><p class="situation">Recopie tes raccourcis dans le jeu.</p></div></div>`
    + `<p class="score">${icone('star', 'etoile pleine')}${recap.score.obtenu} / ${recap.score.max}</p>`
    + `<div class="outils"><button type="button" class="fantome" id="recommencer" data-faire="recommencer">${icone('restart')}Recommencer</button>`
    + `${boutonRevenir(true)}</div>`;
}

// Une erreur avec son avertissement, une note avec sa coche.
export function afficherMessage(message, estNote) {
  $('message').className = estNote ? 'message note' : 'message';
  $('message').innerHTML = message ? `${icone(estNote ? 'check' : 'warn')}<span>${echapper(message)}</span>` : '';
}

// Une étape reconstruite fait perdre le focus : il revient sur Recommencer à la fin, sinon sur la scène.
export function garderLeFocus() {
  const actif = document.activeElement;
  if (!actif || actif === document.body || !actif.isConnected) ($('recommencer') || $('scene')).focus();
}
