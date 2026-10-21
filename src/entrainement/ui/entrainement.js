const $ = (id) => document.getElementById(id);

// Les appuis déjà faits restent cochés jusqu'à la fin de la séquence ou une erreur (V4).
export function afficherSequence(sequence, appuis) {
  $('sequence').replaceChildren(...(sequence || []).map((appui, i) => {
    const li = document.createElement('li');
    li.textContent = appui;
    li.classList.toggle('fait', i < appuis.length);
    return li;
  }));
}
