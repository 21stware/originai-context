---
description: Rebuild the canvas from specs/ and publish it (creates it on first run)
allowed-tools: Read, Glob, Bash, Write, Artifact, ArtifactComments
---

Rebuild the canvas from `specs/` and publish it. Follow the `origin-specs` skill: validate, build, then publish to the URL in `specs/.artifact.json`, or publish a new artifact and write the pointer if there is none. Read the artifact first if this conversation has not touched it.

After publishing, give the link and mention that comments only reach you when sent with **Send to Claude**.
