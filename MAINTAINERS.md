# Public context publish (maintainers)

## Do you need to think about the public repo?

**Usually no.** Day-to-day:

1. Edit **private monorepo** sources only (`packages/skills/...`).
2. Merge to `main` (CI publishes) **or** run one command locally.

```bash
bun run publish:originai-context
```

Never hand-edit https://github.com/21stware/originai-context — the next publish overwrites it.

## What maps where

| Change this | Public effect |
|-------------|----------------|
| `packages/skills/src/setup.ts` skill body | Claude plugin skill + `skills/` for skills.sh |
| `packages/skills` RPML assets (`sync-assets`) | Bundled `rpml/` under the skill |
| Plugin MCP config in `claude-plugin` sync script | `plugins/origin/.mcp.json` |
| Install wording in `install-snippets.ts` / frontend | Product UI/docs (not always the public git tree) |
| CLI behavior in `packages/skills/src/cli.ts` | Needs **npm publish** of `originai` (not this git publish) |

## Commands

```bash
bun run claude-plugin:sync          # regenerate plugin only
bun run claude-marketplace:sync     # plugin + marketplace tree
bun run publish:originai-context    # sync + push public repo
```

## CI

Workflow: `.github/workflows/publish-originai-context.yml`  
Triggers on `main` when skills/plugin/marketplace/publish script change.

Secret (one of):

- `ORIGINAI_CONTEXT_DEPLOY_KEY` — SSH deploy key with **write** on `originai-context` (preferred)
- `ORIGINAI_CONTEXT_TOKEN` — fine-grained PAT with `contents:write` on that repo

## Not covered by this publish

- **npm `originai`**: version bump in `packages/skills/package.json` + `npm publish`
- **Website / well-known skill**: frontend build (`generate-well-known-skill.ts` → getoriginai.com)
- **Docs site**: `apps/docs` via normal web deploy
