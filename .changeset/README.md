# Changesets

Create a changeset with `corepack yarn changeset` for changes in `packages/*`. On `main`, manually run `corepack yarn release:prepare`, review the generated versions, commit them yourself, and explicitly run `corepack yarn release:publish` only when you intend to publish. No GitHub Actions workflow is installed.
