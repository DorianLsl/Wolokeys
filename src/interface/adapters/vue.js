// La vue choisie est retenue par le navigateur quand il le permet (V9).
export function lireVue() {
  try {
    return localStorage.getItem('vue') === 'manette' ? 'manette' : 'main';
  } catch {
    // Stockage indisponible : la vue par défaut.
    return 'main';
  }
}

export function retenirVue(vue) {
  try {
    localStorage.setItem('vue', vue);
  } catch {
    // Stockage indisponible : la vue n'est pas retenue.
  }
}
