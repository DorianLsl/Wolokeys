# Journal des décisions

La plus récente en haut.

## 2026-10-20 — V8 et V26 reformulées, prochain militaire inactif
Validé par le porteur : V26 décrit le comportement gardé (concepts suivant
les mêmes logiques que les éléments, Échap + touche et touches F en dernier
recours) ; « Prochain militaire inactif » s'ajoute en extra, à 9:30 juste
avant « Militaires inactifs », sur la même touche ; V8 parle des unités
inactives, villageois et militaires.

## 2026-10-20 — Réponses du porteur aux questions des revues
Le comportement du prototype est gardé : les concepts suivent les mêmes
logiques que les éléments, Échap + touche et les touches F en dernier recours
(V26 à reformuler) ; 3 raccourcis plus le groupe de contrôle ; « inactifs » a
sa touche partagée par « prochain » et « tous » ; la touche d'un rôle reste
réservée, même prise par un autre élément, et la logique par rôle n'est jamais
écartée. L'homme d'armes passe sur Z, dans la grille de la caserne. Précision
du porteur : le villageois est une unité économique, et « prochain » existe
aussi pour les militaires inactifs.

## 2026-10-20 — La tranche interface affiche la carte, le clavier, la manette et le récapitulatif
Les icônes ne servent qu'à l'interface : la grande carte des suggestions, le
clavier dessiné, la manette et le récapitulatif s'affichent dans la tranche
interface, qui lit le domaine des autres tranches ; les anciens affichages des
suggestions et du récapitulatif sont retirés.
Pendant un raccourci redemandé, un clic sur un autre raccourci de la liste
laisse le premier tel qu'il était (V27, sans perdre le reste de la partie).

## 2026-10-19 — Groupes de contrôle : la partie aiguille, la tranche groupes calcule
La sélection actuelle dépend de l'étape en cours : elle reste dans la tranche
partie, qui aiguille touche maintenue + chiffre vers la tranche groupes et
lui passe la sélection et les raccourcis. Une action réglée par un groupe
remplacé depuis est redemandée tout de suite.

## 2026-10-19 — Double appui : il remplace le premier appui s'il a été accepté
Le second appui d'un double appui arrive après le premier, déjà traité. Le
double remplace le choix du premier appui seulement si celui-ci vient d'être
accepté ; sinon il vaut pour l'étape en cours. Un appui refusé ne laisse pas
de trace dans l'historique : la page le dit au domaine (`premierAccepte`).

## 2026-10-19 — Passage en phase 2
Plus d'hypothèse ni de question ouverte après P1 v14. Retenu de l'audit :
un seul nom par notion (CONTEXT.md), une seule forme pour toutes les
logiques, une touche inconnue refusée par le domaine avec un message. L'archer
et le moine sont sur A dans la grille de leur bâtiment de production
(porteur). Vocabulaire
unique (CONTEXT.md) : infanterie, logique par verbe (qui remplace « par
concept » et « par geste »), Plus tard, Ne pas utiliser, touche maintenue,
enchaînement.

## 2026-10-18 — Logique par rôle et touches F
A, Z, E, R (sous 1, 2, 3, 4) portent l'infanterie, la distance, la cavalerie
et le siège ; le rôle est l'élément. D'après le porteur, F1 à F12 sont
libres dans le jeu ; elles ne servent qu'en cas de gros manque
d'intuitivité, la priorité restant de peu bouger les doigts.

## 2026-10-18 — Toutes les logiques analysées
Aucune logique n'est abandonnée (par geste, par domaine, par élément) :
l'outil les connaît toutes et les analyse à chaque suggestion pour proposer
la plus intuitive (porteur).

## 2026-10-18 — Une touche par élément
D'après le porteur, dans le jeu, chaque élément a toujours « prochain »,
« tous sur la carte » et « tous à l'écran ». Une touche par élément, la
mécanique dit le verbe (combinaison de préférence, double appui en dernier
recours) ; quatrième critère d'étoile « même touche que l'élément » (0 à 4).
« Sélectionner le X » devient « Prochain X ». Infanterie, distance,
cavalerie et siège se sélectionnent à l'écran avant de créer leur groupe.

## 2026-10-18 — Suggestions jugées à leur intuitivité
Une suggestion se juge à son intuitivité pour le joueur, dont fait partie le
fait que les doigts ne quittent pas leur touche de référence. Les étoiles
deviennent le repère d'intuitivité : une par critère rempli (grille du jeu,
famille, doigts immobiles) ; ni le nom ni le consensus des joueurs n'y
comptent, les conventions (V15) restant la base des suggestions.
On part du principe qu'un élément est toujours sélectionné (Échap
désélectionne) : les touches de la grille restent au jeu, sauf après Échap. Double appui, sur
n'importe quelle touche, en dernier recours seulement. Logiques par concept
et par domaine calculées toutes les deux, départagées par les étoiles ; une
touche maintenue pour l'économie comme pour le militaire, sans l'imposer.

## 2026-10-18 — Objectif et règle « groupes appris » retirée
Objectif rappelé par le porteur : utiliser les bonnes pratiques des joueurs
reconnus en privilégiant une posture où les doigts ne quittent jamais leur
touche de référence. La règle « groupes appris » est retirée : l'armée et la
production passent déjà par un groupe d'abord, les groupes s'adaptent par
bloc (armée, bâtiments).

## 2026-10-18 — Conventions des joueurs reconnus
D'après 5 guides (BeastyQt, Valdemar1902, DEMU, Vortix, grille par défaut),
traduits en AZERTY (mêmes touches physiques) : armée par rôle en groupes 1 à
3, siège 4, puis centres-villes et bâtiments de production en groupes (5 à 0),
« tous les X » en second choix ; « éclaireur suivant » ; point de ralliement
commun, annuler la dernière unité, religieux (monastères, moine suivant).
Pas de mention des pros dans l'application. La souris garde notre logique.

## 2026-10-18 — Partie générique jusqu'à l'âge IV
La partie simulée reste générique (aucune civilisation ni monument nommé) et
va jusqu'à une attaque à l'âge IV. Raccourcis : priorité à ce que le joueur
vise (« tous les champs de tir » quand il pense « archers ») ; jamais « toute
l'armée », l'armée passe par des groupes de contrôle (flancs, siège).
Maj + touche d'unité = file de 5. Un interrupteur « entraînement » garde tous
les moments ; sans lui, seules les étapes qui règlent un raccourci restent.

## 2026-10-17 — Logiques déduites des choix
La logique de l'utilisateur se déduit de ses premiers choix, sans question au
départ. « Une ligne par concept » devient « une touche maintenue par
concept ». Une logique par domaine (militaire, économie) reste à étudier. La
partie simulée va jusqu'à l'âge IV, d'après des recherches sur la
communauté (montée au rang Platine).

## 2026-10-17 — Deux vues gardées
Les vues « main posée » et « manette » restent toutes les deux, au choix de
l'utilisateur ; on ne les départage plus.

## 2026-10-17 — Suggestions par famille, doigts immobiles
Les suggestions se calculent depuis la posture choisie, en cherchant d'abord
les raccourcis où aucun doigt ne bouge. Une famille d'actions (caméra ;
sélectionner un élément ; sélectionner tous) garde la mécanique de son premier
raccourci ; le double appui et chaque touche maintenue n'appartiennent qu'à
une famille. La caméra garde sa propre touche, la touche de repos du pouce
(Espace par défaut), en plus du centrage par les groupes ; les groupes sont
un second choix. Le menu du jeu accepte Mouse 4 et Mouse 5 tenus et le
double appui (porteur) ; la grille se combine avec Alt, Mouse 4, Mouse 5.

## 2026-10-17 — Interface visuelle
Moins de texte : icônes dessinées, situation en 8 mots au plus, messages
courts, étoiles d'immobilité. Deux vues commutables à départager : le
clavier dessiné (« main posée ») et la manette.

## 2026-10-15 — Combinaisons, création de groupe et doubles appuis
Une touche maintenue (Alt, Maj, Ctrl, Mouse 4, Mouse 5) plus une autre touche
forme une combinaison qui peut devenir un raccourci. Le modificateur utilisé
pour créer le premier groupe devient la touche de création de groupe. Deux
appuis sur une même touche en moins de 0,4 seconde forment un double appui.
Une touche ne peut pas servir à la fois seule et comme modificateur, ni seule
pour une action et en double appui pour une autre. Mouse 4 est le bouton
« avancer » (le plus à l'avant de la souris).

## 2026-10-15 — Ordinateur uniquement
L'application n'est pas adaptée aux téléphones. Les vérifications se font à
largeur d'ordinateur.

## 2026-10-15 — « Partie optimisée » plutôt que « build order »
Les raccourcis se classent en « partie optimisée » ou « extra ». Le terme
« build order » n'est pas adapté.

## 2026-10-14 — Première version en mode grille uniquement
Les raccourcis fixés par la grille du jeu ne se changent pas dans la première
version (les changer demanderait de quitter le mode grille). L'étape le
mentionne et fait faire la séquence à l'utilisateur, pour l'entraîner, avant
de passer à la suivante. Le Conseil se construit avec T, un villageois étant
sélectionné au préalable, sans menu d'âge.

## 2026-10-14 — Positions de la grille du jeu
Le porteur fournit lui-même les positions de la grille du jeu pour chaque
élément sélectionné, au moment où un prototype en a besoin. Pas de recherche
web sur ce sujet.

## 2026-10-14 — Méthode de travail
Le projet suit METHODE.md : prototypes jetables testés (phase 1), puis
construction propre à partir du cahier des charges (phase 2).
