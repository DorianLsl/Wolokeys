import { ACTIONS, ENCHAINEMENTS, MOMENTS } from '../domain/donnees.js';
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
  $('etiquette').textContent = etiquette(historique, etape);
  $('action').textContent = etape.enchainement ? ENCHAINEMENTS[etape.enchainement].nom : ACTIONS[etape.action].nom;
  $('question').textContent = moment.situation;
}

function etiquette(historique, etape) {
  if (etape.type === 'grille') return 'Grille du jeu, fixe';
  if (etape.type === 'enchainement') return 'Entraînement';
  return estExtra(historique, etape.action) ? 'Extra' : 'Partie optimisée';
}
