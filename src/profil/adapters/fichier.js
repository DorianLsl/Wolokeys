// Le profil se lit et le nouveau se télécharge dans le navigateur : rien ne part ailleurs.
export const lireFichier = (fichier) => fichier.text().catch(() => null);

// Rend le nom du fichier téléchargé, ou une erreur. La page publiée sur claude.ai passe par sa capacité
// downloads, qui refuse l'extension .rkp : le fichier y sort en .rkp.txt, à renommer.
export async function telecharger(nom, texte) {
  const downloads = window.claude ? await window.claude.use('downloads') : null;
  if (downloads) {
    const fichier = `${nom}.rkp.txt`;
    return downloads.save({ filename: fichier, data: texte })
      .then(() => ({ fichier }), (e) => ({ erreur: e.code === 'declined' ? 'Export annule.' : 'Telechargement impossible ici.' }));
  }
  const lien = document.createElement('a');
  lien.href = URL.createObjectURL(new Blob([texte], { type: 'text/plain' }));
  lien.download = `${nom}.rkp`;
  lien.click();
  // Libérée après le clic, quand le téléchargement est lancé.
  setTimeout(() => URL.revokeObjectURL(lien.href));
  return { fichier: lien.download };
}
