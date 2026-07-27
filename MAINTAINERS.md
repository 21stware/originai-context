# Public context publish (maintainers)

## Do you need to think about the public repo?

**Usually no.** Day-to-day:

1. Edit **only** the SSOT paths below.
2. `bun run sync:skills` (or merge to `main` / `bun run publish:originai-context`).

```bash
bun run publish:originai-context
```

Never hand-edit https://github.com/21stware/originai-context — the next publish overwrites it.  
Never hand-edit generated trees under `packages/claude-plugin/skills`, `packages/skills/assets`, `frontend/public/.well-known`, etc.

## Single source of truth

| Edit this | Effect |
|-----------|--------|
| `packages/rpui-preview/rapid-prototype-implement/**` | RPML prompts + references (element index, practise, examples, …) |
| `packages/skills/src/setup.ts` (`SKILL_MD`) | External-agent skill body |
| `packages/skills/src/install-snippets.ts` | CLI install copy |
| `packages/claude-plugin/scripts/sync-from-skills.ts` | Plugin `.mcp.json` shape |
| `packages/skills/src/cli.ts` | Needs **npm publish** of `originai` (not git publish) |

Everything else skill-related is **generated**:

```bash
bun run sync:skills
# → packages/skills/assets/
# → packages/claude-plugin/skills + .mcp.json
# → packages/claude-marketplace/plugins/origin/{skills,.mcp.json,.claude-plugin}
# → frontend/public/.well-known/agent-skills + skills-full.txt
```

## Commands

```bash
bun run sync:skills                 # full artifact pipeline from SSOT
bun run claude-plugin:sync          # plugin only (expects assets already synced)
bun run claude-marketplace:sync     # plugin + marketplace tree
bun run publish:originai-context    # sync:skills + push public repo
```

## CI

Workflow: `.github/workflows/publish-originai-context.yml`  
Triggers on `main` when skills/plugin/marketplace/publish script change.  
Main CI also runs `bun run sync:skills` to ensure the pipeline still works (artifacts are gitignored).

Secret (one of):

- `ORIGINAI_CONTEXT_TOKEN` — fine-grained PAT with `contents:write` on `21stware/originai-context`  
  (use this if deploy keys are disabled on the public repo — common for org repos)
- `ORIGINAI_CONTEXT_DEPLOY_KEY` — SSH deploy key with **write** on `originai-context` (if org allows deploy keys)

Local one-shot publish (uses your logged-in `gh` / git credentials):

```bash
# optional if HTTPS needs a token:
# export PUBLIC_MARKETPLACE_URL="https://x-access-token:$(gh auth token)@github.com/21stware/originai-context.git"
bun run publish:originai-context
```

**Never** put tokens into files under the public tree (marketplace.json `repository` must stay a clean `https://github.com/...` URL — the publish script enforces this).

## Not covered by this publish

- **npm `originai`**: version bump in `packages/skills/package.json` + `npm publish` (`prepublishOnly` runs `sync-assets`)
- **Website / well-known skill**: `bun run sync:skills` or `frontend` `build:spa` (`generate-well-known-skill.ts` → getoriginai.com)
- **Docs site**: `apps/docs` via normal web deploy
