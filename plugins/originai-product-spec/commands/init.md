---
description: Create specs/ for this repo (README plus the key screens as RPML) and publish the live canvas
argument-hint: "[what the product is, or which screens to start with]"
allowed-tools: Read, Glob, Grep, Write, Edit, Bash, Artifact, AskUserQuestion
---

Set up the product specs for this repo and publish the canvas. Follow the `origin-specs` skill for layout, scripts and publishing, and the `rapid-prototype-implement` skill for how to write RPML.

User's hint: $ARGUMENTS

1. **Check first.** If `specs/` already holds `.rpml` files, do not regenerate. Say so and point to `/originai-product-spec:preview`.
2. **Learn the product.** Read the README, package manifests, and the routes, pages or screens in the code. If the repo is empty or the product is unclear, ask the user with `AskUserQuestion` what it is and which two or three screens matter most. Ask about behavior, not tooling.
3. **Start small.** Write `specs/README.rpml` plus the 3 to 5 screens that define the product. Depth over breadth: each screen covers its states, permissions and edge cases as the RPML skill requires. More screens come later through comments and edits.
4. **Validate** until clean.
5. **Gitignore.** Make sure `.origin/` is in `.gitignore`.
6. **Publish** the canvas as the skill describes and write `specs/.artifact.json`.
7. **Finish** with the link, plus three short lines: select anything on the canvas and comment, press **Send to Claude** so you act on it, and the spec files are in `specs/`.
