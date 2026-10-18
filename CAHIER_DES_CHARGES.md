# Cahier des charges aoe-keybinds

> Document vivant. Une exigence n'entre dans « Validé » qu'après un test réel
> sur un prototype et la confirmation du porteur.

**Objectif** : utiliser les bonnes pratiques des joueurs reconnus, en
privilégiant des suggestions intuitives pour le joueur, à partir de sa
posture de référence.

## Validé
- V1. Le principe « situation de jeu → touche proposée → j'accepte ou je
  change » est le bon. *(retour P1 v1)*
- V2. Avant la partie, l'utilisateur choisit une touche de référence pour
  chaque doigt de la main gauche (suggestion Q S D F Espace) et une pour le
  pouce droit (Mouse 4 ou Mouse 5). Les suggestions se calculent à partir de
  cette posture.
- V3. Les actions « à tout moment » vont hors de la grille du jeu, et toutes
  les touches de la grille (A Z E R, Q S D F, W X C V, T) restent au jeu ;
  elles peuvent toutefois se combiner avec Alt, Mouse 4 ou Mouse 5 (ni Ctrl,
  ni Maj).
- V4. Mode grille uniquement dans la première version : les raccourcis de la
  grille du jeu sont fixes ; l'étape le dit et fait faire la séquence pour
  s'entraîner, le villageois étant considéré comme déjà sélectionné. Suivant
  passe l'entraînement (grille et allers-retours) en faisant la séquence à la
  place de l'utilisateur.
- V5. Ignorer pour l'instant (Échap) n'est pas un refus et ne concerne que
  les actions hors grille : l'action revient au prochain moment où la partie
  en a besoin, avec une suggestion recalculée à partir des raccourcis validés
  entre-temps. Une action encore ignorée à la fin de l'âge apparaît « à
  définir ».
  « Ne pas utiliser » n'assigne aucun raccourci : l'action et les
  allers-retours qui en dépendent sont sautés, puis elle revient en extra au
  rattrapage de fin de partie, avec une suggestion ; laissée de côté une
  seconde fois, elle reste sans raccourci.
- V6. Toutes les touches du clavier, plus Mouse 4 et Mouse 5, sont écoutées
  à chaque étape. La touche suggérée est acceptée, une autre devient le choix
  sauf conflit, et Retour arrière revient à l'étape précédente.
- V7. Groupes de contrôle détectés automatiquement : modificateur + chiffre,
  à toute étape, met la sélection actuelle dans ce groupe. L'outil suit la
  sélection et les groupes, proposés en second choix. La caméra a toujours sa
  propre touche, la touche de repos du pouce (Espace par défaut), en plus du
  centrage par les groupes ; les allers-retours entre l'éclaireur et les
  ouvriers se font en entraînement. L'alerte prend la touche de la caméra en
  double appui (Espace x2), seule exception au conflit entre touche seule et
  double appui.
- V8. Chaque raccourci est classé « partie optimisée » ou « extra » ; les deux
  actions sur les villageois inactifs sont des extras. Chaque étape porte son
  étiquette, et le récapitulatif a deux tableaux.
- V9. Interface visuelle : icônes, situation en 8 mots au plus, étoiles
  d'intuitivité, geste suggéré animé, et deux vues
  au choix de l'utilisateur, « main posée » (clavier dessiné) et « manette »,
  commutables d'un clic. Les étoiles comptent un point par critère rempli
  parmi quatre : position de l'élément dans la grille du jeu, mécanique de
  la famille, touche qui rappelle le nom, conventions des joueurs reconnus
  (3 étoiles = 3 ou 4 critères, 2 = 2, 1 = 0 ou 1).
- V10. Combinaisons (Alt, Maj, Ctrl, Mouse 4 ou Mouse 5 maintenu, plus une
  touche) et doubles appuis (deux appuis en moins de 0,4 seconde), acceptés
  par le menu du jeu d'après le porteur. La touche de création de groupe est
  celle utilisée pour le premier groupe. Une touche ne peut pas servir à la
  fois seule et comme modificateur, ni seule et en double appui pour deux
  actions différentes. Un double appui, sur n'importe quelle touche, n'est
  suggéré qu'en dernier recours.
- V11. Une famille d'actions (caméra ; sélectionner un élément ; sélectionner
  tous) garde la mécanique de son premier raccourci. Le double appui et chaque
  touche maintenue n'appartiennent qu'à une famille, et une touche
  maintenable n'est jamais suggérée seule.
- V12. La meilleure suggestion est pré-sélectionnée ; un clic en sélectionne
  une autre ; Suivant valide la sélection.
  *(P1 v6)*
- V13. Partie générique (aucune civilisation ni monument nommé) jusqu'à une
  attaque à l'âge IV ; Maj + touche d'unité = file de 5.
- V14. Un interrupteur « Entraînement », désactivé par défaut, ajoute la
  grille et les entraînements ; sans lui, seules restent les étapes qui
  règlent un raccourci.
- V15. Conventions des joueurs reconnus, traduites en AZERTY : armée par rôle
  sur les groupes 1 à 3, siège 4, centres-villes 5, production 6 à 0 ; la
  production passe par un groupe d'abord, « tous les X » ensuite ; jamais
  « toute l'armée ».
- V16. Au premier raccourci militaire, une touche maintenue réservée au
  militaire est proposée ; la choisir active la logique par domaine.
- V17. Actions tirées des guides : éclaireur suivant, point de ralliement
  commun, annuler la dernière unité, moine suivant (religieux compris).
- V18. La suggestion choisie s'affiche en grande carte, avec sa logique
  visible et les touches de l'action qui l'inspire entourées.
- V19. Les groupes de contrôle s'adaptent par bloc (armée, bâtiments) : au
  plus près du dernier groupe du bloc, sinon au numéro habituel.
  *(P1 v9)*
## Rejeté
## Hypothèses en test
### P1 v10 — logique par domaine, étoiles d'intuitivité (`prototypes/p1-pas-a-pas.html`)
- H1. Les logiques par concept et par domaine sont calculées toutes les deux ;
  les étoiles les départagent et le premier choix de l'utilisateur fixe sa
  logique. La mécanique de la famille s'entend dans la logique choisie.
- H2. Au premier raccourci économique, une touche maintenue réservée à
  l'économie est proposée, comme pour le militaire (V16).
## Hors périmètre de la première version
- Quitter le mode grille (changer un raccourci fixé par la grille du jeu).
- Les téléphones.
- L'entraînement des gestes à la souris (clic).
- Après validation d'une v1 de la phase 2 : import et export du profil
  `Documents/My Games/Age of Empires IV/keyBindingProfiles`, QWERTY (AZERTY
  seulement d'ici là), sauvegarde, autres civilisations.
## Questions ouvertes
## Historique des prototypes
| # | Question | Fichier | Verdict |
|---|---|---|---|
| P1 v1 | Principe pas à pas | `prototypes/p1-pas-a-pas.html` | Retours : ignorer une étape, grille du jeu d'abord |
| P1 v2 | Grille fixe avec entraînement, étape ignorable | `prototypes/p1-pas-a-pas.html` | Retours : Conseil avec un villageois sélectionné, partie optimisée et extras, éclaireur, touches écoutées, couleurs |
| P1 v3 | Avant-partie, éclaireur, souris, couleurs | `prototypes/p1-pas-a-pas.html` | Retours : souris en touche de référence, groupes détectés automatiquement |
| P1 v4 | Groupes détectés, souris en référence, couleurs par type | `prototypes/p1-pas-a-pas.html` | Retours : touches maintenues (combinaisons), doubles appuis |
| P1 v5 | Combinaisons, doubles appuis | `prototypes/p1-pas-a-pas.html` | Retours : moins de texte, doigts immobiles |
| P1 v6 | Doigts immobiles par famille, interface visuelle | `prototypes/p1-pas-a-pas.html` | Validé |
| P1 v7 | Partie générique jusqu'à l'âge IV, mode entraînement | `prototypes/p1-pas-a-pas.html` | Retours : conventions des joueurs reconnus |
| P1 v8 | Conventions des joueurs (groupes par rôle, production en groupes) | `prototypes/p1-pas-a-pas.html` | Retours : affichage, groupes adaptatifs, logique visible |
| P1 v9 | Logique visible, groupes adaptatifs | `prototypes/p1-pas-a-pas.html` | Validé |
