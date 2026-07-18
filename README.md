# Origin AI Context

Public distribution for **Origin** coding-agent context:

- **Claude Code marketplace** — plugin with local MCP bridge (`originai mcp`) + product-spec skill
- Installable without access to the private Origin monorepo

## Claude Code

```text
/plugin marketplace add 21stware/originai-context
/plugin install origin@origin-claude-marketplace
```

Then in your product repo:

```bash
npx originai login
npx originai link --project <project-id>
npx originai doctor
```

Plugin MCP uses local stdio:

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

Requires published npm package [`originai`](https://www.npmjs.com/package/originai) for `originai mcp` / `login` / `link`.

## Other agents

| Client | Path |
|--------|------|
| Cursor | `npx originai login && npx originai link --cursor --skill` + `originai mcp config --cursor` |
| Codex | `npx originai login && npx originai link --codex --skill` |
| Pi / Hermes / OpenCode | `npx originai login && npx originai link --skill` |
| Remote HTTP MCP (CI) | `https://mcp.getoriginai.com` + `ORIGIN_TOKEN` |

## Docs

- Product: https://getoriginai.com
- MCP & install: https://getoriginai.com/docs/reference/mcp
- CLI: https://getoriginai.com/docs/reference/cli
- skills.sh discovery: https://getoriginai.com/.well-known/agent-skills/index.json

## Maintainer note

This repository is a **publish surface**. Edit skills/plugin in the private Origin monorepo, then run:

```bash
bun run publish:originai-context
```

Do not treat this repo as the source of truth for skill body or MCP tool schemas.
