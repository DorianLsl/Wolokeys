# aoe-keybinds

## Méthode de travail (sans attendre qu'on le demande) — détail : METHODE.md
Phase en cours : **phase 1**.
Phase 1 (Ponytail ultra) : /grilling sur les questions ouvertes avant chaque
nouveau prototype ; /prototype (un fichier HTML, logique pure isolée, données
fictives, le plus simple) ; avant de livrer : /ponytail-review, auto-test,
parcours dans un navigateur sans écran, dire ce qui n'est pas vérifié ;
publier au même lien ; proposer les changements du cahier numérotés.
Transition : /ponytail-audit, le porteur choisit quoi appliquer.
Phase 2 (Ponytail full) : /domain-modeling, /to-spec, /to-tickets, /tdd par
ticket (règles du cahier testées d'abord), /code-review et /ponytail-review
avant chaque fusion. Un seul journal de décisions : decisionLog.md.
Critiques sobres : une relecture ciblée suffit ; pas de phase de critique
coûteuse en tokens (agents en cascade, votes, relectures croisées) sans
demande du porteur.
Réponses brèves : ne pas rappeler les règles de la méthode qu'on applique
(ex. « je ne pousse pas »), seulement ce qui est fait ou à trancher.

## Cahier des charges
Le porteur seul décide de ce qui entre dans CAHIER_DES_CHARGES.md, en sort ou
y change : proposer (numéroté) et attendre sa confirmation explicite.

## Règles de code
- Le plus simple ; seulement ce qui est demandé ; rien « pour plus tard ».
- Standard du framework plutôt que code maison ; pas de dépendance sans
  nécessité ; reprendre l'existant ; supprimer le code mort.
- Chaque cas prévisible a un message d'erreur explicite, en ASCII simple.
- Vertical Slice + hexagonal léger : un dossier par fonctionnalité avec
  domain/ (pur), adapters/, ui/, tests à côté ; un bug se reproduit dans un
  test du domain/ de sa tranche.
- Peu de classes ; fonction publique = liste d'étapes nommées.
- Commentaires d'une ligne, le pourquoi seulement ; pas de code commenté.

## Règles Git
- Découper, vérifier, committer en local sans demander de validation.
- Jamais refactoring et changement de comportement dans le même commit.
- Ne jamais pousser sans demande explicite. Avant le push : Conventional
  Commits ; un commit par intention ; un fichier = un commit de la branche
  sauf si cela fusionnait deux intentions ; ne réécrire que le non-poussé ;
  compilation vérifiée à chaque commit qui touche le code.
- Après le push : 2 lignes au plus par intention.
