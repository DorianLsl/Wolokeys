import { lireRaccourci, CHIFFRES } from '../../clavier/domain/touches.js';
import { reglages } from '../../partie/domain/partie.js';
import { toucheDeCreation } from '../../groupes/domain/groupes.js';

// La commande du jeu de chaque action qui prend un raccourci (recherche/profil-rkp.md).
export const COMMANDES = {
  selectTc: 'pick_next_town', allTc: 'select_all_town_centers', allBarracks: 'pick_all_barracks', allRanges: 'pick_all_archery_range',
  allStables: 'pick_all_stables', allWorkshops: 'pick_all_siege_workshop', monasteries: 'pick_all_monastery',
  militaryBuildings: 'pick_all_military_buildings', scout: 'pick_next_scout', camera: 'focus_selected', idle: 'pick_next_idle_worker',
  idleAll: 'pick_all_idle_villagers', idleMilNext: 'pick_next_idle_military', idleMil: 'pick_all_idle_military', monk: 'pick_next_monk',
  infantryScreen: 'pick_all_infantry_on_screen', rangedScreen: 'pick_all_archers_on_screen', cavalryScreen: 'pick_all_cavalry_on_screen',
  siegeScreen: 'pick_all_siege_on_screen', alert: 'focus_event_cue', cancelUnit: 'cancel_last_production_item',
};

// Le jeu écrit la lettre imprimée sur le clavier, le reste en noms anglais (V34).
const NOMS = {
  Espace: 'Space', 'Échap': 'Escape', '²': 'Apostrophe', '<': 'OEM102', 'Verr.Maj': 'CapsLock',
  'Mouse 4': 'MouseX1', 'Mouse 5': 'MouseX2', Maj: 'Shift', Ctrl: 'Control',
};
const nomDansLeJeu = (touche) => NOMS[touche] || touche;
// La grille reste au jeu (V3) : l'export ne lui retire jamais sa touche.
const estGrille = (commande) => /^(command|modal)_card_/.test(commande);

// Échap + touche de la grille désélectionne puis appuie la touche seule (V3) : seule la touche s'écrit.
export function comboDe(raccourci) {
  const lu = lireRaccourci(raccourci);
  const maintenue = lu.maintenue === 'Échap' ? null : lu.maintenue;
  return { combo: [maintenue, lu.touche].filter(Boolean).map(nomDansLeJeu).join('+'), repeatCount: lu.double ? 1 : -1 };
}

// Un nouveau profil, fait du profil de l'utilisateur où seules nos commandes changent (V29 à V33).
export function exporter(texte, historique) {
  const refus = refusDuProfil(texte);
  if (refus) return { erreur: refus };
  const lignes = texte.split(/\r?\n/);
  const fin = lignes.indexOf('\tclassicKeys = false,');
  const combos = combosAEcrire(historique);
  const absente = Object.keys(combos).find((c) => !lignes.slice(0, fin).some((l) => l.endsWith(`command = "${c}",`)));
  if (absente) return { erreur: `Commande absente du profil : ${absente}.` };
  const { ecrites, retires, erreur } = ecrire(lignes.slice(0, fin), combos);
  if (erreur) return { erreur };
  const nom = `${texte.match(/\n\tname = "([^"]*)",/)[1]} Wolokeys`;
  const reste = lignes.slice(fin).map((l) => (l.startsWith('\tname = ') ? `\tname = "${nom}",` : l));
  return { nom, texte: [...ecrites, ...reste].join(texte.includes('\r\n') ? '\r\n' : '\n'), retires };
}

// Seul le mode grille est pris en charge (V4, V29).
function refusDuProfil(texte) {
  if (!/^profile = /.test(texte) || !/\n\tname = "[^"]*",/.test(texte) || !/\n\tclassicKeys = (true|false),/.test(texte)) return 'Profil illisible.';
  if (/\n\tclassicKeys = true,/.test(texte)) return 'Profil en touches classiques : non pris en charge.';
  if (/\n\tfullyRemappable = true,/.test(texte)) return 'Profil entierement personnalisable : non pris en charge.';
  return null;
}

// Les raccourcis réglés, puis « créer le groupe » sur la touche de création s'il y a un groupe (V32).
function combosAEcrire(historique) {
  const regles = Object.entries(reglages(historique)).filter(([, r]) => r.raccourci);
  const combos = Object.fromEntries(regles.map(([action, r]) => [COMMANDES[action], comboDe(r.raccourci)]));
  const creation = toucheDeCreation(historique);
  if (creation) for (const c of CHIFFRES) combos[`hkgroup_set${c}`] = comboDe(`${creation} + ${c}`);
  return combos;
}

// Nos commandes reçoivent leur combinaison puis une place vide ; ailleurs, la même combinaison est retirée (V31).
function ecrire(lignes, combos) {
  const prises = new Set(Object.values(combos).map((c) => `${c.combo}|${c.repeatCount}`));
  const ecrites = [];
  const retires = [];
  let commande = null;
  for (let i = 0; i < lignes.length; i += 1) {
    const l = lignes[i];
    const nom = l.match(/command = "(.*)",$/);
    if (nom) commande = nom[1];
    const combo = l.match(/^(\t*)combo = "(.+)",$/);
    if (nom && combos[commande]) {
      const retrait = (lignes[i + 2] || '').replace(/\{$/, '');
      const fin = lignes.indexOf(`${retrait}},`, i + 3);
      if (!/keycombos = +$/.test(lignes[i + 1]) || !/^\t+$/.test(retrait) || fin < 0) return { erreur: 'Profil illisible.' };
      ecrites.push(l, lignes[i + 1], ...bloc(retrait, combos[commande]));
      i = fin;
    } else if (combo && !estGrille(commande) && prises.has(`${combo[2]}|${repetitionDe(lignes[i + 2])}`)) {
      ecrites.push(`${combo[1]}combo = "",`);
      retires.push({ commande, combo: `${combo[2]}${repetitionDe(lignes[i + 2]) === '1' ? ' x2' : ''}` });
    } else ecrites.push(l);
  }
  return { ecrites, retires };
}

const repetitionDe = (ligne) => ((ligne || '').match(/repeatCount = (-?\d+),/) || [])[1];

function bloc(retrait, { combo, repeatCount }) {
  const place = (c, r) => [`${retrait}\t `, `${retrait}\t{`, `${retrait}\t\tcombo = "${c}",`, `${retrait}\t\tevent = "Press",`, `${retrait}\t\trepeatCount = ${r},`, `${retrait}\t},`];
  return [`${retrait}{`, ...place(combo, repeatCount), ...place('', -1), `${retrait}},`];
}
