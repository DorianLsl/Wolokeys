# Méthode : concevoir par prototypes testés, avec Claude Code

## Le principe
On ne spécifie pas un produit sur le papier : on le découvre en testant.
**Phase 1** : Claude livre des prototypes jetables, minuscules, testables en
un clic ; le porteur du projet les essaie et dit ce qui ne va pas. Chaque
retour tranché alimente un cahier des charges que **seul le porteur valide**.
**Phase 2** : quand le cahier est stable, on construit la version définitive,
propre et testée, avec le cahier comme source.

| Qui | Fait | Ne fait jamais |
|---|---|---|
| **Porteur** | Teste, tranche chaque proposition, décide quand pousser. | Rédiger une spec détaillée à l'avance. |
| **Claude** | Construit le plus simple, vérifie, publie, propose les mises à jour du cahier, committe en local. | Écrire dans le cahier sans accord, pousser sans demande, ajouter ce qui n'a pas été demandé. |

**Sobriété** : Claude ne lance pas de phase de critique trop consommatrice en
tokens (plusieurs agents critiques, votes, relectures en cascade). Une seule
relecture ciblée suffit ; plus seulement si le porteur le demande.
Dans ses réponses, Claude économise aussi ses tokens : il ne rappelle pas
les principes de la méthode qu'il applique, il dit ce qu'il a fait et ce qui
reste à trancher.

## Mise en place (10 minutes)
1. Installer les plugins **Skills For Real Engineers** (Matt Pocock) et
   **ponytail** (`DietrichGebert/ponytail`).
2. Créer à la racine : `CLAUDE.md` (bloc en annexe A), `CAHIER_DES_CHARGES.md`
   (modèle en annexe B), `PROJECT.md` (où on en est, prochaines étapes,
   point de reprise exact), `decisionLog.md` (décisions structurantes, la plus
   récente en haut) et le dossier `prototypes/`.
3. Premier message à Claude : le produit en 3 phrases, puis « prototype 1, le
   plus simple possible, testable en un clic ».

## Phase 1 : la boucle de prototypage
Ponytail au niveau **`ultra`** : Claude conteste toute demande que le besoin
ne justifie pas.

1. **Trancher avant de construire** (`/grilling`) : avant chaque nouveau
   prototype, Claude pose les questions ouvertes qui le concernent, numérotées,
   chacune avec sa recommandation. Le porteur répond en une ligne. Le
   prototype répond ensuite à **une** question produit.
2. **Construire le minimum** (`/prototype`) : un fichier HTML unique, sans
   installation, données fictives marquées comme telles.
   - question de logique → branche « logique » : règles métier isolées dans
     un module pur, réutilisable en phase 2 ;
   - hésitation sur un écran → branche « UI » : 2 ou 3 variantes radicalement
     différentes, à comparer d'un clic.
3. **Vérifier avant de livrer** : `/ponytail-review`, auto-test de la logique
   sur cas réels et cas limites, parcours rejoué dans un navigateur sans écran
   (largeur téléphone, zéro erreur). Claude dit ce qu'il n'a pas vérifié.
4. **Publier** au même lien de test privé ; committer en local.
5. **Le porteur teste** et réagit librement.
6. **Claude propose les changements du cahier, numérotés** ; le porteur
   tranche (« 1 oui, 2 modifié ainsi, 3 non ») ; seul le confirmé est écrit.

On sort de la phase 1 quand les retours ne touchent plus le cœur du produit
et qu'il ne reste plus de question ouverte (réponse ou « hors périmètre »).

## Transition
`/ponytail-audit` sur tout le repo : rapport numéroté de ce qu'il faut
corriger ou supprimer, sans rien modifier. Le porteur choisit les numéros.

## Phase 2 : la conception propre
Ponytail au niveau **`full`**.
1. `/domain-modeling` : vocabulaire dans `CONTEXT.md`, décisions dans
   `decisionLog.md` (un seul journal, jamais de second registre).
2. `/to-spec` puis `/to-tickets`.
3. `/tdd` par ticket : chaque règle validée du cahier devient d'abord un test ;
   le module logique du prototype sert de point de départ, jamais la page.
4. `/code-review` et `/ponytail-review` avant chaque fusion.
5. Les prototypes restent dans l'historique git ; ils ne partent pas en
   production.

## Règles de code
- **Le plus simple possible** : seulement ce qui est demandé, rien « pour plus
  tard ».
- **Standard d'abord** : composants du framework plutôt que code maison ;
  aucune nouvelle dépendance sans nécessité.
- **Pas de doublon, pas de code mort** : reprendre l'existant, supprimer le
  mort.
- **Erreurs explicites** : chaque cas prévisible a son message, en ASCII simple.
- **Vertical Slice + hexagonal léger** : un dossier par fonctionnalité,
  toujours `domain/` (règles pures), `adapters/` (stockage, réseau), `ui/`,
  tests à côté du code. Un bug se reproduit dans un test du `domain/` de sa
  tranche, sans lancer l'application.
- **Peu de classes** : chaque fonction publique se lit comme une liste
  d'étapes nommées.
- **Commentaires d'une ligne**, le pourquoi seulement ; pas de bloc, pas de
  code commenté.

## Règles Git
- Claude découpe la tâche, lance la vérification rapide, committe en local
  **sans demander de validation**.
- Jamais un refactoring et un changement de comportement dans le même commit.
- **Push uniquement à la demande du porteur.** Avant chaque push :
  Conventional Commits ; un commit par intention ; un fichier modifié par un
  seul commit de la branche, sauf si cela fusionnait deux intentions ; ne
  réécrire que les commits pas encore poussés (jamais de push forcé) ; si un
  commit touche le code, vérifier que le projet compile à ce commit.
- Après le push : un résumé de 2 lignes au plus par intention.
- Une consigne du porteur prime sur tout automatisme (ex. un outil qui
  réclame un push).

## Leçons à garder en tête
- La première version est toujours trop chargée : viser l'essentiel.
- Supprimer la friction (saisie au clavier → choix à toucher) rapporte plus
  qu'ajouter des fonctions.
- Laisser le métier simplifier l'écran : si une valeur ne compte que par
  paliers, demander le palier, pas la valeur exacte.
- Ne jamais attribuer au porteur une raison qu'il n'a pas donnée.

---

## Annexe A — bloc à coller dans `CLAUDE.md`
```markdown
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
```

## Annexe B — modèle de `CAHIER_DES_CHARGES.md`
```markdown
# Cahier des charges <projet>

> Document vivant. Une exigence n'entre dans « Validé » qu'après un test réel
> sur un prototype et la confirmation du porteur.

## Validé
- V1. … *(retour P1 v1)*
## Rejeté
- R1. … *(retour P1 vN)*
## Hypothèses en test
### P1 v1 — <question testée> (`prototypes/p1-<nom>.html`)
- H1. …
## Hors périmètre de la première version
## Questions ouvertes
## Historique des prototypes
| # | Question | Fichier | Verdict |
|---|---|---|---|
```
