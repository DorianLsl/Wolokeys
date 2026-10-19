import { ACTIONS, MOMENTS } from '../domain/donnees.js';
import { estExtra, ageA } from '../domain/partie.js';

const $ = (id) => document.getElementById(id);

export function afficherPartie(historique, etape) {
  if (!etape) {
    $('titre').textContent = 'Partie terminée';
    $('question').textContent = 'Fin de la partie simulée.';
    return;
  }
  const moment = MOMENTS[etape.moment];
  $('titre').textContent = `${moment.heure} · Âge ${ageA(etape.moment)}`;
  $('etiquette').textContent = estExtra(historique, etape.action) ? 'Extra' : 'Partie optimisée';
  $('action').textContent = ACTIONS[etape.action].nom;
  $('question').textContent = moment.situation;
}
