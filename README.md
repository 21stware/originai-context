# Origin AI Context

Public distribution for **Origin** coding-agent context (no private monorepo needed):

1. **Claude Code marketplace** — plugin with local MCP (`originai mcp`) + skill
2. **Agent Skills / skills.sh** — installable skill via `npx skills add`
3. Pointers to npm CLI + hosted docs / well-known discovery

## Install skill (skills.sh / Agent Skills)

```bash
# List skills in this repo
npx skills add 21stware/originai-context --list

# Install Origin product-spec skill into your agent(s)
npx skills add 21stware/originai-context
# or pin the skill name:
npx skills add 21stware/originai-context --skill origin-product-spec-management
```

Then authorize + bind a product project (skill alone has no token / project id):

```bash
npx originai login
npx originai link --project <project-id>
npx originai doctor
```

Also discoverable over HTTP (site well-known):

```bash
npx skills add https://getoriginai.com
# manifest: https://getoriginai.com/.well-known/agent-skills/index.json
```

## Claude Code (plugin marketplace)

```text
/plugin marketplace add 21stware/originai-context
/plugin install origin@origin-claude-marketplace
```

```bash
npx originai login
npx originai link --project <project-id>
npx originai doctor
```

Plugin MCP uses local stdio (login token — no day-to-day `export ORIGIN_TOKEN`):

```json
{
  "mcpServers": {
    "origin": {
      "command": "npx",
      "args": ["-y", "originai", "mcp"]
    }
  }
}
```

Requires npm [`originai`](https://www.npmjs.com/package/originai) (`>=0.7.0` for `mcp` / `doctor`).

## Other agents

| Client | Path |
|--------|------|
| Any Agent Skills host | `npx skills add 21stware/originai-context` then `originai login` + `link` |
| Cursor | login + `link --cursor --skill` + `originai mcp config --cursor` |
| Codex | login + `link --codex --skill` |
| Pi / Hermes / OpenCode | login + `link --skill` (or skills add above) |
| Remote HTTP MCP (CI) | `https://mcp.getoriginai.com` + `ORIGIN_TOKEN` |

## Repo layout

```text
.claude-plugin/marketplace.json     # Claude Code marketplace catalog
plugins/origin/                     # Claude plugin (skill + .mcp.json)
skills/origin-product-spec-management/   # Agent Skills / skills.sh entry
  SKILL.md
  rpml/...
```

## Docs

- Product: https://getoriginai.com
- MCP & install: https://getoriginai.com/docs/reference/mcp
- CLI: https://getoriginai.com/docs/reference/cli
- Agent skills: https://getoriginai.com/docs/reference/agent-skills
- skills.sh well-known: https://getoriginai.com/.well-known/agent-skills/index.json

## Maintainer note

This repository is a **publish surface**. Edit skill/plugin in the private Origin monorepo, then:

```bash
bun run publish:originai-context
```

Do not hand-edit skill bodies here — they will be overwritten on the next publish.
