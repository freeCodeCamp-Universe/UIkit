# UIKit repo docs

Maintainer + contributor reference for this monorepo. The public product
documentation is the Astro docs site at
[`https://design.freecodecamp.org`](https://design.freecodecamp.org)
(source: [`apps/docs`](../apps/docs/README.md)).

## Start here

| Doc                                              | What it covers                                                                         |
| ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| [Tooling](./tooling.md)                          | Architecture, workspace inventory, toolchain pins, LTS policy, workspace tasks, CI/CD. |
| [Packages](./packages.md)                        | Every workspace package - entrypoints, exports, scripts, tests, generated artifacts.   |
| [Components matrix](./components-matrix.md)      | UIKit coverage vs. Catalyst / Ark UI / Headless UI.                                    |
| [Releasing](./releasing.md)                      | CDN bundle build, verification, GitHub Actions release flow, cross-repo publish PR.    |
| [Deploy-docs runbook](./runbooks/deploy-docs.md) | Cloudflare Pages operator playbook (provisioning, DNS, rollback, secret rotation).     |
| [v1.1 backlog](./v1.1-backlog.md)                | Deferred bugs, features, CI hardening, repo-going-public follow-ups.                   |
| [ADRs](./adr/)                                   | Architecture decision records - locked decisions cited from code + other docs.         |
| [`apps/docs` README](../apps/docs/README.md)     | Astro app shape, package alias resolution, content collections, dogfood assets.        |

## Source of truth

These docs describe the checked-out repo state. For exact behavior,
read the source files they point to:

- package scripts: root `package.json` and each workspace `package.json`
- task graph: `turbo.json`
- CI and release: `.github/workflows/*`
- component inventory: `apps/docs/src/data/nav.ts` and
  `apps/docs/src/data/knownComponents.ts`
- package exports: `packages/*/package.json` and package barrel files

If a command or workflow changes, update the relevant repo doc in the
same PR.

## See also

- [`README.md`](../README.md) - repo entrypoint.
- [`CONTRIBUTING.md`](../CONTRIBUTING.md) - contributor narrative
  workflow (Setup, daily commands, lint/format/test, release checklist).
- [`SECURITY.md`](../SECURITY.md) - security disclosure process.
