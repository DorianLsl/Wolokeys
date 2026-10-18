# aoe-keybinds — où on en est

## Produit (mots du porteur, 2026-10-14)
Aider un débutant Age of Empires IV à paramétrer ses raccourcis avant de
lancer le jeu. Configuration étape par étape en simulant un build order simple
avec les Anglais, en 1c1, jusqu'au dernier âge. À chaque étape une suggestion,
qui se raffine selon les choix de l'utilisateur et suit une vraie logique :
en priorité « le clavier comme une manette » (main gauche en posture de base,
une touche de référence par doigt) ; aussi possibles : une ligne du clavier
par concept du jeu, privilégier les groupes de contrôle. D'autres logiques
pourront apparaître ou cohabiter.

## À retenir
- Plus tard, tirer parti du fichier de profil du jeu dans
  `Documents/My Games/Age of Empires IV/keyBindingProfiles` (porteur, Q7).

## État
Phase 1. P1 v9 publié au même lien : https://claude.ai/artifact/A8HcDtcjL1LRjykGCzSKA9
(`prototypes/p1-pas-a-pas.html`). Partie générique jusqu'à l'âge IV, avec les
conventions des joueurs reconnus : armée par rôle en groupes 1 à 3, siège 4,
centres-villes 5, production 6 à 0 ; 20 raccourcis à régler, plus 16 étapes de
grille et 17 entraînements en mode entraînement. P1 v9 : logique de chaque
suggestion visible, groupes adaptatifs par bloc (armée, bâtiments).

## Retours du porteur sur P1 v1
- Ajouter « ignorer pour l'instant cette étape ». Si ce raccourci est
  redemandé plus tard, tenir compte des raccourcis définis entre-temps pour
  proposer une meilleure suggestion que la ou les précédentes.
- Garder la logique de la grille du jeu : centre-ville sélectionné,
  « Produire un villageois » reste sur A en première intention.

## Retours du porteur sur P1 v2
- Un villageois doit être sélectionné au préalable pour construire le Conseil
  (corrigé dans le texte de l'étape).
- Distinguer les raccourcis nécessaires au build order des « extra ».
  Retrouver un villageois inactif est un extra : dans un build order parfait,
  aucun villageois n'est inactif.

## Réponses et retours du porteur (tour build order / extra)
- Q1 oui : étiquette « Build order » ou « Extra » sur chaque étape,
  récapitulatif en deux parties, extras présentés comme des imprévus à leur
  moment.
- Prévoir les allers-retours de caméra entre les ouvriers et l'éclaireur, qui
  ne doit jamais arrêter de fouiller la carte pour retrouver des moutons.
- À chaque étape, écouter les touches du clavier et les deux boutons de la
  souris. Une touche appuyée autre que celle proposée devient le choix.
- Code couleur sur le clavier dessiné : une couleur pour les touches déjà
  assignées qui provoqueraient un conflit en jeu ; une couleur spécifique par
  suggestion, avec son explication au survol de la souris.

## Réponses du porteur (tour éclaireur, souris, couleurs)
- Dire « partie optimisée » au lieu de « build order ».
- Avant la simulation, demander : les touches de référence de chaque doigt de
  la main gauche ; groupes de contrôle (l'éclaireur est assigné à un groupe)
  ou touche dédiée pour sélectionner l'éclaireur (demander alors la touche
  qui centre la caméra sur l'élément sélectionné).
- Q2 : pas d'entraînement du geste à la souris, le villageois est considéré
  comme déjà sélectionné.
- Q3 oui, Q4 oui.
- Q5 : pas d'adaptation aux téléphones.

## Retours du porteur sur P1 v3
- Mouse 4 et Mouse 5 doivent pouvoir être des touches de référence.
- Abandonner la question « groupes de contrôle ou touche dédiée » : détection
  automatique. L'outil sauvegarde les groupes de contrôle créés au fur et à
  mesure (Ctrl + chiffre 0 à 9 crée ou attribue la sélection à un groupe) et
  l'élément actuellement sélectionné. À la demande de sélection de
  l'éclaireur, l'utilisateur peut créer son groupe à ce moment-là, puis
  enchaîner avec l'appui sur le bon chiffre.

## Retours du porteur sur P1 v4
- Détecter une touche maintenue : par exemple Mouse 4 + 1, comme si Mouse 4
  remplaçait Ctrl. Les touches à l'origine de combinaisons possibles : Alt,
  Mouse 4, Mouse 5, Ctrl et Maj.
- Détecter les doubles appuis : par exemple assigner la sélection de tous les
  villageois inactifs à « ² x2 ».

## Retours du porteur sur P1 v5
- Interface : minimiser le texte ; plus visuel, ludique, intuitif.
- Affiner les suggestions : en priorité un raccourci qui ne fait bouger aucun
  doigt de sa touche de référence, en profitant des combinaisons et des
  doubles appuis pour éviter les conflits tout en gardant les doigts immobiles.

## Réponses du porteur (tour avant P1 v6)
- Q1 oui : le menu du jeu accepte Alt + touche, Maj + touche, Mouse 4 seul,
  Mouse 4 tenu + touche, le double appui ; Mouse 5 aussi.
- Q2 : pas besoin du logiciel de la souris.
- Q3 : ne pas raisonner par ordre de préférence mais par logique ; par
  exemple, tous les doubles appuis font des actions similaires.
- Q4 : les touches de la grille peuvent être combinées avec Alt, Mouse 4 et
  Mouse 5.
- « Centrer la caméra » garde sa propre touche, de préférence Espace, en plus
  du centrage par double appui sur un groupe de contrôle.
- Ne pas tout baser sur la posture Q S D F : l'algorithme s'adapte aux
  premiers choix de l'utilisateur.

- Oui à tout : une famille d'actions = une mécanique, apprise au premier
  choix ; familles caméra (touche de repos du pouce), sélectionner un élément,
  sélectionner tous ; groupes en second choix (Ctrl + chiffre) ; interfaces
  « main posée » et « manette » commutables ; moins de texte, étoiles
  d'immobilité.

## Retours du porteur sur P1 v6 (avant test)
- Passer l'étape d'un clic de souris : la meilleure suggestion est
  pré-sélectionnée, et c'est elle qui est choisie quand on passe (fait :
  bouton Suivant).
- Mouse 4 + R (index sur R) affiché seul sans pré-sélection : c'était une
  étape d'entraînement ; Suivant y fait maintenant la séquence restante.

## Nouvelle demande (après P1 v6)
- Ignorer une étape = ne pas lui assigner de raccourci ; l'étape ignorée
  réapparaît à la toute fin de la simulation comme un extra, avec une
  suggestion optimisée.
- Réponses : garder « Plus tard » et ajouter « Ne pas utiliser ce
  raccourci » ; 2 à 4 non répondues, recommandations appliquées (allers-retours
  dépendants sautés ; laissée de côté deux fois = sans raccourci ; classée en
  extra). Fait dans P1 v6.

## Test de P1 v6
- Testé par le porteur : OK.

## Réponses du porteur (questions ouvertes après P1 v6)
- « Affiner les suggestions selon les choix » et « logiques une ligne par
  concept / groupes de contrôle » s'analysent ensemble.
- Import et export du profil `keyBindingProfiles` : après validation d'une
  v1 de la phase 2. QWERTY aussi : AZERTY seulement jusqu'à cette v1.
- Simuler jusqu'à l'âge IV : oui.

## Réponses du porteur (questions avant P1 v7)
1. Non : la partie optimisée doit rester assez générique pour convenir à
   n'importe quelle civilisation.
2. Oui : âge I recalé sur les sources.
3. Un interrupteur « mode entraînement » dans l'interface ; en mode
   entraînement, tous les moments sont gardés.
4. Priorité aux raccourcis qui ciblent directement ce à quoi le joueur pense
   en partie ; les raccourcis proposés (mode « manette ») suivent toujours une
   logique avec le jeu.
5. Oui (logique par domaine au premier raccourci militaire), mais « tout
   sélectionner » sur l'armée est très déconseillé (attaque sur deux flancs).
6. Oui : caméra sur Espace, alerte sur Espace x2.
7. Oui : entraînements boucle de production et attaque.
8. Dès qu'on peut produire une unité, Maj + touche = file de 5. Bâtiments
   des villageois : image du porteur en QWERTY
   (`recherche/grille-batiments-qwerty.jpg`), à traduire en AZERTY.

## Grille du porteur en AZERTY (menu d'âge, puis bâtiment)
- Âge I (A) : A maison, Z moulin, E camp de bûcherons, R camp de mineurs ;
  Q ferme, S caserne, D quai ; W avant-poste, X palissade, C porte.
- Âge II (Z) : A forge, Z marché, E forum ; Q champ de tir, S écurie ;
  W tour, X mur, C porte de pierre.
- Âge III (E) : A monastère, Q atelier de siège, W donjon.
- Âge IV (R) : A université, W merveille.
- Monument de chaque âge : T. Unités : Maj + touche = file de 5 ; caserne :
  lancier A, homme d'armes B ; écurie : cavalier A ; atelier de siège :
  espringale A ; centre-ville : villageois A.

## Réponses du porteur (guides des joueurs, avant P1 v8)
1. Oui : bâtiments de production en groupes de contrôle, « tous les X » en
   second choix.
2. Oui : armée par rôle (mêlée, distance, cavalerie) et siège.
3. Les guides sont en QWERTY : les traduire (mêmes touches physiques).
4. Oui : « éclaireur suivant ».
5. Oui : garder Espace pour la caméra et Mouse 4 en touche maintenue.
6. Non : pas besoin de rappeler les pros dans l'application.
7. Ajouter le point de ralliement commun et « annuler la dernière unité », et
   ne pas laisser de côté les religieux (bâtiments religieux compris).

## Retours du porteur sur P1 v8
- Améliorer l'affichage des suggestions.
- Plus adaptatif : si l'utilisateur met lui-même un bâtiment sur le groupe 4,
  les suivants vont au plus près de 4.
- Faire comprendre le lien entre la suggestion et la logique derrière.

- Réponses : oui à tout (carte de la suggestion avec sa logique visible, lien
  sur le clavier, groupes adaptatifs par bloc armée / bâtiments). Rappel du
  porteur : l'objectif est d'utiliser les bonnes pratiques des pros tout en
  privilégiant une posture où les doigts ne quittent jamais leur touche de
  référence.

## Réponses du porteur (logique par domaine, double appui, après P1 v9)
- Penser aussi au double appui (x2) pour la logique par domaine.
- Double appui sur une touche hors repos : seulement s'il n'y a vraiment plus
  d'autre possibilité.
- Une suggestion se juge à son intuitivité pour le joueur, pas au fait qu'un
  doigt bouge ou non.
- Une touche de la grille n'entre en conflit que si un élément est
  sélectionné ; en déplacement libre (rien de sélectionné), les touches de la
  grille ne sont pas des touches de grille.
- Intuitivité : combiner la position de l'élément dans la grille du jeu, la
  mécanique de la famille, une touche qui rappelle le nom et les conventions
  des joueurs reconnus.
- Partir du principe qu'un élément est toujours sélectionné (Échap
  désélectionne rapidement).
- L'indication par étoiles reste, mais elle devient le repère d'intuitivité.
- Double appui, sur n'importe quelle touche, en dernier recours seulement.
- Oui : calculer les deux logiques (concept, domaine), les étoiles
  départagent ; touche maintenue pour l'économie comme pour le militaire.
- Oui : retirer la question ouverte « Âges II à IV ».
- Alerte sur Espace x2 : on garde l'exception.
- « Touche qui rappelle le nom » : pourquoi, alors qu'on privilégie de ne
  pas bouger les doigts ?
- Ne pas compter le consensus des joueurs reconnus dans les étoiles.
- Touche maintenue de l'économie sur l'autre bouton du pouce : possible, mais
  sans forcer.
- Oui aux trois changements : étoiles sur grille, famille et doigts
  immobiles (0 à 3) ; objectif sans que les doigts quittent leur touche ;
  touche de l'économie proposée sans être imposée.

## Prochaines étapes
1. Le porteur teste P1 v6 (les deux vues restent, décision du porteur).
2. Restent à vérifier en vrai : boutons latéraux, clavier AZERTY, délai du
   double appui (0,4 s), enregistrement des combinaisons dans le menu du jeu.

## Point de reprise exact
Cahier à jour pour P1 v10 (H1, H2, V9 étoiles sur 3 critères), plus de question ouverte. Suite : P1 v10.
