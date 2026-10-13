# origin-spec (Claude Code plugin)

Connects Claude to your product specs in [Origin](https://getoriginai.com): read the released specs a feature should match, check code against them, and propose spec changes back as change requests that a person on your team applies. Specs are RPML documents, one screen per file, covering every state, permission and edge case.

- **MCP server** `origin`: tools to list, read, diff and propose changes to a project's specs.
- **Skill** `origin-product-spec-management`: how to read, write and validate RPML, with the RPML reference.

You need an Origin account and a project.

## Install

```text
/plugin marketplace add 21stware/originai-context
/plugin install origin-spec@origin-claude-marketplace
```

Or from a local checkout of this marketplace tree:

```bash
claude --plugin-dir ./plugins/origin-spec
```

```bash
npx originai login
npx originai link --project <project-id>
npx originai doctor
```

Never commit `oat_` tokens. CI only: set `ORIGIN_TOKEN`.

## What it runs and sends

- **Runs** `npx -y originai@0.8.6 mcp`, the Origin CLI from npm, as a local stdio MCP server. npm downloads that exact version the first time.
- **Reads** your access token from `~/.origin/settings.json` (written by `npx originai login`) or the `ORIGIN_TOKEN` environment variable, and the project binding from `.origin.json` in your repo.
- **Sends** requests to the Origin API (`https://vehcxhxmmfasujqtwdat.supabase.co/functions/v1/origin-api`) with that token: reads of your project's specs and, when Claude proposes a change, the RPML it wrote. Nothing is sent until a tool is called.
- The CLI bundles an LLM client library whose model catalog lists provider URLs; the MCP server never contacts them. Its only network destination is the Origin API above. `originai login` also calls `cli-auth` on that host and opens getoriginai.com in your browser.
- The skill has no code of its own.

Privacy: https://getoriginai.com/privacy
