# Origin (Claude Code plugin)

Local MCP bridge: `npx -y originai mcp` (stdio; uses `originai login`)
Skill: `origin-product-spec-management` + RPML references.
Remote HTTP MCP (advanced/CI): `https://mcp.getoriginai.com` + `ORIGIN_TOKEN`

## Install

```text
/plugin marketplace add 21stware/originai-context
/plugin install origin@origin-claude-marketplace
```

Or from a local checkout of this marketplace tree:

```bash
claude --plugin-dir ./plugins/origin
```

```bash
npx originai login
npx originai link --project <project-id>
npx originai doctor
```

Never commit `oat_` tokens. CI only: set `ORIGIN_TOKEN`.
