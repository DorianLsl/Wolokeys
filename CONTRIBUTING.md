# Contribuer

Les issues sont bienvenues : un bug, une idée, une question.

Les pull requests aussi. En proposant une contribution, vous acceptez qu'elle
soit publiée sous la [licence MIT](LICENSE) du projet.

## Organisation du code

- Un dossier par fonctionnalité dans `src/`, chacun avec `domain/` (règles
  pures, sans navigateur), `adapters/` (clavier, fichiers, stockage), `ui/`,
  et les tests à côté du code.
- Un bug se reproduit d'abord dans un test du `domain/` de sa fonctionnalité.
- Ni build ni dépendance : HTML, CSS et modules ES seulement.
- Le code le plus simple qui fait ce qui est demandé ; des commentaires d'une
  ligne qui disent pourquoi.
- Chaque erreur prévisible a un message explicite, en ASCII simple.
- Les mots suivent le glossaire de [CONTEXT.md](CONTEXT.md).

## Avant d'ouvrir une pull request

```sh
npm test
```

Un commit par intention, avec des messages
[Conventional Commits](https://www.conventionalcommits.org/) (`feat:`,
`fix:`, `docs:`...).
