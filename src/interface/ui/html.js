import { lireRaccourci } from '../../clavier/domain/touches.js';

// Icône de chaque action et enchaînement (V9), quand son symbole ne porte pas son nom ; les symboles sont dans index.html.
const ICONES = {
  selectTc: 'tc', alert: 'bell', allTc: 'tcs', allBarracks: 'barracks', allRanges: 'range', allStables: 'stable', allWorkshops: 'workshop',
  monasteries: 'monastery', militaryBuildings: 'rally', cancelUnit: 'cancel', idleMilNext: 'idleMil', infantryScreen: 'army',
  rangedScreen: 'range', cavalryScreen: 'stable', siegeScreen: 'siege', infantry: 'army', ranged: 'range', cavalry: 'stable',
  landmark2: 'landmark', landmark3: 'landmark', landmark4: 'landmark', goBase: 'tc', goScout: 'scout', tcLoop: 'villager',
  spearmen: 'barracks', archers: 'range', rallyPoint: 'rally', goArmy: 'army', menAtArms: 'barracks', horsemen: 'stable', tcsLoop: 'tcs',
  springalds: 'workshop', goAlert: 'bell', monks: 'monastery', attack: 'army',
};

// Icône de ce qui est sélectionné : une sélection de la partie ou d'un groupe de contrôle.
const SELECTIONS = {
  'centre-ville': 'tc', 'éclaireur': 'scout', villageois: 'villager', 'centres-villes': 'tcs', casernes: 'barracks', 'champs de tir': 'range',
  'écuries': 'stable', ateliers: 'workshop', 'monastères': 'monastery', 'bâtiments militaires': 'rally', militaires: 'army', moine: 'monk',
  infanterie: 'army', distance: 'range', cavalerie: 'stable', 'siège': 'siege',
};

// id : une action, un enchaînement, ou directement un symbole (hand, flag, star...).
export const icone = (id, classe = '') => `<svg class="ic ${classe}" aria-hidden="true"><use href="#i-${ICONES[id] || id}"/></svg>`;

export const iconeSelection = (selection) => icone(SELECTIONS[selection] || 'flag');

export const echapper = (texte) => texte.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

export const etoilesHtml = (n) => `<span class="etoiles" role="img" aria-label="${n} sur 4" title="${n} sur 4">`
  + `${[1, 2, 3, 4].map((i) => icone('star', i <= n ? 'etoile pleine' : 'etoile')).join('')}</span>`;

const kbd = (touche) => `<kbd>${echapper(touche)}</kbd>`;

// Une combinaison s'écrit touche maintenue + touche ; Échap se relâche avant la touche (V3).
export function touchesHtml(raccourci) {
  const lu = lireRaccourci(raccourci);
  const avant = lu.maintenue ? `${kbd(lu.maintenue)}${lu.maintenue === 'Échap' ? icone('arrow') : '<b class="plus">+</b>'}` : '';
  return `${avant}${kbd(lu.touche)}${lu.double ? '<b class="x2">x2</b>' : ''}`;
}

// Un groupe de contrôle : sa création s'il le faut, puis son chiffre.
export const groupeHtml = ({ creer, maintenue, chiffre }) => `${icone('flag')}${creer ? `${touchesHtml(`${maintenue} + ${chiffre}`)}${icone('arrow')}` : ''}${kbd(chiffre)}`;
