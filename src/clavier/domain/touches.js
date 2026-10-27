export const CHIFFRES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

// Le code nomme la touche physique en QWERTY ; l'id est la lettre imprimée en AZERTY, celle que voit le joueur.
export const TOUCHES = [
  { id: 'Échap', rangee: 0, code: 'Escape', reservee: 'Echap : menu du jeu.' },
  ...Array.from({ length: 12 }, (_, i) => ({ id: `F${i + 1}`, rangee: 0, code: `F${i + 1}` })),
  { id: '²', rangee: 1, code: 'Backquote' },
  ...CHIFFRES.map((id) => ({ id, rangee: 1, code: 'Digit' + id, reservee: 'Chiffres : groupes de controle.' })),
  { id: 'Tab', rangee: 2, largeur: 1.5, code: 'Tab' },
  ...'AZERT'.split('').map((id, i) => ({ id, rangee: 2, code: 'Key' + 'QWERT'[i], grille: true })),
  { id: 'Verr.Maj', rangee: 3, largeur: 1.75, code: 'CapsLock', reservee: 'Verr.Maj : majuscules.' },
  ...'QSDF'.split('').map((id, i) => ({ id, rangee: 3, code: 'Key' + 'ASDF'[i], grille: true })),
  { id: 'G', rangee: 3, code: 'KeyG' },
  { id: 'Maj', rangee: 4, largeur: 1.25, code: 'ShiftLeft', reservee: 'Maj seule : enchainer les ordres.' },
  { id: '<', rangee: 4, code: 'IntlBackslash' },
  ...'WXCV'.split('').map((id, i) => ({ id, rangee: 4, code: 'Key' + 'ZXCV'[i], grille: true })),
  { id: 'B', rangee: 4, code: 'KeyB' },
  { id: 'Ctrl', rangee: 5, largeur: 1.25, code: 'ControlLeft', reservee: 'Ctrl seul : en combinaison seulement.' },
  { id: 'Win', rangee: 5, largeur: 1.25, code: 'MetaLeft', reservee: 'Win : menu Windows.' },
  { id: 'Alt', rangee: 5, largeur: 1.25, code: 'AltLeft' },
  { id: 'Espace', rangee: 5, largeur: 3.5, code: 'Space' },
  // Le bouton du navigateur : 3 est l'arrière (MouseX1 dans le jeu), 4 l'avant.
  { id: 'Mouse 4', souris: true, bouton: 3 },
  { id: 'Mouse 5', souris: true, bouton: 4 },
];

export const toucheDe = (id) => TOUCHES.find((t) => t.id === id);

// Une touche hors du clavier dessiné garde son code, que lireRaccourci refuse : le pavé numérique n'est pas la rangée des chiffres.
export const toucheDuCode = (code) => (TOUCHES.find((t) => t.code === code) || { id: code }).id;
export const toucheDuBouton = (bouton) => (TOUCHES.find((t) => t.bouton === bouton) || { id: null }).id;

// Centre de chaque touche en largeurs de touche, pour mesurer de combien un doigt se déplace.
export const POSITIONS = Object.fromEntries([0, 1, 2, 3, 4, 5].flatMap((rangee) => {
  let x = 0;
  return TOUCHES.filter((t) => t.rangee === rangee).map((t) => {
    x += t.largeur || 1;
    return [t.id, { x: x - (t.largeur || 1) / 2, rangee }];
  });
}));

// Forme écrite d'un raccourci : 'G', 'Mouse 4', 'Alt + G' ou '² x2'.
export function lireRaccourci(texte) {
  const parties = texte.split(' + ');
  if (parties.length > 2) return { erreur: 'Une seule touche maintenue.' };
  const [premier, second] = parties;
  const touche = (second || premier).replace(/ x2$/, '');
  const maintenue = second ? premier : null;
  if (!toucheDe(touche) || (maintenue && !toucheDe(maintenue))) return { erreur: 'Touche inconnue.' };
  return { maintenue, touche, double: / x2$/.test(texte) };
}

export const raccourciDe = (touche, tenues) => [...tenues, touche].join(' + ');

// Les messages restent en ASCII simple, même quand ils citent une touche comme ² ou Échap.
export const ascii = (texte) => texte.normalize('NFD').replace(/\p{M}/gu, '').replace(/²/g, 'carre').replace(/[^\x20-\x7e]/g, '?');
