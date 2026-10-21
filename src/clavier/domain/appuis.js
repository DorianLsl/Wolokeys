import { toucheDe, raccourciDe } from './touches.js';
import { estDouble } from './raccourcis.js';

// Le navigateur signale ces touches comme tenues : seules, elles ne comptent qu'au relâchement, sans autre touche entre-temps.
const RELACHEMENT_SEUL = ['Maj', 'Ctrl', 'Alt', 'Win'];

export const AUCUN_APPUI = { seule: null, souris: null, dernier: null };

// Lit un événement du clavier ou de la souris : rend l'état suivant et le raccourci à envoyer, ou null.
export function lireAppui(etat, ev) {
  if (ev.type === 'appui') return appui(etat, ev);
  if (ev.type === 'relache') return relache(etat, ev);
  if (ev.type === 'bouton') return bouton(etat, ev);
  if (ev.type === 'boutonRelache') return boutonRelache(etat, ev);
  // Retour arrière ou fenêtre quittée : une touche encore tenue ne doit pas se changer en raccourci après coup.
  return { etat: AUCUN_APPUI, raccourci: null };
}

const maintenuesDe = (etat, ev) => [etat.souris && etat.souris.id, ...ev.maintenues].filter((t) => t && t !== ev.touche);

function envoyer(etat, raccourci, temps) {
  const appuiLu = { raccourci, temps };
  const double = estDouble(etat.dernier, appuiLu);
  return { etat: { ...etat, dernier: double ? null : appuiLu }, raccourci: double ? `${raccourci} x2` : raccourci };
}

function appui(etat, ev) {
  // Une touche inconnue avec Ctrl, Maj, Alt ou Win est un raccourci du navigateur (zoom, recherche) : on la laisse.
  if (!toucheDe(ev.touche) && maintenuesDe(AUCUN_APPUI, ev).length) return { etat, raccourci: null };
  const maintenues = maintenuesDe(etat, ev);
  const souris = etat.souris && { ...etat.souris, utilisee: true };
  if (RELACHEMENT_SEUL.includes(ev.touche) && !maintenues.length) return { etat: { ...etat, souris, seule: ev.touche }, raccourci: null };
  return envoyer({ ...etat, souris, seule: null }, raccourciDe(ev.touche, maintenues), ev.temps);
}

function relache(etat, ev) {
  if (ev.touche !== etat.seule) return { etat, raccourci: null };
  return envoyer({ ...etat, seule: null }, ev.touche, ev.temps);
}

function bouton(etat, ev) {
  const maintenues = maintenuesDe(etat, ev);
  if (!maintenues.length) return { etat: { ...etat, seule: null, souris: { id: ev.touche, utilisee: false } }, raccourci: null };
  const souris = etat.souris && { ...etat.souris, utilisee: true };
  return envoyer({ ...etat, seule: null, souris }, raccourciDe(ev.touche, maintenues), ev.temps);
}

function boutonRelache(etat, ev) {
  if (!etat.souris || etat.souris.id !== ev.touche) return { etat, raccourci: null };
  const seul = !etat.souris.utilisee;
  const sansSouris = { ...etat, souris: null };
  return seul ? envoyer(sansSouris, ev.touche, ev.temps) : { etat: sansSouris, raccourci: null };
}
