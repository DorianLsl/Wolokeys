// Icône de chaque action et enchaînement (V9) ; les symboles sont dans index.html.
const ICONES = {
  selectTc: 'tc', scout: 'scout', camera: 'camera', alert: 'bell', idle: 'idle', idleAll: 'idleAll', allTc: 'tcs',
  allBarracks: 'barracks', allRanges: 'range', allStables: 'stable', allWorkshops: 'workshop', monasteries: 'monastery',
  militaryBuildings: 'rally', cancelUnit: 'cancel', idleMil: 'idleMil', monk: 'monk',
  infantryScreen: 'army', rangedScreen: 'range', cavalryScreen: 'stable', siegeScreen: 'siege', infantry: 'army', ranged: 'range', cavalry: 'stable', siege: 'siege',
  villager: 'villager', house: 'house', mining: 'mining', lumber: 'lumber', mill: 'mill', farm: 'farm', barracks: 'barracks', range: 'range',
  stable: 'stable', workshop: 'workshop', monastery: 'monastery', keep: 'keep', university: 'university',
  landmark2: 'landmark', landmark3: 'landmark', landmark4: 'landmark',
  goBase: 'tc', goScout: 'scout', tcLoop: 'villager', spearmen: 'barracks', archers: 'range', rallyPoint: 'rally', goArmy: 'army',
  menAtArms: 'barracks', horsemen: 'stable', tcsLoop: 'tcs', springalds: 'workshop', goAlert: 'bell', monks: 'monastery', attack: 'army',
};

// id : une action, un enchaînement, ou directement un symbole (hand, flag, landmark).
export const icone = (id, classe = '') => `<svg class="ic ${classe}" aria-hidden="true"><use href="#i-${ICONES[id] || id}"/></svg>`;

export const echapper = (texte) => texte.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

export const etoilesHtml = (n) => `<span class="etoiles" aria-label="${n} sur 4">${'★'.repeat(n)}${'☆'.repeat(4 - n)}</span>`;

const kbd = (touche) => `<kbd>${echapper(touche)}</kbd>`;

// Une combinaison s'écrit touche maintenue + touche ; Échap se relâche avant la touche (V3).
export function touchesHtml(lu) {
  const avant = lu.maintenue ? `${kbd(lu.maintenue)}<b class="lien">${lu.maintenue === 'Échap' ? '→' : '+'}</b>` : '';
  return `${avant}${kbd(lu.touche)}${lu.double ? '<b class="lien">x2</b>' : ''}`;
}
