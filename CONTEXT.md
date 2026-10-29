# Wolokeys

Outil qui aide un débutant d'Age of Empires IV à régler ses raccourcis avant
de jouer, en simulant une partie où chaque action arrive quand le joueur en a
besoin.

## Partie simulée

**Partie simulée** :
Partie générique, de l'avant-partie à une attaque à l'âge IV, sans
civilisation ni monument nommé.
_Éviter_ : build order

**Moment** :
Point daté de la partie simulée où une action ou un entraînement est demandé.

**Étape** :
Ce que l'outil demande à l'utilisateur à un moment : une touche de référence,
un raccourci ou un entraînement.

**Entraînement** :
Séquence d'appuis à refaire pour en prendre l'habitude : celle de la grille du
jeu ou un enchaînement ; présent seulement avec l'interrupteur Entraînement.

**Enchaînement** :
Entraînement sur des raccourcis déjà réglés, comme « 5 lanciers ».

**Aller-retour** :
Enchaînement qui déplace la caméra, comme « Voir l'éclaireur ».

**Avant-partie** :
Les étapes qui fixent la posture, avant le premier moment de jeu.

**Rattrapage** :
Dernière étape de la partie, qui redemande les actions marquées « Ne pas
utiliser ».

**Partie optimisée** :
Les actions dont une partie sans imprévu a besoin.

**Extra** :
Action utile seulement face à un imprévu, comme les villageois inactifs.

## Clavier et souris

**Posture** :
La touche de référence de chaque doigt de la main gauche et du pouce droit.

**Touche de référence** :
Touche où repose un doigt ; Mouse 4 (bouton latéral arrière) ou Mouse 5
(bouton latéral avant) pour le pouce droit.
_Éviter_ : touche de repos

**Grille du jeu** :
Commandes fixées par le jeu sur A Z E R, Q S D F, W X C V et T, selon
l'élément sélectionné.

**Mécanique** :
Façon d'appuyer : touche seule, double appui, ou combinaison avec une touche
maintenue donnée.

**Touche maintenue** :
Alt, Maj ou Ctrl, tenue pendant l'appui d'une autre touche ; le jeu refuse
de tenir Mouse 4 ou Mouse 5.
_Éviter_ : modificateur

**Double appui** :
Deux appuis sur la même touche en moins de 0,4 seconde.

**Combinaison** :
Une touche maintenue plus une autre touche, Mouse 4 ou Mouse 5 compris.

**Raccourci** :
Ce qui déclenche une action : une touche seule, un double appui ou une
combinaison.

**Conflit** :
Raccourci qui déclencherait aussi une autre action en jeu.

**Groupe de contrôle** :
Chiffre de 1 à 0 qui rappelle la sélection qu'on y a mise.
_Éviter_ : groupe

**Touche de création de groupe** :
Touche maintenue utilisée pour le premier groupe de contrôle, seule admise
ensuite.

**Bloc** :
Ensemble de groupes de contrôle rangés côte à côte : l'armée, les bâtiments.

## Actions

**Action** :
Ce que le joueur demande au jeu et qui peut recevoir un raccourci.

**Élément** :
Ce que vise une action : un type d'unité ou de bâtiment, un rôle, la base ou
la caméra.

**Rôle** :
Élément de l'armée qui réunit des unités et leur bâtiment : infanterie,
distance, cavalerie, siège.
_Éviter_ : mêlée

**Concept** :
Ce que vise une action quand ce n'est pas un élément : un état (inactif), un
ensemble (tous les bâtiments militaires) ou un ordre (annuler). Un concept peut
avoir sa touche, comme un élément.

**Inactifs** :
Unités qui ne font rien : les villageois, unités économiques, ou les
militaires ; dans le jeu, chacun a « prochain » et « tous ». Les villageois
inactifs ont une touche partagée par « prochain » et « tous ».

**Verbe** :
Ce que fait une action sur ce qu'elle vise : prochain, tous sur la carte, tous
à l'écran, ou centrer la caméra.

**Domaine** :
Économie ou militaire.

## Suggestions

**Suggestion** :
Raccourci ou groupe de contrôle proposé pour l'action de l'étape.

**Logique** :
Façon de regrouper les actions en familles pour les suggestions : par verbe,
par domaine ou par rôle.
_Éviter_ : logique par concept, logique par geste

**Mécanique habituelle** :
Mécanique proposée d'abord au premier raccourci d'un verbe, celle des
touches par défaut du jeu : prochain sur la touche seule (Échap + touche sur
la grille), tous sur la carte sur Ctrl, tous à l'écran sur Alt.

**Famille** :
Actions qu'une logique regroupe et qui gardent la mécanique de leur premier
raccourci.

**Étoiles** :
Intuitivité d'un raccourci, de 0 à 4 : une par critère rempli parmi place
dans la grille, mécanique de la famille, doigts immobiles, même touche que
l'élément.

**Matrice** :
Tableau des raccourcis réglés, qui se remplit au fil des choix : par touche
(une ligne par mécanique, une colonne par touche) ou par verbe (une ligne par
verbe, une colonne par élément). La suggestion pré-sélectionnée en suit
d'abord la case : la ligne de sa famille, la colonne de son élément.

**Dernier recours** :
Touches F, Échap plus une touche de la grille, double appui : proposés
seulement en cas de gros manque d'intuitivité, sauf Échap plus une touche de
la grille pour prochain.

## Choix de l'utilisateur

**Plus tard** :
Choix qui laisse une action sans raccourci pour l'instant ; elle revient au
prochain moment qui en a besoin.
_Éviter_ : ignorer pour l'instant, passer

**Ne pas utiliser** :
Choix qui laisse une action sans raccourci pour la partie ; elle revient en
extra au rattrapage.
_Éviter_ : laisser de côté, refuser

## Profil du jeu

**Profil** :
Fichier `.rkp` où le jeu garde les raccourcis d'un joueur ; l'export en
crée un nouveau à partir de celui de l'utilisateur.

**Commande** :
Nom interne d'une action dans le profil, comme `pick_next_town` ; elle a
deux places pour une combinaison.
