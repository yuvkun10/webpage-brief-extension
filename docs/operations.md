# Dependency maintenance

Dependency hygiene is handled in three places:

- `npm run audit` checks for moderate-or-higher vulnerabilities.
- `npm run outdated` reports packages that are no longer current.
- Dependabot opens weekly update pull requests for npm packages and GitHub Actions
  ([.github/dependabot.yml](../.github/dependabot.yml)).

CI ([.github/workflows/ci.yml](../.github/workflows/ci.yml)) runs the same checks on
pushes to `main` and pull requests, alongside linting, tests, and the production build.
