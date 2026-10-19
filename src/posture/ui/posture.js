import { etapePosture, toucheSuggeree, postureDe } from '../domain/posture.js';

const $ = (id) => document.getElementById(id);

export function afficherPosture(historique) {
  const doigt = etapePosture(historique);
  if (doigt) {
    $('titre').textContent = 'Avant la partie';
    $('question').textContent = doigt === 'pouce droit' ? 'Main sur la souris : quel bouton latéral ?' : `Main gauche posée : où repose ton ${doigt} ?`;
    $('suggestion').textContent = toucheSuggeree(historique);
  }
  $('posture').replaceChildren(...Object.entries(postureDe(historique)).map(([d, t]) => {
    const li = document.createElement('li');
    li.textContent = `${d} : ${t}`;
    return li;
  }));
}
