# originai-product-spec (Claude Code plugin)

Write product specs as RPML files in your repo and review them as a live canvas in a Claude Artifact.
Comment on the canvas, press **Send to Claude**, and Claude edits the spec. No account, no token.

## Install

```text
/plugin marketplace add 21stware/originai-context
/plugin install originai-product-spec@origin-claude-marketplace
```

## Use

```text
/originai-product-spec:init      # create specs/ and publish the canvas
/originai-product-spec:preview   # rebuild from specs/ and republish
```

Needs a Claude Code host that has the `Artifact` tool and Node >= 18.
Specs live in `specs/`; the canvas link is kept in `specs/.artifact.json`.

## What it runs and sends

- **Hook**: after every Write or Edit, runs `node scripts/validate.mjs --hook` from this plugin. It reads only the `.rpml` file just written under `specs/`, checks it locally and reports problems back to Claude. No network.
- **Build**: `node scripts/build-artifact.mjs` reads `specs/` and writes one self-contained page to `.origin/artifact.html`, inlining `assets/gallery.js`, the RPML canvas runtime built from Origin's `@21stware/rpui` package. The build itself uses no network and no dependencies.
- **Canvas**: the page makes no requests of its own (no fetch, no analytics) except loading the Inter font from `fonts.googleapis.com` when it draws diagrams. It has links to getoriginai.com that open only when you click them.
- **Publish**: Claude publishes that page with Claude's own `Artifact` tool to your claude.ai account. It is private until you share it. The plugin sends nothing anywhere else: no account, no token, no telemetry.
