# Wolokeys

Aide un débutant d'Age of Empires IV à régler ses raccourcis avant de jouer.
Une partie simulée, de l'avant-partie à une attaque à l'âge IV, demande
chaque action au moment où le joueur en a besoin et propose une suggestion
qui suit ses premiers choix. À la fin, les raccourcis réglés s'exportent dans
un nouveau profil du jeu.

Clavier AZERTY seulement pour l'instant ; pensé pour un ordinateur.
Fichiers statiques : HTML, CSS et modules ES, sans build ni dépendance.

## Lancer en local

Les modules ES demandent un serveur, même local :

```sh
python3 -m http.server   # n'importe quel serveur statique convient
```

Puis ouvrir `http://localhost:8000/`. Tests (Node 22) : `npm test`.

## Héberger

Netlify, offre gratuite : créer un site depuis son fork. `netlify.toml` lance
les tests et publie le site seulement s'ils passent. Aucun compte, secret ni
réglage n'est nécessaire en dehors de Netlify.

## Exporter vers le jeu

Dans le récapitulatif, « Exporter vers mon profil du jeu » lit un profil de
`Documents/My Games/Age of Empires IV/keyBindingProfiles` et télécharge un
nouveau profil à déposer dans ce même dossier. Le fichier ne quitte pas le
navigateur.

## Contribuer

Voir [CONTRIBUTING.md](CONTRIBUTING.md).

## Licence

[MIT](LICENSE).
