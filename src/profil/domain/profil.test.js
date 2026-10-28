import { test } from 'node:test';
import assert from 'node:assert/strict';
import { exporter, comboDe, COMMANDES } from './profil.js';
import { choisir, plusTard } from '../../partie/domain/partie.js';
import { ACTIONS } from '../../partie/domain/donnees.js';
import { TOUCHES, CHIFFRES } from '../../clavier/domain/touches.js';

// Profil fictif, au format d'un profil exporté par le jeu (recherche/profil-rkp.md).
const T = (n) => '\t'.repeat(n);
const combo = ([c, repeat = -1]) => [`${T(5)} `, `${T(5)}{`, `${T(6)}combo = "${c}",`, `${T(6)}event = "Press",`, `${T(6)}repeatCount = ${repeat},`, `${T(5)}},`];
const commande = (nom, ...combos) => [`${T(3)} `, `${T(3)}{`, `${T(4)}command = "${nom}",`, `${T(4)}keycombos =  `, `${T(4)}{`, ...combos.flatMap(combo), `${T(4)}},`, `${T(3)}},`];
const groupe = (nom, ...commandes) => [`${T(2)}${nom} =  `, `${T(2)}{`, ...commandes.flat(), `${T(2)}},`];
const profil = ({ classicKeys = false, fullyRemappable = false } = {}) => ['profile =  ', '{', `${T(1)}bindingGroups =  `, `${T(1)}{`,
  ...groupe('camera', commande('pan_left', ['Left'], ['Alt+Q'])),
  ...groupe('hud_control_groups', ...CHIFFRES.map((c) => commande(`hkgroup_set${c}`, [`Control+${c}`], [`Control+Numpad${c}`])), commande('hkgroup_select1', ['1'], ['Numpad1'])),
  ...groupe('hud_dynamic_modern', commande('command_card_row01_column01', ['A'], [''])),
  ...groupe('hud_game', commande('focus_event_cue', ['Space', 1], ['']), commande('global_ability_1', ['Alt+1'], [''])),
  ...groupe('hud_selection_orders', commande('focus_selected', ['Space'], ['']), commande('pick_next_idle_worker'), commande('pick_next_scout', ['OEM8'], [''])),
  ...groupe('hud_unit_control', commande('pick_next_town', ['H'], ['MouseX2'])),
  `${T(1)}},`, `${T(1)}classicKeys = ${classicKeys},`, `${T(1)}fullyRemappable = ${fullyRemappable},`, `${T(1)}fullyRemappableBindingGroups =  `, `${T(1)}{`,
  ...groupe('hud_unit_control', commande('pick_next_town', ['H'], [''])),
  `${T(1)}},`, `${T(1)}name = "d",`, `${T(1)}warnConflicts = true,`, `${T(1)}warnUnremapped = false,`, '}'].join('\r\n');

// Les combinaisons d'une commande, dans bindingGroups (sa première apparition).
function combosDe(texte, nom) {
  const lignes = texte.split('\r\n');
  const debut = lignes.findIndex((l) => l.endsWith(`command = "${nom}",`));
  const fin = lignes.findIndex((l, i) => i > debut && l.startsWith(`${T(3)}},`));
  const valeur = (l) => l.split(' = ')[1].replace(/,$/, '');
  return lignes.slice(debut, fin).flatMap((l, i, bloc) => (l.includes('combo = ') ? [[JSON.parse(valeur(l)), Number(valeur(bloc[i + 2]))]] : []));
}

const poser = () => ['Q', 'S', 'D', 'F', 'Espace', 'Mouse 5'].reduce((h, t) => choisir(h, t).historique, []);
// Dans l'ordre de la partie : centre-ville, éclaireur, caméra, inactif, inactifs ; null vaut Plus tard.
const regler = (h, ...raccourcis) => raccourcis.reduce((acc, r) => (r === null ? plusTard(acc) : choisir(acc, r)).historique, h);

test('V29 : seules les commandes des raccourcis regles changent, le reste du profil reste identique', () => {
  const { texte } = exporter(profil(), regler(poser(), 'Mouse 4'));
  const avant = profil().split('\r\n');
  const changees = texte.split('\r\n').filter((l, i) => l !== avant[i]);
  assert.deepEqual(changees, [`${T(6)}combo = "MouseX1",`, `${T(6)}combo = "",`, `${T(1)}name = "d Wolokeys",`]);
  assert.ok(!/[^\r]\n/.test(texte), 'fins de ligne CRLF gardees');
});

test('V29 : un profil en touches classiques, entierement personnalisable ou illisible est refuse', () => {
  const h = regler(poser(), 'Mouse 4');
  assert.equal(exporter(profil({ classicKeys: true }), h).erreur, 'Profil en touches classiques : non pris en charge.');
  assert.equal(exporter(profil({ fullyRemappable: true }), h).erreur, 'Profil entierement personnalisable : non pris en charge.');
  assert.equal(exporter('bonjour', h).erreur, 'Profil illisible.');
  const tronque = profil().split('\r\n').filter((l) => l !== `${T(4)}},`).join('\r\n');
  assert.equal(exporter(tronque, h).erreur, 'Profil illisible.', 'bloc de combinaisons sans fin');
  assert.equal(exporter(profil(), regler(poser(), 'Mouse 4', 'G', 'Espace', 'Échap + A', 'Ctrl + G')).erreur,
    'Commande absente du profil : pick_all_idle_villagers.');
});

test('V30 : l export cree un nouveau profil, nomme d apres l original', () => {
  const resultat = exporter(profil(), regler(poser(), 'Mouse 4'));
  assert.equal(resultat.nom, 'd Wolokeys');
  assert.ok(resultat.texte.includes(`\r\n${T(1)}name = "d Wolokeys",\r\n`));
});

test('V31 : le raccourci prend la premiere place, la seconde est videe ; la meme combinaison est retiree ailleurs, jamais de la grille', () => {
  const { texte, retires } = exporter(profil(), regler(poser(), 'Alt + Q', 'G', 'Espace', 'Échap + A'));
  assert.deepEqual(combosDe(texte, 'pick_next_town'), [['Alt+Q', -1], ['', -1]]);
  assert.deepEqual(combosDe(texte, 'pan_left'), [['Left', -1], ['', -1]]);
  assert.deepEqual(combosDe(texte, 'pick_next_idle_worker'), [['A', -1], ['', -1]], 'Echap + A : la touche seule');
  assert.deepEqual(combosDe(texte, 'command_card_row01_column01'), [['A', -1], ['', -1]], 'la grille garde sa touche');
  assert.deepEqual(combosDe(texte, 'focus_event_cue'), [['Space', 1], ['', -1]], 'Espace seule ne retire pas Espace x2');
  assert.deepEqual(retires, [{ commande: 'pan_left', combo: 'Alt+Q' }]);
  const ailleurs = exporter(profil(), regler(poser(), 'Mouse 4', 'G', 'Espace x2'));
  assert.deepEqual(ailleurs.retires, [{ commande: 'focus_event_cue', combo: 'Space x2' }], 'un double appui se retire aussi');
});

test('V32 : creer un groupe prend la touche de creation ; selectionner un groupe reste celui du profil', () => {
  const parCtrl = exporter(profil(), choisir(poser(), 'Ctrl + 5').historique).texte;
  assert.deepEqual(combosDe(parCtrl, 'hkgroup_set1'), [['Control+1', -1], ['', -1]]);
  assert.deepEqual(combosDe(parCtrl, 'hkgroup_select1'), [['1', -1], ['Numpad1', -1]]);
  const parAlt = exporter(profil(), choisir(poser(), 'Alt + 5').historique);
  assert.deepEqual(combosDe(parAlt.texte, 'hkgroup_set0'), [['Alt+0', -1], ['', -1]]);
  assert.deepEqual(parAlt.retires, [{ commande: 'global_ability_1', combo: 'Alt+1' }]);
  assert.deepEqual(combosDe(exporter(profil(), poser()).texte, 'hkgroup_set1'), [['Control+1', -1], ['Control+Numpad1', -1]], 'sans groupe : inchange');
});

test('V33 : une action en Plus tard garde la touche qu elle a dans le profil', () => {
  const { texte } = exporter(profil(), regler(poser(), 'Mouse 4', null));
  assert.deepEqual(combosDe(texte, 'pick_next_scout'), [['OEM8', -1], ['', -1]]);
});

test('V34 : la combinaison du jeu ecrit la lettre imprimee en AZERTY et les noms anglais du jeu', () => {
  const combos = ['Alt + A', '²', '<', 'Mouse 4', 'Mouse 5 x2', 'Espace x2', 'Maj + G', 'Ctrl + G', 'F1', 'Tab', 'Échap + A'].map(comboDe);
  assert.deepEqual(combos.map((c) => `${c.combo}${c.repeatCount === 1 ? ' x2' : ''}`),
    ['Alt+A', 'Apostrophe', 'OEM102', 'MouseX1', 'MouseX2 x2', 'Space x2', 'Shift+G', 'Control+G', 'F1', 'Tab', 'A']);
  for (const t of TOUCHES.filter((x) => x.id !== 'Win')) assert.match(comboDe(t.id).combo, /^[A-Za-z0-9]+$/, t.id);
});

test('chaque action qui prend un raccourci a sa commande du jeu', () => {
  const sansCommande = Object.keys(ACTIONS).filter((a) => !ACTIONS[a].grille && !ACTIONS[a].seulementGroupe && !COMMANDES[a]);
  assert.deepEqual(sansCommande, []);
});
