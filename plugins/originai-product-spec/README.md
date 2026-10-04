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
