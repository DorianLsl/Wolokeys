# Spec aoe-keybinds, version 1

Source : `CAHIER_DES_CHARGES.md` (V1 à V28) ; vocabulaire : `CONTEXT.md`.
Point de départ du code : le module logique de `prototypes/p1-pas-a-pas.html`
(P1 v14), jamais la page.

## But
Un débutant d'Age of Empires IV règle ses raccourcis avant de jouer : une
partie simulée, de l'avant-partie à une attaque à l'âge IV, lui demande
chaque action au moment où il en a besoin, avec des suggestions calculées
depuis sa posture (V1, V2, V13).

## Hors périmètre
Repris du cahier : quitter le mode grille, téléphones, gestes à la souris,
import et export du profil du jeu, QWERTY, sauvegarde, civilisations.

## Technique
- Page statique en modules ES natifs : aucun framework, aucune dépendance,
  aucun outil de compilation.
- Tests : `node --test`, à côté du code ; `package.json` ne sert qu'à
  `"type": "module"` et au script `test`.
- Publication comme le prototype ; vérification à largeur d'ordinateur.
- Clavier AZERTY, plus Mouse 4 et Mouse 5.

## Modèle
L'état est un **historique** : une liste d'événements dans l'ordre (réponse
à une étape, groupe de contrôle créé, interrupteur Entraînement, raccourci
redemandé). Tout le reste s'en déduit : raccourcis réglés, posture, groupes,
étape en cours, suggestions. Retour arrière retire le dernier événement.
Pourquoi : Plus tard, Ne pas utiliser et redemander (V5, V27) se rejouent
sans état caché, et chaque règle se teste depuis un historique écrit à la
main.

Les données de la partie (actions, moments, enchaînements, grille du jeu,
numéros de groupe) sont reprises du prototype, avec V28.

## Tranches
Un dossier par tranche sous `src/`, chacun avec `domain/` (pur, testé),
`adapters/` (navigateur) et `ui/` quand il en a besoin. Une tranche n'importe
que le `domain/` des tranches dont elle dépend.

| Tranche | Rôle | Règles |
|---|---|---|
| `clavier` | Touches, raccourcis, mécaniques, conflits ; écoute du clavier et de la souris | V3, V6, V10, V11 |
| `posture` | Avant-partie : touche de référence de chaque doigt | V2 |
| `partie` | Historique, moments, étape en cours, Plus tard, Ne pas utiliser, rattrapage, redemander | V5, V8, V13, V14, V17, V27 |
| `groupes` | Groupes de contrôle, touche de création, numéros par bloc ; la sélection actuelle et le rappel par chiffre restent dans `partie` | V7, V15, V19, V23 |
| `suggestions` | Candidats, étoiles, familles, logiques, dernier recours, pré-sélection | V9, V11, V12, V16, V20 à V22, V24 à V26 |
| `entrainement` | Séquences de la grille et enchaînements | V4, V7, V14, V28 |
| `recapitulatif` | Deux tableaux, étoiles et score ; affichés par `interface` | V8, V9, V27 |
| `interface` | Toute la page, au design du prototype P1 v14 : scène, grande carte, logique visible, clavier dessiné cliquable, manette, récapitulatif | V9, V18 |

## Fonctions publiques du domaine
Chacune prend l'historique et rend un nouvel historique, ou une erreur :
- `choisir(historique, raccourci, premierAccepte)` : V6, V10 ; `premierAccepte` dit
  que le premier appui d'un double appui vient d'être accepté, ce que
  l'historique ne sait pas (un appui refusé n'y laisse pas de trace) ;
- `plusTard(historique)`, `nePasUtiliser(historique)` : V5 ;
- `redemander(historique, action)` : V27 ;
- touche maintenue + chiffre passe par `choisir` et crée un groupe de contrôle ;
  `creerGroupe(historique, chiffre, maintenue, selection, raccourcis)` reçoit
  la sélection et les raccourcis de la partie, qui seule les connaît (V7) ;
- `basculerEntrainement(historique)` : V14 ;
- `appuyer(historique, appuis, raccourci, premierAccepte)` : V4 ; rend les appuis
  faits de la séquence en cours (état de la page, l'historique ne les garde
  pas), l'historique quand elle est finie, ou une erreur qui fait recommencer ;
- `passer(historique)` : V4, Suivant fait la séquence à la place de l'utilisateur.
En lecture : `etapeEnCours`, `suggestions` (chacune avec sa `logique` : texte et
action qui l'inspire, V18), `raccourcisRegles`, `reglages`, `sequenceDe`,
`entrainementActif` ; pour l'interface, `geste`, `touchesEntourees` et
`deplacements` (V9, V18).

## Erreurs
Chaque cas prévisible rend un message court en ASCII simple (8 mots au plus),
jamais une exception : touche inconnue, touche réservée, touche déjà prise
(avec l'action qui la tient), grille sans Alt, Mouse 4 ou Mouse 5, doigt
déjà pris, combinaison impossible, groupe vide, rien de sélectionné, mauvaise
touche de création de groupe.

## Vérification
- Chaque règle V du cahier a au moins un test du `domain/` de sa tranche,
  écrit avant le code.
- Un test de parcours complet, avec la meilleure suggestion à chaque étape,
  fige les raccourcis obtenus (repris de l'auto-test du prototype).
- Avant chaque fusion : `node --test` vert, parcours rejoué dans un
  navigateur sans écran, zéro erreur dans la console.
